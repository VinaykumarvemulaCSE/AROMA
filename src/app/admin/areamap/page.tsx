"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrders, type Order, type OrderStatus } from "@/lib/store/orders";
import { calculateHaversineDistance, buildGoogleMapsNavUrl } from "@/lib/location";
import { inr } from "@/lib/format";
import { formatWhatsAppNumber } from "@/lib/whatsapp";
import { useRiders } from "@/lib/store/rider";
import { greedyDispatchRiders } from "@/lib/dsa/routing";
import {
  MapPin,
  Navigation,
  MessageCircle,
  Search,
  Bike,
  Building2,
  RefreshCw,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Dynamically import DeliveryAreaMapCanvas with ssr disabled
const DeliveryAreaMapCanvas = dynamic(
  () =>
    import("@/components/admin/DeliveryAreaMapCanvas").then(
      (m) => m.DeliveryAreaMapCanvas
    ),
  { ssr: false }
);

import { useSettings } from "@/lib/store/settings";
import { DsaSimulationModal } from "@/components/admin/DsaSimulationModal";
import { Activity } from "lucide-react";

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
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300",
  Preparing: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300",
  Ready: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300",
  "Out for Delivery": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-300",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-300",
};

export default function AdminDeliveryAreaMapPage() {
  const orders = useOrders((s) => s.orders);
  const updateStatus = useOrders((s) => s.updateStatus);
  const { settings, fetchSettings } = useSettings();
  const { riders, autoDispatchOrder, syncRidersToStore } = useRiders();

  const [filterStatus, setFilterStatus] = useState<"All" | OrderStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  const onlineRidersCount = useMemo(() => riders.filter((r) => r.isOnline).length, [riders]);

  React.useEffect(() => {
    fetchSettings().then(() => {
      const cur = useSettings.getState().settings;
      if (cur?.latitude && cur?.longitude) {
        syncRidersToStore({ lat: cur.latitude, lng: cur.longitude });
      }
    });
  }, [fetchSettings, syncRidersToStore]);

  const storeLat = settings?.latitude ?? 17.4399;
  const storeLng = settings?.longitude ?? 78.4017;
  const storeName = settings?.name || "Aroma Cafe Store";
  const storeAddress = settings?.address || "Hyderabad, Telangana";

  const storeLocation = useMemo(
    () => ({
      lat: storeLat,
      lng: storeLng,
      name: storeName,
      address: storeAddress,
    }),
    [storeLat, storeLng, storeName, storeAddress]
  );

  const handleAutoDispatch = () => {
    // 1. Sync available idle riders to the current active store location
    syncRidersToStore(storeLocation);

    // 2. Prepare pending unassigned orders
    const pendingOrders = orders
      .filter((o) => o.status === "Ready" || o.status === "Preparing" || o.status === "Confirmed")
      .map((o) => ({
        id: o.id,
        customerName: o.contact.name,
        customerPhone: o.contact.phone,
        address: `${o.addr.line1}, ${o.addr.city}`,
        lat: o.addr.latitude ?? storeLat,
        lng: o.addr.longitude ?? storeLng,
      }));

    if (pendingOrders.length === 0) {
      toast.info("No pending orders ready for dispatch.");
      return;
    }

    // 3. Run Greedy Dispatch Algorithm
    const greedyMatches = greedyDispatchRiders(storeLocation, pendingOrders, riders);

    let count = 0;
    for (const match of greedyMatches) {
      const targetOrder = pendingOrders.find((o) => o.id === match.orderId);
      if (targetOrder) {
        const result = autoDispatchOrder(targetOrder, storeLocation);
        if (result.assignedRider) count++;
      }
    }

    if (count > 0) {
      toast.success(
        `Greedy Algorithm paired ${count} order(s) with nearest riders relative to Store HQ (${storeLat.toFixed(4)}, ${storeLng.toFixed(4)})!`
      );
    } else {
      toast.warning("No online available riders found for Greedy dispatch.");
    }
  };

  // Filter orders matching search and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === "All" || o.status === filterStatus;
      const matchSearch =
        !searchQuery ||
        o.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.includes(searchQuery) ||
        o.addr.line1.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  // Orders with valid latitude/longitude
  const mapOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) =>
        o.addr.latitude !== undefined &&
        o.addr.longitude !== undefined &&
        o.addr.latitude !== 0 &&
        o.addr.longitude !== 0
    );
  }, [filteredOrders]);

  // Orders lacking lat/lng
  const textOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) =>
        o.addr.latitude === undefined ||
        o.addr.longitude === undefined ||
        o.addr.latitude === 0 ||
        o.addr.longitude === 0
    );
  }, [filteredOrders]);

  // Selected order details object
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Out for Delivery count
  const outForDeliveryCount = useMemo(() => {
    return orders.filter((o) => o.status === "Out for Delivery").length;
  }, [orders]);

  const handleStatusUpdate = async (id: string, s: OrderStatus) => {
    await updateStatus(id, s);
    toast.success(`Order #${id} updated to ${s}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
              <MapPin className="size-7 text-primary" /> Delivery Area Map
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Real-time delivery location tracking, order pins, and turn-by-turn navigation dispatch.
            </p>
          </div>

          {/* Quick Metrics Header Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs">
              <Bike className="size-4 text-amber-500" />
              <span>Online Riders: <strong>{onlineRidersCount}</strong></span>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium">
              <Bike className="size-4 text-cyan-600" />
              <span>Out for Delivery: <strong>{outForDeliveryCount}</strong></span>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium">
              <MapPin className="size-4 text-primary" />
              <span>Mapped Pins: <strong>{mapOrders.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID, customer name, or locality..."
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                filterStatus === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All ({orders.length})
            </button>
            {statuses.map((st) => {
              const count = orders.filter((o) => o.status === st).length;
              if (count === 0 && filterStatus !== st) return null;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
                    filterStatus === st
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span>{st}</span>
                  <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Map (Left) + Active Orders Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map Column (2-cols wide) */}
          <div className="lg:col-span-2 space-y-3 flex flex-col">
            <div className="bg-card border border-border rounded-2xl p-2 shadow-sm flex-1 flex flex-col min-h-[500px]">
              <DeliveryAreaMapCanvas
                orders={orders}
                selectedOrderId={selectedOrderId}
                onSelectOrder={(order) => setSelectedOrderId(order ? order.id : null)}
                filterStatus={filterStatus}
                storeLocation={storeLocation}
              />
            </div>

            {/* Store HQ Footer Note */}
            <div className="bg-secondary/40 border border-border rounded-xl p-3 flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>Store HQ: <strong>{storeName}</strong> ({storeLat.toFixed(4)}, {storeLng.toFixed(4)})</span>
              </div>
              <span>OpenStreetMap Engine</span>
            </div>
          </div>

          {/* Right Column: Selected Order Card / Order List */}
          <div className="space-y-4">
            {/* Selected Order Card Sidebar */}
            {selectedOrder ? (
              <div className="bg-card border-2 border-primary/40 rounded-2xl p-5 space-y-4 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-mono">Order #{selectedOrder.id}</span>
                    <h3 className="font-display font-bold text-lg">{selectedOrder.contact.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColor[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Close Order Card"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-secondary/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{selectedOrder.contact.phone}</span>
                  </div>

                  <div className="bg-secondary/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block mb-1">Delivery Address</span>
                    <p className="font-medium text-foreground">
                      {selectedOrder.addr.line1}
                      {selectedOrder.addr.line2 ? `, ${selectedOrder.addr.line2}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.addr.city} {selectedOrder.addr.pin}
                    </p>
                  </div>

                  {/* Calculated Haversine Distance */}
                  {selectedOrder.addr.latitude && selectedOrder.addr.longitude ? (
                    <div className="bg-primary/10 text-primary p-2.5 rounded-xl flex items-center justify-between font-medium">
                      <span>Distance from Cafe</span>
                      <span>
                        {calculateHaversineDistance(
                          storeLat,
                          storeLng,
                          selectedOrder.addr.latitude,
                          selectedOrder.addr.longitude
                        )}{" "}
                        km
                      </span>
                    </div>
                  ) : null}

                  {/* Order Items Summary */}
                  <div className="bg-secondary/30 p-2.5 rounded-xl space-y-1">
                    <span className="text-muted-foreground block mb-1 font-medium">Items</span>
                    {selectedOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>{it.qty}× {it.name}</span>
                        <span className="font-medium">{inr(it.qty * it.price)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-border flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span>{inr(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Navigation & WhatsApp */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      const navUrl = buildGoogleMapsNavUrl(selectedOrder.addr);
                      window.open(navUrl, "_blank");
                    }}
                  >
                    <Navigation className="size-4 mr-2" /> Start Navigation
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-green-700 dark:text-green-400 border-green-500/40 hover:bg-green-50 dark:hover:bg-green-950/30"
                    onClick={() => {
                      const phoneClean = formatWhatsAppNumber(selectedOrder.contact.phone);
                      if (phoneClean) {
                        window.open(
                          `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hi ${selectedOrder.contact.name}, this is Aroma Cafe regarding your Order #${selectedOrder.id} (${selectedOrder.status}).`)}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <MessageCircle className="size-4 mr-2" /> Message WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-5 text-center text-muted-foreground space-y-2">
                <MapPin className="size-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs">Click on any order marker on the map to view customer details & launch navigation.</p>
              </div>
            )}

            {/* Orders List Cards */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-bold text-sm flex items-center justify-between">
                <span>Active Orders ({filteredOrders.length})</span>
                <span className="text-xs text-muted-foreground font-normal">Click to focus</span>
              </h3>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-4 text-center">No orders match filter.</p>
                ) : (
                  filteredOrders.map((o) => {
                    const isSelected = selectedOrderId === o.id;
                    const hasGps =
                      o.addr.latitude !== undefined &&
                      o.addr.longitude !== undefined &&
                      o.addr.latitude !== 0 &&
                      o.addr.longitude !== 0;

                    return (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-semibold text-foreground">#{o.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[o.status]}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="font-medium text-foreground">{o.contact.name}</div>
                        <div className="text-muted-foreground truncate">{o.addr.line1}, {o.addr.city}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
                          <span className="font-semibold text-foreground">{inr(o.total)}</span>
                          <div className="flex items-center gap-1">
                            {hasGps ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                <MapPin className="size-3" /> GPS Set
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Text Addr</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const navUrl = buildGoogleMapsNavUrl(o.addr);
                                window.open(navUrl, "_blank");
                              }}
                              className="p-1 hover:bg-secondary rounded-md text-blue-600"
                              title="Start Navigation"
                            >
                              <Navigation className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DsaSimulationModal
        isOpen={showSimulationModal}
        onClose={() => setShowSimulationModal(false)}
        orders={orders}
        storeLocation={storeLocation}
      />
    </AdminLayout>
  );
}
