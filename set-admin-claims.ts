/**
 * Sets Firebase Auth custom claim `{ admin: true }` for whitelisted admin emails.
 *
 * Usage:
 *   npx tsx set-admin-claims.ts admin@aroma.in
 *
 * Requires firebase-service-account.json in the project root (same as seed.ts).
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  loadFirebaseServiceAccount,
  hasFirebaseAdminCredentials,
} from "./src/lib/firebase-credentials.server";

// Initialize Firebase Admin using unified credential loader
if (hasFirebaseAdminCredentials()) {
  initializeApp({ credential: cert(loadFirebaseServiceAccount() as Parameters<typeof cert>[0]) });
} else {
  console.error(
    "\n❌ Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or appropriate env vars.",
  );
  process.exit(1);
}

const emailArg = process.argv[2];
const envEmails = (process.env.ADMIN_EMAIL ?? "kumarvinay072007@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const emails = emailArg ? [emailArg.trim().toLowerCase()] : envEmails;

async function setAdminClaim(email: string) {
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`✅ admin:true claim set for ${email} (uid: ${user.uid})`);
}

async function main() {
  for (const email of emails) {
    await setAdminClaim(email);
  }
  console.log("\nDone. Admin users must sign out and sign in again to refresh their token.");
}

main().catch((err) => {
  console.error("Failed to set admin claims:", err);
  process.exit(1);
});
