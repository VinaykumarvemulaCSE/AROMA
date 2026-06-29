import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import "../_libs/firebase.mjs";
import { f as updateProfile, r as createUserWithEmailAndPassword, u as signInWithPopup } from "../_libs/firebase__auth.mjs";
import { i as googleProvider, t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.signup-DfxCGCu5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sendCustomVerificationEmail = createServerFn({ method: "POST" }).validator(objectType({ email: stringType().email() })).handler(createSsrRpc("7dd614e62b30fed541bd38d080ee9b6313c3104e41b0e7b2a284276da0afcf3a"));
function Signup() {
	const navigate = useNavigate();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		pwd: "",
		confirm: ""
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleEmail = async (e) => {
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
			await updateProfile((await createUserWithEmailAndPassword(auth, form.email, form.pwd)).user, { displayName: form.name });
			await sendCustomVerificationEmail({ data: { email: form.email } });
			toast.success("Account created! Please check your email to verify.");
			navigate({ to: "/auth/verify-email" });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Sign up failed.";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};
	const handleGoogle = async () => {
		setLoading(true);
		try {
			const cred = await signInWithPopup(auth, googleProvider);
			toast.success(`Welcome, ${cred.user.displayName ?? "there"}! 🎉`);
			navigate({ to: "/profile" });
		} catch (err) {
			const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
			const message = err instanceof Error ? err.message : "Google sign-in failed.";
			if (code !== "auth/popup-closed-by-user") toast.error(message);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-md px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-display font-bold text-center",
				children: "Create your account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-muted-foreground mt-1",
				children: "Join Aroma for faster checkout & order tracking"
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
								children: "or sign up with email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleEmail,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "Arjun Kumar",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.email,
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "you@example.com",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: form.pwd,
								onChange: (e) => setForm({
									...form,
									pwd: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "Min 6 characters",
								minLength: 6,
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirm password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: form.confirm,
								onChange: (e) => setForm({
									...form,
									confirm: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "Re-enter password",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								size: "lg",
								disabled: loading,
								children: loading ? "Creating account…" : "Create account"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground mt-4",
				children: [
					"Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth/login",
						className: "text-primary font-medium",
						children: "Sign in"
					})
				]
			})
		]
	}) });
}
//#endregion
export { Signup as component };
