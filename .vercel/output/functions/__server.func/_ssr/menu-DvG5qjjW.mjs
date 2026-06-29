import { n as create } from "../_libs/zustand.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, f as collection, l as updateDoc, n as deleteDoc, p as doc, s as query } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu-DvG5qjjW.js
var categories = [
	{
		name: "Breakfast",
		icon: "🍳"
	},
	{
		name: "Starters",
		icon: "🥗"
	},
	{
		name: "Main Course",
		icon: "🍛"
	},
	{
		name: "Breads & Rice",
		icon: "🍚"
	},
	{
		name: "Desserts",
		icon: "🍰"
	},
	{
		name: "Beverages",
		icon: "☕"
	},
	{
		name: "Combos",
		icon: "🍱"
	}
];
var useMenu = create()((set) => ({
	menu: [],
	addMenuItem: async (item) => {
		const id = `item-${Date.now()}`;
		await setDoc(doc(db, "menu_items", id), {
			...item,
			id
		});
	},
	updateMenuItem: async (id, patch) => {
		await updateDoc(doc(db, "menu_items", id), patch);
	},
	removeMenuItem: async (id) => {
		await deleteDoc(doc(db, "menu_items", id));
	},
	listenToMenu: () => {
		return onSnapshot(query(collection(db, "menu_items")), (snapshot) => {
			set({ menu: snapshot.docs.map((doc) => doc.data()) });
		});
	}
}));
//#endregion
export { useMenu as n, categories as t };
