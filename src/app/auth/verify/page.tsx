"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          setTimeout(() => router.push("/profile"), 2000);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message || "Verification failed. The link may have expired.");
        });
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [mode, oobCode, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center p-6">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Button onClick={() => router.push("/auth/login")}>Back to Login</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <SiteLayout>
      <Suspense
        fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}
      >
        <VerifyEmailContent />
      </Suspense>
    </SiteLayout>
  );
}
