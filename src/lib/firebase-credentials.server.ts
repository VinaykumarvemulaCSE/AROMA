import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const SERVICE_ACCOUNT_FILES = ["serviceAccountKey.json", "firebase-service-account.json"] as const;

function normalizePrivateKey(key: string): string {
  // Convert escaped newline sequences ("\\n", "\\\\n", "\r\n") to actual newlines
  return key
    .replace(/\\r\\n/g, "\n")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function parseServiceAccountJson(raw: string, source: string): Record<string, unknown> {
  try {
    const serviceAccount = JSON.parse(raw) as Record<string, unknown>;
    if (typeof serviceAccount.private_key === "string") {
      serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
    }
    return serviceAccount;
  } catch (error) {
    throw new Error(
      `[Firebase Admin] Failed to parse ${source} – ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function readServiceAccountFile(): Record<string, unknown> | null {
  const fs = require("node:fs") as typeof import("node:fs");
  for (const filename of SERVICE_ACCOUNT_FILES) {
    const path = `${process.cwd()}/${filename}`;
    if (!fs.existsSync(/*turbopackIgnore: true*/ path)) continue;
    return parseServiceAccountJson(
      fs.readFileSync(/*turbopackIgnore: true*/ path, "utf-8"),
      filename,
    );
  }
  return null;
}

/** True when any supported Firebase Admin credential source is configured. */
export function hasFirebaseAdminCredentials(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim()) return true;
  if (process.env.FIREBASE_SERVICE_ACCOUNT?.trim()) return true;
  if (
    process.env.FIREBASE_PROJECT_ID?.trim() &&
    process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_PRIVATE_KEY?.trim()
  ) {
    return true;
  }
  return readServiceAccountFile() !== null;
}

/**
 * Loads Firebase Admin service-account credentials.
 * Priority: BASE64 → raw JSON env → local file → individual env vars.
 */
export function loadFirebaseServiceAccount(): Record<string, unknown> {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (base64) {
    const parsed = parseServiceAccountJson(
      Buffer.from(base64, "base64").toString("utf-8"),
      "FIREBASE_SERVICE_ACCOUNT_BASE64",
    );
    console.log("[Firebase Admin] Loaded service account for project ID:", parsed.project_id);
    return parsed;
  }

  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (rawJson) {
    return parseServiceAccountJson(rawJson, "FIREBASE_SERVICE_ACCOUNT");
  }

  const fromFile = readServiceAccountFile();
  if (fromFile) return fromFile;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[Firebase Admin] Missing credentials. Set one of:\n" +
        "  • FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended for Vercel)\n" +
        "  • FIREBASE_SERVICE_ACCOUNT (raw JSON string)\n" +
        "  • serviceAccountKey.json in project root\n" +
        "  • FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY",
    );
  }

  return {
    type: "service_account",
    project_id: projectId,
    client_email: clientEmail,
    private_key: normalizePrivateKey(privateKey),
  };
}
