import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as DEFAULTS, r as useSettings, t as DAYS } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.settings-CuBHHM5N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminSettings() {
	const { settings, fetchSettings, saveSettings, loading } = useSettings();
	const [s, setS] = (0, import_react.useState)(DEFAULTS);
	(0, import_react.useEffect)(() => {
		fetchSettings().then(() => {
			const current = useSettings.getState().settings;
			if (current) setS(current);
		});
	}, [fetchSettings]);
	const save = async () => {
		try {
			await saveSettings(s);
			toast.success("Settings saved to Firestore");
		} catch (e) {
			toast.error("Failed to save settings");
		}
	};
	const upd = (k, v) => setS((p) => ({
		...p,
		[k]: v
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl sm:text-3xl font-display font-bold",
			children: "Settings"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid lg:grid-cols-2 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					title: "Restaurant info",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.name,
								onChange: (e) => upd("name", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tagline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.tagline,
								onChange: (e) => upd("tagline", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.phone,
								onChange: (e) => upd("phone", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.email,
								onChange: (e) => upd("email", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: s.address,
								onChange: (e) => upd("address", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Google Maps URL",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.mapsUrl,
								onChange: (e) => upd("mapsUrl", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Logo Letter(s)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: s.logoLetters || "",
									onChange: (e) => upd("logoLetters", e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Location Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: s.locationName || "",
									onChange: (e) => upd("locationName", e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Instagram URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: s.instagram || "",
									onChange: (e) => upd("instagram", e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Facebook URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: s.facebook || "",
									onChange: (e) => upd("facebook", e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Rating (out of 5)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.1",
									min: "0",
									max: "5",
									value: s.rating,
									onChange: (e) => upd("rating", Number(e.target.value))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Review count",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "0",
									value: s.reviewCount,
									onChange: (e) => upd("reviewCount", Number(e.target.value))
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Operating hours",
					children: DAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[2.5rem_1fr_auto_1fr] items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: d
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: s.hours[d].open,
								onChange: (e) => upd("hours", {
									...s.hours,
									[d]: {
										...s.hours[d],
										open: e.target.value
									}
								}),
								className: "w-full min-w-0 px-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "–"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: s.hours[d].close,
								onChange: (e) => upd("hours", {
									...s.hours,
									[d]: {
										...s.hours[d],
										close: e.target.value
									}
								}),
								className: "w-full min-w-0 px-2"
							})
						]
					}, d))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					title: "Delivery & ordering",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Accept delivery orders",
							v: s.deliveryEnabled,
							on: (v) => upd("deliveryEnabled", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "WhatsApp-only ordering",
							v: s.whatsappOnly,
							on: (v) => upd("whatsappOnly", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "WhatsApp number",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.whatsapp,
								onChange: (e) => upd("whatsapp", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Delivery Fee (₹)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: s.deliveryFee,
										onChange: (e) => upd("deliveryFee", Number(e.target.value))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Minimum order (₹)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: s.minOrder,
										onChange: (e) => upd("minOrder", Number(e.target.value))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Free delivery above (₹)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: s.freeDeliveryAbove,
										onChange: (e) => upd("freeDeliveryAbove", Number(e.target.value))
									})
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Reservation rules",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Max Party Size",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: s.maxPartySize,
								onChange: (e) => upd("maxPartySize", Number(e.target.value))
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Booking window (days)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: s.bookingWindowDays,
								onChange: (e) => upd("bookingWindowDays", Number(e.target.value))
							})
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Tax",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "GST %",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: s.gst,
							onChange: (e) => upd("gst", Number(e.target.value))
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Menu Categories",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: s.categories?.map((c, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 bg-secondary text-sm px-3 py-1.5 rounded-full border border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.icon }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: c.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											upd("categories", s.categories.filter((_, idx) => idx !== index));
										},
										className: "text-muted-foreground hover:text-destructive ml-1",
										"aria-label": "Delete category",
										children: "×"
									})
								]
							}, index))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-2 border-t border-border mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Category Name (e.g. Pasta)",
									id: "new-cat-name",
									className: "flex-1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Emoji (e.g. 🍝)",
									id: "new-cat-emoji",
									className: "w-24 text-center"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									onClick: () => {
										const nameEl = document.getElementById("new-cat-name");
										const emojiEl = document.getElementById("new-cat-emoji");
										const name = nameEl?.value.trim();
										const icon = emojiEl?.value.trim() || "🍽️";
										if (!name) {
											toast.error("Category name is required.");
											return;
										}
										if (s.categories?.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
											toast.error("Category already exists.");
											return;
										}
										upd("categories", [...s.categories || [], {
											name,
											icon
										}]);
										if (nameEl) nameEl.value = "";
										if (emojiEl) emojiEl.value = "";
										toast.success(`Category "${name}" added.`);
									},
									children: "Add"
								})
							]
						})]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				onClick: save,
				className: "w-full sm:w-auto",
				disabled: loading,
				children: loading ? "Loading…" : "Save changes"
			})
		})
	] });
}
function Card({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-3 min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display font-semibold",
			children: title
		}), children]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "text-sm",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5",
		children
	})] });
}
function Toggle({ label, v, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "min-w-0 truncate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked: v,
			onCheckedChange: on
		})]
	});
}
//#endregion
export { AdminSettings as component };
