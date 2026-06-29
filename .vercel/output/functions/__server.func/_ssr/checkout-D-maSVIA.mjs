import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Check, E as MapPin, X as ChevronLeft, Y as ChevronRight, t as X, u as Tag, w as MessageCircle } from "../_libs/lucide-react.mjs";
import { n as useCart, t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as useAddresses } from "./address-CMKa8Eys.mjs";
import { n as RadioGroup, r as RadioGroupItem, t as AddressAutocomplete } from "./AddressAutocomplete-lZWJIlm2.mjs";
import { t as Checkbox } from "./checkbox-kt6FvQcE.mjs";
import { a as openWhatsAppInTab, n as buildOrderWhatsAppUrl, r as createOrder, t as WA_PENDING_KEY } from "./whatsapp-D4qx96Yi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-D-maSVIA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var validateCouponCode = createServerFn({ method: "POST" }).validator(objectType({
	code: stringType().min(1),
	subtotal: numberType().nonnegative()
})).handler(createSsrRpc("0e91b6bfad7392ba36437684e2097df40e189e8cb3812f47cd5913dd58af257f"));
var steps = [
	"Review",
	"Address",
	"Contact",
	"Confirm"
];
function CheckoutPage() {
	const navigate = useNavigate();
	const lines = useCart((s) => s.lines);
	const clear = useCart((s) => s.clear);
	const user = useAuth((s) => s.user);
	const { addresses } = useAddresses();
	const settings = useSettings((s) => s.settings);
	const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
	const gstRate = settings?.gst ?? 5;
	const freeDeliveryThreshold = settings?.freeDeliveryAbove ?? 499;
	const deliveryFee = settings?.deliveryFee ?? 40;
	const tax = Math.round(subtotal * gstRate / 100);
	const delivery = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
	const [step, setStep] = (0, import_react.useState)(0);
	const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
	const [addr, setAddr] = (0, import_react.useState)({
		line1: defaultAddress?.line1 ?? "",
		line2: defaultAddress?.line2 ?? "",
		landmark: defaultAddress?.landmark ?? "",
		city: defaultAddress?.city ?? "Nalgonda",
		pin: defaultAddress?.pin ?? "",
		phone: defaultAddress?.phone ?? user?.phone ?? "",
		type: defaultAddress?.label ?? "Home",
		notes: ""
	});
	const [contact, setContact] = (0, import_react.useState)({
		name: user?.name ?? "",
		email: user?.email ?? "",
		phone: user?.phone ?? "",
		method: "whatsapp",
		note: "",
		cutlery: true
	});
	const [agree, setAgree] = (0, import_react.useState)(false);
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (user) setContact((prev) => ({
			...prev,
			name: user.name || prev.name,
			email: user.email || prev.email,
			phone: user.phone || prev.phone
		}));
	}, [user]);
	(0, import_react.useEffect)(() => {
		const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
		if (defaultAddress) setAddr({
			line1: defaultAddress.line1,
			line2: defaultAddress.line2 ?? "",
			landmark: defaultAddress.landmark ?? "",
			city: defaultAddress.city,
			pin: defaultAddress.pin,
			phone: defaultAddress.phone || user?.phone || "",
			type: defaultAddress.label,
			notes: ""
		});
	}, [addresses, user]);
	const [couponInput, setCouponInput] = (0, import_react.useState)("");
	const [appliedCoupon, setAppliedCoupon] = (0, import_react.useState)(null);
	const discount = appliedCoupon?.discountAmount ?? 0;
	const total = Math.max(0, subtotal + tax + delivery - discount);
	const applySaved = (id) => {
		const a = addresses.find((x) => x.id === id);
		if (!a) return;
		setAddr({
			line1: a.line1,
			line2: a.line2 ?? "",
			landmark: a.landmark ?? "",
			city: a.city,
			pin: a.pin,
			phone: a.phone,
			type: a.label,
			notes: ""
		});
		toast.success(`Address "${a.label}" loaded.`);
	};
	const applyCoupon = async () => {
		if (!couponInput.trim()) return;
		try {
			const result = await validateCouponCode({ data: {
				code: couponInput,
				subtotal
			} });
			if (!result.valid) {
				toast.error(result.error);
				return;
			}
			setAppliedCoupon({
				code: result.coupon.code,
				discountAmount: result.coupon.discountAmount
			});
			toast.success(`🎉 ${inr(result.coupon.discountAmount)} off applied!`);
		} catch {
			toast.error("Could not validate coupon. Please try again.");
		}
	};
	const removeCoupon = () => {
		setAppliedCoupon(null);
		setCouponInput("");
	};
	if (lines.length === 0 && step < 3) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md text-center py-32 px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your cart is empty." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			onClick: () => navigate({ to: "/menu" }),
			children: "Browse menu"
		})]
	}) });
	const next = () => {
		if (step === 1) {
			if (!addr.line1 || !addr.pin || !addr.phone) {
				toast.error("Please fill in all required address fields (Line 1, Pincode, Phone).");
				return;
			}
			if (!/^\d{6}$/.test(addr.pin.replace(/\s/g, ""))) {
				toast.error("Please enter a valid 6-digit Pincode.");
				return;
			}
		}
		if (step === 2) {
			if (!contact.name || !contact.phone) {
				toast.error("Please fill in your Name and Phone number.");
				return;
			}
			if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ""))) {
				toast.error("Please enter a valid 10-digit Indian mobile number.");
				return;
			}
		}
		setStep((s) => Math.min(steps.length - 1, s + 1));
	};
	const back = () => setStep((s) => Math.max(0, s - 1));
	const placeOrder = async () => {
		if (isSubmitting || step !== 3) return;
		setIsSubmitting(true);
		const waTab = window.open("about:blank", "_blank");
		const finalLines = lines.map((l) => ({
			id: l.id,
			qty: l.qty,
			name: l.name,
			price: l.price
		}));
		const finalAppliedCoupon = appliedCoupon ? { ...appliedCoupon } : null;
		const finalAddr = { ...addr };
		const finalContact = { ...contact };
		finalContact.phone = finalContact.phone.replace(/\D/g, "");
		finalAddr.phone = finalAddr.phone.replace(/\D/g, "");
		finalAddr.pin = finalAddr.pin.replace(/\s/g, "");
		try {
			const idToken = user && auth.currentUser ? await auth.currentUser.getIdToken() : void 0;
			const res = await createOrder({ data: {
				items: finalLines.map((l) => ({
					id: l.id,
					qty: l.qty
				})),
				couponCode: finalAppliedCoupon?.code,
				addr: {
					line1: finalAddr.line1,
					...finalAddr.line2 && { line2: finalAddr.line2 },
					...finalAddr.landmark && { landmark: finalAddr.landmark },
					city: finalAddr.city,
					pin: finalAddr.pin,
					phone: finalAddr.phone,
					type: finalAddr.type,
					...finalAddr.notes && { notes: finalAddr.notes }
				},
				contact: {
					name: finalContact.name,
					...finalContact.email && { email: finalContact.email },
					phone: finalContact.phone,
					method: finalContact.method,
					...finalContact.note && { note: finalContact.note },
					cutlery: finalContact.cutlery
				},
				...idToken ? { idToken } : {}
			} });
			if (!res.orderId) {
				waTab?.close();
				toast.error("Failed to create order. Please try again.");
				setIsSubmitting(false);
				return;
			}
			const createdAt = Date.now();
			const waOrder = {
				id: res.orderId,
				items: finalLines,
				subtotal: res.subtotal,
				tax: res.tax,
				delivery: res.delivery,
				discount: res.discount,
				couponCode: finalAppliedCoupon?.code,
				total: res.total,
				addr: {
					line1: finalAddr.line1,
					line2: finalAddr.line2,
					landmark: finalAddr.landmark,
					city: finalAddr.city,
					pin: finalAddr.pin,
					type: finalAddr.type,
					notes: finalAddr.notes,
					phone: finalAddr.phone
				},
				contact: {
					name: finalContact.name,
					phone: finalContact.phone,
					email: finalContact.email,
					method: finalContact.method,
					note: finalContact.note,
					cutlery: finalContact.cutlery
				},
				createdAt
			};
			const waUrl = buildOrderWhatsAppUrl(waOrder, settings?.whatsapp);
			const opened = openWhatsAppInTab(waTab, waOrder, settings?.whatsapp);
			if (!opened) sessionStorage.setItem(WA_PENDING_KEY(res.orderId), waUrl);
			sessionStorage.setItem(`track-phone-${res.orderId}`, finalContact.phone);
			clear();
			toast.success("Order placed! Waiting for admin to confirm.");
			await new Promise((r) => setTimeout(r, 300));
			navigate({
				to: "/track/$orderId",
				params: { orderId: res.orderId },
				search: opened ? {} : { wa: 1 }
			});
		} catch (err) {
			waTab?.close();
			console.error(err);
			toast.error("Failed to place order. Please try again.");
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-display font-bold",
				children: "Checkout"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 flex items-center gap-1 sm:gap-2",
				children: steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1 sm:gap-2 flex-1 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid place-items-center size-7 shrink-0 rounded-full text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`,
							children: i < step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-sm truncate ${i === step ? "font-semibold" : "text-muted-foreground hidden sm:inline"}`,
							children: s
						}),
						i < steps.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}` })
					]
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 bg-card border border-border rounded-2xl p-6",
					children: [
						step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display font-semibold text-lg mb-4",
								children: "Review your order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "py-3 flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: l.image,
											className: "size-14 rounded-lg object-cover",
											alt: l.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: l.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-muted-foreground",
												children: [
													"Qty ",
													l.qty,
													" · ",
													inr(l.price)
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: inr(l.qty * l.price)
										})
									]
								}, l.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 pt-5 border-t border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-semibold flex items-center gap-2 mb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4 text-primary" }), " Apply coupon"]
								}), appliedCoupon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono font-semibold text-green-700",
											children: appliedCoupon.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm text-green-600 flex-1",
											children: [
												"— ",
												inr(appliedCoupon.discountAmount),
												" off applied!"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: removeCoupon,
											className: "text-green-600 hover:text-green-800",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: couponInput,
										onChange: (e) => setCouponInput(e.target.value.toUpperCase()),
										placeholder: "Enter coupon code",
										className: "font-mono",
										onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), applyCoupon()),
										disabled: isSubmitting
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										onClick: applyCoupon,
										children: "Apply"
									})]
								})]
							})
						] }),
						step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display font-semibold text-lg mb-4",
								children: "Delivery address"
							}),
							addresses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground mb-2 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), " Saved addresses"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: addresses.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => applySaved(a.id),
											disabled: isSubmitting,
											className: `text-xs px-3 py-1.5 rounded-full border transition-all ${addr.line1 === a.line1 ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:border-primary hover:bg-secondary/60"}`,
											children: [
												a.label,
												" ",
												a.isDefault && "⭐"
											]
										}, a.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 my-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "or enter manually"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-2 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Address line 1",
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddressAutocomplete, {
											value: addr.line1,
											onChange: (raw, parsed) => {
												if (parsed) setAddr((f) => ({
													...f,
													line1: parsed.line1 || raw,
													city: parsed.city || f.city,
													pin: parsed.pin || f.pin
												}));
												else setAddr((f) => ({
													...f,
													line1: raw
												}));
											},
											placeholder: "House / flat no, street"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Address line 2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addr.line2,
											onChange: (e) => setAddr({
												...addr,
												line2: e.target.value
											}),
											placeholder: "Area, colony",
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Landmark",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addr.landmark,
											onChange: (e) => setAddr({
												...addr,
												landmark: e.target.value
											}),
											placeholder: "Near…",
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "City",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addr.city,
											onChange: (e) => setAddr({
												...addr,
												city: e.target.value
											}),
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Pincode",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addr.pin,
											onChange: (e) => setAddr({
												...addr,
												pin: e.target.value
											}),
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Phone",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addr.phone,
											onChange: (e) => setAddr({
												...addr,
												phone: e.target.value
											}),
											disabled: isSubmitting
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Address type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
									value: addr.type,
									onValueChange: (v) => setAddr({
										...addr,
										type: v
									}),
									className: "flex gap-4 mt-2",
									disabled: isSubmitting,
									children: [
										"Home",
										"Work",
										"Other"
									].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, { value: t }),
											" ",
											t
										]
									}, t))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Delivery instructions",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 3,
									value: addr.notes,
									onChange: (e) => setAddr({
										...addr,
										notes: e.target.value
									}),
									placeholder: "Gate code, where to leave, etc.",
									disabled: isSubmitting
								})
							})
						] }),
						step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display font-semibold text-lg mb-4",
								children: "Contact & preferences"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-2 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Name",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contact.name,
											onChange: (e) => setContact({
												...contact,
												name: e.target.value
											}),
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Email",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											value: contact.email,
											onChange: (e) => setContact({
												...contact,
												email: e.target.value
											}),
											disabled: isSubmitting
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Phone",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contact.phone,
											onChange: (e) => setContact({
												...contact,
												phone: e.target.value
											}),
											disabled: isSubmitting
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Preferred contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
									value: contact.method,
									onValueChange: (v) => setContact({
										...contact,
										method: v
									}),
									className: "flex gap-4 mt-2",
									disabled: isSubmitting,
									children: [
										"phone",
										"email",
										"whatsapp"
									].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm capitalize",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, { value: t }),
											" ",
											t
										]
									}, t))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Special requests",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 3,
									value: contact.note,
									onChange: (e) => setContact({
										...contact,
										note: e.target.value
									}),
									placeholder: "e.g. No onions, extra spicy…",
									disabled: isSubmitting
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-4 flex items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: contact.cutlery,
										onCheckedChange: (v) => setContact({
											...contact,
											cutlery: !!v
										}),
										disabled: isSubmitting
									}),
									" ",
									"Include cutlery"
								]
							})
						] }),
						step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display font-semibold text-lg mb-4",
								children: "Confirm & place order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-2 gap-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-secondary/40 rounded-xl p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs uppercase text-muted-foreground tracking-wider",
											children: "Deliver to"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1",
											children: [
												contact.name,
												" · ",
												contact.phone
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [addr.line1, addr.line2 && `, ${addr.line2}`] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											addr.city,
											" ",
											addr.pin
										] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-secondary/40 rounded-xl p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs uppercase text-muted-foreground tracking-wider",
										children: "Items"
									}), lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1",
										children: [
											l.qty,
											" × ",
											l.name
										]
									}, l.id))]
								})]
							}),
							appliedCoupon && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4 text-green-600" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-semibold text-green-700",
										children: appliedCoupon.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-green-600",
										children: [
											"— ",
											inr(discount),
											" off applied"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 p-4 rounded-xl bg-accent/20 text-sm flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 shrink-0 mt-0.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"You'll be redirected to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "WhatsApp" }),
									" to confirm with our team. Your order tracking will begin once the admin accepts."
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-4 flex items-start gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: agree,
										onCheckedChange: (v) => setAgree(!!v),
										disabled: isSubmitting
									}),
									" ",
									"I agree to the terms and cancellation policy."
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: back,
								disabled: step === 0 || isSubmitting,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 mr-1" }), " Back"]
							}), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: next,
								disabled: isSubmitting,
								children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 ml-1" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: placeOrder,
								disabled: !agree || !contact.name || !contact.phone || !addr.line1 || !addr.pin || isSubmitting,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 mr-2" }), isSubmitting ? "Placing order..." : "Place order via WhatsApp"]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-semibold",
						children: "Summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Subtotal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: inr(subtotal) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
									className: "text-muted-foreground",
									children: [
										"GST (",
										gstRate,
										"%)"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: inr(tax) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Delivery"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: delivery === 0 ? "FREE" : inr(delivery) })]
							}),
							discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-green-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3" }), " Coupon"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: ["-", inr(discount)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3 mt-2 flex justify-between font-display font-bold text-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(total) })]
							})
						]
					})]
				})]
			})
		]
	}) });
}
function Field({ label, required, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
			className: "text-sm",
			children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-destructive",
				children: "*"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5",
			children
		})]
	});
}
//#endregion
export { CheckoutPage as component };
