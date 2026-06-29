import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as Star } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as useReviews } from "./reviews-H1x9HWSd.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as ratingBreakdown } from "./reviews-UCr2QAOA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reviews-Hh_g9Bgy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Reviews() {
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [rating, setRating] = (0, import_react.useState)(5);
	const [name, setName] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const allReviews = useReviews((s) => s.reviews);
	const addReview = useReviews((s) => s.addReview);
	const reviews = allReviews.filter((r) => r.status === "approved");
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	const submit = async (e) => {
		e.preventDefault();
		if (!name.trim() || !title.trim() || !body.trim()) return;
		await addReview({
			name: name.trim(),
			rating,
			title: title.trim(),
			body: body.trim()
		});
		setName("");
		setTitle("");
		setBody("");
		setRating(5);
		setOpen(false);
		toast.success("Thanks! Your review was submitted for approval.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between flex-wrap gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-display font-bold",
					children: "Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Honest words from Aroma regulars."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "Write a review"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid md:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border rounded-2xl p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-6xl font-display font-bold",
							children: settings?.rating || 4.7
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-center gap-0.5 mt-2",
							children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-4 ${i < Math.floor(settings?.rating || 4.7) ? "fill-gold text-gold" : "text-muted-foreground"}` }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [settings?.reviewCount || 1284, " reviews"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-card border border-border rounded-2xl p-6 md:col-span-2",
					children: [
						5,
						4,
						3,
						2,
						1
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm w-6",
								children: [s, "★"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 h-2 rounded-full bg-secondary overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-gold",
									style: { width: `${ratingBreakdown[s]}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground w-10 text-right",
								children: [ratingBreakdown[s], "%"]
							})
						]
					}, s))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 space-y-4",
				children: [reviews.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground",
					children: "No reviews yet — be the first to share your experience!"
				}), reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "bg-card border border-border rounded-2xl p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-10 grid place-items-center rounded-full bg-secondary font-display font-semibold",
									children: r.name[0]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold",
									children: [
										r.name,
										" ",
										r.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-sage font-normal",
											children: "· Verified"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(r.date).toLocaleDateString("en-IN", {
										day: "numeric",
										month: "long",
										year: "numeric"
									})
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center gap-0.5",
								children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-gold text-gold" }, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 font-display font-semibold",
							children: r.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: r.body
						}),
						r.helpful > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: [
								"👍 ",
								r.helpful,
								" found this helpful"
							]
						})
					]
				}, r.id))]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Write a review" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Your rating" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 mt-2",
						children: [
							1,
							2,
							3,
							4,
							5
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRating(s),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-7 ${s <= rating ? "fill-gold text-gold" : "text-muted-foreground"}` })
						}, s))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Your name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1.5",
						value: name,
						onChange: (e) => setName(e.target.value),
						maxLength: 60,
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1.5",
						value: title,
						onChange: (e) => setTitle(e.target.value),
						maxLength: 80,
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Your review" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						maxLength: 500,
						className: "mt-1.5",
						value: body,
						onChange: (e) => setBody(e.target.value),
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Reviews are checked by our team before appearing publicly."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Submit"
					})
				]
			})]
		})
	})] });
}
//#endregion
export { Reviews as component };
