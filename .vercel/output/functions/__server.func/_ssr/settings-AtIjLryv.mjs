import { n as create } from "../_libs/zustand.mjs";
import { t as cafeInfo } from "./format-B1-9ZxZd.mjs";
import "../_libs/firebase.mjs";
import { c as setDoc, p as doc, r as getDoc } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-AtIjLryv.js
var DAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
var DEFAULTS = {
	name: cafeInfo.name,
	phone: cafeInfo.phone,
	email: cafeInfo.email,
	address: cafeInfo.address,
	whatsapp: cafeInfo.whatsapp,
	whatsappOnly: true,
	deliveryEnabled: true,
	minOrder: 150,
	freeDeliveryAbove: 499,
	gst: 5,
	hours: DAYS.reduce((acc, d) => ({
		...acc,
		[d]: {
			open: "08:00",
			close: "23:00"
		}
	}), {}),
	rating: cafeInfo.rating,
	reviewCount: cafeInfo.reviewCount,
	mapsUrl: cafeInfo.mapsUrl,
	tagline: cafeInfo.tagline,
	instagram: cafeInfo.instagram,
	facebook: cafeInfo.facebook,
	logoLetters: "A",
	locationName: "Nalgonda",
	deliveryFee: 40,
	maxPartySize: 20,
	bookingWindowDays: 30,
	categories: [
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
	]
};
var useSettings = create()((set) => ({
	settings: null,
	loading: false,
	fetchSettings: async () => {
		set({ loading: true });
		try {
			const snap = await getDoc(doc(db, "settings", "restaurant"));
			if (snap.exists()) {
				const data = snap.data();
				set({ settings: {
					...DEFAULTS,
					...data,
					hours: {
						...DEFAULTS.hours,
						...data.hours || {}
					}
				} });
			} else set({ settings: DEFAULTS });
		} catch (e) {
			console.error("Failed to fetch settings from Firestore", e);
			set({ settings: DEFAULTS });
		} finally {
			set({ loading: false });
		}
	},
	saveSettings: async (newSettings) => {
		await setDoc(doc(db, "settings", "restaurant"), newSettings);
		set({ settings: newSettings });
	}
}));
//#endregion
export { DEFAULTS as n, useSettings as r, DAYS as t };
