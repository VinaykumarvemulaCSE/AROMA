import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuth } from "firebase-admin/auth";
import { sendVerificationEmailInternal } from "../email";

export const sendCustomVerificationEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const auth = getAuth();
    
    // Generate custom verification link
    const actionCodeSettings = {
      url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/auth/verify`,
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
