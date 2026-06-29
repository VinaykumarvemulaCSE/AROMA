import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import "../firebase-admin"; // Initialize app first
import { getAuth } from "firebase-admin/auth";
import { sendVerificationEmailInternal } from "../email";

export const sendCustomVerificationEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    try {
      const auth = getAuth();
      
      const appUrl = process.env.APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");
      
      const actionCodeSettings = {
        url: `${appUrl}/auth/verify`,
        handleCodeInApp: true,
      };
      
      const link = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);
      
      await sendVerificationEmailInternal({
        email: data.email,
        verificationLink: link,
      });
      
      return { success: true, error: null };
    } catch (e: any) {
      console.error("Verification Email Error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });
