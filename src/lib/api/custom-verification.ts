import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import "../firebase-admin"; // Initialize app first
import { getAuth } from "firebase-admin/auth";
import { sendVerificationEmailInternal } from "../email";

export const sendCustomVerificationEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const auth = getAuth();
    
    // Generate custom verification link
    // Resolve the app URL: prefer explicit APP_URL env var,
    // fall back to Vercel's auto-injected VERCEL_URL, then localhost.
    const appUrl = process.env.APP_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");
    
    const actionCodeSettings = {
      url: `${appUrl}/auth/verify`,
      handleCodeInApp: true,
    };
    
    const link = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);
    
    // Send custom email via Nodemailer
    await sendVerificationEmailInternal({
      email: data.email,
      verificationLink: link,
    });
    
    return { success: true };
  });
