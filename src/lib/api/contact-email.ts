"use server";
import { contactMessageSchema } from "../validation/schemas";
import { assertProductionSecrets } from "../config.server";
import { rateLimit } from "./rate-limit.server";
import { sendContactEmailInternal } from "../email.server";

export const sendContactEmail = async (rawData: unknown) => {
  const data = contactMessageSchema.parse(rawData);
  assertProductionSecrets({ smtp: true, adminEmail: true });
  await rateLimit(`contact_${data.email}`, 5, 10 * 60 * 1000);
  return sendContactEmailInternal(data);
};
