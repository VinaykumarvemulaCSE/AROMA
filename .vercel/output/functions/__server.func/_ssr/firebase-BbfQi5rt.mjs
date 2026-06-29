import { r as __exportAll$1 } from "../_runtime.mjs";
import { o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import "../_libs/firebase.mjs";
import { i as getAuth, t as GoogleAuthProvider } from "../_libs/firebase__auth.mjs";
import { m as getFirestore } from "../_libs/@firebase/firestore+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firebase-BbfQi5rt.js
var firebase_BbfQi5rt_exports = /* @__PURE__ */ __exportAll$1({
	i: () => googleProvider,
	n: () => db,
	r: () => firebase_exports,
	t: () => auth
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var firebase_exports = /* @__PURE__ */ __exportAll({
	auth: () => auth,
	db: () => db,
	googleProvider: () => googleProvider
});
var firebaseConfig = {
	apiKey: "AIzaSyAtvGH69C7IOGwanqt3cfkzFbt0o0hCvOY",
	authDomain: "aroma-cafe-79055.firebaseapp.com",
	projectId: "aroma-cafe-79055",
	storageBucket: "aroma-cafe-79055.firebasestorage.app",
	messagingSenderId: "759327196246",
	appId: "1:759327196246:web:a816c330266210a46c67f7",
	measurementId: ""
};
if (Object.entries(firebaseConfig).filter(([key, value]) => key !== "measurementId" && !value).map(([key]) => key).length > 0 && false);
var app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
var auth = getAuth(app);
var db = getFirestore(app);
var googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
//#endregion
export { googleProvider as i, db as n, firebase_BbfQi5rt_exports as r, auth as t };
