import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: typeof search.mode === "string" ? search.mode : undefined,
    oobCode: typeof search.oobCode === "string" ? search.oobCode : undefined,
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const navigate = useNavigate();
  const { mode, oobCode } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          setTimeout(() => navigate({ to: "/profile" }), 2000);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message || "Verification failed. The link may have expired.");
        });
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [mode, oobCode, navigate]);

  return (
    <SiteLayout>
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
              <Button onClick={() => navigate({ to: "/auth/login" })}>
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
