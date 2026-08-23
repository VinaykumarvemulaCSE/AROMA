"use server";
import { z } from "zod";
import { getDb } from "../firebase-admin.server";
import { assertProductionSecrets } from "../config.server";
import { reservationSchema } from "../validation/schemas";
import { sendReservationEmailInternal } from "../email.server";
import { rateLimit } from "./rate-limit.server";
import { parseSafe, formatZodError } from "./helper";

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1).max(20),
});

export const checkAvailability = async (rawData: unknown) => {
  try {
    const data = parseSafe(availabilitySchema, rawData);
    assertProductionSecrets({ firebase: true });
    const adminDb = await getDb();
    const datetime = `${data.date}T${data.timeSlot}`;
    const tablesSnap = await adminDb.collection("tables").get();

    for (const tableDoc of tablesSnap.docs) {
      const tableData = tableDoc.data();
      if (tableData.size < data.guests) continue;

      const slot = tableData.slots?.find(
        (sl: { datetime: string; available: boolean }) => sl.datetime === datetime && sl.available,
      );
      if (!slot) continue;

      const existingReservations = await adminDb
        .collection("reservations")
        .where("tableConfigId", "==", tableDoc.id)
        .where("slotDatetime", "==", datetime)
        .where("status", "!=", "Cancelled")
        .get();

      if (existingReservations.size < tableData.totalTables) {
        return { available: true as const, tableConfigId: tableDoc.id };
      }
    }

    return { available: false as const };
  } catch (e: unknown) {
    console.error("Availability check error:", e);
    return {
      available: false as const,
      error: formatZodError(e),
    };
  }
};

export const createReservation = async (rawData: unknown) => {
  try {
    const data = parseSafe(reservationSchema, rawData);
    assertProductionSecrets({ firebase: true, smtp: true });
    const adminDb = await getDb();
    await rateLimit(`res_${data.customer.phone}`, 5, 10 * 60 * 1000);

    const datetime = `${data.reservation.date}T${data.reservation.timeSlot}`;

    const tableDoc = await adminDb.collection("tables").doc(data.tableConfigId).get();
    if (!tableDoc.exists) {
      throw new Error("Table configuration does not exist.");
    }
    const tableData = tableDoc.data()!;

    const slot = tableData.slots?.find(
      (sl: { datetime: string; available: boolean }) => sl.datetime === datetime && sl.available,
    );
    if (!slot) {
      throw new Error("This time slot is no longer available.");
    }

    const existingReservations = await adminDb
      .collection("reservations")
      .where("tableConfigId", "==", data.tableConfigId)
      .where("slotDatetime", "==", datetime)
      .where("status", "!=", "Cancelled")
      .get();

    if (existingReservations.size >= tableData.totalTables) {
      throw new Error("Sorry, all tables are fully booked for this time slot.");
    }

    const resId = `RV${Date.now().toString().slice(-6)}`;

    const reservationDoc = {
      id: resId,
      tableConfigId: data.tableConfigId,
      slotDatetime: datetime,
      customer: data.customer,
      reservation: data.reservation,
      location: data.location || null,
      status: "Pending",
      createdAt: Date.now(),
    };

    await adminDb.collection("reservations").doc(resId).set(reservationDoc);

    await sendReservationEmailInternal({
      reservationId: resId,
      customerName: data.customer.name,
      customerEmail: data.customer.email || "",
      customerPhone: data.customer.phone,
      guests: data.reservation.guests,
      date: data.reservation.date,
      timeSlot: data.reservation.timeSlot,
    }).catch((err) => console.error("Email send error:", err));

    return { success: true as const, reservationId: resId };
  } catch (e: unknown) {
    console.error("Create reservation error:", e);
    return {
      success: false as const,
      error: formatZodError(e),
    };
  }
};
