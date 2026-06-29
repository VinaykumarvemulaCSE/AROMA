import { i as initializeApp, n as cert, r as getApps, t as getFirestore } from "../_libs/firebase-admin+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rate-limit-zhwmVyqd.js
if (getApps().length === 0) try {
	if (process.env.FIREBASE_SERVICE_ACCOUNT) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
	else initializeApp();
} catch (error) {
	console.error("Firebase Admin SDK Initialization Error:", error);
}
var adminDb = getFirestore();
/**
* Firestore-backed rate limiter for server functions.
* Works across serverless instances in the same Firebase project.
*/
async function rateLimit(key, maxRequests, windowMs) {
	const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
	const docRef = adminDb.collection("_ratelimit").doc(safeKey);
	const now = Date.now();
	await adminDb.runTransaction(async (transaction) => {
		const snap = await transaction.get(docRef);
		if (!snap.exists || now > snap.data().resetTime) {
			transaction.set(docRef, {
				count: 1,
				resetTime: now + windowMs
			});
			return;
		}
		const data = snap.data();
		if (data.count >= maxRequests) {
			const minutesLeft = Math.ceil((data.resetTime - now) / 6e4);
			throw new Error(`Too many requests. Please try again in ${minutesLeft} minute(s).`);
		}
		transaction.update(docRef, { count: data.count + 1 });
	});
}
//#endregion
export { rateLimit as n, adminDb as t };
