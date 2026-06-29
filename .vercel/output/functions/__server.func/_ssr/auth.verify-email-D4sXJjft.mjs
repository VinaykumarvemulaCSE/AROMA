import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { d as signOut, s as reload } from "../_libs/firebase__auth.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.verify-email-D4sXJjft.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var resendVerificationEmail = createServerFn({ method: "POST" }).validator(objectType({ email: stringType().email() })).handler(createSsrRpc("6deda8bf1d43b4129dfdbc7d1b6093c4de2ace85d24627e9cad9bea6a3437a84"));
function VerifyEmailPage() {
	const navigate = useNavigate();
	const user = useAuth((s) => s.user);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [resending, setResending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user) navigate({ to: "/auth/login" });
	}, [user, navigate]);
	const handleResend = async () => {
		if (!user?.email) return;
		setResending(true);
		try {
			await resendVerificationEmail({ data: { email: user.email } });
			toast.success("Verification email sent!");
		} catch (err) {
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
				navigate({ to: "/profile" });
			} else toast.error("Email not yet verified");
		} finally {
			setLoading(false);
		}
	};
	const handleSignOut = async () => {
		await signOut(auth);
		navigate({ to: "/auth/login" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-[60vh] flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-md text-center p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-6xl mb-4",
						children: "📧"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold mb-2",
						children: "Verify Your Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground mb-6",
						children: [
							"We've sent a verification link to ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: user?.email }),
							". Please check your inbox and click the link to complete your registration."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleCheck,
								disabled: loading,
								className: "w-full",
								size: "lg",
								children: loading ? "Checking..." : "I've verified my email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleResend,
								disabled: resending,
								variant: "outline",
								className: "w-full",
								size: "lg",
								children: resending ? "Sending..." : "Resend verification email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleSignOut,
								variant: "ghost",
								className: "w-full",
								children: "Sign out"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-6",
						children: "If you don't see the email, check your spam folder or make sure you entered the correct email address."
					})
				]
			})
		})
	}) });
}
//#endregion
export { VerifyEmailPage as component };
