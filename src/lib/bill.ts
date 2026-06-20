import { cafeInfo, inr } from "./format";

type BillOrder = {
  id: string;
  items: { id: string; name: string; qty: number; price: number }[];
  subtotal?: number;
  tax?: number;
  delivery?: number;
  total: number;
  addr?: { line1: string; pin: string; city: string };
  contact?: { name: string; phone: string };
  createdAt: number;
};

export function downloadBill(order: BillOrder) {
  const sub = order.subtotal ?? order.items.reduce((a, i) => a + i.price * i.qty, 0);
  const tax = order.tax ?? 0;
  const delivery = order.delivery ?? 0;

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Bill ${order.id} — ${cafeInfo.name}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#1c1410;margin:0;padding:32px;background:#fff;max-width:560px;margin:0 auto}
  h1{font-size:22px;margin:0 0 4px;letter-spacing:-.02em}
  .muted{color:#6b5d54;font-size:12px}
  .row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  hr{border:0;border-top:1px dashed #d8cfc7;margin:18px 0}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:6px 0;vertical-align:top}
  th{font-weight:600;border-bottom:1px solid #e3dcd5}
  td.qty,th.qty{width:36px;text-align:center}
  td.amt,th.amt{text-align:right;white-space:nowrap}
  .total{font-weight:700;font-size:16px}
  .footer{text-align:center;margin-top:24px;font-size:11px;color:#8a7d73}
  .brand{display:flex;align-items:center;gap:10px}
  .logo{width:38px;height:38px;border-radius:999px;background:#26170c;color:#fcf9f8;display:grid;place-items:center;font-weight:700;font-family:Poppins,sans-serif}
  @media print { body{padding:16px} .noprint{display:none} }
</style></head><body>
  <div class="row">
    <div class="brand">
      <div class="logo">A</div>
      <div>
        <h1>${cafeInfo.name}</h1>
        <div class="muted">${cafeInfo.address}</div>
        <div class="muted">${cafeInfo.phone} · ${cafeInfo.email}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700">Bill</div>
      <div class="muted">#${order.id}</div>
      <div class="muted">${new Date(order.createdAt).toLocaleString("en-IN")}</div>
    </div>
  </div>
  <hr/>
  ${order.contact ? `<div class="muted">Customer: <strong style="color:#1c1410">${order.contact.name}</strong> · ${order.contact.phone}</div>` : ""}
  ${order.addr ? `<div class="muted">Deliver to: ${order.addr.line1}, ${order.addr.city} ${order.addr.pin}</div>` : ""}
  <hr/>
  <table>
    <thead><tr><th class="qty">Qty</th><th>Item</th><th class="amt">Price</th><th class="amt">Amount</th></tr></thead>
    <tbody>
      ${order.items.map((i) => `<tr><td class="qty">${i.qty}</td><td>${i.name}</td><td class="amt">${inr(i.price)}</td><td class="amt">${inr(i.price * i.qty)}</td></tr>`).join("")}
    </tbody>
  </table>
  <hr/>
  <table>
    <tr><td>Subtotal</td><td class="amt">${inr(sub)}</td></tr>
    ${tax ? `<tr><td>GST</td><td class="amt">${inr(tax)}</td></tr>` : ""}
    ${delivery ? `<tr><td>Delivery</td><td class="amt">${inr(delivery)}</td></tr>` : ""}
    <tr class="total"><td>Total</td><td class="amt">${inr(order.total)}</td></tr>
  </table>
  <div class="footer">Thank you for choosing Aroma. Brewed with love in Nalgonda.</div>
  <div class="noprint" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="padding:10px 18px;border-radius:8px;background:#26170c;color:#fff;border:0;font-size:14px;cursor:pointer">Save as PDF / Print</button>
  </div>
  <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300))</script>
</body></html>`;

  const w = window.open("", "_blank", "width=620,height=820");
  if (!w) {
    // popup blocked — fallback: download as .html
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aroma-bill-${order.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.write(html);
  w.document.close();
}
