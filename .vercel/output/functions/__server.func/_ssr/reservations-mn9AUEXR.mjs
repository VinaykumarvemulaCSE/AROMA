import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { r as reservationSchema } from "./schemas-B_Z4Eu_V.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { a as sendReservationEmailInternal } from "./email-CMJXOQcA.mjs";
import { n as rateLimit, t as adminDb } from "./rate-limit-zhwmVyqd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reservations-mn9AUEXR.js
var checkAvailability_createServerFn_handler = createServerRpc({
	id: "96c170bc12295fd1cd93c468f9362ee6652049aca1dcc15f2c2e86a214550b9e",
	name: "checkAvailability",
	filename: "src/lib/api/reservations.ts"
}, (opts) => checkAvailability.__executeServer(opts));
var checkAvailability = createServerFn({ method: "POST" }).validator(objectType({
	date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	timeSlot: stringType().regex(/^\d{2}:\d{2}$/),
	guests: numberType().int().min(1).max(20)
})).handler(checkAvailability_createServerFn_handler, async ({ data }) => {
	const datetime = `${data.date}T${data.timeSlot}`;
	const tablesSnap = await adminDb.collection("tables").get();
	for (const tableDoc of tablesSnap.docs) {
		const tableData = tableDoc.data();
		if (tableData.size < data.guests) continue;
		if (!tableData.slots?.find((sl) => sl.datetime === datetime && sl.available)) continue;
		if ((await adminDb.collection("reservations").where("tableConfigId", "==", tableDoc.id).where("slotDatetime", "==", datetime).where("status", "!=", "Cancelled").get()).size < tableData.totalTables) return {
			available: true,
			tableConfigId: tableDoc.id
		};
	}
	return { available: false };
});
var createReservation_createServerFn_handler = createServerRpc({
	id: "f9f6b26272d80879aa9b6f9531df479177b713bf11a41e2c5dd73d72bc5dc53d",
	name: "createReservation",
	filename: "src/lib/api/reservations.ts"
}, (opts) => createReservation.__executeServer(opts));
var createReservation = createServerFn({ method: "POST" }).validator((data) => reservationSchema.parse(data)).handler(createReservation_createServerFn_handler, async ({ data }) => {
	await rateLimit(`res_${data.customer.phone}`, 5, 600 * 1e3);
	const datetime = `${data.reservation.date}T${data.reservation.timeSlot}`;
	const tableDoc = await adminDb.collection("tables").doc(data.tableConfigId).get();
	if (!tableDoc.exists) throw new Error("Table configuration does not exist.");
	const tableData = tableDoc.data();
	if (!tableData.slots?.find((sl) => sl.datetime === datetime && sl.available)) throw new Error("This time slot is no longer available.");
	if ((await adminDb.collection("reservations").where("tableConfigId", "==", data.tableConfigId).where("slotDatetime", "==", datetime).where("status", "!=", "Cancelled").get()).size >= tableData.totalTables) throw new Error("Sorry, all tables are fully booked for this time slot.");
	const resId = `RV${Date.now().toString().slice(-6)}`;
	const reservationDoc = {
		id: resId,
		tableConfigId: data.tableConfigId,
		slotDatetime: datetime,
		customer: data.customer,
		reservation: data.reservation,
		location: data.location || null,
		status: "Pending",
		createdAt: Date.now()
	};
	await adminDb.collection("reservations").doc(resId).set(reservationDoc);
	await sendReservationEmailInternal({
		reservationId: resId,
		customerName: data.customer.name,
		customerEmail: data.customer.email || "",
		customerPhone: data.customer.phone,
		guests: data.reservation.guests,
		date: data.reservation.date,
		timeSlot: data.reservation.timeSlot
	}).catch((err) => console.error("Email send error:", err));
	return {
		success: true,
		reservationId: resId
	};
});
//#endregion
export { checkAvailability_createServerFn_handler, createReservation_createServerFn_handler };
