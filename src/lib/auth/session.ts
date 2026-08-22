import type { User as FirebaseUser } from "firebase/auth";
import { getIdTokenResult, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth, type User } from "@/lib/store/auth";
import { hasAdminClaim } from "./admin";

export async function mapFirebaseUser(fbUser: FirebaseUser): Promise<User> {
  const tokenResult = await getIdTokenResult(fbUser);
  const adminByClaim = hasAdminClaim(tokenResult.claims as Record<string, unknown>);
  const role: User["role"] = adminByClaim ? "admin" : "customer";

  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    email: fbUser.email ?? "",
    avatar: fbUser.photoURL ?? undefined,
    role,
    emailVerified: fbUser.emailVerified,
    notifications: {
      email: true,
      sms: true,
      promo: false,
    },
  };
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore sign-out errors (e.g. already signed out)
  }
  useAuth.getState().clearUser();
}
