"use server";
import { z } from "zod";
import {
  assertEmailSent,
  sendPasswordResetEmailInternal,
} from "../email.server";
import { assertProductionSecrets, getAppUrl } from "../config.server";
import { getAdminAuth } from "../firebase-admin.server";
import { rateLimit } from "./rate-limit.server";

/**
 * Branded password-reset email via SMTP.
 * Generates the Firebase reset link server-side (never accepts a client-supplied link).
 */
const pwdSchema = z.object({
  email: z.string().email(),
});

export const sendPasswordResetEmail = async (rawData: unknown) => {
  const data = pwdSchema.parse(rawData);
  try {
    assertProductionSecrets({ firebase: true, smtp: true });
    await rateLimit(`pwdreset_${data.email.toLowerCase()}`, 3, 60 * 60 * 1000);

    const auth = await getAdminAuth();
    const appUrl = getAppUrl();
    const resetLink = await auth.generatePasswordResetLink(data.email, {
      url: `${appUrl}/auth/login`,
      handleCodeInApp: false,
    });

    const result = await sendPasswordResetEmailInternal({
      email: data.email,
      resetLink,
    });
    assertEmailSent(result, "password reset email");
    return { success: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    // Avoid leaking whether the email exists
    if (
      message.includes("user-not-found") ||
      message.includes("USER_NOT_FOUND") ||
      message.includes("There is no user record")
    ) {
      return { success: true as const };
    }
    console.error("Password reset email error:", e);
    return { success: false as const, error: message };
  }
};
