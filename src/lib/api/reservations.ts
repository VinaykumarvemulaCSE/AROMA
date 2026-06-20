import { createServerFn } from "@tanstack/react-start";
import { adminDb } from "../firebase-admin";
import { reservationSchema } from "../validation/schemas";
import { sendReservationEmailInternal } from "../email";
import { rateLimit } from "./rate-limit";

export const createReservation = createServerFn({ method: "POST" })
  .validator((data: unknown) => reservationSchema.parse(data))
  .handler(async ({ data }) => {
    // Phase 6: Anti-spam rate limiting (5 req / 10 mins per phone)
    rateLimit(`res_${data.customer.phone}`, 5, 10 * 60 * 1000);
    
    const datetime = `${data.reservation.date}T${data.reservation.timeSlot}`;
    
    // 1. Verify table availability securely on the server
    const tableDoc = await adminDb.collection("tables").doc(data.tableConfigId).get();
    if (!tableDoc.exists) {
      throw new Error("Table configuration does not exist.");
    }
    const tableData = tableDoc.data()!;
    
    // Check if slot is available in table config
    const slot = tableData.slots?.find((sl: any) => sl.datetime === datetime && sl.available);
    if (!slot) {
      throw new Error("This time slot is no longer available.");
    }

    // Check existing reservations for this slot
    const existingReservations = await adminDb
      .collection("reservations")
      .where("tableConfigId", "==", data.tableConfigId)
      .where("slotDatetime", "==", datetime)
      .where("status", "!=", "Cancelled")
      .get();
      
    if (existingReservations.size >= tableData.totalTables) {
      throw new Error("Sorry, all tables are fully booked for this time slot.");
    }

    // 2. Create Reservation ID
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

    // 3. Save to Firestore bypassing public rules
    await adminDb.collection("reservations").doc(resId).set(reservationDoc);

    // 4. Send Emails asynchronously
    await sendReservationEmailInternal({
      reservationId: resId,
      customerName: data.customer.name,
      customerEmail: data.customer.email || "",
      customerPhone: data.customer.phone,
      guests: data.reservation.guests,
      date: data.reservation.date,
      timeSlot: data.reservation.timeSlot,
    }).catch((err) => console.error("Email send error:", err));

    return { success: true, reservationId: resId };
  });
