"use server";
import { contactMessageSchema } from "../validation/schemas";
import { assertProductionSecrets } from "../config.server";
import { rateLimit } from "./rate-limit.server";
import { parseSafe, formatZodError } from "./helper";
import { sendContactEmailInternal } from "../email.server";

export const sendContactEmail = async (rawData: unknown) => {
  try {
    const data = parseSafe(contactMessageSchema, rawData);
    assertProductionSecrets({ smtp: true, adminEmail: true });
    await rateLimit(`contact_${data.email}`, 5, 10 * 60 * 1000);
    return sendContactEmailInternal(data);
  } catch (error) {
    return { success: false, error: formatZodError(error) };
  }
};
