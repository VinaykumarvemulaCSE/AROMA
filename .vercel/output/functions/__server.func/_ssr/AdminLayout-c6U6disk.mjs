import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Toaster$1 } from "./sonner-DoFKumIW.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as Image, O as LogOut, T as Menu, a as UserCog, d as TableProperties, f as Star, h as Settings, j as LayoutDashboard, m as ShoppingBag, n as UtensilsCrossed, r as Users, t as X, tt as CalendarClock, u as Tag } from "../_libs/lucide-react.mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { r as signOutUser } from "./session-D5n6nfq5.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminLayout-c6U6disk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var nav = [
	{
		to: "/admin",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/admin/orders",
		label: "Orders",
		icon: ShoppingBag
	},
	{
		to: "/admin/menu",
		label: "Menu",
		icon: UtensilsCrossed
	},
	{
		to: "/admin/reservations",
		label: "Reservations",
		icon: CalendarClock
	},
	{
		to: "/admin/tables",
		label: "Table Mgmt",
		icon: TableProperties
	},
	{
		to: "/admin/customers",
		label: "Customers",
		icon: Users
	},
	{
		to: "/admin/reviews",
		label: "Reviews",
		icon: Star
	},
	{
		to: "/admin/gallery",
		label: "Gallery",
		icon: Image
	},
	{
		to: "/admin/promotions",
		label: "Promotions",
		icon: Tag
	},
	{
		to: "/admin/staff",
		label: "Staff",
		icon: UserCog
	},
	{
		to: "/admin/settings",
		label: "Settings",
		icon: Settings
	}
];
function AdminLayout({ children }) {
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [drawer, setDrawer] = (0, import_react.useState)(false);
	const [soundEnabled, setSoundEnabled] = (0, import_react.useState)(true);
	const orders = useOrders((s) => s.orders);
	const lastOrderTimeRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!orders.length) return;
		const latestTime = Math.max(...orders.map((o) => o.createdAt));
		if (lastOrderTimeRef.current === 0) {
			lastOrderTimeRef.current = latestTime;
			return;
		}
		if (latestTime > lastOrderTimeRef.current) {
			lastOrderTimeRef.current = latestTime;
			if (soundEnabled) try {
				const ctx = new (window.AudioContext || window.webkitAudioContext)();
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.type = "sine";
				osc.frequency.setValueAtTime(880, ctx.currentTime);
				gain.gain.setValueAtTime(.1, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + .5);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + .5);
			} catch (e) {
				console.error("Failed to play notification sound", e);
			}
		}
	}, [orders, soundEnabled]);
	(0, import_react.useEffect)(() => {
		if (!initialized) return;
		if (!user || user.role !== "admin") navigate({
			to: "/admin/login",
			search: { redirect: pathname },
			replace: true
		});
	}, [
		initialized,
		user,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		setDrawer(false);
	}, [pathname]);
	const handleSignOut = async () => {
		await signOutUser();
		navigate({ to: "/admin/login" });
	};
	if (!initialized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center bg-secondary/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!user || user.role !== "admin") return null;
	const NavLinks = ({ onClick }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: nav.map((n) => {
		const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
		const Icon = n.icon;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: n.to,
			onClick,
			className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
				" ",
				n.label
			]
		}, n.to);
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex bg-secondary/30",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden lg:flex w-64 flex-col bg-card border-r border-border sticky top-0 h-screen shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin",
						className: "flex items-center gap-2 px-5 h-16 border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-display font-bold",
							children: "A"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display font-semibold leading-none",
							children: "Aroma Admin"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] uppercase text-muted-foreground tracking-widest mt-0.5",
							children: "Nalgonda"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex-1 p-3 space-y-0.5 overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 border-t border-border space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center gap-3",
								children: "Sound Alerts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: soundEnabled,
								onCheckedChange: setSoundEnabled
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleSignOut,
							className: "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "lg:hidden bg-card border-b border-border h-14 px-4 flex items-center gap-3 sticky top-0 z-30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDrawer(true),
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-semibold",
						children: "Aroma Admin"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden",
					children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			drawer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:hidden fixed inset-0 z-50 flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-black/40",
					onClick: () => setDrawer(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "relative w-72 max-w-[80vw] bg-card border-r border-border flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between h-14 px-4 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display font-semibold",
								children: "Aroma Admin"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setDrawer(false),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex-1 p-3 space-y-0.5 overflow-y-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onClick: () => setDrawer(false) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 border-t border-border space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex items-center gap-3",
									children: "Sound Alerts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: soundEnabled,
									onCheckedChange: setSoundEnabled
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleSignOut,
								className: "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })
		]
	});
}
//#endregion
export { AdminLayout as t };
