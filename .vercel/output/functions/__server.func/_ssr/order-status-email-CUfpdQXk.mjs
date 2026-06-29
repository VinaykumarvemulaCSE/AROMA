import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { i as sendOrderStatusEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-status-email-CUfpdQXk.js
var sendOrderStatusEmail_createServerFn_handler = createServerRpc({
	id: "f327ddfa66e02f8aaf92916e00b481ffb9caa9a7fce0967c821ea599f0a10771",
	name: "sendOrderStatusEmail",
	filename: "src/lib/api/order-status-email.ts"
}, (opts) => sendOrderStatusEmail.__executeServer(opts));
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
})).handler(sendOrderStatusEmail_createServerFn_handler, async ({ data }) => {
	await sendOrderStatusEmailInternal(data);
	return { success: true };
});
//#endregion
export { sendOrderStatusEmail_createServerFn_handler };
