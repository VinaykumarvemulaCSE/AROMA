import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { hasAdminClaim } from "@/lib/auth/admin";
import { signOutUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign in — Aroma" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized && user?.role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [initialized, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      const u = cred.user;

      const tokenResult = await getIdTokenResult(u, true);
      if (!hasAdminClaim(tokenResult.claims as Record<string, unknown>)) {
        await signOutUser();
        toast.error(
          "Admin privileges not configured. Run set-admin-claims.ts for this email, then sign in again.",
        );
        return;
      }

      toast.success("Welcome, admin!");
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your admin email first to reset your password.");
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

  if (!initialized) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30 p-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-8"
      >
        <div className="flex items-center gap-2">
          <div className="grid place-items-center size-10 rounded-full bg-primary text-primary-foreground font-display font-bold">
            A
          </div>
          <div>
            <p className="font-display font-semibold">Aroma Admin</p>
            <p className="text-xs text-muted-foreground">Restaurant dashboard</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
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
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="mt-1.5"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
