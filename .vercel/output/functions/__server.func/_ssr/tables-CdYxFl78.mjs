import { n as create } from "../_libs/zustand.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, f as collection, l as updateDoc, n as deleteDoc, o as orderBy, p as doc, r as getDoc, s as query } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tables-CdYxFl78.js
var sendReservationStatusEmail = createServerFn({ method: "POST" }).validator(objectType({
	reservationId: stringType(),
	customerName: stringType(),
	customerEmail: stringType().email(),
	status: stringType(),
	date: stringType(),
	timeSlot: stringType(),
	guests: numberType()
})).handler(createSsrRpc("093d110f565762dd086a4de8d75a469b81eccdcfdbf0dbdc517844003bb35e18"));
function mapReservationDoc(data) {
	const customer = data.customer;
	const reservation = data.reservation;
	return {
		id: String(data.id ?? ""),
		tableConfigId: String(data.tableConfigId ?? ""),
		slotDatetime: String(data.slotDatetime ?? ""),
		partySize: Number(reservation?.guests ?? data.partySize ?? 0),
		name: String(customer?.name ?? data.name ?? ""),
		email: customer?.email ? String(customer.email) : void 0,
		phone: String(customer?.phone ?? data.phone ?? ""),
		occasion: reservation?.occasion ? String(reservation.occasion) : void 0,
		seat: reservation?.seat ? String(reservation.seat) : void 0,
		notes: reservation?.notes ? String(reservation.notes) : void 0,
		status: data.status ?? "Pending",
		createdAt: Number(data.createdAt ?? 0)
	};
}
var useTables = create()((set, get) => ({
	tables: [],
	reservations: [],
	addTableConfig: async (t) => {
		const id = `tbl-${Date.now()}`;
		await setDoc(doc(db, "tables", id), {
			...t,
			id
		});
	},
	updateTableConfig: async (id, patch) => {
		await updateDoc(doc(db, "tables", id), patch);
	},
	removeTableConfig: async (id) => {
		await deleteDoc(doc(db, "tables", id));
	},
	addSlot: async (tableId, datetime) => {
		const docRef = doc(db, "tables", tableId);
		const snap = await getDoc(docRef);
		if (!snap.exists()) return;
		await updateDoc(docRef, { slots: [...snap.data().slots.filter((sl) => sl.datetime !== datetime), {
			datetime,
			available: true
		}] });
	},
	removeSlot: async (tableId, datetime) => {
		const docRef = doc(db, "tables", tableId);
		const snap = await getDoc(docRef);
		if (!snap.exists()) return;
		await updateDoc(docRef, { slots: snap.data().slots.filter((sl) => sl.datetime !== datetime) });
	},
	findAvailableTable: (date, time, partySize) => {
		const datetime = `${date}T${time}`;
		const { tables, reservations } = get();
		return tables.find((t) => {
			if (t.size < partySize) return false;
			if (!t.slots.find((sl) => sl.datetime === datetime && sl.available)) return false;
			return reservations.filter((r) => r.tableConfigId === t.id && r.slotDatetime === datetime && r.status !== "Cancelled").length < t.totalTables;
		}) ?? null;
	},
	updateReservationStatus: async (id, status) => {
		const reservationRef = doc(db, "reservations", id);
		const reservationSnap = await getDoc(reservationRef);
		if (!reservationSnap.exists()) {
			console.error("Reservation not found:", id);
			return;
		}
		const reservation = reservationSnap.data();
		const oldStatus = reservation.status;
		await updateDoc(reservationRef, { status });
		if (oldStatus !== status && reservation.email) try {
			await sendReservationStatusEmail({ data: {
				reservationId: reservation.id,
				customerName: reservation.name,
				customerEmail: reservation.email,
				status,
				date: reservation.slotDatetime.split("T")[0],
				timeSlot: reservation.slotDatetime.split("T")[1],
				guests: reservation.partySize
			} });
		} catch (error) {
			console.error("Failed to send reservation status email:", error);
		}
	},
	listenToTables: () => {
		return onSnapshot(query(collection(db, "tables")), (snapshot) => {
			set({ tables: snapshot.docs.map((doc) => doc.data()) });
		});
	},
	listenToReservations: () => {
		return onSnapshot(query(collection(db, "reservations"), orderBy("createdAt", "desc")), (snapshot) => {
			set({ reservations: snapshot.docs.map((doc) => mapReservationDoc(doc.data())) });
		});
	}
}));
//#endregion
export { useTables as t };
