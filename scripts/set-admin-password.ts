/**
 * Sets or updates the password for a user in Firebase Auth using Firebase Admin SDK.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/set-admin-password.ts email@example.com "NewPassword123"
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  loadFirebaseServiceAccount,
  hasFirebaseAdminCredentials,
} from "../src/lib/firebase-credentials.server";

if (!hasFirebaseAdminCredentials()) {
  console.error(
    "\n❌ Firebase Admin credentials are missing. Ensure .env has FIREBASE_SERVICE_ACCOUNT_BASE64 or serviceAccountKey.json is in root.",
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(loadFirebaseServiceAccount() as Parameters<typeof cert>[0]) });
}

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!email || !password) {
  console.error("\n❌ Usage: npx tsx --env-file=.env scripts/set-admin-password.ts <email> <password>");
  process.exit(1);
}

if (password.length < 6) {
  console.error("\n❌ Password must be at least 6 characters long.");
  process.exit(1);
}

async function main() {
  const auth = getAuth();
  try {
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password });
    // Also ensure admin claim is set
    await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
    console.log(`\n✅ Successfully set password and admin:true claim for ${email} (UID: ${user.uid})!`);
    console.log(`You can now sign in at /admin/login with your email and new password.`);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found") {
      console.log(`User ${email} does not exist yet. Creating user account...`);
      const newUser = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });
      await auth.setCustomUserClaims(newUser.uid, { admin: true });
      console.log(`\n✅ Created new admin account with password for ${email} (UID: ${newUser.uid})!`);
    } else {
      console.error("\n❌ Failed to set password:", err);
      process.exit(1);
    }
  }
}

main();
