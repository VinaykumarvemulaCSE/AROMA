import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { n as rateLimit, t as adminDb } from "./rate-limit-zhwmVyqd.mjs";
import { t as sanitizeInput } from "./sanitize-CaeEIUq3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reviews-BZBKW4fv.js
var reviewInputSchema = objectType({
	name: stringType().min(2).max(100),
	rating: numberType().int().min(1).max(5),
	title: stringType().min(2).max(120),
	body: stringType().min(10).max(2e3),
	itemId: stringType().optional()
});
var submitReview_createServerFn_handler = createServerRpc({
	id: "d3807520bdee2422f9ead2be16ab8770d61a07ce4b1ad3fbd965e7773fd8a16e",
	name: "submitReview",
	filename: "src/lib/api/reviews.ts"
}, (opts) => submitReview.__executeServer(opts));
var submitReview = createServerFn({ method: "POST" }).validator(reviewInputSchema).handler(submitReview_createServerFn_handler, async ({ data }) => {
	await rateLimit(`review_${data.name.slice(0, 20)}`, 3, 3600 * 1e3);
	const doc = {
		name: sanitizeInput(data.name),
		rating: data.rating,
		title: sanitizeInput(data.title),
		body: sanitizeInput(data.body),
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		helpful: 0,
		verified: false,
		status: "pending",
		...data.itemId ? { itemId: data.itemId } : {}
	};
	return {
		success: true,
		id: (await adminDb.collection("reviews").add(doc)).id
	};
});
//#endregion
export { submitReview_createServerFn_handler };
