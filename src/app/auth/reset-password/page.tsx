"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [verifying, setVerifying] = useState(true);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      setCodeError("No reset code found in URL. Please request a new password reset link.");
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setAccountEmail(email);
        setVerifying(false);
      })
      .catch((err: unknown) => {
        console.error("verifyPasswordResetCode error:", err);
        setVerifying(false);
        setCodeError(
          "This password reset link is invalid or has expired. Please request a new link.",
        );
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset code.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password.";
      toast.error(msg);
      console.error("confirmPasswordReset error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying password reset link...</p>
      </div>
    );
  }

  if (codeError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="bg-card border border-destructive/30 rounded-2xl p-8 space-y-4">
          <AlertCircle className="size-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold font-display">Link Expired or Invalid</h1>
          <p className="text-muted-foreground text-sm">{codeError}</p>
          <div className="pt-2">
            <Link href="/auth/login">
              <Button variant="default" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
          <CheckCircle2 className="size-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold font-display">Password Reset Complete</h1>
          <p className="text-muted-foreground text-sm">
            Your password has been changed successfully. Redirecting you to the login page...
          </p>
          <div className="pt-2">
            <Link href="/auth/login">
              <Button variant="default" className="w-full">
                Log In Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold">Create New Password</h1>
        {accountEmail && (
          <p className="text-sm text-muted-foreground mt-1">
            Setting a new password for <span className="font-semibold text-foreground">{accountEmail}</span>
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={6}
                disabled={submitting}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting ? "Updating password..." : "Reset Password"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <SiteLayout>
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </SiteLayout>
  );
}
