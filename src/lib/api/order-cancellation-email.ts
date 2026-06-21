import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendOrderCancellationEmailInternal } from "../email";

export const sendOrderCancellationEmail = createServerFn({ method: "POST" })
  .validator(z.object({
    orderId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    items: z.array(z.object({
      name: z.string(),
      qty: z.number(),
      price: z.number(),
    })),
    total: z.number(),
    reason: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    await sendOrderCancellationEmailInternal(data);
    return { success: true };
  });
