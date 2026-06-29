import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Search, p as SlidersHorizontal, t as X } from "../_libs/lucide-react.mjs";
import { n as useCart, t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as useMenu, t as categories } from "./menu-DvG5qjjW.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { n as optimizeImage, t as MenuCard } from "./MenuCard-28U5LQws.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/radix-ui__react-slider.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu-Dacgs1hL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
function MenuPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)("All");
	const [diet, setDiet] = (0, import_react.useState)("all");
	const [price, setPrice] = (0, import_react.useState)([0, 1e3]);
	const [sort, setSort] = (0, import_react.useState)("popular");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const menu = useMenu((s) => s.menu);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const menuCategories = (0, import_react.useMemo)(() => {
		return settings?.categories || categories;
	}, [settings?.categories]);
	const items = (0, import_react.useMemo)(() => {
		let arr = menu.filter((m) => {
			if (cat !== "All" && m.category !== cat) return false;
			if (q && !`${m.name} ${m.description}`.toLowerCase().includes(q.toLowerCase())) return false;
			if (diet === "veg" && !m.veg) return false;
			if (diet === "nonveg" && m.veg) return false;
			if (m.price < price[0] || m.price > price[1]) return false;
			return true;
		});
		switch (sort) {
			case "price-asc":
				arr = [...arr].sort((a, b) => a.price - b.price);
				break;
			case "price-desc":
				arr = [...arr].sort((a, b) => b.price - a.price);
				break;
			case "new":
				arr = [...arr].sort((a) => a.tags.includes("New") ? -1 : 1);
				break;
			default: break;
		}
		return arr;
	}, [
		q,
		cat,
		diet,
		price,
		sort
	]);
	const clearAll = () => {
		setQ("");
		setCat("All");
		setDiet("all");
		setPrice([0, 1e3]);
		setSort("popular");
	};
	const activeFilters = [];
	if (cat !== "All") activeFilters.push({
		label: cat,
		clear: () => setCat("All")
	});
	if (diet !== "all") activeFilters.push({
		label: diet === "veg" ? "Veg only" : "Non-veg only",
		clear: () => setDiet("all")
	});
	if (price[0] > 0 || price[1] < 1e3) activeFilters.push({
		label: `${inr(price[0])}–${inr(price[1])}`,
		clear: () => setPrice([0, 1e3])
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-secondary/30 border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl sm:text-5xl font-display font-bold",
						children: "Our Menu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: "Specialty coffee, hearty meals & sweet endings."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-2 items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center bg-card rounded-full px-4 border border-border w-full sm:w-96",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: q,
									onChange: (e) => setQ(e.target.value),
									placeholder: "Search dishes, drinks…",
									className: "border-0 focus-visible:ring-0 bg-transparent"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => setFiltersOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4 mr-2" }), " Filters"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: sort,
								onChange: (e) => setSort(e.target.value),
								className: "h-9 rounded-md border border-border bg-card px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "popular",
										children: "Default"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "price-asc",
										children: "Price: Low to High"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "price-desc",
										children: "Price: High to Low"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "new",
										children: "Newest"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 -mx-4 px-4 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 min-w-max pb-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								active: cat === "All",
								onClick: () => setCat("All"),
								children: "All"
							}), menuCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
								active: cat === c.name,
								onClick: () => setCat(c.name),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-1.5",
									children: c.icon
								}), c.name]
							}, c.name))]
						})
					}),
					activeFilters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2 items-center",
						children: [activeFilters.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: f.clear,
							className: "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-accent/30 hover:bg-accent/50",
							children: [
								f.label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
							]
						}, f.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: clearAll,
							className: "text-xs text-muted-foreground underline",
							children: "Clear all"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground mb-4",
				children: [
					items.length,
					" ",
					items.length === 1 ? "item" : "items"
				]
			}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg",
					children: "No dishes match these filters."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: clearAll,
					className: "mt-4",
					children: "Clear filters"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5",
				children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuCard, {
					item: i,
					onOpen: setOpenId
				}, i.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: filtersOpen,
			onOpenChange: setFiltersOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Filters" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold mb-2 text-sm",
							children: "Dietary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: [
								"all",
								"veg",
								"nonveg"
							].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								active: diet === d,
								onClick: () => setDiet(d),
								children: d === "all" ? "All" : d === "veg" ? "Veg" : "Non-veg"
							}, d))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold mb-2 text-sm",
							children: [
								"Price range: ",
								inr(price[0]),
								" – ",
								inr(price[1])
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 1e3,
							step: 50,
							value: price,
							onValueChange: (v) => setPrice([v[0], v[1]])
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: clearAll,
								className: "flex-1",
								children: "Clear"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setFiltersOpen(false),
								className: "flex-1",
								children: "Apply"
							})]
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDialog, {
			id: openId,
			onClose: () => setOpenId(null)
		})
	] });
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`,
		children
	});
}
function ItemDialog({ id, onClose }) {
	const menu = useMenu((s) => s.menu);
	const item = id ? menu.find((m) => m.id === id) : null;
	const [qty, setQty] = (0, import_react.useState)(1);
	const add = useCart((s) => s.add);
	if (!item) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!id,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl p-0 overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aspect-[16/9] w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: optimizeImage(item.image, 1200),
					alt: item.name,
					className: "w-full h-full object-cover"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-block size-3 border-2 ${item.veg ? "border-sage" : "border-destructive"} p-0.5`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block size-full rounded-full ${item.veg ? "bg-sage" : "bg-destructive"}` })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.category }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [item.prepTime, " min"] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-2xl font-display font-bold",
							children: item.name
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl font-bold",
							children: inr(item.price)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: item.longDescription || item.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center justify-between gap-3 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center border border-border rounded-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty(Math.max(1, qty - 1)),
									className: "size-9 grid place-items-center",
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 text-center font-semibold",
									children: qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty(qty + 1),
									className: "size-9 grid place-items-center",
									children: "+"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							className: "flex-1",
							onClick: () => {
								add(item, qty);
								toast.success(`Added ${qty} × ${item.name}`);
								onClose();
								setQty(1);
							},
							children: [
								"Add ",
								qty,
								" to cart · ",
								inr(item.price * qty)
							]
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { MenuPage as component };
