import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as useGallery } from "./gallery-BFSjxxw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gallery-CqmK0xVk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cats = [
	"All",
	"Interior",
	"Food",
	"Events",
	"Other"
];
function Gallery() {
	const { images, loading, fetchImages } = useGallery();
	const [cat, setCat] = (0, import_react.useState)("All");
	const [open, setOpen] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchImages();
	}, [fetchImages]);
	const list = cat === "All" ? images : images.filter((p) => p.category === cat);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-display font-bold",
				children: "Gallery"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "A glimpse inside Aroma Cafe."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-2 flex-wrap",
				children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setCat(c),
					className: `px-4 py-1.5 rounded-full text-sm border ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`,
					children: c
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
				children: list.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen(i),
					className: "aspect-square rounded-2xl overflow-hidden group",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.url,
						alt: p.caption || p.category,
						className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					})
				}, p.id))
			})
		]
	}), open !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4",
		onClick: () => setOpen(null),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "absolute top-4 right-4 text-white",
			onClick: (e) => {
				e.stopPropagation();
				setOpen(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: list[open].url,
			alt: list[open].caption || list[open].category,
			className: "max-h-[80vh] max-w-[90vw] rounded-xl object-contain"
		})]
	})] });
}
//#endregion
export { Gallery as component };
