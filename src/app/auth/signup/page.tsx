"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendCustomVerificationEmail } from "@/lib/api/custom-verification";
import {
  googleAuthErrorMessage,
  signInWithGoogle,
  syncFirebaseUser,
} from "@/lib/auth/google";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [form, setForm] = useState({ name: "", email: "", pwd: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const goAfterSignup = () => {
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      router.push(redirectTo);
      return;
    }
    router.push("/profile");
  };

  // Email / password sign-up
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pwd !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.pwd.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.pwd);
      await updateProfile(cred.user, { displayName: form.name });
      await syncFirebaseUser(cred.user);
      // Send custom verification email with fallback to standard Firebase verification
      try {
        const result = await sendCustomVerificationEmail({ data: { email: form.email } });
        if (result && !result.success) {
          console.warn("Custom verification email failed, sending standard Firebase verification:", result.error);
          const { sendEmailVerification } = await import("firebase/auth");
          await sendEmailVerification(cred.user);
        }
      } catch (e) {
        console.warn("Custom verification email error, sending standard Firebase verification:", e);
        try {
          const { sendEmailVerification } = await import("firebase/auth");
          await sendEmailVerification(cred.user);
        } catch { }
      }

      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/verify-email");
    } catch (err: unknown) {
      let message = "Sign up failed.";
      if (err && typeof err === "object" && "code" in err) {
        const code = String(err.code);
        if (code === "auth/email-already-in-use") {
          message = "An account with this email already exists.";
        } else if (code === "auth/weak-password") {
          message = "Password is too weak. Please use a stronger password.";
        } else if (code === "auth/invalid-email") {
          message = "Invalid email address format.";
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

  // Google sign-up
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle({
        redirectTo: redirectTo ?? "/profile",
      });
      if (result.method === "redirect") return;
      toast.success(`Welcome, ${result.user.displayName ?? "there"}! 🎉`);
      goAfterSignup();
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (code !== "auth/popup-closed-by-user") {
        toast.error(googleAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-center">Create your account</h1>
      <p className="text-center text-muted-foreground mt-1">
        Join Aroma for faster checkout & order tracking
      </p>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6 space-y-4">
        {/* Google */}
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
          <span className="text-xs text-muted-foreground">or sign up with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
              placeholder="Vinay Kumar"
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={form.pwd}
              onChange={(e) => setForm({ ...form, pwd: e.target.value })}
              className="mt-1.5"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="mt-1.5"
              placeholder="Re-enter password"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
          className="text-primary font-medium"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}

export default function Signup() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </SiteLayout>
  );
}
