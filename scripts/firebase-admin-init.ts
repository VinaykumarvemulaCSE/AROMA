/**
 * Shared Firebase Admin init for CLI scripts (seed, set-admin-claims).
 * Checks serviceAccountKey.json and firebase-service-account.json.
 */
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import * as fs from "node:fs";
import * as path from "node:path";

const CANDIDATE_FILES = ["serviceAccountKey.json", "firebase-service-account.json"];

function loadServiceAccountFromEnv(): Record<string, unknown> | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (base64) {
    const parsed = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) {
    const parsed = JSON.parse(raw);
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (projectId && clientEmail && privateKey) {
    return {
      type: "service_account",
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

function loadServiceAccountFromFile(): Record<string, unknown> | null {
  for (const filename of CANDIDATE_FILES) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }
  return null;
}

export function initFirebaseAdminForScripts(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const serviceAccount = loadServiceAccountFromEnv() ?? loadServiceAccountFromFile();
  if (!serviceAccount) {
    console.error("\n❌ Firebase Admin credentials not found.");
    console.error("Provide one of:");
    console.error("  • serviceAccountKey.json in project root");
    console.error("  • FIREBASE_SERVICE_ACCOUNT_BASE64 in .env");
    console.error("  • FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env\n");
    process.exit(1);
  }

  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}
