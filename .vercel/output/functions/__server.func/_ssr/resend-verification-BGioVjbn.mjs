import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { a as getAuth } from "../_libs/firebase-admin+[...].mjs";
import { c as sendVerificationEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resend-verification-BGioVjbn.js
var resendVerificationEmail_createServerFn_handler = createServerRpc({
	id: "6deda8bf1d43b4129dfdbc7d1b6093c4de2ace85d24627e9cad9bea6a3437a84",
	name: "resendVerificationEmail",
	filename: "src/lib/api/resend-verification.ts"
}, (opts) => resendVerificationEmail.__executeServer(opts));
var resendVerificationEmail = createServerFn({ method: "POST" }).validator(objectType({ email: stringType().email() })).handler(resendVerificationEmail_createServerFn_handler, async ({ data }) => {
	const auth = getAuth();
	const actionCodeSettings = {
		url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/auth/verify`,
		handleCodeInApp: true
	};
	const link = await auth.generateEmailVerificationLink(data.email, actionCodeSettings);
	await sendVerificationEmailInternal({
		email: data.email,
		verificationLink: link
	});
	return { success: true };
});
//#endregion
export { resendVerificationEmail_createServerFn_handler };
