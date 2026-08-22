"use server";
import { z } from "zod";
import {
  assertEmailSent,
  sendReservationStatusEmailInternal,
} from "../email.server";
import { assertProductionSecrets } from "../config.server";
import { verifyAdmin } from "./auth-server.server";

const rsvSchema = z.object({
  idToken: z.string().min(20),
  reservationId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  status: z.string(),
  date: z.string(),
  timeSlot: z.string(),
  guests: z.number(),
});

export const sendReservationStatusEmail = async (rawData: unknown) => {
  const data = rsvSchema.parse(rawData);
  assertProductionSecrets({ firebase: true, smtp: true });
  await verifyAdmin(data.idToken);
  const { idToken: _idToken, ...payload } = data;
  const result = await sendReservationStatusEmailInternal(payload);
  assertEmailSent(result, "reservation status email");
  return { success: true as const };
};
