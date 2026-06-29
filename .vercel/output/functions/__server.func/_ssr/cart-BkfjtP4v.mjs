import { r as inr } from "./format-B1-9ZxZd.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Trash2, m as ShoppingBag } from "../_libs/lucide-react.mjs";
import { n as useCart, t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-BkfjtP4v.js
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	const lines = useCart((s) => s.lines);
	const setQty = useCart((s) => s.setQty);
	const remove = useCart((s) => s.remove);
	const clear = useCart((s) => s.clear);
	const settings = useSettings((s) => s.settings);
	const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
	const gstRate = settings?.gst ?? 5;
	const freeDeliveryThreshold = settings?.freeDeliveryAbove ?? 499;
	const deliveryFee = settings?.deliveryFee ?? 40;
	const tax = Math.round(subtotal * gstRate / 100);
	const delivery = subtotal > 0 ? subtotal >= freeDeliveryThreshold ? 0 : deliveryFee : 0;
	const total = subtotal + tax + delivery;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 pb-32 lg:pb-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl font-display font-bold",
			children: "Your cart"
		}), lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-14 text-center bg-card border border-border rounded-2xl py-16 px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-12 mx-auto text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-lg",
					children: "Your cart is empty."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Add a few dishes to get started."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-5",
						children: "Browse menu"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid lg:grid-cols-3 gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2 space-y-3",
				children: [lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border rounded-2xl p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: l.image,
								alt: l.name,
								className: "size-16 sm:size-20 rounded-xl object-cover shrink-0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold truncate",
									children: l.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [inr(l.price), " each"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => remove(l.id),
								className: "text-muted-foreground hover:text-destructive p-2 shrink-0",
								"aria-label": "Remove",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center border border-border rounded-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty(l.id, l.qty - 1),
									className: "size-9 grid place-items-center",
									"aria-label": "Decrease",
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 text-center text-sm font-semibold",
									children: l.qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty(l.id, l.qty + 1),
									className: "size-9 grid place-items-center",
									"aria-label": "Increase",
									children: "+"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display font-semibold",
							children: inr(l.price * l.qty)
						})]
					})]
				}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-2 sm:justify-between pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "w-full sm:w-auto",
							children: "Continue shopping"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: clear,
						className: "text-destructive w-full sm:w-auto",
						children: "Clear cart"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold text-lg",
						children: "Order summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Subtotal",
								value: inr(subtotal)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: `GST (${gstRate}%)`,
								value: inr(tax)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Delivery",
								value: delivery === 0 ? "FREE" : inr(delivery)
							}),
							subtotal < freeDeliveryThreshold && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Add ",
									inr(freeDeliveryThreshold - subtotal),
									" more for free delivery."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3 mt-3 flex justify-between font-display font-bold text-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(total) })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/checkout",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "w-full mt-5",
							children: "Proceed to checkout"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-3 text-center",
						children: "Pay via WhatsApp after order confirmation"
					})
				]
			})]
		})]
	}), lines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "lg:hidden fixed bottom-16 inset-x-0 z-30 px-4 pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-widest text-muted-foreground",
				children: "Total"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display font-bold text-lg leading-none",
				children: inr(total)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/checkout",
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					children: "Checkout"
				})
			})]
		})
	})] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-medium",
			children: value
		})]
	});
}
//#endregion
export { CartPage as component };
