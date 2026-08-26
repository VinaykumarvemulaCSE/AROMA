"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { googleAuthErrorMessage, signInWithGoogle, syncFirebaseUser, completeGoogleRedirectSignIn, consumeAuthRedirect } from "@/lib/auth/google";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto redirect if already signed in
  useEffect(() => {
    // Handle Google redirect sign-in result when this page loads after redirect
    (async () => {
      const completed = await completeGoogleRedirectSignIn();
      if (completed) {
        // Use stored redirect or fallback to profile
        router.push(consumeAuthRedirect('/profile'));
      }
    })();
    if (initialized && user) {
      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        router.push(redirectTo);
      } else {
        router.push("/profile");
      }
    }
  }, [initialized, user, redirectTo, router]);

  const goAfterLogin = () => {
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      router.push(redirectTo);
      return;
    }
    router.push("/profile");
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      const mapped = await syncFirebaseUser(cred.user);
      toast.success(`Welcome back, ${mapped.name}!`);
      goAfterLogin();
    } catch (err: unknown) {
      let message = "Sign in failed. Check your credentials.";
      if (err && typeof err === "object" && "code" in err) {
        const code = String(err.code);
        if (
          code === "auth/invalid-credential" ||
          code === "auth/user-not-found" ||
          code === "auth/wrong-password" ||
          code === "auth/invalid-email"
        ) {
          message = "Invalid email or password.";
        } else if (code === "auth/too-many-requests") {
          message = "Too many failed attempts. Please try again in a few minutes.";
        } else if (code === "auth/user-disabled") {
          message = "This account has been disabled.";
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
      const result = await signInWithGoogle({
        redirectTo: redirectTo ?? "/profile",
      });
      if (result.method === "redirect") return;
      toast.success(`Welcome, ${result.mappedUser?.name || result.user.displayName || "there"}!`);
      goAfterLogin();
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (code !== "auth/popup-closed-by-user") {
        toast.error(googleAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send password reset email.";
      toast.error(message);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-center">Welcome back</h1>
      <p className="text-center text-muted-foreground mt-1">Sign in to your Aroma account</p>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6 space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-3"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
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

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or sign in with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Password</Label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1.5 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-[calc(50%+3px)] -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        New here?{" "}
        <Link
          href={
            redirectTo ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}` : "/auth/signup"
          }
          className="text-primary font-medium"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}

export default function Login() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </SiteLayout>
  );
}
