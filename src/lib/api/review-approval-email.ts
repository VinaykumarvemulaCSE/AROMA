"use server";
import { z } from "zod";
import {
  assertEmailSent,
  sendReviewApprovalEmailInternal,
} from "../email.server";
import { assertProductionSecrets } from "../config.server";
import { verifyAdmin } from "./auth-server.server";

const rvwSchema = z.object({
  idToken: z.string().min(20),
  customerName: z.string(),
  customerEmail: z.string().email(),
  reviewText: z.string(),
  rating: z.number(),
  itemName: z.string().optional(),
});

export const sendReviewApprovalEmail = async (rawData: unknown) => {
  const data = rvwSchema.parse(rawData);
  assertProductionSecrets({ firebase: true, smtp: true });
  await verifyAdmin(data.idToken);
  const { idToken: _idToken, ...payload } = data;
  const result = await sendReviewApprovalEmailInternal(payload);
  assertEmailSent(result, "review approval email");
  return { success: true as const };
};
