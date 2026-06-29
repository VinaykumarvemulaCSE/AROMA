import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as IndianRupee, c as TrendingUp, f as Star, m as ShoppingBag, r as Users } from "../_libs/lucide-react.mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { n as useMenu } from "./menu-DvG5qjjW.mjs";
import { t as useReviews } from "./reviews-H1x9HWSd.mjs";
import { a as Line, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as LineChart, o as CartesianGrid, r as YAxis, s as Bar, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-DFKWJK73.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminDashboard() {
	const menu = useMenu((s) => s.menu);
	const orders = useOrders((s) => s.orders);
	const reviews = useReviews((s) => s.reviews);
	const [dateFilter, setDateFilter] = (0, import_react.useState)("today");
	const periodOrders = (0, import_react.useMemo)(() => {
		const now = /* @__PURE__ */ new Date();
		return orders.filter((o) => {
			const d = new Date(o.createdAt);
			if (dateFilter === "today") return d.toDateString() === now.toDateString();
			if (dateFilter === "7days") return now.getTime() - d.getTime() <= 168 * 3600 * 1e3;
			if (dateFilter === "30days") return now.getTime() - d.getTime() <= 720 * 3600 * 1e3;
			return true;
		});
	}, [orders, dateFilter]);
	const periodRevenue = (0, import_react.useMemo)(() => periodOrders.reduce((sum, o) => !["Cancelled"].includes(o.status) ? sum + o.total : sum, 0), [periodOrders]);
	const activeOrders = (0, import_react.useMemo)(() => orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length, [orders]);
	const avgRating = (0, import_react.useMemo)(() => {
		const approved = reviews.filter((r) => r.status === "approved");
		if (!approved.length) return "—";
		return (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1);
	}, [reviews]);
	const weekly = (0, import_react.useMemo)(() => {
		const days = Array.from({ length: 7 }, (_, i) => {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - (6 - i));
			return {
				label: d.toLocaleDateString("en-IN", { weekday: "short" }),
				date: d.toDateString(),
				revenue: 0
			};
		});
		orders.forEach((o) => {
			const day = days.find((d) => d.date === new Date(o.createdAt).toDateString());
			if (day && !["Cancelled"].includes(o.status)) day.revenue += o.total;
		});
		return days.map((d) => ({
			d: d.label,
			revenue: d.revenue
		}));
	}, [orders]);
	const hourly = (0, import_react.useMemo)(() => {
		const hours = {};
		periodOrders.forEach((o) => {
			const h = new Date(o.createdAt).getHours();
			hours[h] = (hours[h] || 0) + 1;
		});
		return Array.from({ length: 12 }, (_, i) => ({
			h: `${(i + 9) % 24}:00`,
			orders: hours[i + 9] || 0
		}));
	}, [periodOrders]);
	const recentOrders = (0, import_react.useMemo)(() => orders.slice(0, 6), [orders]);
	const latestReviews = (0, import_react.useMemo)(() => reviews.filter((r) => r.status === "approved").slice(0, 3), [reviews]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-display font-bold",
				children: "Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Welcome back. Here's how Aroma is doing."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: dateFilter,
				onChange: (e) => setDateFilter(e.target.value),
				className: "h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "today",
						children: "Today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "7days",
						children: "Last 7 Days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "30days",
						children: "Last 30 Days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All Time"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {}),
					label: "Orders (Period)",
					value: String(periodOrders.length),
					trend: ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndianRupee, {}),
					label: "Revenue (Period)",
					value: inr(periodRevenue),
					trend: ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}),
					label: "Active orders",
					value: String(activeOrders),
					trend: ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {}),
					label: "Avg rating",
					value: String(avgRating),
					trend: ""
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid lg:grid-cols-3 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "Revenue this week"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: weekly,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--border)",
								strokeDasharray: "3 3"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "d",
								stroke: "var(--muted-foreground)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "var(--muted-foreground)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => inr(v) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "revenue",
								stroke: "var(--primary)",
								strokeWidth: 2,
								dot: { r: 4 }
							})
						]
					}) })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "Orders by hour (Period)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: hourly,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--border)",
								strokeDasharray: "3 3"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "h",
								stroke: "var(--muted-foreground)",
								fontSize: 10
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "var(--muted-foreground)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "orders",
								fill: "var(--accent)",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					}) })
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid lg:grid-cols-2 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "Top menu items"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 divide-y divide-border",
					children: [menu.slice(0, 5).map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold w-5 text-muted-foreground",
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: m.image,
								className: "size-10 rounded object-cover",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium truncate",
									children: m.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: m.category
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: inr(m.price)
							})
						]
					}, m.id)), menu.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: "No menu items yet"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "Recent orders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/orders",
						className: "text-xs text-primary hover:underline",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "divide-y divide-border",
					children: [recentOrders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-3 flex items-center gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										"#",
										o.id,
										" · ",
										o.contact.name
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [o.items.length, " items"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs px-2 py-1 rounded-full bg-secondary",
								children: o.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold w-20 text-right",
								children: inr(o.total)
							})
						]
					}, o.id)), recentOrders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: "No orders yet"
					})]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 bg-card border border-border rounded-2xl p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "Latest approved reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin/reviews",
					className: "text-xs text-primary hover:underline",
					children: "Manage reviews"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid md:grid-cols-3 gap-4",
				children: [latestReviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-secondary/40 rounded-xl p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-sm",
							children: r.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs flex items-center gap-0.5",
							children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-gold text-gold" }, i))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground line-clamp-3",
						children: r.body
					})]
				}, r.id)), latestReviews.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground col-span-3 py-4 text-center",
					children: "No approved reviews yet"
				})]
			})]
		})
	] });
}
function Kpi({ icon, label, value, trend }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card border border-border rounded-2xl p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-9 grid place-items-center rounded-lg bg-secondary text-primary",
					children: icon
				}), trend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs flex items-center gap-0.5 text-sage font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }), trend]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-2xl font-display font-bold",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			})
		]
	});
}
//#endregion
export { AdminDashboard as component };
