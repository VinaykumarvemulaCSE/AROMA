import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as inr } from "./format-B1-9ZxZd.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { r as useSettings } from "./settings-AtIjLryv.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as ImagePlus, S as Pencil, _ as Search, b as Plus, k as LoaderCircle, l as Trash2, o as Upload } from "../_libs/lucide-react.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { secureUploadImage } from "./cloudinary-BiHnQsyx.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as useMenu, t as categories } from "./menu-DvG5qjjW.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.menu-WrVhnuzX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminMenu() {
	const items = useMenu((s) => s.menu);
	const addMenuItem = useMenu((s) => s.addMenuItem);
	const updateMenuItem = useMenu((s) => s.updateMenuItem);
	const removeMenuItem = useMenu((s) => s.removeMenuItem);
	const [q, setQ] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const filtered = items.filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-display font-bold",
				children: "Menu management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setCreating(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Add item"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center bg-card rounded-md border border-border px-3 w-72",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search dishes",
				className: "border-0 focus-visible:ring-0"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[680px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Item",
						"Category",
						"Price",
						"Status",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/20 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: i.image,
									className: "size-10 rounded-lg object-cover shrink-0",
									alt: ""
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: i.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground line-clamp-1",
										children: i.description
									})]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: i.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-semibold",
							children: inr(i.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs px-2 py-1 rounded-full ${i.available ? "bg-sage/20 text-sage" : "bg-destructive/10 text-destructive"}`,
								children: i.available ? "Active" : "Hidden"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => setEditing(i),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: async () => {
									await removeMenuItem(i.id);
									toast.success("Deleted");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
							})]
						})
					]
				}, i.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemFormDialog, {
			open: !!editing || creating,
			item: editing,
			onClose: () => {
				setEditing(null);
				setCreating(false);
			},
			onSave: async (it) => {
				if (editing) await updateMenuItem(it.id, it);
				else await addMenuItem(it);
				toast.success("Saved");
				setEditing(null);
				setCreating(false);
			}
		})
	] });
}
function ItemFormDialog({ open, item, onClose, onSave }) {
	const [f, setF] = (0, import_react.useState)(item || {
		id: "",
		name: "",
		description: "",
		price: 100,
		category: "Main Course",
		image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
		publicId: "",
		veg: true,
		spice: 0,
		prepTime: 15,
		tags: [],
		available: true,
		isDailySpecial: false,
		isBestseller: false
	});
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (item) setF({
			...item,
			isDailySpecial: !!item.isDailySpecial,
			isBestseller: !!item.isBestseller
		});
		else setF({
			id: "",
			name: "",
			description: "",
			price: 100,
			category: "Main Course",
			image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
			publicId: "",
			veg: true,
			spice: 0,
			prepTime: 15,
			tags: [],
			available: true,
			isDailySpecial: false,
			isBestseller: false
		});
	}, [item]);
	const settings = useSettings((s) => s.settings);
	const fetchSettings = useSettings((s) => s.fetchSettings);
	(0, import_react.useEffect)(() => {
		fetchSettings();
	}, [fetchSettings]);
	settings?.categories;
	const handleOpen = () => {
		if (item) setF({
			...item,
			isDailySpecial: !!item.isDailySpecial,
			isBestseller: !!item.isBestseller
		});
		else setF({
			id: "",
			name: "",
			description: "",
			price: 100,
			category: "Main Course",
			image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
			publicId: "",
			veg: true,
			spice: 0,
			prepTime: 15,
			tags: [],
			available: true,
			isDailySpecial: false,
			isBestseller: false
		});
	};
	const handleFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5 MB.");
			return;
		}
		setUploading(true);
		try {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			await new Promise((resolve, reject) => {
				reader.onload = resolve;
				reader.onerror = reject;
			});
			const idToken = await auth.currentUser?.getIdToken();
			if (!idToken) {
				toast.error("You must be signed in as admin to upload images.");
				return;
			}
			const res = await secureUploadImage({ data: {
				idToken,
				base64File: reader.result,
				mimeType: file.type,
				sizeInBytes: file.size
			} });
			setF((prev) => ({
				...prev,
				image: res.url,
				publicId: res.publicId || ""
			}));
			toast.success("Image uploaded securely!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed.");
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
			else handleOpen();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: item ? "Edit item" : "Add new item" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					onSave(f);
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Item image" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 space-y-2",
						children: [f.image && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full aspect-video rounded-xl overflow-hidden bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: f.image,
								alt: "Preview",
								className: "w-full h-full object-cover"
							}), uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 bg-background/70 grid place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									className: "flex-1",
									disabled: uploading,
									onClick: () => fileRef.current?.click(),
									children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 mr-1.5 animate-spin" }), " Uploading…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5 mr-1.5" }), " Upload image"] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "image/*",
									className: "hidden",
									onChange: handleFileChange
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									className: "flex-1",
									onClick: () => {
										const url = prompt("Paste image URL:", f.image);
										if (url) setF((prev) => ({
											...prev,
											image: url
										}));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-3.5 mr-1.5" }), " Paste URL"]
								})
							]
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: f.name,
						onChange: (e) => setF({
							...f,
							name: e.target.value
						}),
						className: "mt-1.5",
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: f.description,
						onChange: (e) => setF({
							...f,
							description: e.target.value
						}),
						className: "mt-1.5"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: f.category,
							onChange: (e) => setF({
								...f,
								category: e.target.value
							}),
							className: "mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm",
							children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c.name }, c.name))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Price (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: f.price,
							onChange: (e) => setF({
								...f,
								price: parseInt(e.target.value) || 0
							}),
							className: "mt-1.5"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prep time (min)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: f.prepTime,
							onChange: (e) => setF({
								...f,
								prepTime: parseInt(e.target.value) || 0
							}),
							className: "mt-1.5"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Spice level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: f.spice,
							onChange: (e) => setF({
								...f,
								spice: parseInt(e.target.value) || 0
							}),
							className: "mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 0,
									children: "None 🙂"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 1,
									children: "Mild 🌶"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 2,
									children: "Medium 🌶🌶"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 3,
									children: "Hot 🌶🌶🌶"
								})
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-x-6 gap-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: f.veg,
									onCheckedChange: (v) => setF({
										...f,
										veg: v
									})
								}), " Vegetarian"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: f.available,
										onCheckedChange: (v) => setF({
											...f,
											available: v
										})
									}),
									" ",
									"Available"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: !!f.isDailySpecial,
										onCheckedChange: (v) => setF({
											...f,
											isDailySpecial: v
										})
									}),
									" ",
									"Daily Special"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: !!f.isBestseller,
										onCheckedChange: (v) => setF({
											...f,
											isBestseller: v
										})
									}),
									" ",
									"Bestseller"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: onClose,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: uploading,
							children: "Save"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { AdminMenu as component };
