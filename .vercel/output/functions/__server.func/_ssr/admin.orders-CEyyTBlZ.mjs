import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { K as CircleCheck, _ as Search, w as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.orders-CEyyTBlZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statuses = [
	"Pending",
	"Confirmed",
	"Preparing",
	"Ready",
	"Out for Delivery",
	"Delivered",
	"Cancelled"
];
var statusColor = {
	Pending: "bg-amber-100 text-amber-700",
	Confirmed: "bg-blue-100 text-blue-700",
	Preparing: "bg-purple-100 text-purple-700",
	Ready: "bg-indigo-100 text-indigo-700",
	"Out for Delivery": "bg-cyan-100 text-cyan-700",
	Delivered: "bg-green-100 text-green-700",
	Cancelled: "bg-red-100 text-red-700"
};
function AdminOrders() {
	const orders = useOrders((s) => s.orders);
	const updateStatus = useOrders((s) => s.updateStatus);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [filter, setFilter] = (0, import_react.useState)("All");
	const [q, setQ] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const list = orders.filter((o) => {
		const matchFilter = filter === "All" || o.status === filter;
		const matchQ = !q || o.contact.name.toLowerCase().includes(q.toLowerCase()) || o.id.includes(q);
		return matchFilter && matchQ;
	});
	const setStatus = (id, s) => {
		updateStatus(id, s);
		if (view?.id === id) setView((v) => v ? {
			...v,
			status: s
		} : v);
		toast.success(`Order #${id} → ${s}`);
	};
	const acceptOrder = (o) => {
		updateStatus(o.id, "Confirmed");
		if (view?.id === o.id) setView({
			...o,
			status: "Confirmed"
		});
		const itemsText = o.items.map((i, idx) => `${idx + 1}. ${i.name} × ${i.qty} = ${inr(i.qty * i.price)}`).join("\n");
		const msg = [
			`✅ *Order #${o.id} Confirmed!*`,
			`Hi ${o.contact.name}, your order from Aroma Cafe has been accepted.`,
			``,
			`🛍️ *Items*`,
			itemsText,
			``,
			`💰 *Total: ${inr(o.total)}*`,
			``,
			`📍 Delivering to: ${o.addr.line1}, ${o.addr.city}`,
			`⏱️ Estimated time: 30–45 minutes`,
			``,
			`We'll notify you when your order is ready. Thank you! 🙏`
		].join("\n");
		const waUrl = `https://wa.me/${o.contact.phone.replace(/\D/g, "") || settings?.whatsapp || ""}?text=${encodeURIComponent(msg)}`;
		window.open(waUrl, "_blank");
		toast.success(`Order #${o.id} accepted & WhatsApp opened.`);
	};
	const exportCsv = () => {
		const head = "Order,Customer,Phone,Items,Total,Status,Date\n";
		const body = list.map((o) => [
			o.id,
			o.contact.name,
			o.contact.phone,
			o.items.length,
			o.total,
			o.status,
			new Date(o.createdAt).toLocaleDateString("en-IN")
		].join(",")).join("\n");
		const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
		const a = document.createElement("a");
		a.href = url;
		a.download = `orders-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("Exported");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl sm:text-3xl font-display font-bold",
			children: "Orders"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center bg-card rounded-md border border-border px-3 w-full sm:w-64",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search order or customer",
						className: "border-0 focus-visible:ring-0"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: filter,
					onChange: (e) => setFilter(e.target.value),
					className: "h-9 rounded-md border border-border bg-card px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "All",
						children: "All statuses"
					}), statuses.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "ml-auto",
					onClick: exportCsv,
					children: "Export CSV"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[800px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Order",
						"Customer",
						"Time",
						"Items",
						"Total",
						"Status",
						"Actions"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: "No orders found. Customer orders will appear here once placed."
				}) }), list.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/20 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-medium text-primary",
							children: ["#", o.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [o.contact.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: o.contact.phone
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-muted-foreground text-xs",
							children: [new Date(o.createdAt).toLocaleTimeString("en-IN", {
								hour: "2-digit",
								minute: "2-digit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: new Date(o.createdAt).toLocaleDateString("en-IN") })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: o.items.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-semibold",
							children: inr(o.total)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[o.status] ?? "bg-secondary"}`,
								children: o.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [o.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white",
									onClick: () => acceptOrder(o),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Accept"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									onClick: () => setView(o),
									children: "View"
								})]
							})
						})
					]
				}, o.id))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!view,
			onOpenChange: (o) => !o && setView(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Order #", view?.id] }) }), view && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 rounded-xl p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mb-1",
										children: "Customer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: view.contact.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.contact.phone }),
									view.contact.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.contact.email })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 rounded-xl p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mb-1",
										children: "Deliver to"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.addr.line1 }),
									view.addr.line2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.addr.line2 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										view.addr.city,
										" ",
										view.addr.pin
									] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-secondary/40 rounded-xl p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mb-2",
									children: "Items"
								}),
								view.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between py-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										i.qty,
										" × ",
										i.name
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(i.qty * i.price) })]
								}, i.id)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border mt-2 pt-2 space-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(view.subtotal) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(view.tax) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: view.delivery === 0 ? "FREE" : inr(view.delivery) })]
										}),
										view.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-green-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Coupon (",
												view.couponCode,
												")"
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", inr(view.discount)] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between font-bold text-base pt-1 border-t border-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(view.total) })]
										})
									]
								})
							]
						}),
						view.contact.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground text-xs",
							children: ["⭐ Request: ", view.contact.note]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-2",
							children: "Update status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [view.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "bg-green-600 hover:bg-green-700 text-white gap-1",
								onClick: () => acceptOrder(view),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), " Accept & WhatsApp"]
							}), statuses.filter((s) => s !== "Pending").map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: view.status === s ? "default" : "outline",
								onClick: () => setStatus(view.id, s),
								children: s
							}, s))]
						})] })
					]
				})]
			})
		})
	] });
}
//#endregion
export { AdminOrders as component };
