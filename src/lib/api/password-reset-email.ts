"use server";
import { z } from "zod";
import { assertEmailSent, sendPasswordResetEmailInternal } from "../email.server";
import { assertProductionSecrets, getAppUrl } from "../config.server";
import { getAdminAuth } from "../firebase-admin.server";
import { rateLimit } from "./rate-limit.server";
import { parseSafe, formatZodError } from "./helper";

/**
 * Branded password-reset email via SMTP.
 * Generates the Firebase reset link server-side (never accepts a client-supplied link).
 */
const pwdSchema = z.object({ email: z.string().email() });

export const sendPasswordResetEmail = async (rawData: unknown) => {
  try {
    const data = parseSafe(pwdSchema, rawData);
    assertProductionSecrets({ firebase: true, smtp: true });
    await rateLimit(`pwd_reset_${data.email.toLowerCase()}`, 3, 60 * 60 * 1000);

    const auth = await getAdminAuth();
    const appUrl = getAppUrl();
    const link = await auth.generatePasswordResetLink(data.email, {
      url: `${appUrl}/auth/login`,
      handleCodeInApp: true,
    });

    const result = await sendPasswordResetEmailInternal({
      email: data.email,
      resetLink: link,
    });
    assertEmailSent(result, "password reset email");
    return { success: true as const, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    // Avoid leaking whether the email exists
    if (
      message.includes("user-not-found") ||
      message.includes("USER_NOT_FOUND") ||
      message.includes("There is no user record")
    ) {
      return { success: true as const, error: null };
    }
    console.error("Password reset email error:", e);
    return { success: false as const, error: message };
  }
};
