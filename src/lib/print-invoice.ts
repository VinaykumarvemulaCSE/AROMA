import type { Order } from "./store/orders";
import { inr } from "./format";

export function printOrderInvoice(
  order: Order,
  cafeInfo?: { name?: string; address?: string; phone?: string; gst?: string | number } | null,
): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const cafeName = cafeInfo?.name || "Aroma Cafe & Restaurant";
  const cafeAddress = cafeInfo?.address || "Clock Tower Center, Main Road, Nalgonda, Telangana - 508001";
  const cafePhone = cafeInfo?.phone || "+91 98765 43210";
  const dateStr = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${order.id} — ${cafeName}</title>
  <style>
    @page { margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      margin: 0;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e7e5e4;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      color: #3b281f;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
    }
    .sub {
      color: #78716c;
      font-size: 12px;
      margin: 0;
    }
    .meta-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #d6d3d1;
    }
    .meta-col {
      flex: 1;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #a8a29e;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .meta-val {
      font-weight: 600;
      color: #292524;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #78716c;
      border-bottom: 1px solid #e7e5e4;
      padding: 8px 4px;
    }
    td {
      padding: 10px 4px;
      border-bottom: 1px solid #f5f5f4;
      font-size: 12px;
    }
    .num { text-align: right; }
    .totals {
      margin-left: auto;
      width: 260px;
      border-top: 1px solid #e7e5e4;
      padding-top: 10px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      color: #57534e;
    }
    .grand-total {
      font-size: 15px;
      font-weight: 800;
      color: #3b281f;
      border-top: 2px solid #e7e5e4;
      padding-top: 8px;
      margin-top: 6px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: #f5f5f4;
      color: #44403c;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e7e5e4;
      color: #a8a29e;
      font-size: 11px;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="brand">☕ ${cafeName}</h1>
    <p class="sub">${cafeAddress}</p>
    <p class="sub">Phone: ${cafePhone}</p>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <div class="meta-label">Billed To</div>
      <div class="meta-val">${order.contact.name}</div>
      <div style="font-size:11px;color:#78716c;">${order.contact.phone}</div>
      <div style="font-size:11px;color:#78716c;margin-top:4px;">
        ${[order.addr.line1, order.addr.line2, order.addr.city, order.addr.pin].filter(Boolean).join(", ")}
      </div>
    </div>
    <div class="meta-col" style="text-align:right;">
      <div class="meta-label">Invoice Details</div>
      <div class="meta-val">Order #${order.id}</div>
      <div style="font-size:11px;color:#78716c;">${dateStr}</div>
      <div style="margin-top:4px;"><span class="badge">${order.status}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50%;">Item</th>
        <th class="num" style="width:15%;">Price</th>
        <th class="num" style="width:15%;">Qty</th>
        <th class="num" style="width:20%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (i) => `
        <tr>
          <td><strong>${i.name}</strong></td>
          <td class="num">${inr(i.price)}</td>
          <td class="num">${i.qty}</td>
          <td class="num"><strong>${inr(i.price * i.qty)}</strong></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${inr(order.subtotal)}</span>
    </div>
    <div class="totals-row">
      <span>GST / Taxes</span>
      <span>${inr(order.tax)}</span>
    </div>
    <div class="totals-row">
      <span>Delivery Fee</span>
      <span>${order.delivery === 0 ? "FREE" : inr(order.delivery)}</span>
    </div>
    ${
      order.discount
        ? `
    <div class="totals-row" style="color:#15803d;">
      <span>Discount (${order.couponCode || "Coupon"})</span>
      <span>-${inr(order.discount)}</span>
    </div>`
        : ""
    }
    <div class="totals-row grand-total">
      <span>Grand Total</span>
      <span>${inr(order.total)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing ${cafeName}! Enjoy your meal.</p>
    <p style="font-size:9px;">This is a computer generated tax invoice.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
`;

  win.document.write(html);
  win.document.close();
}

export function printCafeAuditReport(data: {
  title: string;
  dateRange: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { name: string; category: string; count: number; revenue: number }[];
}): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.title} — Aroma Cafe</title>
  <style>
    @page { margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1c1917;
      margin: 0;
      padding: 24px;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #3b281f;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 24px; font-weight: 800; color: #3b281f; margin: 0; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      padding: 16px;
    }
    .kpi-num { font-size: 22px; font-weight: 800; color: #3b281f; margin-top: 4px; }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; color: #78716c; border-bottom: 2px solid #e7e5e4; padding: 8px 4px; }
    td { padding: 10px 4px; border-bottom: 1px solid #f5f5f4; }
    .num { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">☕ Aroma Cafe Business Report</h1>
      <p style="margin:4px 0 0 0;color:#78716c;">Period: ${data.dateRange}</p>
    </div>
    <div style="text-align:right;color:#a8a29e;font-size:11px;">
      Generated on ${new Date().toLocaleString("en-IN")}
    </div>
  </div>

  <div class="kpis">
    <div class="kpi-card">
      <div class="kpi-lbl">Total Revenue</div>
      <div class="kpi-num">${inr(data.totalRevenue)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">Total Completed Orders</div>
      <div class="kpi-num">${data.totalOrders}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">Average Order Value</div>
      <div class="kpi-num">${inr(data.avgOrderValue)}</div>
    </div>
  </div>

  <h3 style="font-size:15px;margin-bottom:8px;color:#292524;">Top Selling Items Breakdown</h3>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Dish Name</th>
        <th>Category</th>
        <th class="num">Units Sold</th>
        <th class="num">Gross Revenue</th>
      </tr>
    </thead>
    <tbody>
      ${data.topItems
        .map(
          (item, idx) => `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td class="num">${item.count}</td>
          <td class="num"><strong>${inr(item.revenue)}</strong></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  win.document.write(html);
  win.document.close();
}

export function printOrdersListPDF(orders: Order[], title = "Orders Report"): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const totalAmount = orders.reduce((s, o) => (!["Cancelled"].includes(o.status) ? s + o.total : s), 0);
  const dateStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const rows = orders
    .map(
      (o, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>#${o.id}</strong></td>
      <td>${new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}, ${new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
      <td><strong>${o.contact.name}</strong><br/><span style="color:#78716c;font-size:11px">${o.contact.phone}</span></td>
      <td>${o.items.map((i) => `${i.qty}x ${i.name}`).join("<br/>")}</td>
      <td style="font-weight:700;text-align:right">${inr(o.total)}</td>
      <td><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:#f5f5f4;font-weight:600">${o.status}</span></td>
    </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — Aroma Cafe</title>
  <style>
    @page { margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1c1917;
      margin: 0;
      padding: 16px;
      font-size: 12px;
    }
    .header {
      border-bottom: 2px solid #3b281f;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand { font-size: 20px; font-weight: 800; color: #3b281f; margin: 0; }
    .sub { color: #78716c; font-size: 11px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { background: #f5f5f4; text-align: left; padding: 8px 6px; border-bottom: 2px solid #d6d3d1; font-weight: 700; }
    td { padding: 6px; border-bottom: 1px solid #e7e5e4; vertical-align: top; }
    .summary-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 10px 14px; margin-top: 16px; display: flex; justify-content: space-between; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Aroma Cafe & Restaurant</div>
      <div class="sub">${title} · Generated on ${dateStr}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:16px;font-weight:700;color:#3b281f">${orders.length} Orders</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:24px">#</th>
        <th>Order ID</th>
        <th>Date & Time</th>
        <th>Customer</th>
        <th>Items</th>
        <th style="text-align:right">Total</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="summary-box">
    <span><strong>Total Completed Volume:</strong> ${inr(totalAmount)}</span>
    <span><strong>Total Count:</strong> ${orders.length} orders</span>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
