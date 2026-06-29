import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { n as sendOrderCancellationEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-cancellation-email-BlvSDiPa.js
var sendOrderCancellationEmail_createServerFn_handler = createServerRpc({
	id: "e8c24639cb439d52663e9b4f4b31e5d815565814eb527c55d74ec67be200a2d4",
	name: "sendOrderCancellationEmail",
	filename: "src/lib/api/order-cancellation-email.ts"
}, (opts) => sendOrderCancellationEmail.__executeServer(opts));
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
})).handler(sendOrderCancellationEmail_createServerFn_handler, async ({ data }) => {
	await sendOrderCancellationEmailInternal(data);
	return { success: true };
});
//#endregion
export { sendOrderCancellationEmail_createServerFn_handler };
