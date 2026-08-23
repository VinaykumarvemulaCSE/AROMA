"use server";
import { z } from "zod";
import { getDb } from "../firebase-admin.server";
import { assertProductionSecrets } from "../config.server";
import { rateLimit } from "./rate-limit.server";
import { parseSafe, formatZodError } from "./helper";

const couponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export const validateCouponCode = async (rawData: unknown) => {
  try {
    const data = parseSafe(couponSchema, rawData);
    assertProductionSecrets({ firebase: true });
    const adminDb = await getDb();
    await rateLimit(`coupon_${data.code.toUpperCase()}`, 20, 60 * 1000);

    const code = data.code.toUpperCase().trim();
    const docSnap = await adminDb.collection("coupons").doc(code).get();
    if (!docSnap.exists) {
      return { valid: false as const, error: "Invalid coupon code." };
    }

    const coupon = docSnap.data()!;
    if (coupon.status !== "Active") {
      return { valid: false as const, error: "This coupon is not active." };
    }
    if (coupon.maxUses > 0 && coupon.used >= coupon.maxUses) {
      return { valid: false as const, error: "This coupon has reached its usage limit." };
    }
    if (data.subtotal < coupon.minOrder) {
      return {
        valid: false as const,
        error: `Minimum order of ₹${coupon.minOrder} required.`,
      };
    }

    return {
      valid: true as const,
      coupon: {
        code,
        discountAmount: coupon.discountAmount as number,
        minOrder: coupon.minOrder as number,
      },
    };
  } catch (e: unknown) {
    console.error("Coupon Validation Error:", e);
    return {
      valid: false as const,
      error: formatZodError(e),
    };
  }
};
