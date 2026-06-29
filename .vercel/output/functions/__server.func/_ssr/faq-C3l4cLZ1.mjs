import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { a as Trigger2, i as Root2, n as Header, r as Item, t as Content2, v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Z as ChevronDown } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faq-C3l4cLZ1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Accordion = Root2;
var AccordionItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
	ref,
	className: cn("border-b", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
	className: "flex",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
		ref,
		className: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger.displayName = Trigger2.displayName;
var AccordionContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pb-4 pt-0", className),
		children
	})
}));
AccordionContent.displayName = Content2.displayName;
var faqs = [
	{
		q: "How do I place an order?",
		a: "Browse our menu, add items to cart, and check out. We'll redirect you to WhatsApp to confirm and arrange payment."
	},
	{
		q: "How do I make a reservation?",
		a: "Use the Reserve a Table page — pick a date, time and party size. You'll get an instant confirmation."
	},
	{
		q: "Do you deliver across Nalgonda?",
		a: "Yes, we deliver within a 5 km radius. Delivery fee is ₹40, free above ₹499. Typical time 30–40 mins."
	},
	{
		q: "What payment methods do you accept?",
		a: "UPI, cards and cash. For online orders, we currently confirm and accept payment via WhatsApp QR."
	},
	{
		q: "Can you cater for events?",
		a: "Absolutely. WhatsApp or call us with your date, headcount and preferences."
	},
	{
		q: "What's your cancellation policy?",
		a: "Reservations: free up to 24 hours before. Orders: free until the kitchen starts preparing."
	},
	{
		q: "Do you have vegan options?",
		a: "Yes — look for the Vegan badge on the menu, or filter by dietary preference."
	}
];
function FAQ() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl font-display font-bold",
			children: "Frequently asked questions"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
			type: "single",
			collapsible: true,
			className: "mt-8",
			children: faqs.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
				value: `q${i}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, {
					className: "text-left",
					children: f.q
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
					className: "text-muted-foreground",
					children: f.a
				})]
			}, i))
		})]
	}) });
}
//#endregion
export { FAQ as component };
