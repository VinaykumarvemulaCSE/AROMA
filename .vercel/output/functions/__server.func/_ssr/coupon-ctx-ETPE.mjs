import { n as create } from "../_libs/zustand.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, f as collection, l as updateDoc, n as deleteDoc, p as doc, s as query } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coupon-ctx-ETPE.js
var useCoupons = create()((set, get) => ({
	coupons: [],
	addCoupon: async (c) => {
		await setDoc(doc(db, "coupons", c.code.toUpperCase()), {
			...c,
			code: c.code.toUpperCase()
		});
	},
	updateCoupon: async (code, patch) => {
		await updateDoc(doc(db, "coupons", code.toUpperCase()), patch);
	},
	removeCoupon: async (code) => {
		await deleteDoc(doc(db, "coupons", code.toUpperCase()));
	},
	validateCoupon: (code, subtotal) => {
		const c = get().coupons.find((x) => x.code === code.toUpperCase().trim());
		if (!c) return "Invalid coupon code.";
		if (c.status === "Paused") return "This coupon is not active.";
		if (c.maxUses > 0 && c.used >= c.maxUses) return "This coupon has reached its usage limit.";
		if (subtotal < c.minOrder) return `Minimum order of ₹${c.minOrder} required.`;
		return c;
	},
	incrementUsed: async (code) => {
		const c = get().coupons.find((x) => x.code === code.toUpperCase().trim());
		if (c) await updateDoc(doc(db, "coupons", code.toUpperCase()), { used: c.used + 1 });
	},
	listenToCoupons: () => {
		return onSnapshot(query(collection(db, "coupons")), (snapshot) => {
			set({ coupons: snapshot.docs.map((doc) => doc.data()) });
		}, (error) => {
			console.error("Error listening to coupons:", error);
		});
	}
}));
//#endregion
export { useCoupons as t };
