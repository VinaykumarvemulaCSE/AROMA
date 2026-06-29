import { n as create } from "../_libs/zustand.mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, f as collection, l as updateDoc, o as orderBy, p as doc, r as getDoc, s as query, u as where } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-CdMyVVbR.js
var sendOrderStatusEmail = createServerFn({ method: "POST" }).validator(objectType({
	orderId: stringType(),
	customerName: stringType(),
	customerEmail: stringType().email(),
	status: stringType(),
	items: arrayType(objectType({
		name: stringType(),
		qty: numberType(),
		price: numberType()
	})),
	total: numberType()
})).handler(createSsrRpc("f327ddfa66e02f8aaf92916e00b481ffb9caa9a7fce0967c821ea599f0a10771"));
var sendOrderCancellationEmail = createServerFn({ method: "POST" }).validator(objectType({
	orderId: stringType(),
	customerName: stringType(),
	customerEmail: stringType().email(),
	items: arrayType(objectType({
		name: stringType(),
		qty: numberType(),
		price: numberType()
	})),
	total: numberType(),
	reason: stringType().optional()
})).handler(createSsrRpc("e8c24639cb439d52663e9b4f4b31e5d815565814eb527c55d74ec67be200a2d4"));
var useOrders = create()((set) => ({
	orders: [],
	setOrders: (orders) => set({ orders }),
	updateStatus: async (id, status) => {
		const orderRef = doc(db, "orders", id);
		const orderSnap = await getDoc(orderRef);
		if (!orderSnap.exists()) {
			console.error("Order not found:", id);
			return;
		}
		const order = orderSnap.data();
		const oldStatus = order.status;
		await updateDoc(orderRef, { status });
		if (oldStatus !== status && order.contact.email) try {
			const user = useAuth.getState().user;
			if (!user || user.notifications?.email !== false) if (status === "Cancelled") await sendOrderCancellationEmail({ data: {
				orderId: order.id,
				customerName: order.contact.name,
				customerEmail: order.contact.email,
				items: order.items,
				total: order.total
			} });
			else await sendOrderStatusEmail({ data: {
				orderId: order.id,
				customerName: order.contact.name,
				customerEmail: order.contact.email,
				status,
				items: order.items,
				total: order.total
			} });
		} catch (error) {
			console.error("Failed to send order email:", error);
		}
	},
	updateStatusWithLoading: async (id, status) => {
		try {
			await updateDoc(doc(db, "orders", id), { status });
			return { success: true };
		} catch (error) {
			console.error("Failed to update order status:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error"
			};
		}
	},
	listenToOrders: (userId, role) => {
		let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
		if (role === "customer" && userId) q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
		else if (role !== "admin") {
			set({ orders: [] });
			return () => {};
		}
		return onSnapshot(q, (snapshot) => {
			set({ orders: snapshot.docs.map((doc) => doc.data()) });
		}, (error) => {
			console.error("Error listening to orders:", error);
		});
	},
	listenToOrder: (orderId, onOrder) => {
		return onSnapshot(doc(db, "orders", orderId), (snapshot) => {
			onOrder(snapshot.exists() ? snapshot.data() : null);
		}, (error) => {
			console.error("Error listening to order:", error);
			onOrder(null);
		});
	}
}));
//#endregion
export { useOrders as t };
