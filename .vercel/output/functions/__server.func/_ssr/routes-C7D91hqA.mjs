import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as MapPin, H as Clock, Y as ChevronRight, _ as Search, f as Star, s as Truck, w as MessageCircle, x as Phone, y as Quote } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as useGallery } from "./gallery-BFSjxxw1.mjs";
import { n as useMenu } from "./menu-DvG5qjjW.mjs";
import { t as useReviews } from "./reviews-H1x9HWSd.mjs";
import { t as MenuCard } from "./MenuCard-28U5LQws.mjs";
import { n as reviews } from "./reviews-UCr2QAOA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C7D91hqA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var heroSlides = [
	{
		img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80",
		title: "Brewed with love.",
		sub: "Single-origin coffee, hand-pulled every morning."
	},
	{
		img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
		title: "Slow food, fast service.",
		sub: "Fresh, seasonal plates from our kitchen to your table."
	},
	{
		img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
		title: "A second home in Nalgonda.",
		sub: "Warm interiors, quiet corners, conversations that linger."
	}
];
function Home() {
	const menu = useMenu((s) => s.menu);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [slide, setSlide] = (0, import_react.useState)(0);
	const [q, setQ] = (0, import_react.useState)("");
	const { images, fetchImages, loading } = useGallery();
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	(0, import_react.useEffect)(() => {
		fetchImages();
	}, [fetchImages]);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5e3);
		return () => clearInterval(t);
	}, []);
	const liveReviews = useReviews((s) => s.reviews);
	const specials = (0, import_react.useMemo)(() => menu.filter((m) => !!m.isDailySpecial), [menu]);
	const best = (0, import_react.useMemo)(() => menu.filter((m) => !!m.isBestseller), [menu]);
	const testimonials = (0, import_react.useMemo)(() => {
		let list = liveReviews.filter((r) => r.status === "approved" && r.featured);
		if (list.length === 0) list = liveReviews.filter((r) => r.status === "approved");
		if (list.length === 0) return reviews.slice(0, 3);
		return list.slice(0, 3);
	}, [liveReviews]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative h-[78vh] min-h-[560px] w-full overflow-hidden",
			children: [
				heroSlides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`,
					style: {
						backgroundImage: `url(${s.img})`,
						backgroundSize: "cover",
						backgroundPosition: "center"
					},
					role: "img",
					"aria-label": s.title
				}, i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16 text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-1 rounded-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-gold text-gold" }),
									" ",
									settings?.rating || 4.7,
									" ·",
									" ",
									settings?.reviewCount || 1284,
									" reviews"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden sm:inline-flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-1 rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), " Nalgonda"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-3xl",
							children: heroSlides[slide].title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-base sm:text-lg text-white/85",
							children: heroSlides[slide].sub
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap items-center gap-2 sm:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/menu",
									className: "flex-1 sm:flex-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										className: "w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90",
										children: "Order Now"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/reservations",
									className: "flex-1 sm:flex-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										variant: "outline",
										className: "w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white",
										children: "Reserve Table"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `tel:${settings?.phone || ""}`,
									className: "hidden sm:inline-flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										variant: "ghost",
										className: "text-white hover:bg-white/10 hover:text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 mr-2" }), " Call"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://wa.me/${settings?.whatsapp || ""}`,
									className: "hidden sm:inline-flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										variant: "ghost",
										className: "text-white hover:bg-white/10 hover:text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 mr-2" }), " WhatsApp"]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => e.preventDefault(),
							className: "mt-5 w-full max-w-md flex bg-white rounded-full pl-4 pr-1 py-1 items-center shadow-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: q,
									onChange: (e) => setQ(e.target.value),
									placeholder: "Search dishes…",
									className: "border-0 focus-visible:ring-0 text-foreground bg-transparent min-w-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/menu",
									search: { q },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "rounded-full shrink-0",
										children: "Find"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex gap-1.5",
							role: "group",
							"aria-label": "Slideshow controls",
							children: heroSlides.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSlide(i),
								"aria-label": `Go to slide ${i + 1}`,
								className: `h-1.5 rounded-full transition-all ${i === slide ? "bg-white w-8" : "bg-white/40 w-4"}`
							}, i))
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
				children: [
					{
						icon: Clock,
						label: "Open Now",
						value: "Until 11:00 PM"
					},
					{
						icon: MapPin,
						label: "Location",
						value: "Clock Tower Rd · 2.1 km"
					},
					{
						icon: Star,
						label: "Rating",
						value: `${settings?.rating || 4.7} / 5 · ${settings?.reviewCount || 1284}`
					},
					{
						icon: Truck,
						label: "Home Delivery",
						value: "30-40 min · ₹40"
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid place-items-center size-11 rounded-xl bg-secondary text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: c.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: c.value
					})] })]
				}, c.label))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Today's Special",
			sub: "Hand-picked by our chef for today",
			link: {
				to: "/menu",
				label: "See full menu"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5",
				children: specials.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuCard, { item: i }, i.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Bestsellers",
			sub: "What Nalgonda is loving this week",
			link: {
				to: "/menu",
				label: "View all"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
				children: best.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuCard, { item: i }, i.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-secondary/40 py-16 mt-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl sm:text-4xl font-display font-bold text-center",
					children: "Why we're loved"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid md:grid-cols-4 gap-5",
					children: [
						{
							emoji: "☕",
							t: "Single-origin coffee",
							d: "Beans from Chikmagalur, roasted weekly."
						},
						{
							emoji: "🌿",
							t: "Fresh & seasonal",
							d: "Locally sourced produce, never frozen."
						},
						{
							emoji: "👨‍🍳",
							t: "Chef-led kitchen",
							d: "Authentic Indian + continental, no shortcuts."
						},
						{
							emoji: "🪴",
							t: "Cosy space",
							d: "Wooden interiors, plants and quiet corners."
						}
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card border border-border rounded-2xl p-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl",
								children: c.emoji
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display font-semibold",
								children: c.t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: c.d
							})
						]
					}, c.t))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "What our guests say",
			sub: "Real reviews from Aroma regulars",
			link: {
				to: "/reviews",
				label: "Read all reviews"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-3 gap-5",
				children: testimonials.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
					className: "bg-card border border-border rounded-2xl p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "size-6 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "mt-3 text-sm leading-relaxed",
							children: [
								"\"",
								r.body,
								"\""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
							className: "mt-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-sm",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(r.date).toLocaleDateString("en-IN", {
									month: "long",
									year: "numeric"
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center gap-0.5",
								children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-gold text-gold" }, i))
							})]
						})
					]
				}, r.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "A glimpse inside",
			sub: "The space, the plates, the people",
			link: {
				to: "/gallery",
				label: "View gallery"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading gallery..." }) : images.map((img) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/gallery",
					className: "block aspect-square rounded-2xl overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: img.url,
						alt: img.caption || "Gallery image",
						className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
					})
				}, img.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16" })
	] });
}
function Section({ title, sub, link, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-3xl sm:text-4xl font-display font-bold",
				children: title
			}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-1",
				children: sub
			})] }), link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: link.to,
				className: "text-sm font-medium text-primary hover:text-accent flex items-center gap-1 shrink-0",
				children: [
					link.label,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
				]
			})]
		}), children]
	});
}
//#endregion
export { Home as component };
