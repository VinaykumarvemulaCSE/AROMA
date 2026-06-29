import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Check, H as Clock, r as Users, t as X, tt as CalendarClock } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as useTables } from "./tables-CdYxFl78.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reservations-BGft5e7B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusColor = {
	Pending: "bg-amber-100 text-amber-700",
	Confirmed: "bg-green-100 text-green-700",
	Cancelled: "bg-red-100 text-red-700",
	Completed: "bg-blue-100 text-blue-700"
};
function AdminRes() {
	const { reservations, updateReservationStatus } = useTables();
	const [view, setView] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("All");
	const list = filter === "All" ? reservations : reservations.filter((r) => r.status === filter);
	const setStatus = (id, s) => {
		updateReservationStatus(id, s);
		if (view?.id === id) setView((v) => v ? {
			...v,
			status: s
		} : v);
		toast.success(`Reservation ${id} → ${s}`);
	};
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const todayCount = reservations.filter((r) => r.slotDatetime.startsWith(today)).length;
	const pendingCount = reservations.filter((r) => r.status === "Pending").length;
	const confirmedCount = reservations.filter((r) => r.status === "Confirmed").length;
	const thisWeek = reservations.filter((r) => {
		const d = new Date(r.slotDatetime);
		const now = /* @__PURE__ */ new Date();
		const diff = (d.getTime() - now.getTime()) / 864e5;
		return diff >= -1 && diff <= 7;
	}).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl sm:text-3xl font-display font-bold",
			children: "Reservations"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4",
			children: [
				{
					l: "Today's bookings",
					v: todayCount,
					icon: CalendarClock
				},
				{
					l: "This week",
					v: thisWeek,
					icon: Users
				},
				{
					l: "Pending confirmation",
					v: pendingCount,
					icon: Clock
				},
				{
					l: "Confirmed",
					v: confirmedCount,
					icon: Check
				}
			].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-full bg-primary/10 grid place-items-center shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "size-5 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl font-display font-bold",
					children: c.v
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: c.l
				})] })]
			}, c.l))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 flex flex-wrap gap-2",
			children: [
				"All",
				"Pending",
				"Confirmed",
				"Completed",
				"Cancelled"
			].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setFilter(s),
				className: `px-3.5 py-1.5 rounded-full text-sm border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`,
				children: [s, s === "Pending" && pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1.5 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5",
					children: pendingCount
				})]
			}, s))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[720px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"ID",
						"Guest",
						"Phone",
						"Date & Time",
						"Party",
						"Occasion",
						"Status",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 8,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: "No reservations yet. They will appear here as customers book tables."
				}) }), list.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/20 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-medium text-primary",
							children: ["#", r.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: r.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs",
							children: new Date(r.slotDatetime).toLocaleString("en-IN", {
								dateStyle: "medium",
								timeStyle: "short"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.partySize
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: r.occasion || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[r.status]}`,
								children: r.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 justify-end",
								children: [r.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1",
									onClick: () => setStatus(r.id, "Confirmed"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), " Confirm"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs text-destructive hover:text-destructive gap-1",
									onClick: () => setStatus(r.id, "Cancelled"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }), " Cancel"]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									onClick: () => setView(r),
									children: "View"
								})]
							})
						})
					]
				}, r.id))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!view,
			onOpenChange: (o) => !o && setView(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Reservation #", view?.id] }) }), view && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 rounded-xl p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mb-1",
										children: "Guest"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: view.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.phone }),
									view.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground",
										children: view.email
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 rounded-xl p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mb-1",
										children: "Booking details"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: new Date(view.slotDatetime).toLocaleString("en-IN", {
											dateStyle: "medium",
											timeStyle: "short"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [view.partySize, " guests"] }),
									view.occasion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground",
										children: view.occasion
									})
								]
							})]
						}),
						view.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-secondary/40 rounded-xl p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mb-1",
								children: "Special requests"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: view.notes })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-2",
							children: "Update status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								"Confirmed",
								"Completed",
								"Cancelled"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: view.status === s ? "default" : "outline",
								onClick: () => setStatus(view.id, s),
								children: s
							}, s))
						})] })
					]
				})]
			})
		})
	] });
}
//#endregion
export { AdminRes as component };
