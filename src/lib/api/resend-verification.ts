import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuth } from "firebase-admin/auth";
import { sendVerificationEmailInternal } from "../email";

export const resendVerificationEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const auth = getAuth();
    
    const actionCodeSettings = {
      url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/auth/verify`,
      handleCodeInApp: true,
    };
    
    const link = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);
    
    await sendVerificationEmailInternal({
      email: data.email,
      verificationLink: link,
    });
    
    return { success: true };
  });
