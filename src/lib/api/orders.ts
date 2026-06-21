import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminDb } from "../firebase-admin";
import { sendOrderEmailInternal } from "../email";
import { orderSchema } from "../validation/schemas";
import { rateLimit } from "./rate-limit";
import { resolveUserIdFromToken } from "./auth-server";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export const getOrderForTracking = createServerFn({ method: "POST" })
  .validator(
    z.object({
      orderId: z.string().min(1),
      phone: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => {
    await rateLimit(`track_${data.orderId}`, 30, 10 * 60 * 1000);

    const snap = await adminDb.collection("orders").doc(data.orderId).get();
    if (!snap.exists) {
      throw new Error("Order not found.");
    }

    const order = snap.data()!;
    const orderPhone = normalizePhone(String(order.contact?.phone ?? ""));
    if (orderPhone !== normalizePhone(data.phone)) {
      throw new Error("Phone number does not match this order.");
    }

    return {
      order: {
        id: order.id as string,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        delivery: order.delivery,
        discount: order.discount,
        couponCode: order.couponCode ?? undefined,
        total: order.total,
        addr: order.addr,
        contact: order.contact,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.userId ?? undefined,
      },
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    await rateLimit(`order_${data.contact.phone}`, 5, 10 * 60 * 1000);

    const userId = await resolveUserIdFromToken(data.idToken);

    const menuItemsSnapshot = await adminDb.collection("menu_items").get();
    const menuItemsMap = new Map<string, Record<string, unknown>>();
    menuItemsSnapshot.docs.forEach((doc) => {
      menuItemsMap.set(doc.id, doc.data());
    });

    let subtotal = 0;
    const validatedItems = [];

    for (const item of data.items) {
      const dbItem = menuItemsMap.get(item.id);
      if (!dbItem || !dbItem.available) {
        throw new Error(`Item ${item.id} is unavailable or does not exist.`);
      }
      subtotal += (dbItem.price as number) * item.qty;
      validatedItems.push({
        id: item.id,
        name: String(dbItem.name),
        price: Number(dbItem.price),
        qty: item.qty,
        image: String(dbItem.image),
      });
    }

    let discount = 0;
    let appliedCoupon = null;
    const couponCode = data.couponCode?.toUpperCase().trim();
    if (couponCode) {
      const couponDoc = await adminDb.collection("coupons").doc(couponCode).get();
      if (couponDoc.exists) {
        const coupon = couponDoc.data();
        if (coupon?.status === "Active" && subtotal >= coupon.minOrder) {
          if (coupon.maxUses === 0 || coupon.used < coupon.maxUses) {
            discount = coupon.discountAmount;
            appliedCoupon = coupon;
          }
        }
      }
    }

    const tax = Math.round(subtotal * 0.05);
    const delivery = subtotal >= 499 ? 0 : 40;
    const total = Math.max(0, subtotal + tax + delivery - discount);

    const orderId = `AC${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 6)}`;
    const orderRef = adminDb.collection("orders").doc(orderId);

    const orderDoc = {
      id: orderId,
      items: validatedItems,
      subtotal,
      tax,
      delivery,
      discount,
      couponCode: appliedCoupon ? couponCode : null,
      total,
      addr: data.addr,
      contact: data.contact,
      status: "Pending",
      createdAt: Date.now(),
      userId,
    };

    if (appliedCoupon && couponCode) {
      const couponRef = adminDb.collection("coupons").doc(couponCode);
      await adminDb.runTransaction(async (transaction) => {
        const couponSnap = await transaction.get(couponRef);
        if (!couponSnap.exists) {
          throw new Error("Coupon no longer valid.");
        }
        const couponData = couponSnap.data()!;
        if (couponData.maxUses > 0 && couponData.used >= couponData.maxUses) {
          throw new Error("Coupon usage limit reached.");
        }
        transaction.set(orderRef, orderDoc);
        transaction.update(couponRef, { used: couponData.used + 1 });
      });
    } else {
      await orderRef.set(orderDoc);
    }

    await sendOrderEmailInternal({
      orderId,
      customerName: data.contact.name,
      customerEmail: data.contact.email || "",
      customerPhone: data.contact.phone,
      address: [data.addr.line1, data.addr.line2, data.addr.landmark, data.addr.city, data.addr.pin]
        .filter(Boolean)
        .join(", "),
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee: delivery,
      total,
      cutlery: data.contact.cutlery,
    }).catch((err) => console.error("Email send error:", err));

    return {
      success: true,
      orderId,
      subtotal,
      tax,
      delivery,
      discount,
      total,
    };
  });
