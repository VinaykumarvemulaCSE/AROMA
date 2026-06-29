import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import "../_libs/firebase.mjs";
import { n as applyActionCode } from "../_libs/firebase__auth.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Route } from "./auth.verify-C4RdVWBC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.verify-CrIcjFAh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VerifyEmail() {
	const navigate = useNavigate();
	const { mode, oobCode } = Route.useSearch();
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (mode === "verifyEmail" && oobCode) applyActionCode(auth, oobCode).then(() => {
			setStatus("success");
			setMessage("Your email has been verified successfully!");
			setTimeout(() => navigate({ to: "/profile" }), 2e3);
		}).catch((err) => {
			setStatus("error");
			setMessage(err.message || "Verification failed. The link may have expired.");
		});
		else {
			setStatus("error");
			setMessage("Invalid verification link.");
		}
	}, [
		mode,
		oobCode,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-[60vh] flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center p-6",
			children: [
				status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Verifying your email..." })] }),
				status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-green-500 text-5xl mb-4",
						children: "✓"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold mb-2",
						children: "Email Verified!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: message
					})
				] }),
				status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-red-500 text-5xl mb-4",
						children: "✕"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold mb-2",
						children: "Verification Failed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground mb-4",
						children: message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => navigate({ to: "/auth/login" }),
						children: "Back to Login"
					})
				] })
			]
		})
	}) });
}
//#endregion
export { VerifyEmail as component };
