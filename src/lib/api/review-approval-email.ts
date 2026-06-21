import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendReviewApprovalEmailInternal } from "../email";

export const sendReviewApprovalEmail = createServerFn({ method: "POST" })
  .validator(z.object({
    customerName: z.string(),
    customerEmail: z.string().email(),
    reviewText: z.string(),
    rating: z.number(),
    itemName: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    await sendReviewApprovalEmailInternal(data);
    return { success: true };
  });
