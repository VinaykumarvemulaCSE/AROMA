import type { Order } from "./store/orders";
import type { MenuItem } from "./store/menu";
import type { Reservation } from "./store/tables";
import { inr } from "./format";

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/"/g, '""');
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str}"`;
  }
  return str;
}

function downloadCSV(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Defer cleanup so the browser download manager can process the stream
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 1000);
}

// ── Export Orders ──
export function exportOrdersToCSV(orders: Order[], filenamePrefix = "aroma_orders"): void {
  const headers = [
    "Order ID",
    "Date & Time",
    "Customer Name",
    "Customer Phone",
    "Customer Email",
    "Items Summary",
    "Item Count",
    "Subtotal (₹)",
    "Tax (₹)",
    "Delivery Fee (₹)",
    "Discount (₹)",
    "Coupon Code",
    "Total (₹)",
    "Status",
    "Delivery Address",
    "Notes",
  ];

  const rows = orders.map((o) => {
    const dateStr = new Date(o.createdAt).toLocaleString("en-IN");
    const itemsSummary = o.items.map((i) => `${i.qty}x ${i.name}`).join("; ");
    const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
    const addrStr = [o.addr.line1, o.addr.line2, o.addr.city, o.addr.pin].filter(Boolean).join(", ");

    return [
      o.id,
      dateStr,
      o.contact.name,
      o.contact.phone,
      o.contact.email || "",
      itemsSummary,
      itemCount,
      o.subtotal,
      o.tax,
      o.delivery,
      o.discount || 0,
      o.couponCode || "",
      o.total,
      o.status,
      addrStr,
      o.contact.note || o.addr.notes || "",
    ]
      .map(escapeCSV)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCSV(`${filenamePrefix}_${dateTag}.csv`, csv);
}

// ── Export Orders to Excel (.xls) ──
export function exportOrdersToExcel(orders: Order[], filenamePrefix = "aroma_orders"): void {
  const dateTag = new Date().toISOString().slice(0, 10);
  const rows = orders
    .map(
      (o) => `
    <tr>
      <td>${o.id}</td>
      <td>${new Date(o.createdAt).toLocaleString("en-IN")}</td>
      <td>${o.contact.name}</td>
      <td>${o.contact.phone}</td>
      <td>${o.contact.email || "—"}</td>
      <td>${o.items.map((i) => `${i.qty}x ${i.name}`).join("; ")}</td>
      <td>${o.items.reduce((s, i) => s + i.qty, 0)}</td>
      <td>${o.subtotal}</td>
      <td>${o.tax}</td>
      <td>${o.delivery}</td>
      <td>${o.discount || 0}</td>
      <td>${o.couponCode || "—"}</td>
      <td><strong>${o.total}</strong></td>
      <td>${o.status}</td>
      <td>${[o.addr.line1, o.addr.line2, o.addr.city, o.addr.pin].filter(Boolean).join(", ")}</td>
    </tr>`,
    )
    .join("");

  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; }
        th { background-color: #26170c; color: #ffffff; font-weight: bold; border: 1px solid #ddd; padding: 8px 12px; }
        td { border: 1px solid #ddd; padding: 6px 10px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h2>Aroma Cafe — Orders Export Report (${dateTag})</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Items Summary</th>
            <th>Total Items</th>
            <th>Subtotal (₹)</th>
            <th>GST (₹)</th>
            <th>Delivery (₹)</th>
            <th>Discount (₹)</th>
            <th>Coupon</th>
            <th>Total (₹)</th>
            <th>Status</th>
            <th>Delivery Address</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>`;

  const blob = new Blob(["\uFEFF" + excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filenamePrefix}_${dateTag}.xls`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 1000);
}

// ── Export Menu ──
export function exportMenuToCSV(menu: MenuItem[], filenamePrefix = "aroma_menu"): void {
  const headers = [
    "Item ID",
    "Name",
    "Category",
    "Price (₹)",
    "Diet",
    "Prep Time (min)",
    "In Stock",
    "Tags",
    "Description",
  ];

  const rows = menu.map((m) => {
    return [
      m.id,
      m.name,
      m.category,
      m.price,
      m.veg ? "Veg" : "Non-Veg",
      m.prepTime,
      m.available !== false ? "Yes" : "No",
      m.tags ? m.tags.join("; ") : "",
      m.description || "",
    ]
      .map(escapeCSV)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCSV(`${filenamePrefix}_${dateTag}.csv`, csv);
}

// ── Export Customers ──
export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: number;
};

export function exportCustomersToCSV(customers: CustomerRecord[], filenamePrefix = "aroma_customers"): void {
  const headers = [
    "Customer Name",
    "Phone Number",
    "Email Address",
    "Total Orders",
    "Total Spent (₹)",
    "Last Order Date",
  ];

  const rows = customers.map((c) => {
    const lastDate = c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-IN") : "Never";
    return [
      c.name,
      c.phone,
      c.email || "",
      c.totalOrders,
      c.totalSpent,
      lastDate,
    ]
      .map(escapeCSV)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCSV(`${filenamePrefix}_${dateTag}.csv`, csv);
}

// ── Export Reservations ──
export function exportReservationsToCSV(reservations: Reservation[], filenamePrefix = "aroma_reservations"): void {
  const headers = [
    "Reservation ID",
    "Guest Name",
    "Phone",
    "Email",
    "Party Size",
    "Slot Date & Time",
    "Occasion",
    "Seating Preference",
    "Status",
    "Special Notes",
    "Created At",
  ];

  const rows = reservations.map((r) => {
    return [
      r.id,
      r.name,
      r.phone,
      r.email || "",
      r.partySize,
      r.slotDatetime,
      r.occasion || "Casual",
      r.seat || "Standard",
      r.status,
      r.notes || "",
      new Date(r.createdAt).toLocaleString("en-IN"),
    ]
      .map(escapeCSV)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadCSV(`${filenamePrefix}_${dateTag}.csv`, csv);
}
