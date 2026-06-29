import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuth } from "firebase-admin/auth";
import { sendVerificationEmailInternal } from "../email";

export const resendVerificationEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const auth = getAuth();
    
    // Resolve the app URL: prefer explicit APP_URL env var,
    // fall back to Vercel's auto-injected VERCEL_URL, then localhost.
    const appUrl = process.env.APP_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const actionCodeSettings = {
      url: `${appUrl}/auth/verify`,
      handleCodeInApp: true,
    };
    
    const link = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);
    
    await sendVerificationEmailInternal({
      email: data.email,
      verificationLink: link,
    });
    
    return { success: true };
  });
