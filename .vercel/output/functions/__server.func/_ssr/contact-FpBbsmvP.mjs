import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as Mail, E as MapPin, k as LoaderCircle, w as MessageCircle, x as Phone } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as sendContactEmail } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-FpBbsmvP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Contact() {
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const submit = async (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !message.trim()) return;
		setLoading(true);
		try {
			if ((await sendContactEmail({ data: {
				name: name.trim(),
				email: email.trim(),
				message: message.trim()
			} }))?.success) {
				toast.success("Message sent! We'll be in touch soon.");
				setName("");
				setEmail("");
				setMessage("");
			} else toast.error("Failed to send message. Please try WhatsApp or call us directly.");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	const mapSrc = (0, import_react.useMemo)(() => {
		if (settings?.address) return `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&z=15&ie=UTF8&iwloc=&output=embed`;
		return "https://maps.google.com/maps?q=Nalgonda&z=15&ie=UTF8&iwloc=&output=embed";
	}, [settings]);
	const mapsLink = settings?.mapsUrl ? settings.mapsUrl : settings?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : "https://www.google.com/maps";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-display font-bold",
				children: "Get in touch"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "We'd love to hear from you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid md:grid-cols-2 gap-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-5" }),
							label: "Call us",
							value: settings?.phone || "",
							href: `tel:${settings?.phone || ""}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" }),
							label: "WhatsApp",
							value: "Chat with us",
							href: `https://wa.me/${settings?.whatsapp || ""}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5" }),
							label: "Email",
							value: settings?.email || "",
							href: `mailto:${settings?.email || ""}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" }),
							label: "Visit",
							value: settings?.address || "",
							href: mapsLink
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-[4/3] rounded-2xl overflow-hidden border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								title: "Map",
								className: "w-full h-full",
								src: mapSrc
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "bg-card border border-border rounded-2xl p-6 space-y-4 h-fit",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-semibold text-lg",
							children: "Send a message"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "contact-name",
							className: "mt-1.5",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "contact-email",
							type: "email",
							className: "mt-1.5",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "contact-message",
							rows: 5,
							className: "mt-1.5",
							value: message,
							onChange: (e) => setMessage(e.target.value),
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							size: "lg",
							disabled: loading,
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }), " Sending…"] }) : "Send message"
						})
					]
				})]
			})
		]
	}) });
}
function Card({ icon, label, value, href }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		className: "flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid place-items-center size-11 rounded-xl bg-secondary text-primary",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase text-muted-foreground tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold",
			children: value
		})] })]
	});
}
//#endregion
export { Contact as component };
