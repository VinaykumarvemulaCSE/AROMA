"use server";
import { z } from "zod";
import { assertProductionSecrets } from "../config.server";
import { verifyAdmin } from "./auth-server.server";

function requireCloudinaryConfig() {
  assertProductionSecrets({ cloudinary: true });
  const cloud_name = (
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  )?.trim();
  const api_key = (
    process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  )?.trim();
  const api_secret = (
    process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
  )?.trim();
  
  if (!cloud_name || !api_key || !api_secret) {
    const missing = [];
    if (!cloud_name) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!api_key) missing.push("CLOUDINARY_API_KEY");
    if (!api_secret) missing.push("CLOUDINARY_API_SECRET");
    
    throw new Error(
      `Cloudinary is not fully configured. Missing: ${missing.join(", ")}`,
    );
  }
  return { cloud_name, api_key, api_secret, secure: true };
}

const uploadSchema = z.object({
  idToken: z.string().min(20),
  base64File: z.string().min(100),
  mimeType: z.string(),
  sizeInBytes: z.number(),
});

export const secureUploadImage = async (rawData: unknown) => {
  const data = uploadSchema.parse(rawData);
  await verifyAdmin(data.idToken);
  const cloudinaryConfig = requireCloudinaryConfig();

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
    cloudinary.config(cloudinaryConfig);

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
};

export const secureUploadGalleryImage = async (rawData: unknown) => {
  const data = uploadSchema.parse(rawData);
  await verifyAdmin(data.idToken);
  const cloudinaryConfig = requireCloudinaryConfig();

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
    cloudinary.config(cloudinaryConfig);

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
};

const deleteSchema = z.object({
  idToken: z.string().min(20),
  publicId: z.string().min(1),
});

export const secureDeleteImage = async (rawData: unknown) => {
  const data = deleteSchema.parse(rawData);
  await verifyAdmin(data.idToken);
  const cloudinaryConfig = requireCloudinaryConfig();

  try {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config(cloudinaryConfig);

    const result = await cloudinary.uploader.destroy(data.publicId);
    return { success: result.result === "ok" };
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw new Error("Failed to delete image securely.");
  }
};
