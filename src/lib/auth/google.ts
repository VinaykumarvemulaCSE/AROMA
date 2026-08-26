import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { mapFirebaseUser, syncFirestoreUserDoc } from "./session";
import { toast } from "sonner";

const AUTH_REDIRECT_KEY = "aroma_auth_redirect";

/** Persist post-login destination across Google redirect flow. */
export function stashAuthRedirect(path: string) {
  if (path.startsWith("/") && !path.startsWith("//")) {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, path);
  }
}

export function consumeAuthRedirect(fallback = "/profile"): string {
  const stored = sessionStorage.getItem(AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  if (stored && stored.startsWith("/") && !stored.startsWith("//")) {
    return stored;
  }
  return fallback;
}

/** Sync Firebase user into Zustand & Firestore immediately. */
export async function syncFirebaseUser(fbUser: FirebaseUser) {
  const mapped = await mapFirebaseUser(fbUser);
  await syncFirestoreUserDoc(fbUser, mapped);
  useAuth.getState().setUser(mapped);
  useAuth.getState().setInitialized(true);
  return mapped;
}

function isPopupBlockedError(code: string) {
  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * Google sign-in: popup on desktop; redirect fallback when popup is blocked
 * (common on mobile and some deployed environments).
 */
export async function signInWithGoogle(options?: { redirectTo?: string }) {
  const redirectTo = options?.redirectTo ?? "/profile";
  stashAuthRedirect(redirectTo);
  // Always use redirect flow – avoids COOP‑blocked pop‑ups
  await signInWithRedirect(auth, googleProvider);
  return { method: "redirect" as const };
}

/** Call once on app boot to finish Google redirect sign-in. */
export async function completeGoogleRedirectSignIn(): Promise<boolean> {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return false;
    const mapped = await syncFirebaseUser(result.user);
    toast.success(`Welcome back, ${mapped.name}!`);
    return true;
  } catch (err) {
    console.error("Google redirect sign-in failed:", err);
    toast.error(googleAuthErrorMessage(err));
    return false;
  }
}

export function googleAuthErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String(err.code);
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for Google sign-in. Add your domain in Firebase Console → Authentication → Settings → Authorized domains.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
    }
    if (code === "auth/network-request-failed") {
      return "Network error. Please check your internet connection and try again.";
    }
    if (code === "auth/account-exists-with-different-credential") {
      return "An account already exists with the same email address using a different sign-in method.";
    }
    if (code === "auth/popup-blocked") {
      return "Popup was blocked by your browser. Attempting redirect sign-in...";
    }
  }
  return err instanceof Error ? err.message : "Google sign-in failed.";
}
