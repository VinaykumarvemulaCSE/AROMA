import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { V as Download, m as ShoppingBag } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { t as downloadBill } from "./bill-4SI5MUMz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-DMG74srh.js
var import_jsx_runtime = require_jsx_runtime();
function Orders() {
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const orders = useOrders((s) => s.orders);
	if (!initialized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-md text-center py-24 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-12 mx-auto text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-2xl font-display font-bold",
				children: "Sign in to view orders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-2",
				children: "Your order history is linked to your account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth/login",
				search: { redirect: "/orders" },
				className: "inline-block mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Sign in" })
			})
		]
	}) });
	const myOrders = orders.filter((o) => o.userId === user.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl font-display font-bold",
			children: "Your orders"
		}), myOrders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 bg-card border border-border rounded-2xl p-12 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-12 mx-auto text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4",
					children: "No orders yet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						children: "Start ordering"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-3",
			children: myOrders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center gap-3 sm:gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-[60%]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								"#",
								o.id,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-normal text-muted-foreground ml-2",
									children: new Date(o.createdAt).toLocaleString("en-IN")
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground truncate",
							children: [
								o.items.length,
								" items ·",
								" ",
								o.items.slice(0, 2).map((i) => i.name).join(", "),
								o.items.length > 2 && "…"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs px-2 py-1 rounded-full bg-secondary",
						children: o.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-bold",
						children: inr(o.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 ml-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => downloadBill(o),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-1.5" }), "Bill"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/track/$orderId",
							params: { orderId: o.id },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								children: "View"
							})
						})]
					})
				]
			}, o.id))
		})]
	}) });
}
//#endregion
export { Orders as component };
