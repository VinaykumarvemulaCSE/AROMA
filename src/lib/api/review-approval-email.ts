"use server";
import { z } from "zod";
import {
  assertEmailSent,
  sendReviewApprovalEmailInternal,
} from "../email.server";
import { assertProductionSecrets } from "../config.server";
import { verifyAdmin } from "./auth-server.server";

import { parseSafe, formatZodError } from "./helper";

const rvwSchema = z.object({
  idToken: z.string().min(20),
  customerName: z.string(),
  customerEmail: z.string().email(),
  reviewText: z.string(),
  rating: z.number(),
  itemName: z.string().optional(),
});

export const sendReviewApprovalEmail = async (rawData: unknown) => {
  try {
    const data = parseSafe(rvwSchema, rawData);
    assertProductionSecrets({ firebase: true, smtp: true });
    await verifyAdmin(data.idToken);
    const { idToken: _idToken, ...payload } = data;
    const result = await sendReviewApprovalEmailInternal(payload);
    assertEmailSent(result, "review approval email");
    return { success: true as const };
  } catch (e: unknown) {
    console.error("Review approval email error:", e);
    return {
      success: false as const,
      error: formatZodError(e),
    };
  }
};
