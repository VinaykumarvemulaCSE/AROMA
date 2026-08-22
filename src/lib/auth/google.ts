import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { mapFirebaseUser } from "./session";

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

/** Sync Firebase user into Zustand immediately (avoids race before navigation). */
export async function syncFirebaseUser(fbUser: FirebaseUser) {
  const mapped = await mapFirebaseUser(fbUser);
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

  // Mobile browsers often block popups — use redirect directly
  if (isMobileBrowser()) {
    await signInWithRedirect(auth, googleProvider);
    return { method: "redirect" as const };
  }

  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncFirebaseUser(cred.user);
    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    return { method: "popup" as const, user: cred.user };
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err ? String(err.code) : "";

    if (isPopupBlockedError(code) && code !== "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, googleProvider);
      return { method: "redirect" as const };
    }

    throw err;
  }
}

/** Call once on app boot to finish Google redirect sign-in. */
export async function completeGoogleRedirectSignIn(): Promise<boolean> {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return false;
    await syncFirebaseUser(result.user);
    return true;
  } catch (err) {
    console.error("Google redirect sign-in failed:", err);
    return false;
  }
}

export function googleAuthErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String(err.code);
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for sign-in. Add your Vercel URL in Firebase Console → Authentication → Settings → Authorized domains.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
    }
    if (code === "auth/network-request-failed") {
      return "Network error. Check your connection and try again.";
    }
  }
  return err instanceof Error ? err.message : "Google sign-in failed.";
}
