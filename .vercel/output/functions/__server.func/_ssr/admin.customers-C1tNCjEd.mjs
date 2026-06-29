import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.customers-C1tNCjEd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCustomers() {
	const orders = useOrders((s) => s.orders);
	const customers = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		orders.forEach((o) => {
			const key = o.contact.email || o.contact.phone;
			if (!key) return;
			if (map.has(key)) {
				const c = map.get(key);
				c.orders += 1;
				c.spent += o.total;
				if (new Date(o.createdAt) > new Date(c.last)) c.last = new Date(o.createdAt).toLocaleDateString("en-IN");
			} else map.set(key, {
				name: o.contact.name,
				email: o.contact.email || "—",
				phone: o.contact.phone,
				orders: 1,
				spent: o.total,
				last: new Date(o.createdAt).toLocaleDateString("en-IN")
			});
		});
		return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
	}, [orders]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl sm:text-3xl font-display font-bold",
			children: "Customers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: [
				customers.length,
				" unique customer",
				customers.length !== 1 ? "s" : "",
				" derived from your order history."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[720px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Customer",
						"Email",
						"Phone",
						"Orders",
						"Lifetime spend",
						"Last order"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [customers.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/20 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-medium",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: c.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: c.orders
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-semibold",
							children: inr(c.spent)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.last
						})
					]
				}, i)), customers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 6,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: "No customers yet. They will appear here once orders are placed."
				}) })] })]
			})
		})
	] });
}
//#endregion
export { AdminCustomers as component };
