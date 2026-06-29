import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Check, _ as Search, f as Star, l as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as useReviews } from "./reviews-H1x9HWSd.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reviews-BOJ6s_D-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminReviews() {
	const list = useReviews((s) => s.reviews);
	const setStatus = useReviews((s) => s.setStatus);
	const removeReview = useReviews((s) => s.remove);
	const [tab, setTab] = (0, import_react.useState)("pending");
	const [q, setQ] = (0, import_react.useState)("");
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)("all");
	const counts = (0, import_react.useMemo)(() => ({
		total: list.length,
		pending: list.filter((r) => r.status === "pending").length,
		approved: list.filter((r) => r.status === "approved").length,
		rejected: list.filter((r) => r.status === "rejected").length
	}), [list]);
	const filtered = (0, import_react.useMemo)(() => {
		return list.filter((r) => {
			if (r.status !== tab) return false;
			if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
			if (q) {
				const s = q.toLowerCase();
				if (!r.name.toLowerCase().includes(s) && !r.title.toLowerCase().includes(s) && !r.body.toLowerCase().includes(s)) return false;
			}
			return true;
		});
	}, [
		list,
		tab,
		q,
		ratingFilter
	]);
	const handleSetStatus = (id, status, msg) => {
		setStatus(id, status);
		toast.success(msg);
	};
	const remove = (id) => {
		removeReview(id);
		toast.success("Review deleted");
	};
	const Stat = ({ label, value, tone }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card border border-border rounded-2xl p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground uppercase tracking-wide",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-2xl font-display font-bold mt-1 ${tone ?? ""}`,
			children: value
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-display font-bold",
				children: "Reviews"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Approve or reject customer reviews before they appear on the site."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total",
						value: counts.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pending",
						value: counts.pending,
						tone: "text-gold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Approved",
						value: counts.approved,
						tone: "text-sage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Rejected",
						value: counts.rejected,
						tone: "text-destructive"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search name, title, content...",
						value: q,
						onChange: (e) => setQ(e.target.value),
						className: "pl-9"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: ratingFilter,
					onValueChange: setRatingFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full sm:w-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All ratings"
					}), [
						5,
						4,
						3,
						2,
						1
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: String(s),
						children: [s, " stars"]
					}, s))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: (v) => setTab(v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid grid-cols-3 w-full sm:w-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "pending",
							children: [
								"Pending (",
								counts.pending,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "approved",
							children: [
								"Approved (",
								counts.approved,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "rejected",
							children: [
								"Rejected (",
								counts.rejected,
								")"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: tab,
					className: "mt-4 space-y-3",
					children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground",
						children: [
							"No ",
							tab,
							" reviews",
							q || ratingFilter !== "all" ? " match your filters" : "",
							"."
						]
					}), filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "bg-card border border-border rounded-2xl p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 grid place-items-center rounded-full bg-secondary font-display font-semibold shrink-0",
										children: r.name[0]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold truncate",
											children: r.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: new Date(r.date).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric"
											})
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex items-center gap-0.5",
									children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-gold text-gold" }, i))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display font-semibold",
								children: r.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: r.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									r.status !== "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => handleSetStatus(r.id, "approved", "Review approved"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), " Approve"]
									}),
									r.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: r.featured ? "default" : "outline",
										className: r.featured ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "",
										onClick: async () => {
											await useReviews.getState().toggleFeatured(r.id, !r.featured);
											toast.success(r.featured ? "Removed from homepage" : "Featured on homepage");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 mr-1.5" }), r.featured ? "Featured" : "Feature"]
									}),
									r.status !== "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => handleSetStatus(r.id, "rejected", "Review rejected"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Reject"]
									}),
									r.status !== "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => handleSetStatus(r.id, "pending", "Moved back to pending"),
										children: "Move to pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										className: "text-destructive hover:text-destructive ml-auto",
										onClick: () => remove(r.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete"]
									})
								]
							})
						]
					}, r.id))]
				})]
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminReviews, {}) });
//#endregion
export { SplitComponent as component };
