import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { n as rateLimit, t as adminDb } from "./rate-limit-zhwmVyqd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coupons-7QZgWFGS.js
var validateCouponCode_createServerFn_handler = createServerRpc({
	id: "0e91b6bfad7392ba36437684e2097df40e189e8cb3812f47cd5913dd58af257f",
	name: "validateCouponCode",
	filename: "src/lib/api/coupons.ts"
}, (opts) => validateCouponCode.__executeServer(opts));
var validateCouponCode = createServerFn({ method: "POST" }).validator(objectType({
	code: stringType().min(1),
	subtotal: numberType().nonnegative()
})).handler(validateCouponCode_createServerFn_handler, async ({ data }) => {
	await rateLimit(`coupon_${data.code.toUpperCase()}`, 20, 60 * 1e3);
	const code = data.code.toUpperCase().trim();
	const doc = await adminDb.collection("coupons").doc(code).get();
	if (!doc.exists) return {
		valid: false,
		error: "Invalid coupon code."
	};
	const coupon = doc.data();
	if (coupon.status === "Paused") return {
		valid: false,
		error: "This coupon is not active."
	};
	if (coupon.maxUses > 0 && coupon.used >= coupon.maxUses) return {
		valid: false,
		error: "This coupon has reached its usage limit."
	};
	if (data.subtotal < coupon.minOrder) return {
		valid: false,
		error: `Minimum order of ₹${coupon.minOrder} required.`
	};
	return {
		valid: true,
		coupon: {
			code,
			discountAmount: coupon.discountAmount,
			minOrder: coupon.minOrder
		}
	};
});
//#endregion
export { validateCouponCode_createServerFn_handler };
