"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRiders } from "@/lib/store/rider";
import { useOrders } from "@/lib/store/orders";
import { useSettings } from "@/lib/store/settings";
import { buildGoogleMapsNavUrl, getUserCoordinates, calculateHaversineDistance } from "@/lib/location";
import {
  optimizeDeliveryRoute,
  buildRoadNetworkGraph,
  dijkstraShortestPath,
  type DeliveryState,
  type RiderAvailabilityStatus,
} from "@/lib/dsa/routing";
import { inr } from "@/lib/format";
import { formatWhatsAppNumber } from "@/lib/whatsapp";
import { performanceTracker } from "@/lib/performance";
import { autoDispatchOrderToRider, shouldAutoDispatchOrder } from "@/lib/auto-dispatch";
import {
  generateAlternativeRoutes,
  type AlternativeRoute,
} from "@/lib/route-deviation";
import {
  Bike,
  Navigation,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  BatteryCharging,
  Power,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  UserCheck,
  Coffee,
  Lock,
  ChevronRight,
  Eye,
  AlertTriangle,
  Compass,
  Check,
  X,
  Share2,
  Sparkles,
  Route,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InAppNavigationModal, type BatchNavStop } from "@/components/rider/InAppNavigationModal";
import { toast } from "sonner";

export default function RiderPortalPage() {
  const {
    riders,
    assignments,
    currentRiderId,
    setCurrentRiderId,
    setRiderAvailability,
    toggleRiderOnline,
    updateRiderLocation,
    syncRidersToStore,
    updateDeliveryState,
    rejectAssignment,
    failDelivery,
  } = useRiders();

  const orders = useOrders((s) => s.orders);
  const updateOrderStatus = useOrders((s) => s.updateStatus);
  const { settings, fetchSettings } = useSettings();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedLoginRiderId, setSelectedLoginRiderId] = useState("rider-1");
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [showRiderLoginModal, setShowRiderLoginModal] = useState(false);
  const [selectedOrderModalId, setSelectedOrderModalId] = useState<string | null>(null);
  const [activeNavOrder, setActiveNavOrder] = useState<{ order: any; isPickedUp: boolean } | null>(null);
  const [isBatchNavActive, setIsBatchNavActive] = useState(false);
  const [failureReasonInput, setFailureReasonInput] = useState("");
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(false);
  const [alternativeRoutes, setAlternativeRoutes] = useState<AlternativeRoute[]>([]);

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = React.useRef<any>(null);

  // Trigger haptic vibration for mobile riders
  const triggerHaptic = (pattern: number[] = [150, 80, 150]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  // Screen Wake Lock API — Keeps screen awake during active rides
  const requestWakeLock = async () => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        setWakeLockActive(true);
        wakeLockRef.current?.addEventListener("release", () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        setWakeLockActive(false);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (e) {}
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  const listenToOrders = useOrders((s) => s.listenToOrders);

  useEffect(() => {
    fetchSettings();
    const unsub = listenToOrders();
    return () => unsub();
  }, [fetchSettings, listenToOrders]);

  // Keep screen awake whenever rider is online or actively broadcasting GPS
  useEffect(() => {
    const isOnline = riders.find((r) => r.id === currentRiderId)?.isOnline;
    if (isOnline || isBroadcastingGps) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [currentRiderId, riders, isBroadcastingGps]);

  // Re-acquire wake lock if rider switches back to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isOnline = riders.find((r) => r.id === currentRiderId)?.isOnline;
      if (document.visibilityState === "visible" && (isOnline || isBroadcastingGps)) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentRiderId, riders, isBroadcastingGps]);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("aroma_rider_authenticated");
    const storedRiderId = sessionStorage.getItem("aroma_rider_id");
    if (authStatus === "true" && storedRiderId) {
      setIsAuthenticated(true);
      setCurrentRiderId(storedRiderId);
    }
  }, [setCurrentRiderId]);

  const handleRiderPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRider = riders.find((r) => r.id === selectedLoginRiderId);
    const validPin = targetRider?.pin || "1234";

    if (pinInput.trim() === validPin) {
      setCurrentRiderId(selectedLoginRiderId);
      setIsAuthenticated(true);
      sessionStorage.setItem("aroma_rider_authenticated", "true");
      sessionStorage.setItem("aroma_rider_id", selectedLoginRiderId);
      toast.success(`Authorized as Rider: ${targetRider?.name}`);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Invalid Rider Security PIN. Default PIN: 1234");
      toast.error("Authentication Failed: Incorrect PIN");
    }
  };

  const handleRiderLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("aroma_rider_authenticated");
    sessionStorage.removeItem("aroma_rider_id");
    toast.info("Logged out from Rider Portal.");
  };

  // Auto-dispatch monitor - DISABLED: Auto-dispatch should only happen from admin side
  // This was causing duplicate dispatch attempts and race conditions
  // useEffect(() => {
  //   const handleDispatch = (orderId: string, riderId: string, riderName: string) => {
  //     toast.success(`Auto-dispatched Order #${orderId.slice(-6)} to ${riderName}`, {
  //       duration: 3000,
  //     });
  //   };

  //   const monitorOrders = () => {
  //     orders.forEach((order) => {
  //       if (
  //         shouldAutoDispatchOrder(order.status) &&
  //         !order.assignedRider &&
  //         order.addr.latitude &&
  //         order.addr.longitude
  //       ) {
  //         autoDispatchOrderToRider(order.id).then((result) => {
  //           if (result.success && result.riderId && result.riderName) {
  //             handleDispatch(order.id, result.riderId, result.riderName);
  //           }
  //         });
  //       }
  //     });
  //   };

  //   monitorOrders();
  // }, [orders]);

  useEffect(() => {
    if (settings?.latitude && settings?.longitude) {
      syncRidersToStore({ lat: settings.latitude, lng: settings.longitude });
    }
  }, [settings?.latitude, settings?.longitude, syncRidersToStore]);

  const activeRider = riders.find((r) => r.id === currentRiderId) || riders[0];

  const storeLat = settings?.latitude ?? 17.0544;
  const storeLng = settings?.longitude ?? 79.2671;

  // Filter assigned or active orders strictly for the authenticated rider
  const riderAssignedOrders = orders.filter((o) => {
    if (o.status === "Delivered" || o.status === "Cancelled" || o.isDeleted) return false;
    const assignment = assignments[o.id];
    const isAssignedToThisRiderInStore = assignment && assignment.riderId === activeRider?.id;
    const isAssignedToThisRiderInDoc = o.assignedRider && o.assignedRider.id === activeRider?.id;

    // Strict Authorization: Order must be assigned to THIS logged-in rider only
    return isAssignedToThisRiderInStore || isAssignedToThisRiderInDoc;
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderModalId) || null;
  const selectedAssignment = selectedOrder ? assignments[selectedOrder.id] : null;

  // Calculate Dijkstra weighted road network path for selected order modal
  const dijkstraRoute = React.useMemo(() => {
    if (!selectedOrder) return null;
    const destLat = selectedOrder.addr.latitude ?? storeLat + 0.005;
    const destLng = selectedOrder.addr.longitude ?? storeLng + 0.005;

    const graph = buildRoadNetworkGraph(storeLat, storeLng, destLat, destLng);

    // Measure Dijkstra performance
    const startTime = performance.now();
    const result = dijkstraShortestPath(graph, "cafe", "customer");
    const executionTime = performance.now() - startTime;

    console.log(`[Performance] Dijkstra: ${executionTime.toFixed(2)}ms`);

    return result;
  }, [selectedOrder, storeLat, storeLng]);

  // Generate alternative routes when order is selected
  useEffect(() => {
    if (selectedOrder && showAlternativeRoutes) {
      const destLat = selectedOrder.addr.latitude ?? storeLat + 0.005;
      const destLng = selectedOrder.addr.longitude ?? storeLng + 0.005;

      const routes = generateAlternativeRoutes(
        storeLat,
        storeLng,
        destLat,
        destLng,
        1.0 // Current traffic multiplier
      );

      setAlternativeRoutes(routes);
    }
  }, [selectedOrder, showAlternativeRoutes, storeLat, storeLng]);

  // Calculate optimized DSA route sequence for current rider's batch
  const dsaOptimizedRoute = React.useMemo(() => {
    const storeNode = {
      id: "store-base",
      address: settings?.address || "Aroma Cafe Base, Hyderabad",
      lat: storeLat,
      lng: storeLng,
    };

    const deliveryNodes = riderAssignedOrders.map((o) => ({
      id: o.id,
      orderId: o.id,
      customerName: o.contact.name,
      phone: o.contact.phone,
      address: `${o.addr.line1}, ${o.addr.city}`,
      lat: o.addr.latitude ?? storeLat + 0.005,
      lng: o.addr.longitude ?? storeLng + 0.005,
      prepTimeMinutes: 10,
    }));

    // Measure TSP performance
    const startTime = performance.now();
    const result = optimizeDeliveryRoute(storeNode, deliveryNodes);
    const executionTime = performance.now() - startTime;

    console.log(`[Performance] TSP 2-Opt: ${executionTime.toFixed(2)}ms (${deliveryNodes.length} nodes)`);

    return result;
  }, [riderAssignedOrders, settings, storeLat, storeLng]);

  // Phase 3: Ordered Stops Queue for TSP Multi-Order Batch Navigation
  const batchStopsQueue: BatchNavStop[] = React.useMemo(() => {
    if (!dsaOptimizedRoute.routeSequence || dsaOptimizedRoute.routeSequence.length <= 1) return [];

    return dsaOptimizedRoute.routeSequence
      .filter((node) => node.id !== "store-base" && node.id !== "store-hq")
      .map((node) => {
        const order = riderAssignedOrders.find((o) => o.id === node.orderId || o.id === node.id);
        const assignment = order ? assignments[order.id] : null;
        const isPickedUp =
          assignment?.deliveryState === "PICKED_UP" ||
          assignment?.deliveryState === "IN_TRANSIT" ||
          order?.status === "Out for Delivery";

        return {
          orderId: node.orderId || node.id,
          customerName: node.customerName || order?.contact.name || "Customer",
          customerPhone: node.phone || order?.contact.phone,
          address: node.address,
          coords: { lat: node.lat, lng: node.lng },
          isPickedUp: Boolean(isPickedUp),
          prepTimeMinutes: node.prepTimeMinutes ?? 10,
          orderPlacedAt: order?.createdAt,
        };
      });
  }, [dsaOptimizedRoute.routeSequence, riderAssignedOrders, assignments]);

  // Live GPS telemetry interval
  useEffect(() => {
    let timer: any = null;
    if (isBroadcastingGps && activeRider?.isOnline) {
      timer = setInterval(async () => {
        try {
          const coords = await getUserCoordinates(3); // 3 retries
          updateRiderLocation(activeRider.id, coords.latitude, coords.longitude);
          toast.success("GPS position updated live!", { duration: 1500 });
        } catch (err: any) {
          console.error("GPS broadcast error:", err);
          toast.error(`GPS error: ${err.message}`, { duration: 3000 });
          // Disable broadcast on persistent errors
          if (err.message.includes("permission denied") || err.message.includes("not supported")) {
            setIsBroadcastingGps(false);
          }
        }
      }, 10000);
    }
    return () => clearInterval(timer);
  }, [isBroadcastingGps, activeRider, updateRiderLocation]);

  const availabilityBadgeColor: Record<RiderAvailabilityStatus, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    ON_DELIVERY: "bg-amber-100 text-amber-800 border-amber-300",
    UNAVAILABLE: "bg-rose-100 text-rose-800 border-rose-300",
    OFFLINE: "bg-stone-100 text-stone-700 border-stone-300",
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white border border-amber-200 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6 text-stone-900">
          <div className="text-center space-y-2">
            <div className="size-14 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="size-7" />
            </div>
            <h2 className="font-display font-bold text-xl text-stone-900">Rider Portal Security Access</h2>
            <p className="text-xs text-stone-500">Authenticate with your Rider Account PIN to manage assigned deliveries.</p>
          </div>

          <form onSubmit={handleRiderPinLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Select Rider Profile</label>
              <select
                value={selectedLoginRiderId}
                onChange={(e) => setSelectedLoginRiderId(e.target.value)}
                className="w-full bg-stone-50 border border-amber-200 rounded-2xl p-3 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    🚴 {r.name} ({r.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Enter 4-Digit Security PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (Default: 1234)"
                className="w-full bg-stone-50 border border-amber-200 rounded-2xl p-3 text-center text-lg font-mono tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-stone-400 mt-1 text-center">Hint: Rahul Kumar (1234), Vikram Singh (2345), Suresh Patel (3456)</p>
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center font-semibold">
                {pinError}
              </p>
            )}

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl py-3 shadow-md">
              <ShieldCheck className="size-4 mr-1.5" /> AUTHENTICATE & ENTER
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans pb-24 selection:bg-amber-500 selection:text-white">
      {/* Aroma Warm Espresso Header Bar */}
      <header className="sticky top-0 z-40 bg-[#3c2415] text-[#faf7f2] border-b border-amber-900/40 px-3 sm:px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="size-9 sm:size-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Coffee className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-sm sm:text-base text-amber-100 truncate">
                  Aroma Rider Portal
                </h1>

              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/80 truncate">Navigation & Order Fulfillment</p>
            </div>
          </div>

          {/* Select Active Rider Profile / Login Switcher */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRiderLogout}
              className="border-amber-400/40 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50 text-[11px] sm:text-xs font-semibold rounded-xl h-8 px-2.5"
              title="Switch Profile (Requires PIN)"
            >
              <UserCheck className="size-3.5 mr-1 text-amber-400" />
              {activeRider.name.split(" ")[0]} (Switch)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRiderLogout}
              className="text-amber-200/80 hover:text-white hover:bg-amber-900/40 text-[11px] sm:text-xs font-semibold rounded-xl h-8 px-2"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* 1. Rider Availability & Dashboard Counter Card — Aroma Cream Theme */}
        <div className="bg-white border border-amber-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="size-11 sm:size-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-base shadow-xs">
                  <Bike className="size-5 sm:size-6" />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white ${activeRider.isOnline ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
                    }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display font-bold text-base sm:text-lg text-stone-900 truncate">
                  {activeRider.name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <Badge className={`text-[9px] sm:text-[10px] font-bold ${availabilityBadgeColor[activeRider.availability || "AVAILABLE"]}`}>
                    🟢 {activeRider.availability || "AVAILABLE"}
                  </Badge>
                  <span className="text-[11px] sm:text-xs text-stone-500">Vehicle: {activeRider.vehicleType}</span>
                  {wakeLockActive && (
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] sm:text-[10px] font-semibold flex items-center gap-1">
                      <Zap className="size-3 text-amber-600 fill-amber-600 animate-pulse" /> Screen Awake
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Availability Selector & Online Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
              <Button
                size="sm"
                variant={activeRider.isOnline ? "default" : "outline"}
                onClick={() => {
                  toggleRiderOnline(activeRider.id);
                  triggerHaptic([100, 50, 100]);
                  toast.info(activeRider.isOnline ? "Went Offline" : "Went Online");
                }}
                className={`flex-1 sm:flex-none text-xs h-9 font-bold rounded-xl ${activeRider.isOnline
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100"
                  }`}
              >
                <Power className="size-3.5 mr-1" />
                {activeRider.isOnline ? "ONLINE" : "OFFLINE"}
              </Button>

              <select
                value={activeRider.availability || "AVAILABLE"}
                onChange={(e) => setRiderAvailability(activeRider.id, e.target.value as RiderAvailabilityStatus)}
                className="flex-1 sm:flex-none bg-amber-50/80 border border-amber-200 text-stone-800 text-xs font-semibold rounded-xl px-2 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 h-9"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">NOT AVAILABLE</option>
                <option value="OFFLINE">OFFLINE</option>
                {activeRider.availability === "ON_DELIVERY" && (
                  <option value="ON_DELIVERY" disabled>
                    ON DELIVERY (Admin Assigned)
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Today's Deliveries Metrics Dashboard */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2.5 border-t border-amber-100 text-center">
            <div className="bg-amber-50/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-200/60">
              <span className="text-[9px] sm:text-[10px] font-semibold text-stone-500 block uppercase tracking-wider truncate">
                Today's Total
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-stone-900 mt-0.5 block">
                {activeRider.todayDeliveries || riderAssignedOrders.length}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-200/60">
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 block uppercase tracking-wider truncate">
                Completed
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-emerald-800 mt-0.5 block">
                {activeRider.completedDeliveries || 0}
              </span>
            </div>
            <div className="bg-amber-100/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-300/60">
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-800 block uppercase tracking-wider truncate">
                Pending
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-amber-900 mt-0.5 block">
                {riderAssignedOrders.length}
              </span>
            </div>
          </div>

          {/* Live GPS Broadcast & Coordinates Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80">
            <div className="flex items-center gap-2.5 text-xs text-stone-700 min-w-0">
              <Zap className={`size-4 shrink-0 ${isBroadcastingGps ? "text-amber-600 animate-bounce" : "text-stone-400"}`} />
              <div className="min-w-0 flex-1">
                <span className="font-semibold block truncate">Live GPS Telemetry</span>
                <span className="text-[10px] text-stone-500 font-mono truncate block">
                  Lat: {activeRider.currentLat.toFixed(4)}, Lng: {activeRider.currentLng.toFixed(4)}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const nextState = !isBroadcastingGps;
                setIsBroadcastingGps(nextState);
                if (nextState && !activeRider.isOnline) {
                  toggleRiderOnline(activeRider.id);
                  toast.success("GPS broadcasting & Rider set to Online!");
                }
              }}
              className={`text-xs h-9 font-semibold rounded-xl w-full sm:w-auto shrink-0 ${isBroadcastingGps
                  ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                  : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
            >
              {isBroadcastingGps ? "Broadcasting Live" : "Enable GPS & Go Online"}
            </Button>
          </div>
        </div>

        {/* Phase 3: TSP 2-Opt Multi-Order Batch Ride & Fuel Optimizer Card */}
        {dsaOptimizedRoute.stopsCount > 1 && (
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/50 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Award className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-stone-900">
                      Multi-Order TSP Fuel Saver
                    </h3>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      2-Opt Local Search
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Optimal stop sequencing to minimize mileage & carbon footprint.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 shadow-xs">
                  🌱 {dsaOptimizedRoute.fuelSavedPercentage}% Fuel Saved
                </Badge>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-500 block uppercase font-semibold">Stops In Tour</span>
                <span className="font-bold text-stone-900 text-sm">{dsaOptimizedRoute.stopsCount - 1} Drops</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-500 block uppercase font-semibold">TSP Road Distance</span>
                <div className="flex items-center justify-center gap-1">
                  <span className="font-bold text-emerald-700 text-sm">{dsaOptimizedRoute.totalRoadDistanceKm} km</span>
                  <span className="text-[10px] text-stone-400 line-through">({dsaOptimizedRoute.unoptimizedRoadDistanceKm} km)</span>
                </div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-500 block uppercase font-semibold">Fuel & CO₂ Saved</span>
                <span className="font-bold text-emerald-700 text-xs">
                  ~{dsaOptimizedRoute.fuelSavedLitres}L / -{dsaOptimizedRoute.co2SavedKg}kg
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-500 block uppercase font-semibold">Total Tour ETA</span>
                <span className="font-bold text-amber-700 text-sm">{dsaOptimizedRoute.totalEstimatedMinutes} mins</span>
              </div>
            </div>

            {/* Stop Sequence Itinerary Preview */}
            <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Route className="size-3.5 text-amber-700" /> Optimal 2-Opt Tour Sequence:
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  Store HQ ➔ Nearest Neighbor ➔ 2-Opt refined
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-900 border border-amber-300/80 px-2.5 py-1.5 rounded-xl font-bold shrink-0 text-[11px]">
                  <Coffee className="size-3.5 text-amber-700" /> Cafe Base
                </div>

                {batchStopsQueue.map((st, i) => (
                  <React.Fragment key={st.orderId}>
                    <ArrowRight className="size-3.5 text-stone-400 shrink-0" />
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 rounded-xl shrink-0 shadow-2xs">
                      <span className="size-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-bold text-stone-800 text-[11px] truncate max-w-[110px]">
                        {st.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        #{st.orderId.slice(-4).toUpperCase()}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Launch Batch Navigation Button */}
            <Button
              size="lg"
              onClick={() => {
                setIsBatchNavActive(true);
                triggerHaptic([120, 60, 120]);
                toast.success(`Launching TSP Batch Navigation across ${batchStopsQueue.length} stops!`);
              }}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-2xl h-11 shadow-md transition-all active:scale-[0.99]"
            >
              <Navigation className="size-4 mr-2" /> 🚀 START TSP BATCH NAVIGATION ({batchStopsQueue.length} DROPS)
            </Button>
          </div>
        )}

        {/* Assigned Deliveries List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-bold text-sm text-stone-900">
              Assigned Deliveries ({riderAssignedOrders.length})
            </h3>
            <span className="text-xs text-stone-500">Aroma Cafe Logistics Queue</span>
          </div>

          {riderAssignedOrders.length === 0 ? (
            <div className="bg-white border border-amber-200/80 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <Package className="size-6" />
              </div>
              <p className="font-display font-bold text-sm text-stone-800">No active delivery assignments</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Orders dispatched from Aroma Cafe HQ will appear here automatically with exact GPS navigation.
              </p>
            </div>
          ) : (
            riderAssignedOrders.map((order, idx) => {
              const assignment = assignments[order.id];
              const deliveryState: DeliveryState = assignment?.deliveryState || "ASSIGNED";
              const isPickedUp = deliveryState === "PICKED_UP" || deliveryState === "IN_TRANSIT" || order.status === "Out for Delivery";

              // Two-Stage Navigation Logic:
              // Stage 1 (Before Pickup): Rider Location -> Aroma Cafe HQ
              // Stage 2 (After Pickup): Aroma Cafe HQ -> Customer Drop Address
              const navUrl = isPickedUp
                ? buildGoogleMapsNavUrl(
                  {
                    line1: order.addr.line1,
                    landmark: order.addr.landmark,
                    city: order.addr.city,
                    pin: order.addr.pin,
                    latitude: order.addr.latitude,
                    longitude: order.addr.longitude,
                  },
                  { latitude: storeLat, longitude: storeLng },
                  "driving"
                )
                : buildGoogleMapsNavUrl(
                  {
                    line1: settings?.address || "Main Road, Jubilee Hills, Hyderabad",
                    city: settings?.locationName || "Hyderabad",
                    pin: "500081",
                    latitude: storeLat,
                    longitude: storeLng,
                  },
                  { latitude: activeRider.currentLat, longitude: activeRider.currentLng },
                  "driving"
                );

              const distanceKm =
                order.addr.latitude && order.addr.longitude
                  ? calculateHaversineDistance(storeLat, storeLng, order.addr.latitude, order.addr.longitude)
                  : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="size-6 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center border border-amber-300 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-600">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        {batchStopsQueue.length > 1 && (
                          <Badge className="bg-blue-100 text-blue-900 border-blue-300 text-[10px] font-bold">
                            TSP Stop #{batchStopsQueue.findIndex((s) => s.orderId === order.id) + 1}
                          </Badge>
                        )}
                      </div>
                      <p className="font-display font-bold text-sm sm:text-base text-stone-900 mt-1">
                        Customer: {order.contact.name}
                      </p>
                    </div>

                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold shrink-0">
                      {isPickedUp ? "OUT FOR DELIVERY" : "ASSIGNED (PENDING PICKUP)"}
                    </Badge>
                  </div>

                  {/* Pickup & Drop GPS Details */}
                  <div className="bg-amber-50/50 p-3 sm:p-3.5 rounded-2xl border border-amber-200/60 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-900 bg-amber-100/80 p-2 rounded-xl border border-amber-300/80">
                      <Coffee className="size-3.5 shrink-0 text-amber-700" />
                      <span className="truncate">Pickup: <strong>📍 {settings?.name || "Aroma Cafe HQ"}</strong></span>
                    </div>

                    <p className="text-stone-800 font-medium flex items-start gap-2 pt-1">
                      <MapPin className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Drop: {order.addr.line1}
                        {order.addr.landmark && `, ${order.addr.landmark}`}
                        {`, ${order.addr.city} ${order.addr.pin}`}
                      </span>
                    </p>

                    {/* Quick 1-Tap Customer Contact Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${order.contact.phone}`}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
                      >
                        <Phone className="size-3.5 text-emerald-600" /> Call {order.contact.phone}
                      </a>
                      <a
                        href={`https://wa.me/91${order.contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${order.contact.name}, this is ${activeRider.name} from Aroma Cafe with your order #${order.id}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="size-3.5 text-emerald-600" /> WhatsApp
                      </a>
                    </div>

                    {distanceKm > 0 && (
                      <p className="text-[11px] text-stone-600 pl-1 pt-0.5">
                        Distance from Cafe: <strong className="text-amber-800">{distanceKm} km</strong>
                      </p>
                    )}
                  </div>

                  {/* Driver Action Buttons: [ VIEW DETAILS ] & [ TWO-STAGE NAVIGATE ] */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrderModalId(order.id)}
                      className="w-full sm:w-auto text-xs font-semibold border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl h-10"
                    >
                      <Eye className="size-3.5 mr-1.5" /> VIEW DETAILS
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setActiveNavOrder({ order, isPickedUp })}
                      className={`w-full sm:flex-1 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 h-10 ${
                        isPickedUp ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      <Navigation className="size-4" />
                      {isPickedUp ? "LAUNCH IN-APP NAVIGATION" : "NAVIGATE TO CAFE HQ"}
                    </Button>
                  </div>

                  {/* Streamlined Direct Rider Fulfillment Controls */}
                  <div className="pt-2 border-t border-amber-100 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {deliveryState === "ASSIGNED" && (
                        <Button
                          size="lg"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl h-11 shadow-sm"
                          onClick={() => {
                            updateDeliveryState(order.id, "ACCEPTED");
                            triggerHaptic([150, 80, 150]);
                            toast.success("Order accepted! Head to cafe to pick up. 🚴");
                          }}
                        >
                          <CheckCircle2 className="size-4 mr-2" /> ✅ ACCEPT ASSIGNMENT
                        </Button>
                      )}

                      {deliveryState === "ACCEPTED" && !isPickedUp && (
                        <Button
                          size="lg"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl h-11 shadow-sm"
                          onClick={() => {
                            updateDeliveryState(order.id, "PICKED_UP");
                            updateOrderStatus(order.id, "Out for Delivery");
                            triggerHaptic([150, 80, 150]);
                            toast.success("Order picked up from Cafe! Out for Delivery 🚴");
                          }}
                        >
                          <Coffee className="size-4 mr-2" /> ☕ PICK UP ORDER FROM CAFE
                        </Button>
                      )}

                      {isPickedUp && deliveryState !== "DELIVERED" && (
                        <Button
                          size="lg"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md rounded-xl h-11"
                          onClick={() => {
                            updateDeliveryState(order.id, "DELIVERED");
                            updateOrderStatus(order.id, "Delivered");
                            triggerHaptic([200, 100, 200, 100, 200]);
                            toast.success("Order marked as DELIVERED to customer! 🎉");
                          }}
                        >
                          <CheckCircle2 className="size-5 mr-2" /> 🎉 MARK ORDER DELIVERED
                        </Button>
                      )}
                    </div>

                    {deliveryState !== "DELIVERED" && deliveryState !== "DELIVERY_FAILED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const reason = prompt("Enter failure reason (e.g., Customer unavailable, Address incorrect):");
                          if (reason) {
                            failDelivery(order.id, reason);
                            toast.error(`Delivery marked failed: ${reason}`);
                          }
                        }}
                        className="w-full text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7"
                      >
                        <AlertTriangle className="size-3 mr-1" /> Report Delivery Issue / Failed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>



      {/* 3. Delivery Details Modal (Submodule 3) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-amber-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Delivery Details</span>
                <h3 className="font-display font-bold text-lg text-stone-900">Order #{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderModalId(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Pickup */}
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <Coffee className="size-4 text-amber-700" /> Pickup Location
              </span>
              <p className="font-semibold text-stone-800">📍 Aroma Cafe HQ Base</p>
              <p className="text-stone-500">{settings?.address || "Main Branch, Nalgonda, Telangana"}</p>
            </div>

            {/* Customer Details */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-stone-900 block">Customer Information</span>
              <p className="font-semibold text-stone-800">👤 {selectedOrder.contact.name}</p>
              <p className="text-stone-600">📞 Phone: {selectedOrder.contact.phone}</p>
            </div>

            {/* Delivery Location GPS */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
              <span className="font-bold text-emerald-900 block">Delivery Location & Coordinates</span>
              <p className="font-semibold text-stone-800">
                📍 {selectedOrder.addr.line1}, {selectedOrder.addr.city}
              </p>
              {selectedOrder.addr.landmark && (
                <p className="text-stone-600">Landmark: Near {selectedOrder.addr.landmark}</p>
              )}
              {selectedOrder.addr.latitude && selectedOrder.addr.longitude && (
                <p className="font-mono text-[11px] bg-white p-2 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
                  GPS: `{selectedOrder.addr.latitude}, {selectedOrder.addr.longitude}`
                </p>
              )}
              {selectedOrder.addr.notes && (
                <p className="text-amber-800 font-medium pt-1">
                  Instructions: "{selectedOrder.addr.notes}"
                </p>
              )}
            </div>

            {/* Dijkstra Graph Shortest-Path Calculation */}
            {dijkstraRoute && (
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Compass className="size-4 text-amber-700" /> Dijkstra Shortest Path
                  </span>
                  <span className="font-mono text-amber-800 font-bold">{dijkstraRoute.totalDistanceKm} km</span>
                </div>

                <ol className="relative border-l border-amber-300 pl-3 space-y-1.5 text-[11px]">
                  {dijkstraRoute.path.map((node, i) => (
                    <li key={node.id} className="text-stone-700 font-medium">
                      <span className="font-bold text-amber-900">{i + 1}. {node.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Alternative Routes (Dynamic Routing) */}
            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-300/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-blue-700" /> Alternative Routes
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAlternativeRoutes(!showAlternativeRoutes)}
                  className="text-[10px] font-semibold border-blue-300 text-blue-700 hover:bg-blue-100 h-7"
                >
                  {showAlternativeRoutes ? "Hide" : "Show"}
                </Button>
              </div>

              {showAlternativeRoutes && alternativeRoutes.length > 0 && (
                <div className="space-y-2 pt-2">
                  {alternativeRoutes.map((route, idx) => (
                    <div
                      key={route.id}
                      className={`p-2.5 rounded-xl border ${idx === 0
                          ? "bg-emerald-50 border-emerald-300"
                          : "bg-white border-stone-200"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">{route.name}</span>
                        {idx === 0 && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{route.totalDistanceKm.toFixed(1)} km</span>
                        <span>•</span>
                        <span>{route.estimatedMinutes} min</span>
                        <span>•</span>
                        <span className="text-blue-600">{route.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={buildGoogleMapsNavUrl(selectedOrder.addr, { latitude: storeLat, longitude: storeLng })}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-2xl text-center shadow-sm"
              >
                Launch Voice Navigation
              </a>
              <Button
                variant="outline"
                onClick={() => setSelectedOrderModalId(null)}
                className="text-xs font-semibold rounded-2xl border-stone-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rider Switcher Modal */}
      {showRiderLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-amber-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">Select Rider Profile</h3>
                <p className="text-xs text-stone-500">Choose active rider profile</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {riders.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setCurrentRiderId(r.id);
                    setShowRiderLoginModal(false);
                    toast.success(`Logged in as ${r.name}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${r.id === activeRider.id
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400"
                      : "border-stone-200 bg-stone-50/50 text-stone-800 hover:bg-stone-100"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bike className="size-4 text-amber-700" />
                    <div>
                      <p className="text-xs font-semibold">{r.name}</p>
                      <span className="text-[10px] text-stone-500 capitalize">{r.vehicleType}</span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-stone-400" />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRiderLoginModal(false)}
              className="w-full text-xs text-stone-500 hover:text-stone-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 4. Full-Screen In-App Turn-by-Turn DSA Navigation Modal (Single or Multi-Stop TSP Batch) */}
      {(activeNavOrder || isBatchNavActive) && (
        <InAppNavigationModal
          isOpen={!!activeNavOrder || isBatchNavActive}
          onClose={() => {
            setActiveNavOrder(null);
            setIsBatchNavActive(false);
          }}
          startCoords={{ lat: activeRider.currentLat, lng: activeRider.currentLng }}
          destinationCoords={
            activeNavOrder
              ? activeNavOrder.isPickedUp
                ? {
                    lat: activeNavOrder.order.addr.latitude ?? storeLat + 0.005,
                    lng: activeNavOrder.order.addr.longitude ?? storeLng + 0.005,
                  }
                : { lat: storeLat, lng: storeLng }
              : batchStopsQueue[0]?.coords || { lat: storeLat, lng: storeLng }
          }
          destinationLabel={
            activeNavOrder
              ? activeNavOrder.isPickedUp
                ? `${activeNavOrder.order.addr.line1}, ${activeNavOrder.order.addr.city}`
                : settings?.name || "Aroma Cafe HQ"
              : batchStopsQueue[0]
              ? `${batchStopsQueue[0].customerName} (${batchStopsQueue[0].address})`
              : "Batch Destination"
          }
          cafeCoords={{ lat: storeLat, lng: storeLng }}
          orderPlacedAt={activeNavOrder?.order.createdAt || batchStopsQueue[0]?.orderPlacedAt}
          prepTimeMinutes={15}
          customerName={activeNavOrder?.order.contact.name || batchStopsQueue[0]?.customerName}
          customerPhone={activeNavOrder?.order.contact.phone || batchStopsQueue[0]?.customerPhone}
          isPickedUp={activeNavOrder ? activeNavOrder.isPickedUp : batchStopsQueue.some((s) => s.isPickedUp)}
          orderId={activeNavOrder ? activeNavOrder.order.id : batchStopsQueue[0]?.orderId || "BATCH"}
          stopsQueue={isBatchNavActive ? batchStopsQueue : undefined}
          fuelSavedPercentage={dsaOptimizedRoute.fuelSavedPercentage}
          onPickUp={(ordId) => {
            const targetId = ordId || activeNavOrder?.order.id;
            if (targetId) {
              updateDeliveryState(targetId, "PICKED_UP");
              updateOrderStatus(targetId, "Out for Delivery");
              setActiveNavOrder((prev) => (prev ? { ...prev, isPickedUp: true } : null));
              triggerHaptic([150, 80, 150]);
              toast.success("Order picked up from Cafe! Out for Delivery 🚴");
            } else if (isBatchNavActive) {
              batchStopsQueue.forEach((st) => {
                updateDeliveryState(st.orderId, "PICKED_UP");
                updateOrderStatus(st.orderId, "Out for Delivery");
              });
              triggerHaptic([150, 80, 150]);
              toast.success("All batch orders processed from Cafe! 🚴");
            }
          }}
          onDeliver={(ordId) => {
            const targetId = ordId || activeNavOrder?.order.id;
            if (targetId) {
              updateDeliveryState(targetId, "DELIVERED");
              updateOrderStatus(targetId, "Delivered");
              triggerHaptic([200, 100, 200, 100, 200]);
              toast.success("Order marked as DELIVERED to customer! 🎉");
              if (!isBatchNavActive) {
                setActiveNavOrder(null);
              }
            }
          }}
        />
      )}
    </div>
  );
}
