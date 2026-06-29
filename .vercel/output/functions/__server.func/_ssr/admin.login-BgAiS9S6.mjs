import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { a as getIdTokenResult, c as sendPasswordResetEmail, l as signInWithEmailAndPassword } from "../_libs/firebase__auth.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signOutUser, t as hasAdminClaim } from "./session-D5n6nfq5.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Route } from "./admin.login-CVUbNjxs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.login-BgAiS9S6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const navigate = useNavigate();
	const { redirect: redirectTo } = Route.useSearch();
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const [email, setEmail] = (0, import_react.useState)("");
	const [pwd, setPwd] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (initialized && user?.role === "admin") if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.startsWith("//")) navigate({ to: redirectTo });
		else navigate({ to: "/admin" });
	}, [
		initialized,
		user,
		navigate,
		redirectTo
	]);
	const goAfterLogin = () => {
		if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.startsWith("//")) {
			navigate({ to: redirectTo });
			return;
		}
		navigate({ to: "/admin" });
	};
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const u = (await signInWithEmailAndPassword(auth, email, pwd)).user;
			if (!hasAdminClaim((await getIdTokenResult(u, true)).claims)) {
				await signOutUser();
				toast.error("Admin privileges not configured. Run set-admin-claims.ts for this email, then sign in again.");
				return;
			}
			toast.success("Welcome, admin!");
			goAfterLogin();
		} catch (err) {
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
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to send password reset email.";
			toast.error(message);
		}
	};
	if (!initialized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center bg-secondary/30 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center bg-secondary/30 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "w-full max-w-sm bg-card border border-border rounded-2xl p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid place-items-center size-10 rounded-full bg-primary text-primary-foreground font-display font-bold",
					children: "A"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display font-semibold",
					children: "Aroma Admin"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Restaurant dashboard"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Admin email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "mt-1.5",
						placeholder: "admin@aroma.in",
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
			})]
		})
	});
}
//#endregion
export { AdminLogin as component };
