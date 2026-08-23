// Server-only Firebase Admin. Dynamic import avoids bundler ESM eval crashes.
// Uses modular firebase-admin v14 APIs (firebase-admin/app|firestore|auth).
//
// Vercel setup — pick ONE of these methods (in priority order):
//
//   1. FIREBASE_SERVICE_ACCOUNT_BASE64  (recommended — no escaping issues)
//      PowerShell:  [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content serviceAccountKey.json -Raw)))
//      Bash/macOS:  base64 -i serviceAccountKey.json | tr -d '\n'
//      Paste the output as a single Vercel env var.
//
//   2. FIREBASE_SERVICE_ACCOUNT  (raw JSON string — works but fragile on Vercel)
//
//   3. Individual env vars:
//      FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//
//   4. Local file: serviceAccountKey.json (dev only)

import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { createRequire } from "node:module";

import { isProductionRuntime, assertProductionSecrets } from "./config.server";
import {
  hasFirebaseAdminCredentials,
  loadFirebaseServiceAccount,
} from "./firebase-credentials.server";

const require = createRequire(import.meta.url);

let _app: App | null = null;
let _initPromise: Promise<App> | null = null;

async function getApp(): Promise<App> {
  if (_app) return _app;

  if (!_initPromise) {
    _initPromise = (async () => {
      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      const existing = getApps();
      if (existing.length > 0) {
        _app = existing[0]!;
        return _app as App;
      }

      assertProductionSecrets({ firebase: true });
      try {
        if (hasFirebaseAdminCredentials()) {
          _app = initializeApp({
            credential: cert(
              loadFirebaseServiceAccount() as Parameters<typeof cert>[0],
            ),
          });
        } else if (!isProductionRuntime()) {
          // Local ADC / emulator fallback only — never in production
          _app = initializeApp();
        } else {
          throw new Error(
            "Firebase Admin credentials are required in production. " +
              "Set FIREBASE_SERVICE_ACCOUNT_BASE64 on Vercel.",
          );
        }
        return _app as App;
      } catch (error) {
        _initPromise = null;
        _app = null;
        console.error(
          "FATAL: Firebase Admin SDK initialization failed:",
          error instanceof Error ? error.message : error,
        );
        throw error instanceof Error
          ? error
          : new Error("Firebase Admin SDK initialization failed.");
      }
    })();
  }

  return _initPromise as Promise<App>;
}

/** Returns an initialised Firestore instance. */
export async function getDb(): Promise<Firestore> {
  const app = await getApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore(app);
}

/** Returns an initialised Auth instance. */
export async function getAdminAuth(): Promise<Auth> {
  const app = await getApp();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(app);
}
