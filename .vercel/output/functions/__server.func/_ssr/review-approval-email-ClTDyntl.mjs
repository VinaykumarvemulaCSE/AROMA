import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { s as sendReviewApprovalEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/review-approval-email-ClTDyntl.js
var sendReviewApprovalEmail_createServerFn_handler = createServerRpc({
	id: "7dc6b68bf7651471b4c98d4b0deb29e67e9209f64869eae4b4f0db8a2167248a",
	name: "sendReviewApprovalEmail",
	filename: "src/lib/api/review-approval-email.ts"
}, (opts) => sendReviewApprovalEmail.__executeServer(opts));
var sendReviewApprovalEmail = createServerFn({ method: "POST" }).validator(objectType({
	customerName: stringType(),
	customerEmail: stringType().email(),
	reviewText: stringType(),
	rating: numberType(),
	itemName: stringType().optional()
})).handler(sendReviewApprovalEmail_createServerFn_handler, async ({ data }) => {
	await sendReviewApprovalEmailInternal(data);
	return { success: true };
});
//#endregion
export { sendReviewApprovalEmail_createServerFn_handler };
