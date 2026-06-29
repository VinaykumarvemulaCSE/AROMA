import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { a as getIdTokenResult, d as signOut } from "../_libs/firebase__auth.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-D5n6nfq5.js
function hasAdminClaim(claims) {
	if (!claims) return false;
	return claims.admin === true;
}
async function mapFirebaseUser(fbUser) {
	const role = hasAdminClaim((await getIdTokenResult(fbUser)).claims) ? "admin" : "customer";
	return {
		id: fbUser.uid,
		name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
		email: fbUser.email ?? "",
		avatar: fbUser.photoURL ?? void 0,
		role,
		emailVerified: fbUser.emailVerified,
		notifications: {
			email: true,
			sms: true,
			promo: false
		}
	};
}
async function signOutUser() {
	try {
		await signOut(auth);
	} catch {}
	useAuth.getState().clearUser();
}
//#endregion
export { mapFirebaseUser as n, signOutUser as r, hasAdminClaim as t };
