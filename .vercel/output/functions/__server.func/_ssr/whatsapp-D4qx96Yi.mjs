import { r as inr } from "./format-B1-9ZxZd.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import { n as orderSchema } from "./schemas-B_Z4Eu_V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-D4qx96Yi.js
var getOrderForTracking = createServerFn({ method: "POST" }).validator(objectType({
	orderId: stringType().min(1),
	phone: stringType().min(10)
})).handler(createSsrRpc("fec2b61f7a04a4182532615ffce8ee894f70318f6b11ad623f61cfc376ded786"));
var createOrder = createServerFn({ method: "POST" }).validator((data) => orderSchema.parse(data)).handler(createSsrRpc("00e828a7cbd00d568d07bebe5f5c0e6c24a84ec46880352adb787cb183a1f079"));
function buildOrderMessage(o) {
	const sub = o.subtotal ?? o.items.reduce((a, i) => a + i.price * i.qty, 0);
	const itemsText = o.items.map((l, i) => `${i + 1}. ${l.name}\n   ${l.qty} × ${inr(l.price)} = ${inr(l.qty * l.price)}`).join("\n");
	const a = o.addr || {};
	const addressParts = [
		a.line1,
		a.line2,
		a.landmark && `Near ${a.landmark}`,
		`${a.city || ""} ${a.pin || ""}`.trim()
	].filter(Boolean).join(", ");
	const c = o.contact || {};
	const discountLine = o.discount && o.discount > 0 ? `Coupon${o.couponCode ? ` (${o.couponCode})` : ""}: -${inr(o.discount)}` : "";
	return [
		`🛎️ *${o.status ? "ORDER" : "NEW ORDER"} #${o.id}*${o.status ? ` · ${o.status}` : ""}`,
		`Aroma Cafe & Restaurant — Nalgonda`,
		`📅 ${new Date(o.createdAt).toLocaleString("en-IN", {
			dateStyle: "medium",
			timeStyle: "short"
		})}`,
		"",
		`👤 *Customer*\n${c.name || "—"}\n📞 ${c.phone || "—"}${c.email ? `\n✉️ ${c.email}` : ""}${c.method ? `\nPreferred contact: ${c.method}` : ""}`,
		"",
		`🛍️ *Items (${o.items.length})*\n${itemsText}`,
		"",
		`💰 *Bill*\nSubtotal: ${inr(sub)}${o.tax !== void 0 ? `\nGST (5%): ${inr(o.tax)}` : ""}${o.delivery !== void 0 ? `\nDelivery: ${o.delivery === 0 ? "FREE" : inr(o.delivery)}` : ""}${discountLine ? `\n${discountLine}` : ""}\n*TOTAL: ${inr(o.total)}*`,
		addressParts ? `\n📍 *Deliver to*${a.type ? ` (${a.type})` : ""}\n${addressParts}${a.phone && a.phone !== c.phone ? `\n📞 ${a.phone}` : ""}${a.notes ? `\n📝 ${a.notes}` : ""}` : "",
		c.note ? `\n⭐ *Special request:* ${c.note}` : "",
		c.cutlery !== void 0 ? `\n🍴 Cutlery: ${c.cutlery ? "Yes" : "No"}` : "",
		"",
		o.status ? "Please confirm and share the payment QR. Thank you!" : "Please confirm this order. Thank you!"
	].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function buildOrderWhatsAppUrl(o, whatsappNumber) {
	return `https://wa.me/${whatsappNumber || "918019551015"}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}
/** Open WhatsApp in a tab pre-opened synchronously on user click (avoids popup blockers). */
function openWhatsAppInTab(tab, o, whatsappNumber) {
	const url = buildOrderWhatsAppUrl(o, whatsappNumber);
	if (tab && !tab.closed) {
		tab.location.href = url;
		return true;
	}
	return false;
}
var WA_PENDING_KEY = (orderId) => `wa-pending-${orderId}`;
//#endregion
export { openWhatsAppInTab as a, getOrderForTracking as i, buildOrderWhatsAppUrl as n, createOrder as r, WA_PENDING_KEY as t };
