//#region node_modules/.nitro/vite/services/ssr/assets/format-B1-9ZxZd.js
var inr = (n) => new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0
}).format(n);
var cafeInfo = {
	name: "Aroma Cafe & Restaurant",
	tagline: "Brewed with love in Nalgonda",
	phone: "+91 80195 51015",
	whatsapp: "918019551015",
	email: "hello@aromacafe.in",
	address: "Clock Tower Road, Nalgonda, Telangana 508001",
	hours: "Mon–Sun · 8:00 AM – 11:00 PM",
	rating: 4.7,
	reviewCount: 1284,
	instagram: "https://instagram.com",
	facebook: "https://facebook.com",
	mapsUrl: "https://maps.google.com/?q=Nalgonda"
};
var getCafeInfo = (settings) => {
	if (!settings) return {
		...cafeInfo,
		logoLetters: "A",
		locationName: "Nalgonda"
	};
	return {
		...cafeInfo,
		name: settings.name || cafeInfo.name,
		phone: settings.phone || cafeInfo.phone,
		whatsapp: settings.whatsapp || cafeInfo.whatsapp,
		email: settings.email || cafeInfo.email,
		address: settings.address || cafeInfo.address,
		tagline: settings.tagline || cafeInfo.tagline,
		instagram: settings.instagram || cafeInfo.instagram,
		facebook: settings.facebook || cafeInfo.facebook,
		rating: settings.rating || cafeInfo.rating,
		reviewCount: settings.reviewCount || cafeInfo.reviewCount,
		logoLetters: settings.logoLetters || "A",
		locationName: settings.locationName || "Nalgonda"
	};
};
//#endregion
export { getCafeInfo as n, inr as r, cafeInfo as t };
