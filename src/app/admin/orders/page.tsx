"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  MessageCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  BellRing,
  Printer,
  CheckSquare,
  Square,
  X,
  Layers,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inr } from "@/lib/format";
import { useSettings } from "@/lib/store/settings";
import { useOrders, type Order, type OrderStatus } from "@/lib/store/orders";
import { toast } from "sonner";
import { formatWhatsAppNumber } from "@/lib/whatsapp";
import { printOrderInvoice, printOrdersListPDF } from "@/lib/print-invoice";
import {
  getAdminSoundEnabled,
  setAdminSoundEnabled,
  playOrderChime,
} from "@/lib/audio";

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusColor: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  Preparing: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  Ready: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  "Out for Delivery": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export default function AdminOrders() {
  const orders = useOrders((s) => s.orders);
  const updateStatus = useOrders((s) => s.updateStatus);
  const deleteOrder = useOrders((s) => s.deleteOrder);
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("Confirmed");
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSoundEnabledState(getAdminSoundEnabled());
    const handleToggle = () => setSoundEnabledState(getAdminSoundEnabled());
    window.addEventListener("aroma_sound_toggle", handleToggle);
    return () => window.removeEventListener("aroma_sound_toggle", handleToggle);
  }, []);

  const toggleSound = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setAdminSoundEnabled(enabled);
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const list = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = filter === "All" || o.status === filter;
      const matchQ =
        !q || o.contact.name.toLowerCase().includes(q.toLowerCase()) || o.id.includes(q);
      return matchFilter && matchQ;
    });
  }, [orders, filter, q]);

  const setStatus = (id: string, s: OrderStatus) => {
    updateStatus(id, s);
    if (view?.id === id) setView((v) => (v ? { ...v, status: s } : v));
    toast.success(`Order #${id} → ${s}`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length && list.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((o) => o.id));
    }
  };

  // Bulk status update
  const handleBulkStatusChange = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      updateStatus(id, bulkStatus);
    });
    toast.success(`Updated ${selectedIds.length} orders to "${bulkStatus}"`);
    setSelectedIds([]);
  };

  // Print PDF summary of orders
  const handlePrintOrdersPDF = () => {
    const targetOrders =
      selectedIds.length > 0 ? orders.filter((o) => selectedIds.includes(o.id)) : list;
    printOrdersListPDF(
      targetOrders,
      selectedIds.length > 0 ? `Selected Orders (${selectedIds.length})` : "Orders Summary Report",
    );
  };

  // Execute actual deletion in Firebase & store
  const executeDelete = async () => {
    if (!deleteTarget || deleteTarget.ids.length === 0) return;
    setIsDeleting(true);
    let count = 0;
    try {
      for (const id of deleteTarget.ids) {
        await deleteOrder(id);
        count++;
      }
      toast.success(`Successfully deleted ${count} order(s) from Firebase`);
      setSelectedIds((prev) => prev.filter((id) => !deleteTarget.ids.includes(id)));
      if (view && deleteTarget.ids.includes(view.id)) setView(null);
    } catch (e: any) {
      toast.error(`Deletion error: ${e?.message || "Failed to delete from Firebase"}`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
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

    const phone = formatWhatsAppNumber(o.contact.phone);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    toast.success(`Order #${o.id} accepted & WhatsApp opened.`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Orders Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {orders.length} total orders recorded
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              playOrderChime();
              toast.success("Test chime played!");
            }}
            title="Test audio alert sound"
          >
            <BellRing className="size-4 mr-1.5 text-amber-500" /> Test Sound
          </Button>
          <Button
            variant={soundEnabled ? "default" : "secondary"}
            size="sm"
            onClick={() => {
              toggleSound(!soundEnabled);
              toast.success(!soundEnabled ? "Audio alerts enabled" : "Audio alerts muted");
            }}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-4 mr-1.5" /> Audio: ON
              </>
            ) : (
              <>
                <VolumeX className="size-4 mr-1.5 text-muted-foreground" /> Audio: OFF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mt-5 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
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
            onChange={(e) => setFilter(e.target.value as "All" | OrderStatus)}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm"
          >
            <option value="All">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={handlePrintOrdersPDF}>
          <Printer className="size-4 mr-1.5" /> Print / Save Orders PDF
        </Button>
      </div>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 my-4 bg-primary text-primary-foreground p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Layers className="size-5" />
            <span className="font-semibold text-sm">
              {selectedIds.length} {selectedIds.length === 1 ? "order" : "orders"} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-lg p-1">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                className="h-8 rounded bg-background text-foreground text-xs px-2 focus:outline-none"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    Mark as {st}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs font-semibold"
                onClick={handleBulkStatusChange}
              >
                Apply
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground"
              onClick={handlePrintOrdersPDF}
            >
              <Printer className="size-3.5 mr-1" /> Print Selected ({selectedIds.length}) PDF
            </Button>

            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs font-semibold"
              onClick={() =>
                setDeleteTarget({
                  ids: selectedIds,
                  label: `${selectedIds.length} selected orders`,
                })
              }
            >
              <Trash2 className="size-3.5 mr-1" /> Delete Selected ({selectedIds.length})
            </Button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-primary-foreground/10 rounded-lg text-primary-foreground transition-colors"
              title="Clear selection"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="mt-5 bg-card border border-border rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-sm min-w-[850px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10">
                <button onClick={toggleSelectAll} className="grid place-items-center">
                  {selectedIds.length === list.length && list.length > 0 ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4 text-muted-foreground" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Date & Time</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
            {list.map((o) => {
              const isSelected = selectedIds.includes(o.id);
              return (
                <tr
                  key={o.id}
                  className={`hover:bg-secondary/30 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(o.id)}
                      className="grid place-items-center"
                    >
                      {isSelected ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-xs">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.contact.name}</div>
                    <div className="text-xs text-muted-foreground">{o.contact.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <div>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                  </td>
                  <td className="px-4 py-3">{o.items.length}</td>
                  <td className="px-4 py-3 font-semibold">{inr(o.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[o.status as OrderStatus] ?? "bg-secondary"}`}
                    >
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setView(o)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs p-1"
                        onClick={() => printOrderInvoice(o, settings)}
                        title="Print Invoice"
                      >
                        <Printer className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setDeleteTarget({ ids: [o.id], label: `Order #${o.id}` })
                        }
                        title="Delete Order"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>Order #{view?.id}</DialogTitle>
              {view && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => printOrderInvoice(view, settings)}
                  >
                    <Printer className="size-3.5 mr-1" /> Print Invoice
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() =>
                      setDeleteTarget({ ids: [view.id], label: `Order #${view.id}` })
                    }
                  >
                    <Trash2 className="size-3.5 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>
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
                  <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                  <p>
                    {view.addr.line1}
                    {view.addr.line2 && `, ${view.addr.line2}`}
                  </p>
                  <p>
                    {view.addr.city} {view.addr.pin}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Order Items
                </p>
                <div className="bg-secondary/20 rounded-xl divide-y divide-border/60">
                  {view.items.map((i) => (
                    <div key={i.id} className="p-2.5 flex justify-between">
                      <span>
                        {i.qty} × {i.name}
                      </span>
                      <span className="font-semibold">{inr(i.price * i.qty)}</span>
                    </div>
                  ))}
                  <div className="p-2.5 font-bold flex justify-between bg-secondary/40 rounded-b-xl">
                    <span>Total</span>
                    <span>{inr(view.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Status Update
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={view.status === s ? "default" : "outline"}
                      className="text-xs h-7"
                      onClick={() => setStatus(view.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    const phone = formatWhatsAppNumber(view.contact.phone);
                    if (phone) {
                      window.open(
                        `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${view.contact.name}, this is Aroma Cafe regarding your Order #${view.id} (${view.status}).`)}`,
                        "_blank",
                      );
                    }
                  }}
                >
                  <MessageCircle className="size-4 mr-2" /> Message Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Interactive Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-display">
              <Trash2 className="size-5" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm font-medium">
              Are you really sure you want to delete <strong>{deleteTarget?.label}</strong>?
            </p>
            <div className="text-xs bg-destructive/10 text-destructive p-3 rounded-xl border border-destructive/20 leading-relaxed">
              ⚠️ This will permanently remove the record from your <strong>Firebase database</strong>.
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={executeDelete}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
