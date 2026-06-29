import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as Leaf, R as Heart, z as Flame } from "../_libs/lucide-react.mjs";
import { n as useCart } from "./SiteLayout-v4aN8jv8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MenuCard-28U5LQws.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Optimizes a Cloudinary URL by injecting format and quality auto-optimizations,
* as well as an optional width limit for responsive loading.
*/
function optimizeImage(url, width) {
	if (!url || !url.includes("res.cloudinary.com")) return url;
	const parts = url.split("/upload/");
	if (parts.length !== 2) return url;
	if (parts[1].includes("f_auto") || parts[1].includes("q_auto")) return url;
	const transforms = ["f_auto", "q_auto"];
	if (width) transforms.push(`w_${width}`);
	return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
function MenuCard({ item, onOpen }) {
	const fav = useAuth((s) => s.favorites.includes(item.id));
	const toggleFav = useAuth((s) => s.toggleFav);
	const add = useCart((s) => s.add);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => onOpen?.(item.id),
					className: "absolute inset-0 w-full h-full",
					"aria-label": `Open ${item.name}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: optimizeImage(item.image, 600),
						alt: item.name,
						className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
						loading: "lazy"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute top-2 left-2 flex gap-1 flex-wrap",
					children: [
						item.tags.includes("Bestseller") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gold text-espresso",
							children: "Bestseller"
						}),
						item.tags.includes("New") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sage text-white",
							children: "New"
						}),
						item.tags.includes("Chef's Special") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 text-[10px] font-semibold rounded-full bg-destructive text-destructive-foreground",
							children: "Chef's"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => {
						e.stopPropagation();
						toggleFav(item.id);
						toast.success(fav ? "Removed from favorites" : "Added to favorites");
					},
					className: "absolute top-2 right-2 grid place-items-center size-8 rounded-full bg-background/90 backdrop-blur",
					"aria-label": "Toggle favorite",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `size-4 ${fav ? "fill-destructive text-destructive" : ""}` })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-start justify-between gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-block size-3 border-2 ${item.veg ? "border-sage" : "border-destructive"} p-0.5`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block size-full rounded-full ${item.veg ? "bg-sage" : "bg-destructive"}` })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold truncate",
								children: item.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground line-clamp-2",
							children: item.description
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [item.spice > 0 && Array.from({ length: item.spice }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-3 text-destructive" }, i)), item.tags.includes("Vegan") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-3 text-sage" })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-bold text-lg",
						children: inr(item.price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => {
							add(item);
							toast.success(`Added ${item.name}`);
						},
						children: "Add"
					})]
				})
			]
		})]
	});
}
//#endregion
export { optimizeImage as n, MenuCard as t };
