import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendOrderStatusEmailInternal } from "../email";

export const sendOrderStatusEmail = createServerFn({ method: "POST" })
  .validator(z.object({
    orderId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    status: z.string(),
    items: z.array(z.object({
      name: z.string(),
      qty: z.number(),
      price: z.number(),
    })),
    total: z.number(),
  }))
  .handler(async ({ data }) => {
    await sendOrderStatusEmailInternal(data);
    return { success: true };
  });
