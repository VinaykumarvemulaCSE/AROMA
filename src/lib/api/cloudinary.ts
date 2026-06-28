import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdmin } from "./auth-server";

export const secureUploadImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      idToken: z.string().min(20),
      base64File: z.string().min(100),
      mimeType: z.string(),
      sizeInBytes: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(data.mimeType)) {
      throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
    }

    const MAX_SIZE_MB = 5;
    if (data.sizeInBytes > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
    }

    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(data.base64File, {
        folder: "aroma-cafe/menu",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Failed to upload image securely.");
    }
  });

export const secureUploadGalleryImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      idToken: z.string().min(20),
      base64File: z.string().min(100),
      mimeType: z.string(),
      sizeInBytes: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(data.mimeType)) {
      throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
    }

    const MAX_SIZE_MB = 5;
    if (data.sizeInBytes > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
    }

    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(data.base64File, {
        folder: "aroma-cafe/gallery",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Failed to upload image securely.");
    }
  });

export const secureDeleteImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      idToken: z.string().min(20),
      publicId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);

    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.destroy(data.publicId);
      return { success: result.result === "ok" };
    } catch (err) {
      console.error("Cloudinary delete error:", err);
      throw new Error("Failed to delete image securely.");
    }
  });
