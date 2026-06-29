import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Check, N as Info, r as Users, tt as CalendarClock } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as Checkbox } from "./checkbox-kt6FvQcE.mjs";
import { r as reservationSchema } from "./schemas-B_Z4Eu_V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reservations-D2sHuN2A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var checkAvailability = createServerFn({ method: "POST" }).validator(objectType({
	date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	timeSlot: stringType().regex(/^\d{2}:\d{2}$/),
	guests: numberType().int().min(1).max(20)
})).handler(createSsrRpc("96c170bc12295fd1cd93c468f9362ee6652049aca1dcc15f2c2e86a214550b9e"));
var createReservation = createServerFn({ method: "POST" }).validator((data) => reservationSchema.parse(data)).handler(createSsrRpc("f9f6b26272d80879aa9b6f9531df479177b713bf11a41e2c5dd73d72bc5dc53d"));
var occasions = [
	"",
	"Birthday",
	"Anniversary",
	"Engagement",
	"Business Meeting",
	"Family Gathering",
	"Other"
];
function Reservations() {
	const user = useAuth((s) => s.user);
	const setUser = useAuth((s) => s.setUser);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const maxPartySize = settings?.maxPartySize ?? 20;
	const bookingWindowDays = settings?.bookingWindowDays ?? 30;
	const savedPrefs = user?.reservationPrefs || {};
	const [form, setForm] = (0, import_react.useState)({
		date: new Date(Date.now() + 864e5).toISOString().slice(0, 10),
		time: savedPrefs.preferredTime || "19:30",
		party: savedPrefs.preferredParty || 2,
		name: user?.name ?? "",
		email: user?.email ?? "",
		phone: user?.phone ?? "",
		occasion: "",
		notes: savedPrefs.defaultNote || "",
		seat: savedPrefs.preferredSeat || "",
		agree: false
	});
	const getDayOfWeek = (dateStr) => {
		return [
			"Sun",
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat"
		][new Date(dateStr).getDay()];
	};
	const dayKey = getDayOfWeek(form.date);
	const dayHours = settings?.hours?.[dayKey] || {
		open: "08:00",
		close: "23:00"
	};
	const timeSlots = (0, import_react.useMemo)(() => {
		const slots = [];
		try {
			const [openH, openM] = dayHours.open.split(":").map(Number);
			const [closeH, closeM] = dayHours.close.split(":").map(Number);
			let currentH = openH;
			let currentM = openM >= 30 ? 30 : 0;
			if (openM > 0 && openM < 30) currentM = 30;
			else if (openM > 30) {
				currentH += 1;
				currentM = 0;
			}
			const maxH = closeM === 0 ? closeH - 1 : closeH;
			const maxM = closeM === 0 ? 0 : closeM >= 30 ? 30 : 0;
			while (currentH < maxH || currentH === maxH && currentM <= maxM) {
				slots.push(`${currentH.toString().padStart(2, "0")}:${currentM.toString().padStart(2, "0")}`);
				currentM += 30;
				if (currentM >= 60) {
					currentH += 1;
					currentM = 0;
				}
			}
		} catch (e) {
			return Array.from({ length: 22 }, (_, i) => {
				const h = 11 + Math.floor(i / 2);
				const m = i % 2 === 0 ? "00" : "30";
				return `${h.toString().padStart(2, "0")}:${m}`;
			}).filter((t) => parseInt(t.split(":")[0]) <= 21);
		}
		return slots.length > 0 ? slots : [
			"19:00",
			"19:30",
			"20:00",
			"20:30"
		];
	}, [dayHours]);
	(0, import_react.useEffect)(() => {
		if (timeSlots.length > 0 && !timeSlots.includes(form.time)) setForm((prev) => ({
			...prev,
			time: timeSlots[0]
		}));
	}, [timeSlots, form.time]);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(null);
	const [savePrefs, setSavePrefs] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		if (!form.agree) return toast.error("Please accept the booking policy.");
		if (!form.name || !form.phone) return toast.error("Name and phone are required.");
		setSubmitting(true);
		try {
			const availability = await checkAvailability({ data: {
				date: form.date,
				timeSlot: form.time,
				guests: form.party
			} });
			if (!availability.available) {
				toast.error("No tables available for this time slot. Please try a different date/time.");
				return;
			}
			const res = await createReservation({ data: {
				customer: {
					name: form.name,
					email: form.email,
					phone: form.phone
				},
				reservation: {
					date: form.date,
					timeSlot: form.time,
					guests: form.party,
					occasion: form.occasion,
					seat: form.seat,
					notes: form.notes
				},
				tableConfigId: availability.tableConfigId
			} });
			if (savePrefs && user) {
				setUser({
					...user,
					reservationPrefs: {
						preferredTime: form.time,
						preferredParty: form.party,
						preferredSeat: form.seat,
						defaultNote: form.notes
					}
				});
				toast.success("Preferences saved for future bookings!");
			}
			setDone(res.reservationId);
			toast.success("Table reserved! The restaurant will confirm shortly.");
		} catch (err) {
			console.error(err);
			toast.error(err instanceof Error ? err.message : "Failed to create reservation. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-2xl text-center py-20 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-16 rounded-full bg-green-100 text-green-600 grid place-items-center mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-8" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-3xl font-display font-bold",
				children: "Table reserved!"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted-foreground",
				children: ["Confirmation #", done]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 bg-card border border-border rounded-2xl p-6 text-left max-w-md mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Date:" }),
						" ",
						new Date(form.date).toLocaleDateString("en-IN", {
							weekday: "long",
							day: "numeric",
							month: "long"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Time:" }),
						" ",
						form.time
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Party:" }),
						" ",
						form.party,
						" guest",
						form.party !== 1 && "s"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Name:" }),
						" ",
						form.name
					] }),
					form.occasion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Occasion:" }),
						" ",
						form.occasion
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: [
					"Status is ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pending" }),
					" — the restaurant will confirm your booking via",
					" ",
					form.email || form.phone,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: () => {
					setDone(null);
				},
				children: "Make another reservation"
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-secondary/30 border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-10 mx-auto text-accent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-4xl sm:text-5xl font-display font-bold",
					children: "Reserve a table"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "We hold your table for 15 minutes past your booking time."
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold text-base mb-4",
						children: "When & how many?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
									max: new Date(Date.now() + bookingWindowDays * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10),
									value: form.date,
									onChange: (e) => setForm({
										...form,
										date: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Time",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: form.time,
									onChange: (e) => setForm({
										...form,
										time: e.target.value
									}),
									className: "h-9 w-full rounded-md border border-border bg-card px-3 text-sm",
									children: timeSlots.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Party size",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										max: maxPartySize,
										value: form.party,
										onChange: (e) => setForm({
											...form,
											party: parseInt(e.target.value) || 1
										})
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-5 text-blue-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-blue-900",
							children: "Availability verified on booking"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-blue-800 mt-1",
							children: "Table availability is confirmed by our server when you submit. This ensures accurate real-time slot management across concurrent bookings."
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: form.email,
							onChange: (e) => setForm({
								...form,
								email: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Occasion",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: form.occasion,
							onChange: (e) => setForm({
								...form,
								occasion: e.target.value
							}),
							className: "h-9 w-full rounded-md border border-border bg-card px-3 text-sm",
							children: occasions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: o,
								children: o || "—"
							}, o))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Seating preference",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Window, quiet corner, outdoor…",
							value: form.seat,
							onChange: (e) => setForm({
								...form,
								seat: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Special requests",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: form.notes,
							onChange: (e) => setForm({
								...form,
								notes: e.target.value
							}),
							placeholder: "Dietary needs, decorations, allergies…"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-secondary/30 rounded-2xl p-5 text-sm space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Booking policy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 list-disc list-inside text-muted-foreground space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Free cancellation up to 24 hours before your reservation." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "We hold your table for 15 minutes past your booking time." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Availability is confirmed when the restaurant accepts your booking." })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: form.agree,
							onCheckedChange: (v) => setForm({
								...form,
								agree: !!v
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I accept the booking policy." })]
					}),
					user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2 -mx-2 px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: savePrefs,
							onCheckedChange: (v) => setSavePrefs(!!v)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "Save my preferences (time, party size, seating) for faster bookings"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 justify-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => setForm({
						...form,
						name: "",
						email: "",
						phone: "",
						occasion: "",
						notes: "",
						seat: "",
						agree: false
					}),
					disabled: submitting,
					children: "Clear"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "lg",
					disabled: submitting,
					children: submitting ? "Booking…" : "Book table"
				})]
			})
		]
	})] });
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
export { Reservations as component };
