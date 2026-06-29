import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import { n as orderSchema } from "./schemas-B_Z4Eu_V.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as resolveUserIdFromToken } from "./auth-server-COwlBdJh.mjs";
import { r as sendOrderEmailInternal } from "./email-CMJXOQcA.mjs";
import { n as rateLimit, t as adminDb } from "./rate-limit-zhwmVyqd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-Bb2jetGX.js
function normalizePhone(phone) {
	return phone.replace(/\D/g, "");
}
var getOrderForTracking_createServerFn_handler = createServerRpc({
	id: "fec2b61f7a04a4182532615ffce8ee894f70318f6b11ad623f61cfc376ded786",
	name: "getOrderForTracking",
	filename: "src/lib/api/orders.ts"
}, (opts) => getOrderForTracking.__executeServer(opts));
var getOrderForTracking = createServerFn({ method: "POST" }).validator(objectType({
	orderId: stringType().min(1),
	phone: stringType().min(10)
})).handler(getOrderForTracking_createServerFn_handler, async ({ data }) => {
	await rateLimit(`track_${data.orderId}`, 30, 600 * 1e3);
	const snap = await adminDb.collection("orders").doc(data.orderId).get();
	if (!snap.exists) throw new Error("Order not found.");
	const order = snap.data();
	if (normalizePhone(String(order.contact?.phone ?? "")) !== normalizePhone(data.phone)) throw new Error("Phone number does not match this order.");
	return { order: {
		id: order.id,
		items: order.items,
		subtotal: order.subtotal,
		tax: order.tax,
		delivery: order.delivery,
		discount: order.discount,
		couponCode: order.couponCode ?? void 0,
		total: order.total,
		addr: order.addr,
		contact: order.contact,
		status: order.status,
		createdAt: order.createdAt,
		userId: order.userId ?? void 0
	} };
});
var createOrder_createServerFn_handler = createServerRpc({
	id: "00e828a7cbd00d568d07bebe5f5c0e6c24a84ec46880352adb787cb183a1f079",
	name: "createOrder",
	filename: "src/lib/api/orders.ts"
}, (opts) => createOrder.__executeServer(opts));
var createOrder = createServerFn({ method: "POST" }).validator((data) => orderSchema.parse(data)).handler(createOrder_createServerFn_handler, async ({ data }) => {
	await rateLimit(`order_${data.contact.phone}`, 5, 600 * 1e3);
	const userId = await resolveUserIdFromToken(data.idToken);
	const menuItemsSnapshot = await adminDb.collection("menu_items").get();
	const menuItemsMap = /* @__PURE__ */ new Map();
	menuItemsSnapshot.docs.forEach((doc) => {
		menuItemsMap.set(doc.id, doc.data());
	});
	let subtotal = 0;
	const validatedItems = [];
	for (const item of data.items) {
		const dbItem = menuItemsMap.get(item.id);
		if (!dbItem || !dbItem.available) throw new Error(`Item ${item.id} is unavailable or does not exist.`);
		subtotal += dbItem.price * item.qty;
		validatedItems.push({
			id: item.id,
			name: String(dbItem.name),
			price: Number(dbItem.price),
			qty: item.qty,
			image: String(dbItem.image)
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
	const settingsDoc = await adminDb.collection("settings").doc("restaurant").get();
	const settings = settingsDoc.exists ? settingsDoc.data() : {
		gst: 5,
		freeDeliveryAbove: 499,
		deliveryFee: 40
	};
	const gstRate = settings?.gst ?? 5;
	const freeDeliveryThreshold = settings?.freeDeliveryAbove ?? 499;
	const tax = Math.round(subtotal * gstRate / 100);
	const delivery = subtotal >= freeDeliveryThreshold ? 0 : 40;
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
		userId
	};
	if (appliedCoupon && couponCode) {
		const couponRef = adminDb.collection("coupons").doc(couponCode);
		await adminDb.runTransaction(async (transaction) => {
			const couponSnap = await transaction.get(couponRef);
			if (!couponSnap.exists) throw new Error("Coupon no longer valid.");
			const couponData = couponSnap.data();
			if (couponData.maxUses > 0 && couponData.used >= couponData.maxUses) throw new Error("Coupon usage limit reached.");
			transaction.set(orderRef, orderDoc);
			transaction.update(couponRef, { used: couponData.used + 1 });
		});
	} else await orderRef.set(orderDoc);
	await sendOrderEmailInternal({
		orderId,
		customerName: data.contact.name,
		customerEmail: data.contact.email || "",
		customerPhone: data.contact.phone,
		address: [
			data.addr.line1,
			data.addr.line2,
			data.addr.landmark,
			data.addr.city,
			data.addr.pin
		].filter(Boolean).join(", "),
		items: validatedItems,
		subtotal,
		discount,
		deliveryFee: delivery,
		total,
		cutlery: data.contact.cutlery
	}).catch((err) => console.error("Email send error:", err));
	return {
		success: true,
		orderId,
		subtotal,
		tax,
		delivery,
		discount,
		total
	};
});
//#endregion
export { createOrder_createServerFn_handler, getOrderForTracking_createServerFn_handler };
