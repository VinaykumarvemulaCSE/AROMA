import { createServerFn } from "@tanstack/react-start";
import { adminDb } from "../firebase-admin";
import { sendOrderEmailInternal } from "../email";
import { orderSchema } from "../validation/schemas";
import { rateLimit } from "./rate-limit";

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    // Phase 6: Anti-spam rate limiting (5 req / 10 mins per phone)
    rateLimit(`order_${data.contact.phone}`, 5, 10 * 60 * 1000);
    // 1. Fetch real prices from Firestore
    const menuItemsSnapshot = await adminDb.collection("menu_items").get();
    const menuItemsMap = new Map();
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
      subtotal += dbItem.price * item.qty;
      validatedItems.push({
        id: item.id,
        name: dbItem.name,
        price: dbItem.price,
        qty: item.qty,
        image: dbItem.image,
      });
    }

    // 2. Coupon Validation (if any)
    let discount = 0;
    let appliedCoupon = null;
    if (data.couponCode) {
      const couponDoc = await adminDb.collection("coupons").doc(data.couponCode).get();
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

    // 3. Calculate Totals
    const tax = Math.round(subtotal * 0.05);
    const delivery = subtotal >= 499 ? 0 : 40;
    const total = Math.max(0, subtotal + tax + delivery - discount);

    // 4. Create Order ID
    const orderId = `AC${Date.now().toString().slice(-6)}`;

    const orderDoc = {
      id: orderId,
      items: validatedItems,
      subtotal,
      tax,
      delivery,
      discount,
      couponCode: appliedCoupon ? data.couponCode : null,
      total,
      addr: data.addr,
      contact: data.contact,
      status: "Pending",
      createdAt: Date.now(),
      userId: data.userId || null,
    };

    // 5. Save to Firestore via Admin SDK (bypasses security rules which we'll lock down)
    await adminDb.collection("orders").doc(orderId).set(orderDoc);

    // Increment coupon used count if valid
    if (appliedCoupon) {
      await adminDb.collection("coupons").doc(data.couponCode!).update({
        used: appliedCoupon.used + 1,
      });
    }

    // 6. Trigger Emails
    await sendOrderEmailInternal({
      orderId,
      customerName: data.contact.name,
      customerEmail: data.contact.email || "",
      customerPhone: data.contact.phone,
      address: [data.addr.line1, data.addr.line2, data.addr.landmark, data.addr.city, data.addr.pin].filter(Boolean).join(", "),
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee: delivery,
      total,
      cutlery: data.contact.cutlery,
    }).catch((err) => console.error("Email send error:", err));

    return { success: true, orderId, total };
  });
