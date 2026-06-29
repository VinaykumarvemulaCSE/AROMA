import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { o as sendReservationStatusEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reservation-status-email-B9wIDpdl.js
var sendReservationStatusEmail_createServerFn_handler = createServerRpc({
	id: "093d110f565762dd086a4de8d75a469b81eccdcfdbf0dbdc517844003bb35e18",
	name: "sendReservationStatusEmail",
	filename: "src/lib/api/reservation-status-email.ts"
}, (opts) => sendReservationStatusEmail.__executeServer(opts));
var sendReservationStatusEmail = createServerFn({ method: "POST" }).validator(objectType({
	reservationId: stringType(),
	customerName: stringType(),
	customerEmail: stringType().email(),
	status: stringType(),
	date: stringType(),
	timeSlot: stringType(),
	guests: numberType()
})).handler(sendReservationStatusEmail_createServerFn_handler, async ({ data }) => {
	await sendReservationStatusEmailInternal(data);
	return { success: true };
});
//#endregion
export { sendReservationStatusEmail_createServerFn_handler };
