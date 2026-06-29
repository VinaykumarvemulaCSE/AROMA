import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { $ as Check, C as Package, H as Clock, Q as ChefHat, V as Download, q as CircleAlert, s as Truck, w as MessageCircle, x as Phone } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as getOrderForTracking, n as buildOrderWhatsAppUrl, t as WA_PENDING_KEY } from "./whatsapp-D4qx96Yi.mjs";
import { t as downloadBill } from "./bill-4SI5MUMz.mjs";
import { t as Route } from "./track._orderId-Dnv6vPw3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track._orderId-BHZ0i6Oc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var stages = [
	{
		key: "Pending",
		label: "Order Placed",
		icon: Clock,
		description: "Waiting for restaurant to confirm your order."
	},
	{
		key: "Confirmed",
		label: "Order Confirmed",
		icon: Check,
		description: "Restaurant has accepted your order."
	},
	{
		key: "Preparing",
		label: "Being Prepared",
		icon: ChefHat,
		description: "Our chefs are preparing your meal."
	},
	{
		key: "Ready",
		label: "Ready",
		icon: Package,
		description: "Your order is packed and ready."
	},
	{
		key: "Out for Delivery",
		label: "Out for Delivery",
		icon: Truck,
		description: "Your order is on its way!"
	},
	{
		key: "Delivered",
		label: "Delivered",
		icon: Check,
		description: "Enjoy your meal! 🎉"
	}
];
var statusIndex = (s) => stages.findIndex((st) => st.key === s);
function TrackPage() {
	const { orderId } = Route.useParams();
	const { wa: waSearch } = Route.useSearch();
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const orders = useOrders((s) => s.orders);
	const listenToOrder = useOrders((s) => s.listenToOrder);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [trackedOrder, setTrackedOrder] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [needsPhone, setNeedsPhone] = (0, import_react.useState)(false);
	const [phoneInput, setPhoneInput] = (0, import_react.useState)("");
	const [trackError, setTrackError] = (0, import_react.useState)(null);
	const [pendingWaUrl, setPendingWaUrl] = (0, import_react.useState)(() => typeof sessionStorage !== "undefined" ? sessionStorage.getItem(WA_PENDING_KEY(orderId)) : null);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const fetchGuestOrder = (0, import_react.useCallback)(async (phone) => {
		setTrackError(null);
		try {
			setTrackedOrder((await getOrderForTracking({ data: {
				orderId,
				phone
			} })).order);
			setNeedsPhone(false);
		} catch (err) {
			setTrackedOrder(null);
			setTrackError(err instanceof Error ? err.message : "Could not load order.");
		} finally {
			setLoading(false);
		}
	}, [orderId]);
	(0, import_react.useEffect)(() => {
		if (!initialized) return;
		const ownedOrder = orders.find((o) => o.id === orderId);
		if (ownedOrder) {
			setTrackedOrder(ownedOrder);
			setLoading(false);
			setNeedsPhone(false);
			return;
		}
		const storedPhone = sessionStorage.getItem(`track-phone-${orderId}`);
		let resolved = false;
		let unsub;
		let pollInterval;
		const timeoutId = setTimeout(() => {
			if (resolved) return;
			if (storedPhone) {
				fetchGuestOrder(storedPhone);
				pollInterval = setInterval(() => void fetchGuestOrder(storedPhone), 3e4);
			} else {
				setLoading(false);
				setNeedsPhone(true);
			}
		}, user?.id ? 5e3 : 0);
		if (user?.id) unsub = listenToOrder(orderId, (order) => {
			if (order?.userId === user.id) {
				resolved = true;
				clearTimeout(timeoutId);
				if (pollInterval) clearInterval(pollInterval);
				setTrackedOrder(order);
				setLoading(false);
				setNeedsPhone(false);
			} else if (order === null && storedPhone) {
				resolved = true;
				clearTimeout(timeoutId);
				fetchGuestOrder(storedPhone);
			}
		});
		else if (storedPhone) {
			clearTimeout(timeoutId);
			fetchGuestOrder(storedPhone);
			pollInterval = setInterval(() => void fetchGuestOrder(storedPhone), 3e4);
		} else {
			clearTimeout(timeoutId);
			setLoading(false);
			setNeedsPhone(true);
		}
		return () => {
			unsub?.();
			clearTimeout(timeoutId);
			if (pollInterval) clearInterval(pollInterval);
		};
	}, [
		initialized,
		orderId,
		user?.id,
		orders,
		listenToOrder,
		fetchGuestOrder
	]);
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		const live = orders.find((o) => o.id === orderId);
		if (live) setTrackedOrder(live);
	}, [
		orders,
		orderId,
		user?.id
	]);
	const order = trackedOrder;
	const whatsAppUrl = (0, import_react.useMemo)(() => {
		if (pendingWaUrl) return pendingWaUrl;
		if (!order) return null;
		return buildOrderWhatsAppUrl({
			id: order.id,
			items: order.items,
			subtotal: order.subtotal,
			tax: order.tax,
			delivery: order.delivery,
			discount: order.discount,
			couponCode: order.couponCode,
			total: order.total,
			addr: order.addr,
			contact: order.contact,
			createdAt: order.createdAt,
			status: order.status
		}, settings?.whatsapp);
	}, [
		pendingWaUrl,
		order,
		settings?.whatsapp
	]);
	const showWhatsAppFallback = Boolean(whatsAppUrl && (waSearch === 1 || pendingWaUrl));
	if (!initialized || loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-md text-center py-32 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading order…"
		})
	}) });
	if (needsPhone && !order) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md py-24 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-display font-bold text-center",
				children: "Verify your order"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground text-center",
				children: [
					"Enter the phone number used when placing order #",
					orderId,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					fetchGuestOrder(phoneInput.replace(/\D/g, ""));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1.5",
						value: phoneInput,
						onChange: (e) => setPhoneInput(e.target.value),
						placeholder: "10-digit mobile number",
						required: true
					})] }),
					trackError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: trackError
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Track order"
					})
				]
			})
		]
	}) });
	if (!order) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md text-center py-32 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-12 mx-auto text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg font-semibold",
				children: "Order not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-1 text-sm",
				children: trackError ?? "Check the order ID and phone number, then try again."
			})
		]
	}) });
	const currentStageIdx = statusIndex(order.status);
	const isCancelled = order.status === "Cancelled";
	const isDelivered = order.status === "Delivered";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `size-16 rounded-full grid place-items-center mx-auto ${isCancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`,
						children: isCancelled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-2xl font-display font-bold",
						children: isCancelled ? "Order Cancelled" : isDelivered ? "Order Delivered! 🎉" : "Order Placed!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground",
						children: [
							"Order ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["#", order.id] }),
							" · ",
							new Date(order.createdAt).toLocaleString("en-IN")
						]
					}),
					!isDelivered && !isCancelled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), " ETA: 30–45 minutes"]
					})
				]
			}),
			showWhatsAppFallback && whatsAppUrl && order.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-green-900",
						children: "Confirm your order on WhatsApp"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-green-800 mt-0.5",
						children: "Send the order details to our team so we can accept it."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: whatsAppUrl,
					target: "_blank",
					rel: "noreferrer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full sm:w-auto shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 mr-2" }), " Send order to WhatsApp"]
					})
				})]
			}),
			order.status === "Pending" && !showWhatsAppFallback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your order is waiting for the restaurant to confirm. Tracking will update automatically once accepted." })]
			}),
			!isCancelled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 bg-card border border-border rounded-2xl p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold mb-5",
					children: "Tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "relative",
					children: stages.map((s, i) => {
						const done = i <= currentStageIdx;
						const active = i === currentStageIdx;
						const Icon = s.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-4 pb-6 last:pb-0 relative",
							children: [
								i < stages.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute left-[18px] top-9 bottom-0 w-px transition-colors ${done ? "bg-primary" : "bg-border"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `relative grid place-items-center size-9 rounded-full shrink-0 transition-all ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"} ${active ? "ring-4 ring-primary/20 scale-110" : ""}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `font-medium ${done ? "" : "text-muted-foreground"}`,
										children: s.label
									}), done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: s.description
									})]
								})
							]
						}, s.key);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid sm:grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: `tel:${settings?.phone || ""}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 mr-2" }), " Call restaurant"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: `https://wa.me/${settings?.whatsapp || ""}`,
					target: "_blank",
					rel: "noreferrer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 mr-2" }), " Chat on WhatsApp"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 bg-card border border-border rounded-2xl p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "Order summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: order.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-2 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								i.qty,
								" × ",
								i.name
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(i.price * i.qty) })]
						}, i.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 pt-3 border-t border-border space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(order.subtotal) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(order.tax) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: order.delivery === 0 ? "FREE" : inr(order.delivery) })]
							}),
							order.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-green-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Coupon (",
									order.couponCode,
									")"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", inr(order.discount)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-display font-bold text-base pt-1 border-t border-border mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(order.total) })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							"Delivering to ",
							order.addr.line1,
							", ",
							order.addr.city,
							" ",
							order.addr.pin
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4 w-full",
						onClick: () => downloadBill(order),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-2" }), " Download bill"]
					})
				]
			})
		]
	}) });
}
//#endregion
export { TrackPage as component };
