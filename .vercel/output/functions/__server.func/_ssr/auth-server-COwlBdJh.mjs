import { a as getAuth } from "../_libs/firebase-admin+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-server-COwlBdJh.js
async function verifyIdToken(idToken) {
	return getAuth().verifyIdToken(idToken);
}
async function verifyAdmin(idToken) {
	const decoded = await verifyIdToken(idToken);
	if (decoded.admin !== true) throw new Error("Admin access required.");
	return decoded;
}
async function resolveUserIdFromToken(idToken) {
	if (!idToken) return null;
	try {
		return (await verifyIdToken(idToken)).uid;
	} catch {
		return null;
	}
}
//#endregion
export { verifyAdmin as n, resolveUserIdFromToken as t };
