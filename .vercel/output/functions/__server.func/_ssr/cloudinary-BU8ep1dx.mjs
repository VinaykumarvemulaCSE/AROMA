import { o as __toESM } from "../_runtime.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { n as verifyAdmin } from "./auth-server-COwlBdJh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cloudinary-BU8ep1dx.js
var secureUploadImage_createServerFn_handler = createServerRpc({
	id: "566e3e4499e6d969ee63c9429f5c88a0b44b790b17de8d02425d8f5e5dbdbabd",
	name: "secureUploadImage",
	filename: "src/lib/api/cloudinary.ts"
}, (opts) => secureUploadImage.__executeServer(opts));
var secureUploadImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	base64File: stringType().min(100),
	mimeType: stringType(),
	sizeInBytes: numberType()
})).handler(secureUploadImage_createServerFn_handler, async ({ data }) => {
	await verifyAdmin(data.idToken);
	if (![
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(data.mimeType)) throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
	const MAX_SIZE_MB = 5;
	if (data.sizeInBytes > MAX_SIZE_MB * 1024 * 1024) throw new Error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
	try {
		const { v2: cloudinary } = await import("../_libs/cloudinary+lodash.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET
		});
		const result = await cloudinary.uploader.upload(data.base64File, { folder: "aroma-cafe/menu" });
		return {
			url: result.secure_url,
			publicId: result.public_id
		};
	} catch (err) {
		console.error("Cloudinary upload error:", err);
		throw new Error("Failed to upload image securely.");
	}
});
var secureUploadGalleryImage_createServerFn_handler = createServerRpc({
	id: "314b56170bba00ad1781af1cbf3be156a6b730a70d69f6e35498b764523b74ed",
	name: "secureUploadGalleryImage",
	filename: "src/lib/api/cloudinary.ts"
}, (opts) => secureUploadGalleryImage.__executeServer(opts));
var secureUploadGalleryImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	base64File: stringType().min(100),
	mimeType: stringType(),
	sizeInBytes: numberType()
})).handler(secureUploadGalleryImage_createServerFn_handler, async ({ data }) => {
	await verifyAdmin(data.idToken);
	if (![
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(data.mimeType)) throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
	const MAX_SIZE_MB = 5;
	if (data.sizeInBytes > MAX_SIZE_MB * 1024 * 1024) throw new Error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
	try {
		const { v2: cloudinary } = await import("../_libs/cloudinary+lodash.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET
		});
		const result = await cloudinary.uploader.upload(data.base64File, { folder: "aroma-cafe/gallery" });
		return {
			url: result.secure_url,
			publicId: result.public_id
		};
	} catch (err) {
		console.error("Cloudinary upload error:", err);
		throw new Error("Failed to upload image securely.");
	}
});
var secureDeleteImage_createServerFn_handler = createServerRpc({
	id: "ce298875ca5642a78128169af0dbf7abe8ae5c3e3869d097667956f552822503",
	name: "secureDeleteImage",
	filename: "src/lib/api/cloudinary.ts"
}, (opts) => secureDeleteImage.__executeServer(opts));
var secureDeleteImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	publicId: stringType().min(1)
})).handler(secureDeleteImage_createServerFn_handler, async ({ data }) => {
	await verifyAdmin(data.idToken);
	try {
		const { v2: cloudinary } = await import("../_libs/cloudinary+lodash.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET
		});
		return { success: (await cloudinary.uploader.destroy(data.publicId)).result === "ok" };
	} catch (err) {
		console.error("Cloudinary delete error:", err);
		throw new Error("Failed to delete image securely.");
	}
});
//#endregion
export { secureDeleteImage_createServerFn_handler, secureUploadGalleryImage_createServerFn_handler, secureUploadImage_createServerFn_handler };
