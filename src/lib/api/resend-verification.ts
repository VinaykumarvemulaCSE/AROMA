"use server";
import { z } from "zod";
import { getAdminAuth } from "../firebase-admin.server";
import { assertEmailSent, sendVerificationEmailInternal } from "../email.server";
import { assertProductionSecrets, getAppUrl } from "../config.server";
import { rateLimit } from "./rate-limit.server";
import { parseSafe, formatZodError } from "./helper";

const resendSchema = z.object({ email: z.string().email() });

export const resendVerificationEmail = async (rawData: unknown) => {
  try {
    const data = parseSafe(resendSchema, rawData);
    assertProductionSecrets({ firebase: true, smtp: true });
    await rateLimit(`resend_verify_${data.email.toLowerCase()}`, 5, 60 * 60 * 1000);

    const auth = await getAdminAuth();
    const appUrl = getAppUrl();

    const actionCodeSettings = {
      url: `${appUrl}/auth/verify`,
      handleCodeInApp: true,
    };

    const rawLink = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);

    let verificationLink = rawLink;
    try {
      const parsedUrl = new URL(rawLink);
      const oobCode = parsedUrl.searchParams.get("oobCode");
      if (oobCode) {
        verificationLink = `${appUrl}/auth/verify?mode=verifyEmail&oobCode=${encodeURIComponent(oobCode)}`;
      }
    } catch {
      // fallback to rawLink
    }

    const result = await sendVerificationEmailInternal({
      email: data.email,
      verificationLink,
    });
    assertEmailSent(result, "verification email");

    return { success: true as const };
  } catch (e: unknown) {
    console.error("Resend verification error:", e);
    return {
      success: false as const,
      error: formatZodError(e),
    };
  }
};
