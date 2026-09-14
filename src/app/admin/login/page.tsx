"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdTokenResult,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { hasAdminClaim } from "@/lib/auth/admin";
import { signOutUser } from "@/lib/auth/session";
import {
  signInWithGoogle,
  completeGoogleRedirectSignIn,
  googleAuthErrorMessage,
} from "@/lib/auth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-secondary/30 p-4">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Google redirect sign-in completion on return
  useEffect(() => {
    (async () => {
      const completed = await completeGoogleRedirectSignIn();
      if (completed) {
        const u = useAuth.getState().user;
        if (u && u.role !== "admin") {
          await signOutUser();
          toast.error(
            `Access denied. ${u.email || "This account"} does not have admin privileges. Run set-admin-claims.ts first.`
          );
          return;
        }
        goAfterLogin();
      }
    })();
  }, []);

  useEffect(() => {
    if (initialized && user?.role === "admin") {
      if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.startsWith("//")) {
        router.push(redirectTo);
      } else {
        router.push("/admin");
      }
    }
  }, [initialized, user, router, redirectTo]);

  const goAfterLogin = () => {
    if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.startsWith("//")) {
      router.push(redirectTo);
      return;
    }
    router.push("/admin");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your admin email.");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pwd);
      const u = cred.user;

      const tokenResult = await getIdTokenResult(u, true);
      if (!hasAdminClaim(tokenResult.claims as Record<string, unknown>)) {
        await signOutUser();
        toast.error(
          "Admin privileges not configured. Run set-admin-claims.ts for this email, then sign in again."
        );
        return;
      }

      toast.success("Welcome, admin!");
      goAfterLogin();
    } catch (err: unknown) {
      let message = "Sign in failed. Check your credentials.";
      if (err && typeof err === "object" && "code" in err) {
        const code = String(err.code);
        if (
          code === "auth/invalid-credential" ||
          code === "auth/wrong-password" ||
          code === "auth/user-not-found"
        ) {
          message =
            "Invalid email or password. If you signed up with Google, click 'Continue with Google' above.";
        } else if (code === "auth/invalid-email") {
          message = "Please enter a valid email address.";
        } else if (code === "auth/too-many-requests") {
          message = "Too many failed attempts. Please try again in a few minutes or reset your password.";
        } else if (code === "auth/user-disabled") {
          message = "This admin account has been disabled.";
        } else if (err instanceof Error) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle({ redirectTo: redirectTo || "/admin" });
      if (result.method === "popup") {
        if (result.mappedUser.role !== "admin") {
          await signOutUser();
          toast.error(
            `Access denied. ${result.mappedUser.email} does not have admin privileges. Run set-admin-claims.ts first.`
          );
          return;
        }
        toast.success(`Welcome, ${result.mappedUser.name}!`);
        goAfterLogin();
      }
    } catch (err) {
      toast.error(googleAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your admin email first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err: unknown) {
      let message = "Failed to send password reset email.";
      if (err && typeof err === "object" && "code" in err) {
        const code = String(err.code);
        if (code === "auth/user-not-found") {
          message = "No account found with this email. Please check the email or sign in with Google.";
        } else if (code === "auth/invalid-email") {
          message = "Invalid email address format.";
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30 p-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/30 p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center size-10 rounded-full bg-primary text-primary-foreground font-display font-bold">
            A
          </div>
          <div>
            <p className="font-display font-semibold">Aroma Admin</p>
            <p className="text-xs text-muted-foreground">Restaurant dashboard</p>
          </div>
        </div>

        {/* Google Sign-in for Admin */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 cursor-pointer"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Admin email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="admin@aroma.in"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Password</Label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="mt-1.5 pr-10"
                placeholder="Enter Password..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-[calc(50%+3px)] -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in with Email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
