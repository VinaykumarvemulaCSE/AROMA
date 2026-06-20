import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle, CheckCircle2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inr, cafeInfo } from "@/lib/format";
import { useOrders, type Order, type OrderStatus } from "@/lib/store/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Aroma Admin" }] }),
  component: AdminOrders,
});

const statuses: OrderStatus[] = [
  "Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled",
];

const statusColor: Record<OrderStatus, string> = {
  Pending:          "bg-amber-100 text-amber-700",
  Confirmed:        "bg-blue-100 text-blue-700",
  Preparing:        "bg-purple-100 text-purple-700",
  Ready:            "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-cyan-100 text-cyan-700",
  Delivered:        "bg-green-100 text-green-700",
  Cancelled:        "bg-red-100 text-red-700",
};

function AdminOrders() {
  const orders = useOrders((s) => s.orders);
  const updateStatus = useOrders((s) => s.updateStatus);

  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Order | null>(null);

  const list = orders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchQ =
      !q ||
      o.contact.name.toLowerCase().includes(q.toLowerCase()) ||
      o.id.includes(q);
    return matchFilter && matchQ;
  });

  const setStatus = (id: string, s: OrderStatus) => {
    updateStatus(id, s);
    if (view?.id === id) setView((v) => (v ? { ...v, status: s } : v));
    toast.success(`Order #${id} → ${s}`);
  };

  // Accept order: mark Confirmed + open WhatsApp to confirm with customer
  const acceptOrder = (o: Order) => {
    updateStatus(o.id, "Confirmed");
    if (view?.id === o.id) setView({ ...o, status: "Confirmed" });

    const itemsText = o.items
      .map((i, idx) => `${idx + 1}. ${i.name} × ${i.qty} = ${inr(i.qty * i.price)}`)
      .join("\n");

    const msg = [
      `✅ *Order #${o.id} Confirmed!*`,
      `Hi ${o.contact.name}, your order from Aroma Cafe has been accepted.`,
      ``,
      `🛍️ *Items*`,
      itemsText,
      ``,
      `💰 *Total: ${inr(o.total)}*`,
      ``,
      `📍 Delivering to: ${o.addr.line1}, ${o.addr.city}`,
      `⏱️ Estimated time: 30–45 minutes`,
      ``,
      `We'll notify you when your order is ready. Thank you! 🙏`,
    ].join("\n");

    const phone = o.contact.phone.replace(/\D/g, "");
    const waUrl = `https://wa.me/${phone || cafeInfo.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    toast.success(`Order #${o.id} accepted & WhatsApp opened.`);
  };

  const exportCsv = () => {
    const head = "Order,Customer,Phone,Items,Total,Status,Date\n";
    const body = list
      .map((o) =>
        [
          o.id,
          o.contact.name,
          o.contact.phone,
          o.items.length,
          o.total,
          o.status,
          new Date(o.createdAt).toLocaleDateString("en-IN"),
        ].join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl sm:text-3xl font-display font-bold">Orders</h1>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="flex items-center bg-card rounded-md border border-border px-3 w-full sm:w-64">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order or customer"
            className="border-0 focus-visible:ring-0"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm"
        >
          <option value="All">All statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <Button variant="outline" className="ml-auto" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {/* Orders table */}
      <div className="mt-5 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["Order", "Customer", "Time", "Items", "Total", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No orders found. Customer orders will appear here once placed.
                </td>
              </tr>
            )}
            {list.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">#{o.id}</td>
                <td className="px-4 py-3">
                  {o.contact.name}
                  <div className="text-xs text-muted-foreground">{o.contact.phone}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  <div>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                </td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-semibold">{inr(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[o.status as OrderStatus] ?? "bg-secondary"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {o.status === "Pending" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => acceptOrder(o)}
                      >
                        <CheckCircle2 className="size-3.5" /> Accept
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setView(o)}>
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{view?.id}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{view.contact.name}</p>
                  <p>{view.contact.phone}</p>
                  {view.contact.email && <p>{view.contact.email}</p>}
                </div>
                <div className="bg-secondary/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Deliver to</p>
                  <p>{view.addr.line1}</p>
                  {view.addr.line2 && <p>{view.addr.line2}</p>}
                  <p>{view.addr.city} {view.addr.pin}</p>
                </div>
              </div>

              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                {view.items.map((i) => (
                  <div key={i.id} className="flex justify-between py-0.5">
                    <span>{i.qty} × {i.name}</span>
                    <span>{inr(i.qty * i.price)}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 space-y-0.5">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(view.subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>GST</span><span>{inr(view.tax)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{view.delivery === 0 ? "FREE" : inr(view.delivery)}</span></div>
                  {view.discount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Coupon ({view.couponCode})</span><span>-{inr(view.discount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>Total</span><span>{inr(view.total)}</span></div>
                </div>
              </div>

              {view.contact.note && (
                <p className="text-muted-foreground text-xs">⭐ Request: {view.contact.note}</p>
              )}

              {/* Status controls */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Update status</p>
                <div className="flex flex-wrap gap-1.5">
                  {view.status === "Pending" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => acceptOrder(view)}
                    >
                      <MessageCircle className="size-3.5" /> Accept & WhatsApp
                    </Button>
                  )}
                  {statuses.filter((s) => s !== "Pending").map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={view.status === s ? "default" : "outline"}
                      onClick={() => setStatus(view.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
