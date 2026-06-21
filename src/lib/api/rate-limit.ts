import { adminDb } from "../firebase-admin";

/**
 * Firestore-backed rate limiter for server functions.
 * Works across serverless instances in the same Firebase project.
 */
export async function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
  const docRef = adminDb.collection("_ratelimit").doc(safeKey);
  const now = Date.now();

  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);

    if (!snap.exists || now > snap.data()!.resetTime) {
      transaction.set(docRef, { count: 1, resetTime: now + windowMs });
      return;
    }

    const data = snap.data()!;
    if (data.count >= maxRequests) {
      const minutesLeft = Math.ceil((data.resetTime - now) / 60000);
      throw new Error(`Too many requests. Please try again in ${minutesLeft} minute(s).`);
    }

    transaction.update(docRef, { count: data.count + 1 });
  });
}
