import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as Plus, l as Trash2, u as Tag } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as useCoupons } from "./coupon-ctx-ETPE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.promotions-DSd7YnAT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	code: "",
	discountAmount: 0,
	minOrder: 0,
	maxUses: 0,
	status: "Active",
	description: ""
};
function Promotions() {
	const { coupons, addCoupon, updateCoupon, removeCoupon } = useCoupons();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [f, setF] = (0, import_react.useState)(empty);
	const handleCreate = (e) => {
		e.preventDefault();
		if (!f.code.trim()) return toast.error("Code is required.");
		if (coupons.find((c) => c.code === f.code.toUpperCase())) return toast.error("A coupon with this code already exists.");
		addCoupon({
			...f,
			code: f.code.toUpperCase(),
			used: 0
		});
		toast.success(`Coupon ${f.code.toUpperCase()} created!`);
		setOpen(false);
		setF(empty);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-display font-bold",
				children: "Promotions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: "Create fixed-amount discount coupons. Customers enter the code at checkout."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setF(empty);
					setOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Create coupon"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[700px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Code",
						"Discount",
						"Min Order",
						"Max Uses",
						"Used",
						"Status",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [coupons.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					colSpan: 7,
					className: "px-4 py-10 text-center text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-8 mx-auto mb-2 opacity-30" }), "No coupons yet. Create one to get started."]
				}) }), coupons.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/30 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded",
								children: c.code
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-semibold",
							children: [inr(c.discountAmount), " off"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.minOrder > 0 ? `Min ${inr(c.minOrder)}` : "No minimum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.maxUses === 0 ? "Unlimited" : c.maxUses
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: c.used
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => updateCoupon(c.code, { status: c.status === "Active" ? "Paused" : "Active" }),
								className: `text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${c.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`,
								children: c.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => {
									removeCoupon(c.code);
									toast.success("Coupon removed.");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
							})
						})
					]
				}, c.code))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New coupon" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreate,
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Coupon code ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.code,
							onChange: (e) => setF({
								...f,
								code: e.target.value.toUpperCase()
							}),
							placeholder: "SUMMER50",
							className: "mt-1.5 font-mono",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Discount amount (₹) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								value: f.discountAmount || "",
								onChange: (e) => setF({
									...f,
									discountAmount: parseInt(e.target.value) || 0
								}),
								placeholder: "e.g. 100",
								className: "mt-1.5",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Fixed amount deducted from subtotal."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Minimum order amount (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: f.minOrder || "",
							onChange: (e) => setF({
								...f,
								minOrder: parseInt(e.target.value) || 0
							}),
							placeholder: "0 = no minimum",
							className: "mt-1.5"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Max uses" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: f.maxUses || "",
							onChange: (e) => setF({
								...f,
								maxUses: parseInt(e.target.value) || 0
							}),
							placeholder: "0 = unlimited",
							className: "mt-1.5"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (shown to customer)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.description,
							onChange: (e) => setF({
								...f,
								description: e.target.value
							}),
							placeholder: "e.g. ₹100 off on orders above ₹399",
							className: "mt-1.5"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Create coupon"
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { Promotions as component };
