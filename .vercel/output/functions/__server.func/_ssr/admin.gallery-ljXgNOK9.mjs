import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as Image, I as ImagePlus, b as Plus, k as LoaderCircle, l as Trash2, o as Upload } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { secureUploadGalleryImage } from "./cloudinary-BiHnQsyx.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as useGallery } from "./gallery-BFSjxxw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.gallery-ljXgNOK9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminGallery() {
	const { images, loading, fetchImages, addImage, deleteImage } = useGallery();
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const [newImage, setNewImage] = (0, import_react.useState)({
		url: "",
		publicId: "",
		category: "Interior",
		caption: "",
		order: 0
	});
	(0, import_react.useEffect)(() => {
		fetchImages();
	}, [fetchImages]);
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
			const res = await secureUploadGalleryImage({ data: {
				idToken,
				base64File: reader.result,
				mimeType: file.type,
				sizeInBytes: file.size
			} });
			setNewImage((prev) => ({
				...prev,
				url: res.url,
				publicId: res.publicId || ""
			}));
			toast.success("Image uploaded successfully!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed.");
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	};
	const handleAdd = async () => {
		if (!newImage.url.trim()) {
			toast.error("Please enter an image URL");
			return;
		}
		try {
			await addImage({
				url: newImage.url,
				publicId: newImage.publicId,
				category: newImage.category,
				caption: newImage.caption,
				order: images.length
			});
			toast.success("Image added successfully");
			setNewImage({
				url: "",
				publicId: "",
				category: "Interior",
				caption: "",
				order: 0
			});
			setIsAdding(false);
		} catch {
			toast.error("Failed to add image");
		}
	};
	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this image?")) return;
		try {
			await deleteImage(id);
			toast.success("Image deleted successfully");
		} catch {
			toast.error("Failed to delete image");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-display font-bold",
				children: "Gallery Management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Manage your restaurant's photo gallery"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setIsAdding(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Add Image"]
			})]
		}),
		isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 bg-card border border-border rounded-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold text-lg mb-4",
					children: "Add New Image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Image" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 space-y-2",
						children: [newImage.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full aspect-video rounded-xl overflow-hidden bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: newImage.url,
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
										const url = prompt("Paste image URL:", newImage.url);
										if (url) setNewImage((prev) => ({
											...prev,
											url
										}));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-3.5 mr-1.5" }), " Paste URL"]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid sm:grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: newImage.category,
						onValueChange: (value) => setNewImage({
							...newImage,
							category: value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "mt-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
							"Interior",
							"Food",
							"Events",
							"Other"
						].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: cat,
							children: cat
						}, cat)) })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Caption (Optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: newImage.caption,
						onChange: (e) => setNewImage({
							...newImage,
							caption: e.target.value
						}),
						placeholder: "Image description",
						className: "mt-1.5"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleAdd,
						disabled: loading || uploading,
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : "Add Image"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setIsAdding(false),
						children: "Cancel"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: loading && images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 mx-auto animate-spin text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted-foreground",
					children: "Loading gallery..."
				})]
			}) : images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-12 bg-card border border-border rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-12 mx-auto text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-muted-foreground",
						children: "No images in gallery yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setIsAdding(true),
						className: "mt-4",
						children: "Add your first image"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
				children: images.map((image) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative aspect-square rounded-2xl overflow-hidden border border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: image.url,
							alt: image.caption || image.category,
							className: "w-full h-full object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "destructive",
							onClick: () => handleDelete(image.id),
							className: "absolute top-2 right-2 size-8 shadow-sm",
							"aria-label": "Delete image",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-4 pointer-events-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white text-xs font-medium bg-black/50 px-2 py-1 rounded mb-2",
								children: image.category
							}), image.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white text-xs text-center line-clamp-2",
								children: image.caption
							})]
						})
					]
				}, image.id))
			})
		})
	] });
}
//#endregion
export { AdminGallery as component };
