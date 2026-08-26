import type { User as FirebaseUser } from "firebase/auth";
import { getIdTokenResult, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth, type User } from "@/lib/store/auth";
import { hasAdminClaim } from "./admin";

export async function mapFirebaseUser(fbUser: FirebaseUser): Promise<User> {
  const tokenResult = await getIdTokenResult(fbUser);
  const adminByClaim = hasAdminClaim(tokenResult.claims as Record<string, unknown>);
  const role: User["role"] = adminByClaim ? "admin" : "customer";

  let name = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
  let phone = fbUser.phoneNumber || undefined;
  let avatar = fbUser.photoURL || undefined;
  let notifications = { email: true, sms: true, promo: false };

  try {
    const snap = await getDoc(doc(db, "users", fbUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.name) name = data.name;
      if (data.phone) phone = data.phone;
      if (data.avatar) avatar = data.avatar;
      if (data.notifications) {
        notifications = {
          email: data.notifications.email ?? true,
          sms: data.notifications.sms ?? true,
          promo: data.notifications.promo ?? false,
        };
      }
    }
  } catch (e) {
    // Ignore offline or read errors on boot
  }

  return {
    id: fbUser.uid,
    name,
    email: fbUser.email ?? "",
    phone,
    avatar,
    role,
    emailVerified: fbUser.emailVerified,
    notifications,
  };
}

/**
 * Ensures user profile doc exists in Firestore `users/{uid}`.
 */
export async function syncFirestoreUserDoc(fbUser: FirebaseUser, mapped: User) {
  try {
    const userRef = doc(db, "users", fbUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: mapped.name,
        email: mapped.email,
        avatar: mapped.avatar || null,
        phone: mapped.phone || "",
        role: mapped.role,
        notifications: mapped.notifications || { email: true, sms: true, promo: false },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      const data = snap.data();
      const updates: Record<string, unknown> = {};
      if (!data.name && mapped.name) updates.name = mapped.name;
      if (!data.email && mapped.email) updates.email = mapped.email;
      if (!data.avatar && mapped.avatar) updates.avatar = mapped.avatar;
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await setDoc(userRef, updates, { merge: true });
      }
    }
  } catch (err) {
    console.error("Failed to sync user profile to Firestore:", err);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore sign-out errors (e.g. already signed out)
  }
  useAuth.getState().clearUser();
}
