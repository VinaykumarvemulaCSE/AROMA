import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendPasswordResetEmailInternal } from "../email";

export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .validator(z.object({
    email: z.string().email(),
    resetLink: z.string(),
  }))
  .handler(async ({ data }) => {
    await sendPasswordResetEmailInternal(data);
    return { success: true };
  });
