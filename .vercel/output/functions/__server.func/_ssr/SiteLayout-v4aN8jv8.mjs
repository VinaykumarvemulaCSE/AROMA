import { o as __toESM } from "../_runtime.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { n as getCafeInfo } from "./format-B1-9ZxZd.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Toaster$1 } from "./sonner-DoFKumIW.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as Facebook, D as Mail, E as MapPin, L as House, M as Instagram, T as Menu, _ as Search, i as User, m as ShoppingBag, n as UtensilsCrossed, t as X, tt as CalendarClock, w as MessageCircle, x as Phone } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteLayout-v4aN8jv8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var useCart = create()(persist((set, get) => ({
	lines: [],
	add: (item, qty = 1) => set((s) => {
		if (s.lines.find((l) => l.id === item.id)) return { lines: s.lines.map((l) => l.id === item.id ? {
			...l,
			qty: l.qty + qty
		} : l) };
		return { lines: [...s.lines, {
			id: item.id,
			name: item.name,
			price: item.price,
			image: item.image,
			qty
		}] };
	}),
	remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
	setQty: (id, qty) => set((s) => ({ lines: qty <= 0 ? s.lines.filter((l) => l.id !== id) : s.lines.map((l) => l.id === id ? {
		...l,
		qty
	} : l) })),
	clear: () => set({ lines: [] }),
	count: () => get().lines.reduce((s, l) => s + l.qty, 0),
	subtotal: () => get().lines.reduce((s, l) => s + l.qty * l.price, 0)
}), { name: "aroma-cart" }));
var navLinks = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/menu",
		label: "Menu"
	},
	{
		to: "/reservations",
		label: "Reserve"
	},
	{
		to: "/gallery",
		label: "Gallery"
	},
	{
		to: "/about",
		label: "About"
	},
	{
		to: "/contact",
		label: "Contact"
	}
];
function Header() {
	const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
	const user = useAuth((s) => s.user);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const info = getCafeInfo(settings);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center justify-between gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 shrink-0 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-display font-bold shrink-0",
							children: info.logoLetters || "A"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col leading-none min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display font-semibold text-base truncate",
								children: info.name.split(" ")[0]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground truncate",
								children: ["Cafe · ", info.locationName || "Nalgonda"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "hidden md:flex items-center gap-1",
						children: navLinks.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: l.to,
							className: "px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors",
							activeProps: { className: "text-foreground !font-semibold" },
							children: l.label
						}, l.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `tel:${info.phone}`,
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cart",
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" })
								}), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-0.5 -right-0.5 grid place-items-center size-4 text-[10px] font-bold rounded-full bg-accent text-accent-foreground",
									children: count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: user ? "/profile" : "/auth/login",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "md:hidden p-2",
								onClick: () => setOpen(true),
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							})
						]
					})
				]
			})
		})
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col h-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-4 border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display font-semibold",
					children: "Menu"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen(false),
					"aria-label": "Close menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-col p-4 gap-1 overflow-y-auto",
				children: [
					navLinks.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						onClick: () => setOpen(false),
						className: "px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary",
						children: l.label
					}, l.to)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/cart",
						onClick: () => setOpen(false),
						className: "px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary",
						children: ["Cart", count > 0 ? ` (${count})` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: user ? "/profile" : "/auth/login",
						onClick: () => setOpen(false),
						className: "px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary",
						children: user ? "My account" : "Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `tel:${info.phone}`,
						className: "px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary",
						children: ["Call ", info.phone]
					})
				]
			})]
		})]
	})] });
}
function Footer() {
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const info = getCafeInfo(settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "bg-primary text-primary-foreground mt-12 md:mt-20 pb-20 md:pb-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 grid gap-8 sm:grid-cols-2 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center size-9 rounded-full bg-accent text-accent-foreground font-display font-bold",
							children: info.logoLetters || "A"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display font-semibold text-lg",
							children: info.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-primary-foreground/70",
						children: info.tagline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 mt-5",
						children: [
							info.instagram && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: info.instagram,
								"aria-label": "Instagram",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "size-4" })
							}),
							info.facebook && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: info.facebook,
								"aria-label": "Facebook",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Facebook, { className: "size-4" })
							}),
							info.whatsapp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `https://wa.me/${info.whatsapp}`,
								"aria-label": "WhatsApp",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" })
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-display text-sm font-semibold uppercase tracking-wider",
					children: "Quick Links"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm text-primary-foreground/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/menu",
							className: "hover:text-accent",
							children: "Menu"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/reservations",
							className: "hover:text-accent",
							children: "Reservations"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "hover:text-accent",
							children: "About"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/gallery",
							className: "hover:text-accent",
							children: "Gallery"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/faq",
							className: "hover:text-accent",
							children: "FAQ"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-display text-sm font-semibold uppercase tracking-wider",
					children: "Contact"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm text-primary-foreground/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: info.address })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `tel:${info.phone}`,
								children: info.phone
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `mailto:${info.email}`,
								children: info.email
							})]
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-display text-sm font-semibold uppercase tracking-wider",
						children: "Hours"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-primary-foreground/80",
						children: info.hours
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-primary-foreground/60",
						children: "Last order 10:30 PM"
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-white/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" ",
					info.name,
					". All rights reserved."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Made with care in ",
					info.locationName || "Nalgonda",
					"."
				] })]
			})
		})]
	});
}
var items = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/menu",
		label: "Menu",
		icon: UtensilsCrossed
	},
	{
		to: "/reservations",
		label: "Reserve",
		icon: CalendarClock
	},
	{
		to: "/cart",
		label: "Cart",
		icon: ShoppingBag
	},
	{
		to: "/profile",
		label: "Me",
		icon: User
	}
];
function BottomNav() {
	const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "md:hidden fixed bottom-0 inset-x-0 z-30 bg-background border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid grid-cols-5",
			children: items.map((it) => {
				const Icon = it.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: it.to,
					className: "flex flex-col items-center justify-center py-2 text-[11px] text-muted-foreground",
					activeProps: { className: "!text-primary" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), it.to === "/cart" && count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -top-1 -right-2 grid place-items-center size-4 text-[9px] font-bold rounded-full bg-accent text-accent-foreground",
							children: count
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5",
						children: it.label
					})]
				}) }, it.to);
			})
		})
	});
}
function SiteLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 pb-20 md:pb-0",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })
		]
	});
}
//#endregion
export { useCart as n, SiteLayout as t };
