import { inr } from "./format";

type WAItem = { name: string; qty: number; price: number };
export type WAOrder = {
  id: string;
  items: WAItem[];
  subtotal?: number;
  tax?: number;
  delivery?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  addr?: {
    line1?: string;
    line2?: string;
    landmark?: string;
    city?: string;
    pin?: string;
    type?: string;
    notes?: string;
    phone?: string;
  };
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    method?: string;
    note?: string;
    cutlery?: boolean;
  };
  createdAt: number;
  status?: string;
};

export function buildOrderMessage(o: WAOrder) {
  const sub = o.subtotal ?? o.items.reduce((a, i) => a + i.price * i.qty, 0);
  const itemsText = o.items
    .map((l, i) => `${i + 1}. ${l.name}\n   ${l.qty} × ${inr(l.price)} = ${inr(l.qty * l.price)}`)
    .join("\n");
  const a = o.addr || {};
  const addressParts = [
    a.line1,
    a.line2,
    a.landmark && `Near ${a.landmark}`,
    `${a.city || ""} ${a.pin || ""}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  const c = o.contact || {};
  const discountLine =
    o.discount && o.discount > 0
      ? `Coupon${o.couponCode ? ` (${o.couponCode})` : ""}: -${inr(o.discount)}`
      : "";
  const blocks = [
    `🛎️ *${o.status ? "ORDER" : "NEW ORDER"} #${o.id}*${o.status ? ` · ${o.status}` : ""}`,
    `Aroma Cafe & Restaurant — Nalgonda`,
    `📅 ${new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
    "",
    `👤 *Customer*\n${c.name || "—"}\n📞 ${c.phone || "—"}${c.email ? `\n✉️ ${c.email}` : ""}${c.method ? `\nPreferred contact: ${c.method}` : ""}`,
    "",
    `🛍️ *Items (${o.items.length})*\n${itemsText}`,
    "",
    `💰 *Bill*\nSubtotal: ${inr(sub)}${o.tax !== undefined ? `\nGST (5%): ${inr(o.tax)}` : ""}${o.delivery !== undefined ? `\nDelivery: ${o.delivery === 0 ? "FREE" : inr(o.delivery)}` : ""}${discountLine ? `\n${discountLine}` : ""}\n*TOTAL: ${inr(o.total)}*`,
    addressParts
      ? `\n📍 *Deliver to*${a.type ? ` (${a.type})` : ""}\n${addressParts}${a.phone && a.phone !== c.phone ? `\n📞 ${a.phone}` : ""}${a.notes ? `\n📝 ${a.notes}` : ""}`
      : "",
    c.note ? `\n⭐ *Special request:* ${c.note}` : "",
    c.cutlery !== undefined ? `\n🍴 Cutlery: ${c.cutlery ? "Yes" : "No"}` : "",
    "",
    o.status
      ? "Please confirm and share the payment QR. Thank you!"
      : "Please confirm this order. Thank you!",
  ];
  return blocks
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildOrderWhatsAppUrl(o: WAOrder, whatsappNumber?: string) {
  return `https://wa.me/${whatsappNumber || "918019551015"}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}

/** Open WhatsApp in a tab pre-opened synchronously on user click (avoids popup blockers). */
export function openWhatsAppInTab(tab: Window | null, o: WAOrder, whatsappNumber?: string): boolean {
  const url = buildOrderWhatsAppUrl(o, whatsappNumber);
  if (tab && !tab.closed) {
    tab.location.href = url;
    return true;
  }
  return false;
}

export function openWhatsAppOrder(o: WAOrder, whatsappNumber?: string) {
  window.open(buildOrderWhatsAppUrl(o, whatsappNumber), "_blank");
}

export const WA_PENDING_KEY = (orderId: string) => `wa-pending-${orderId}`;
