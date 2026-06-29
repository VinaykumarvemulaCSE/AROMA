import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import "../_libs/firebase.mjs";
import { c as sendPasswordResetEmail, l as signInWithEmailAndPassword, u as signInWithPopup } from "../_libs/firebase__auth.mjs";
import { i as googleProvider, t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Route } from "./auth.login-DLUsCbpv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.login-DVDVepeE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const { redirect: redirectTo } = Route.useSearch();
	const [email, setEmail] = (0, import_react.useState)("");
	const [pwd, setPwd] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const goAfterLogin = () => {
		if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
			navigate({ to: redirectTo });
			return;
		}
		navigate({ to: "/profile" });
	};
	const handleEmail = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, pwd);
			toast.success("Welcome back!");
			goAfterLogin();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Sign in failed. Check your credentials.";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};
	const handleGoogle = async () => {
		setLoading(true);
		try {
			const cred = await signInWithPopup(auth, googleProvider);
			toast.success(`Welcome, ${cred.user.displayName ?? "there"}!`);
			goAfterLogin();
		} catch (err) {
			const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
			const message = err instanceof Error ? err.message : "Google sign-in failed.";
			if (code !== "auth/popup-closed-by-user") toast.error(message);
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
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to send password reset email.";
			toast.error(message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-md px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-display font-bold text-center",
				children: "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-muted-foreground mt-1",
				children: "Sign in to your Aroma account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 bg-card border border-border rounded-2xl p-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full flex items-center gap-3",
						onClick: handleGoogle,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							className: "size-5",
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
									fill: "#4285F4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
									fill: "#34A853"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z",
									fill: "#FBBC05"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
									fill: "#EA4335"
								})
							]
						}), "Continue with Google"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "or sign in with email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleEmail,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "mt-1.5",
								placeholder: "you@example.com",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleResetPassword,
									className: "text-xs text-primary font-medium hover:underline",
									children: "Forgot password?"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: pwd,
								onChange: (e) => setPwd(e.target.value),
								className: "mt-1.5",
								placeholder: "••••••••",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								size: "lg",
								disabled: loading,
								children: loading ? "Signing in…" : "Sign in"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground mt-4",
				children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth/signup",
						className: "text-primary font-medium",
						children: "Create an account"
					})
				]
			})
		]
	}) });
}
//#endregion
export { Login as component };
