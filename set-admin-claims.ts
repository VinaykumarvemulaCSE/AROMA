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
import * as fs from "fs";
import * as path from "path";

const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("\n❌ firebase-service-account.json not found in project root.");
  console.error("Download it from Firebase Console → Project Settings → Service Accounts.\n");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))) });
}

const emailArg = process.argv[2];
const envEmails = (process.env.VITE_ADMIN_EMAIL ?? "admin@aroma.in")
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
