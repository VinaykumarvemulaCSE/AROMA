import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminDb } from "../firebase-admin";
import { rateLimit } from "./rate-limit";

export const validateCouponCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(1),
      subtotal: z.number().nonnegative(),
    }),
  )
  .handler(async ({ data }) => {
    await rateLimit(`coupon_${data.code.toUpperCase()}`, 20, 60 * 1000);

    const code = data.code.toUpperCase().trim();
    const doc = await adminDb.collection("coupons").doc(code).get();
    if (!doc.exists) {
      return { valid: false as const, error: "Invalid coupon code." };
    }

    const coupon = doc.data()!;
    if (coupon.status === "Paused") {
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
  });
