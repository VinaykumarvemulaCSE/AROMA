"use server";
import { z } from "zod";
import { getAdminAuth } from "../firebase-admin.server";
import {
  assertEmailSent,
  sendVerificationEmailInternal,
} from "../email.server";
import { assertProductionSecrets, getAppUrl } from "../config.server";
import { rateLimit } from "./rate-limit.server";

const verifySchema = z.object({ email: z.string().email() });

export const sendCustomVerificationEmail = async (rawData: unknown) => {
  const data = verifySchema.parse(rawData);
  try {
    assertProductionSecrets({ firebase: true, smtp: true });
    await rateLimit(`verify_${data.email.toLowerCase()}`, 5, 60 * 60 * 1000);

    const auth = await getAdminAuth();
    const appUrl = getAppUrl();

    const actionCodeSettings = {
      url: `${appUrl}/auth/verify`,
      handleCodeInApp: true,
    };

    const link = await auth.generateEmailVerificationLink(
      data.email,
      actionCodeSettings,
    );

    const result = await sendVerificationEmailInternal({
      email: data.email,
      verificationLink: link,
    });
    assertEmailSent(result, "verification email");

    return { success: true as const, error: null };
  } catch (e: unknown) {
    console.error("Verification Email Error:", e);
    return {
      success: false as const,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};
