import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendCustomVerificationEmail } from "@/lib/api/custom-verification";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — Aroma Cafe" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pwd: "", confirm: "" });
  const [loading, setLoading] = useState(false);

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
      
      // Send custom verification email
      await sendCustomVerificationEmail({ data: { email: form.email } });
      
      toast.success("Account created! Please check your email to verify.");
      navigate({ to: "/auth/verify-email" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Google sign-up
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome, ${cred.user.displayName ?? "there"}! 🎉`);
      navigate({ to: "/profile" });
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      if (code !== "auth/popup-closed-by-user") {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
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
                placeholder="Arjun Kumar"
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
          <Link to="/auth/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}
