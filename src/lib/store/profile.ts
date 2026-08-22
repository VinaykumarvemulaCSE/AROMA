// src/lib/store/profile.ts
// Persists user profile data (name, phone, notification prefs) in Firestore users/{uid}.

import { db } from "../firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth, type User } from "./auth";

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    promo: boolean;
  };
};

const defaultNotifications = { email: true, sms: true, promo: false };

/**
 * Save user profile to Firestore and update the Zustand auth store.
 */
export async function saveUserProfile(
  uid: string,
  profile: Partial<UserProfile>,
) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...profile, updatedAt: Date.now() }, { merge: true });

  // Also update the local auth store so the UI reflects immediately
  const currentUser = useAuth.getState().user;
  if (currentUser && currentUser.id === uid) {
    useAuth.getState().setUser({
      ...currentUser,
      name: profile.name ?? currentUser.name,
      phone: profile.phone ?? currentUser.phone,
    });
  }
}

/**
 * Load the profile doc for the given user uid.
 */
export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    name: data.name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    avatar: data.avatar,
    notifications: {
      email: data.notifications?.email ?? true,
      sms: data.notifications?.sms ?? true,
      promo: data.notifications?.promo ?? false,
    },
  };
}

/**
 * Real-time listener for the user profile document.
 */
export function listenToUserProfile(
  uid: string,
  callback: (profile: UserProfile) => void,
): () => void {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        avatar: data.avatar,
        notifications: {
          email: data.notifications?.email ?? true,
          sms: data.notifications?.sms ?? true,
          promo: data.notifications?.promo ?? false,
        },
      });
    }
  });
}
