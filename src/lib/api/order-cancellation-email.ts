"use server";
import { z } from "zod";
import { assertEmailSent, sendOrderCancellationEmailInternal } from "../email.server";
import { assertProductionSecrets } from "../config.server";
import { verifyAdmin } from "./auth-server.server";

import { parseSafe, formatZodError } from "./helper";

const orderCancelSchema = z.object({
  idToken: z.string().min(20),
  orderId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email().catch(""),
  items: z.array(
    z.object({
      name: z.string(),
      qty: z.number(),
      price: z.number(),
    }),
  ),
  total: z.number(),
});

export const sendOrderCancellationEmail = async (rawData: unknown) => {
  try {
    const data = parseSafe(orderCancelSchema, rawData);
    assertProductionSecrets({ firebase: true, smtp: true });
    await verifyAdmin(data.idToken);
    const { idToken: _idToken, ...payload } = data;
    const result = await sendOrderCancellationEmailInternal(payload);
    assertEmailSent(result, "order cancellation email");
    return { success: true as const };
  } catch (e: unknown) {
    console.error("Order cancellation email error:", e);
    return {
      success: false as const,
      error: formatZodError(e),
    };
  }
};
