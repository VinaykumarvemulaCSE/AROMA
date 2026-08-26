"use client";

import { useRouter } from "next/navigation";
import { reload, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { resendVerificationEmail } from "@/lib/api/resend-verification";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const result = await resendVerificationEmail({ data: { email: user.email } });
      if (!result.success) {
        if (auth.currentUser) {
          const { sendEmailVerification } = await import("firebase/auth");
          await sendEmailVerification(auth.currentUser);
          toast.success("Verification email sent!");
          return;
        }
        toast.error(result.error || "Failed to send verification email");
        return;
      }
      toast.success("Verification email sent!");
    } catch (err) {
      if (auth.currentUser) {
        try {
          const { sendEmailVerification } = await import("firebase/auth");
          await sendEmailVerification(auth.currentUser);
          toast.success("Verification email sent!");
          return;
        } catch {}
      }
      toast.error("Failed to send verification email");
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        toast.success("Email verified!");
        router.push("/profile");
      } else {
        toast.error("Email not yet verified");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <SiteLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md text-center p-6">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <strong>{user?.email}</strong>. Please check your
              inbox and click the link to complete your registration.
            </p>
            <div className="space-y-3">
              <Button onClick={handleCheck} disabled={loading} className="w-full" size="lg">
                {loading ? "Checking..." : "I've verified my email"}
              </Button>
              <Button
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
              <Button onClick={handleSignOut} variant="ghost" className="w-full">
                Sign out
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              If you don't see the email, check your spam folder or make sure you entered the
              correct email address.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
