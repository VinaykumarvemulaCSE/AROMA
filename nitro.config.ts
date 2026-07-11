import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  external: ["firebase-admin", "nodemailer", "cloudinary", "dompurify"],
  alias: {
    "@": "./src",
  },
});
