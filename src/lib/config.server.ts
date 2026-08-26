import process from "node:process";

import { hasFirebaseAdminCredentials } from "./firebase-credentials.server";

// Server-only config — values here never reach the browser.
// Always read process.env INSIDE a function (per-request), never at module scope.

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: isProductionRuntime(),
    hasFirebaseServiceAccount: hasFirebaseAdminCredentials(),
    hasSmtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    hasCloudinary: Boolean(
      (
        process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      )?.trim() &&
      (process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)?.trim() &&
      (process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET)?.trim(),
    ),
    adminEmail: process.env.ADMIN_EMAIL || "",
  };
}

/**
 * Throws in production when required secrets are missing.
 * Call from server handlers that depend on these services.
 */
export function assertProductionSecrets(options?: {
  smtp?: boolean;
  cloudinary?: boolean;
  firebase?: boolean;
  adminEmail?: boolean;
}) {
  if (!isProductionRuntime()) return;

  const missing: string[] = [];
  const opts = {
    firebase: true,
    smtp: false,
    cloudinary: false,
    adminEmail: false,
    ...options,
  };

  if (opts.firebase && !hasFirebaseAdminCredentials()) {
    missing.push(
      "Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_SERVICE_ACCOUNT, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)",
    );
  }
  if (opts.smtp && !(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) {
    missing.push("SMTP_HOST, SMTP_USER, SMTP_PASS");
  }
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  )?.trim();
  const apiKey = (
    process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  )?.trim();
  const apiSecret = (
    process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
  )?.trim();
  if (opts.cloudinary && !(cloudName && apiKey && apiSecret)) {
    missing.push("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }
  if (opts.adminEmail && !process.env.ADMIN_EMAIL) {
    missing.push("ADMIN_EMAIL");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variable(s): ${missing.join("; ")}`);
  }
}

/** Canonical public app origin for email links and redirects (server-only). */
export function getAppUrl(): string {
  const appUrl =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://aroma-cafe-072007.vercel.app";
  return appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
}
