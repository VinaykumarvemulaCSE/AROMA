"use server";
import { z } from "zod";
import { getDb } from "../firebase-admin.server";
import { assertProductionSecrets } from "../config.server";
import { rateLimit } from "./rate-limit.server";
import { sanitizeInput } from "../sanitize";
import { parseSafe, formatZodError } from "./helper";

const reviewInputSchema = z.object({
  name: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  body: z.string().min(10).max(2000),
  itemId: z.string().optional(),
});

export const submitReview = async (rawData: unknown) => {
  try {
    const data = parseSafe(reviewInputSchema, rawData);
    assertProductionSecrets({ firebase: true });
    const adminDb = await getDb();
    await rateLimit(`review_${data.name.slice(0, 20)}`, 3, 60 * 60 * 1000);

    const doc = {
      name: sanitizeInput(data.name),
      rating: data.rating,
      title: sanitizeInput(data.title),
      body: sanitizeInput(data.body),
      date: new Date().toISOString().slice(0, 10),
      helpful: 0,
      verified: false,
      status: "pending",
      ...(data.itemId ? { itemId: data.itemId } : {}),
    };

    const ref = await adminDb.collection("reviews").add(doc);
    return { success: true as const, id: ref.id };
  } catch (e: unknown) {
    console.error("Submit review error:", e);
    return {
      success: false as const,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};
