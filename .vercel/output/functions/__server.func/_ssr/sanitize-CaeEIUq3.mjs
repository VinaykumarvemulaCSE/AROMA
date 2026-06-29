import { t as purify } from "../_libs/dompurify.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sanitize-CaeEIUq3.js
/**
* Sanitizes plain text content
* Removes HTML tags and escapes special characters
*/
function sanitizeText(text) {
	return purify.sanitize(text, { ALLOWED_TAGS: [] });
}
/**
* Sanitizes user input for display in forms
* Preserves basic formatting but removes dangerous content
*/
function sanitizeInput(input) {
	return sanitizeText(input).trim();
}
//#endregion
export { sanitizeInput as t };
