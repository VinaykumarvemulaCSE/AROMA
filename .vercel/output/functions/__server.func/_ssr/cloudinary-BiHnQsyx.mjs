import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cloudinary-BiHnQsyx.js
var secureUploadImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	base64File: stringType().min(100),
	mimeType: stringType(),
	sizeInBytes: numberType()
})).handler(createSsrRpc("566e3e4499e6d969ee63c9429f5c88a0b44b790b17de8d02425d8f5e5dbdbabd"));
var secureUploadGalleryImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	base64File: stringType().min(100),
	mimeType: stringType(),
	sizeInBytes: numberType()
})).handler(createSsrRpc("314b56170bba00ad1781af1cbf3be156a6b730a70d69f6e35498b764523b74ed"));
var secureDeleteImage = createServerFn({ method: "POST" }).validator(objectType({
	idToken: stringType().min(20),
	publicId: stringType().min(1)
})).handler(createSsrRpc("ce298875ca5642a78128169af0dbf7abe8ae5c3e3869d097667956f552822503"));
//#endregion
export { secureDeleteImage, secureUploadGalleryImage, secureUploadImage };
