import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendReservationStatusEmailInternal } from "../email";

export const sendReservationStatusEmail = createServerFn({ method: "POST" })
  .validator(z.object({
    reservationId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    status: z.string(),
    date: z.string(),
    timeSlot: z.string(),
    guests: z.number(),
  }))
  .handler(async ({ data }) => {
    await sendReservationStatusEmailInternal(data);
    return { success: true };
  });
