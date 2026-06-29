import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { a as getAuth } from "../_libs/firebase-admin+[...].mjs";
import { c as sendVerificationEmailInternal } from "./email-CMJXOQcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/custom-verification-CHnYwDz-.js
var sendCustomVerificationEmail_createServerFn_handler = createServerRpc({
	id: "7dd614e62b30fed541bd38d080ee9b6313c3104e41b0e7b2a284276da0afcf3a",
	name: "sendCustomVerificationEmail",
	filename: "src/lib/api/custom-verification.ts"
}, (opts) => sendCustomVerificationEmail.__executeServer(opts));
var sendCustomVerificationEmail = createServerFn({ method: "POST" }).validator(objectType({ email: stringType().email() })).handler(sendCustomVerificationEmail_createServerFn_handler, async ({ data }) => {
	const auth = getAuth();
	const actionCodeSettings = {
		url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/auth/verify`,
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
export { sendCustomVerificationEmail_createServerFn_handler };
