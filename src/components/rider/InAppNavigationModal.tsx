"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Volume2,
  VolumeX,
  Navigation,
  MapPin,
  Coffee,
  CheckCircle2,
  Phone,
  MessageCircle,
  RefreshCw,
  Zap,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  CornerUpRight,
  CornerUpLeft,
  RotateCw,
  Undo2,
  GitFork,
  GitMerge,
  TrendingUp,
  List,
  Clock,
  ChevronDown,
  ChevronUp,
  Timer,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getLiveRoadRoute,
  getMultiStopRoadRoute,
  calculateDualLegEta,
  ManeuverInstruction,
  TurnDirection,
  DualLegEtaResult,
  MultiStopWaypoint,
} from "@/lib/dsa/routing";
import { useTraffic, type TrafficLevel, TRAFFIC_MULTIPLIERS } from "@/lib/store/traffic";
import { calculateHaversineDistance, getUserCoordinates } from "@/lib/location";
import { toast } from "sonner";

export type BatchNavStop = {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  coords: { lat: number; lng: number };
  isPickedUp: boolean;
  prepTimeMinutes?: number;
  orderPlacedAt?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  startCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  destinationLabel: string;
  cafeCoords?: { lat: number; lng: number };
  customerName?: string;
  customerPhone?: string;
  isPickedUp: boolean;
  orderId: string;
  orderPlacedAt?: number;
  prepTimeMinutes?: number;
  onPickUp: (orderId?: string) => void;
  onDeliver: (orderId?: string) => void;
  // Phase 3: Multi-Order Batch TSP Navigation
  stopsQueue?: BatchNavStop[];
  initialStopIndex?: number;
  fuelSavedPercentage?: number;
};

const DEFAULT_CAFE_COORDS = { lat: 17.4399, lng: 78.4017 };

export function InAppNavigationModal({
  isOpen,
  onClose,
  startCoords,
  destinationCoords,
  destinationLabel,
  cafeCoords = DEFAULT_CAFE_COORDS,
  customerName,
  customerPhone,
  isPickedUp,
  orderId,
  orderPlacedAt,
  prepTimeMinutes = 12,
  onPickUp,
  onDeliver,
  stopsQueue,
  initialStopIndex = 0,
  fuelSavedPercentage,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const stopsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Multi-stop state
  const isBatchMode = Boolean(stopsQueue && stopsQueue.length > 1);
  const [currentStopIdx, setCurrentStopIdx] = useState(initialStopIndex);
  const [completedStopIds, setCompletedStopIds] = useState<Set<string>>(new Set());
  const [internalPickedUp, setInternalPickedUp] = useState(isPickedUp);

  useEffect(() => {
    setInternalPickedUp(isPickedUp);
  }, [isPickedUp]);

  // Derive active stop information
  const activeStop: BatchNavStop | null =
    stopsQueue && stopsQueue.length > 0
      ? stopsQueue[currentStopIdx] || stopsQueue[0]
      : null;

  const activeOrderId = activeStop ? activeStop.orderId : orderId;
  const activeCustName = activeStop ? activeStop.customerName : customerName;
  const activeCustPhone = activeStop ? activeStop.customerPhone : customerPhone;
  const activeDestCoords = activeStop ? activeStop.coords : destinationCoords;
  const activeDestLabel = activeStop
    ? `${activeStop.customerName} (${activeStop.address})`
    : destinationLabel;
  const activeIsPickedUp = isBatchMode ? (activeStop ? activeStop.isPickedUp : isPickedUp) : internalPickedUp;
  const activePrepTime = activeStop?.prepTimeMinutes ?? prepTimeMinutes;
  const activePlacedAt = activeStop?.orderPlacedAt ?? orderPlacedAt;

  const [currentRiderPos, setCurrentRiderPos] = useState(startCoords);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [maneuvers, setManeuvers] = useState<ManeuverInstruction[]>([]);
  const [currentManeuverIdx, setCurrentManeuverIdx] = useState(0);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [totalDurationMins, setTotalDurationMins] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showBatchQueue, setShowBatchQueue] = useState(false);
  const [showEtaBreakdown, setShowEtaBreakdown] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [trafficRadiusKm, setTrafficRadiusKm] = useState(0.75);
  const [dualLegEta, setDualLegEta] = useState<DualLegEtaResult | null>(null);

  const { incidents, reportTraffic, removeIncident, getRouteTrafficMultiplier, getActiveIncidents } = useTraffic();

  // Active traffic along current route
  const currentRouteTraffic = getRouteTrafficMultiplier(
    routeCoordinates.length > 0
      ? routeCoordinates.map((c) => ({ lat: c[0], lng: c[1] }))
      : [{ lat: currentRiderPos.lat, lng: currentRiderPos.lng }, { lat: activeDestCoords.lat, lng: activeDestCoords.lng }]
  );

  // Trigger mobile vibration haptic pulse
  const triggerHaptic = (pattern: number[] = [80, 40, 80]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  };

  // Speak aloud maneuver prompts
  const speakInstruction = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  };

  // Screen wake lock during active navigation
  useEffect(() => {
    let wakeLock: any = null;
    if (isOpen && typeof window !== "undefined" && "wakeLock" in navigator) {
      (navigator as any).wakeLock
        .request("screen")
        .then((lock: any) => {
          wakeLock = lock;
          setWakeLockActive(true);
        })
        .catch(() => setWakeLockActive(false));
    }
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
      setWakeLockActive(false);
    };
  }, [isOpen]);

  // Compute DSA route & Dual Leg ETA with live traffic multiplier
  const calculateRoute = async (start = currentRiderPos, forcedMultiplier?: number) => {
    setIsRecalculating(true);
    try {
      const checkPath =
        routeCoordinates.length > 0
          ? routeCoordinates.map((c) => ({ lat: c[0], lng: c[1] }))
          : [{ lat: start.lat, lng: start.lng }, { lat: activeDestCoords.lat, lng: activeDestCoords.lng }];

      const latestTraffic = useTraffic.getState().getRouteTrafficMultiplier(checkPath);
      const trafficMultiplier = forcedMultiplier !== undefined ? forcedMultiplier : latestTraffic.multiplier || 1.0;

      if (isBatchMode && stopsQueue && stopsQueue.length > 1) {
        // Multi-Stop TSP route from current rider position through remaining stops
        const remainingStops = stopsQueue.slice(currentStopIdx);
        const waypoints: MultiStopWaypoint[] = [
          { lat: start.lat, lng: start.lng, label: "Rider Position", isStore: false },
          ...remainingStops.map((st, i) => ({
            lat: st.coords.lat,
            lng: st.coords.lng,
            label: `Stop ${currentStopIdx + i + 1}: ${st.customerName}`,
            orderId: st.orderId,
            customerName: st.customerName,
            address: st.address,
          })),
        ];

        const multiRes = await getMultiStopRoadRoute(waypoints, trafficMultiplier);
        setRouteCoordinates(multiRes.polyline);
        setManeuvers(multiRes.allManeuvers);
        setTotalDistanceKm(multiRes.totalDistanceKm);
        setTotalDurationMins(multiRes.totalDurationMins);

        // Also compute single dual leg for immediate active stop
        const etaRes = await calculateDualLegEta(
          start,
          cafeCoords,
          activeDestCoords,
          activePrepTime,
          activePlacedAt,
          trafficMultiplier
        );
        setDualLegEta(etaRes);
        setCurrentManeuverIdx(0);

        if (multiRes.allManeuvers.length > 0) {
          speakInstruction(multiRes.allManeuvers[0].audioPrompt);
        }
      } else {
        // Single order route calculation: route to Cafe if not picked up, or Customer if picked up
        const targetCoords = activeIsPickedUp ? activeDestCoords : cafeCoords;
        const targetLabel = activeIsPickedUp ? activeDestLabel : "Aroma Cafe HQ";

        const [routeResult, etaResult] = await Promise.all([
          getLiveRoadRoute(start, targetCoords, targetLabel, trafficMultiplier),
          calculateDualLegEta(
            start,
            cafeCoords,
            activeDestCoords,
            activePrepTime,
            activePlacedAt,
            trafficMultiplier
          ),
        ]);

        setRouteCoordinates(routeResult.polyline);
        setManeuvers(routeResult.maneuvers);
        setTotalDistanceKm(routeResult.totalDistanceKm);
        setTotalDurationMins(routeResult.totalDurationMins);
        setDualLegEta(etaResult);
        setCurrentManeuverIdx(0);

        if (routeResult.maneuvers.length > 0) {
          speakInstruction(routeResult.maneuvers[0].audioPrompt);
        }
      }
    } catch (e) {
      toast.error("Failed to compute DSA road route");
    } finally {
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateRoute(startCoords);
    }
  }, [isOpen, startCoords, currentStopIdx, destinationCoords, activeIsPickedUp, incidents]);

  // Live GPS tracking interval during navigation
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(async () => {
      try {
        const pos = await getUserCoordinates();
        setCurrentRiderPos({ lat: pos.latitude, lng: pos.longitude });

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([pos.latitude, pos.longitude]);
        }

        // Check distance to current maneuver
        if (maneuvers.length > 0 && currentManeuverIdx < maneuvers.length) {
          const currentStep = maneuvers[currentManeuverIdx];
          const distToStep = calculateHaversineDistance(
            pos.latitude,
            pos.longitude,
            currentStep.toCoords.lat,
            currentStep.toCoords.lng
          );

          if (distToStep < 0.045 && currentManeuverIdx < maneuvers.length - 1) {
            const nextIdx = currentManeuverIdx + 1;
            setCurrentManeuverIdx(nextIdx);
            triggerHaptic([100, 50, 100]);
            speakInstruction(maneuvers[nextIdx].audioPrompt);
          }
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, maneuvers, currentManeuverIdx]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [currentRiderPos.lat, currentRiderPos.lng],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    const trafficLayerGroup = L.layerGroup().addTo(map);
    trafficLayerGroupRef.current = trafficLayerGroup;

    const stopsLayerGroup = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = stopsLayerGroup;

    // Custom Aroma Roasted Amber Rider Marker
    const riderIcon = L.divIcon({
      className: "aroma-rider-live-marker",
      html: `<div class="relative flex items-center justify-center">
              <span class="animate-ping absolute size-9 rounded-full bg-amber-500 opacity-75"></span>
              <div class="size-7 bg-[#3c2415] border-2 border-amber-400 rounded-full flex items-center justify-center shadow-lg text-white text-xs font-bold">🚴</div>
            </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    riderMarkerRef.current = L.marker([currentRiderPos.lat, currentRiderPos.lng], { icon: riderIcon }).addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const t = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(t);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [isOpen]);

  // Update stops markers (Single or Multi-Stop Batch)
  useEffect(() => {
    const stopsGroup = stopsLayerGroupRef.current;
    if (!stopsGroup) return;

    stopsGroup.clearLayers();

    if (isBatchMode && stopsQueue && stopsQueue.length > 0) {
      stopsQueue.forEach((st, idx) => {
        const isCurrent = idx === currentStopIdx;
        const isCompleted = completedStopIds.has(st.orderId);
        const pinBg = isCompleted ? "#059669" : isCurrent ? "#d97706" : "#78350f";
        const badgeLabel = isCompleted ? "✓" : `${idx + 1}`;

        const stopIcon = L.divIcon({
          className: "batch-stop-marker",
          html: `<div class="relative flex items-center justify-center">
                  ${isCurrent ? '<span class="animate-ping absolute size-9 rounded-full bg-amber-400 opacity-75"></span>' : ""}
                  <div class="size-7 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-xs border-2 border-amber-200" style="background-color: ${pinBg};">
                    ${badgeLabel}
                  </div>
                </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([st.coords.lat, st.coords.lng], { icon: stopIcon }).addTo(stopsGroup);
        marker.bindPopup(`
          <div style="font-size: 12px; font-family: inherit; line-height: 1.3; color: #2b1810;">
            <strong style="color: #3c2415;">Stop #${idx + 1}: ${st.customerName}</strong>
            <p style="margin: 2px 0; color: #78350f;">${st.address}</p>
            <span style="font-size: 10px; font-weight: bold; color: ${pinBg};">
              ${isCompleted ? "Delivered" : isCurrent ? "Current Target Drop" : "Upcoming Stop in TSP Tour"}
            </span>
          </div>
        `);
      });
    } else {
      // Single destination marker — Aroma Coffee Cup or Pin
      const destIcon = L.divIcon({
        className: "dest-live-marker",
        html: `<div class="relative flex items-center justify-center">
                <span class="animate-ping absolute size-9 rounded-full bg-amber-400 opacity-75"></span>
                <div class="size-7 bg-amber-700 border-2 border-amber-200 rounded-full flex items-center justify-center shadow-lg text-white text-xs">📍</div>
              </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([activeDestCoords.lat, activeDestCoords.lng], { icon: destIcon }).addTo(stopsGroup);
    }
  }, [isOpen, isBatchMode, stopsQueue, currentStopIdx, completedStopIds, activeDestCoords]);

  // Update Traffic Layer on Map
  useEffect(() => {
    const trafficGroup = trafficLayerGroupRef.current;
    if (!trafficGroup) return;

    trafficGroup.clearLayers();
    const activeIncidents = getActiveIncidents();

    activeIncidents.forEach((inc) => {
      const isHeavy = inc.level === "HEAVY";
      const color = isHeavy ? "#dc2626" : "#f59e0b";
      const remainingMins = Math.max(1, Math.round((inc.expiresAt - Date.now()) / 60000));

      L.circle([inc.lat, inc.lng], {
        radius: (inc.radiusKm || 0.75) * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2,
        dashArray: "4, 4",
      }).addTo(trafficGroup);

      const trafficIcon = L.divIcon({
        className: "nav-traffic-marker",
        html: `<div class="p-1 rounded-full bg-[#2b1810] border-2 border-amber-300 shadow-lg text-xs flex items-center justify-center font-bold" style="color: ${color};">🚦</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const m = L.marker([inc.lat, inc.lng], { icon: trafficIcon }).addTo(trafficGroup);
      m.bindPopup(`
        <div style="font-size: 11px; text-align: center; color: #2b1810;">
          <strong>${inc.level} Traffic (${inc.multiplier}x)</strong>
          <p style="margin: 2px 0;">${inc.description || "Reported slow zone"}</p>
          <span style="color: #78350f; font-size: 10px;">Expires in ${remainingMins}m</span>
        </div>
      `);
    });
  }, [incidents, isOpen]);

  // Update polyline on route change
  useEffect(() => {
    if (!mapRef.current || routeCoordinates.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    const trafficColor =
      currentRouteTraffic.multiplier >= 2.0
        ? "#dc2626"
        : currentRouteTraffic.multiplier >= 1.5
        ? "#f59e0b"
        : isBatchMode
        ? "#d97706"
        : activeIsPickedUp
        ? "#059669"
        : "#b45309";

    const poly = L.polyline(routeCoordinates, {
      color: trafficColor,
      weight: 6,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(mapRef.current);

    polylineRef.current = poly;
    mapRef.current.fitBounds(poly.getBounds(), { padding: [50, 50] });
  }, [routeCoordinates, activeIsPickedUp, isBatchMode, currentRouteTraffic.multiplier]);

  const handleReportTrafficLevel = (level: TrafficLevel, customRadius?: number) => {
    const radius = customRadius || trafficRadiusKm;
    const mult = TRAFFIC_MULTIPLIERS[level];
    reportTraffic({
      lat: currentRiderPos.lat,
      lng: currentRiderPos.lng,
      level,
      radiusKm: radius,
      reportedBy: "Active Rider",
      description: `${level} traffic within ${radius}km radius`,
    });
    setShowTrafficModal(false);
    triggerHaptic([100, 50, 100]);
    toast.success(
      level === "NORMAL"
        ? "🟢 Roads marked clear! Traffic delays reset."
        : `🚦 Marked ${level} traffic (${mult}x ETA) for 30 mins.`
    );
    calculateRoute(currentRiderPos, mult);
  };

  const handleClearAllTraffic = () => {
    const active = getActiveIncidents();
    active.forEach((inc) => removeIncident(inc.id));
    setShowTrafficModal(false);
    triggerHaptic([150, 50, 150]);
    toast.success("✨ All active traffic zones cleared! Roads restored to normal speed.");
    calculateRoute(currentRiderPos, 1.0);
  };

  // Advance to next stop in TSP batch queue
  const handleDeliverAndAdvance = () => {
    onDeliver(activeOrderId);
    setCompletedStopIds((prev) => new Set([...prev, activeOrderId]));

    if (isBatchMode && stopsQueue && currentStopIdx < stopsQueue.length - 1) {
      const nextIdx = currentStopIdx + 1;
      const nextStop = stopsQueue[nextIdx];
      setCurrentStopIdx(nextIdx);
      triggerHaptic([150, 100, 150, 100, 250]);
      toast.success(`🎉 Stop #${currentStopIdx + 1} Delivered! Advancing to Stop #${nextIdx + 1} (${nextStop.customerName})`);
      speakInstruction(`Order delivered. Now navigating to Stop ${nextIdx + 1}, ${nextStop.customerName} at ${nextStop.address}.`);
    } else {
      triggerHaptic([200, 100, 200, 100, 300]);
      toast.success("🎉 All stops in batch route completed successfully! Great job 🚴");
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentManeuver = maneuvers[currentManeuverIdx] || {
    direction: "straight" as TurnDirection,
    instruction: `Head towards ${activeDestLabel}`,
    streetName: "Main Road",
    distanceMeters: Math.round(totalDistanceKm * 1000),
    nextPreview: undefined,
  };

  const getManeuverIcon = (dir: TurnDirection) => {
    switch (dir) {
      case "sharp_left":
        return <CornerUpLeft className="size-6 text-white rotate-[-25deg]" />;
      case "sharp_right":
        return <CornerUpRight className="size-6 text-white rotate-[25deg]" />;
      case "left":
        return <ArrowLeft className="size-6 text-white" />;
      case "right":
        return <ArrowRight className="size-6 text-white" />;
      case "slight_left":
        return <CornerUpLeft className="size-6 text-white" />;
      case "slight_right":
        return <CornerUpRight className="size-6 text-white" />;
      case "uturn":
        return <Undo2 className="size-6 text-white" />;
      case "roundabout":
        return <RotateCw className="size-6 text-white" />;
      case "fork":
        return <GitFork className="size-6 text-white" />;
      case "merge":
        return <GitMerge className="size-6 text-white" />;
      case "ramp":
        return <TrendingUp className="size-6 text-white" />;
      case "arrive":
        return <MapPin className="size-6 text-amber-200" />;
      case "depart":
        return <Navigation className="size-6 text-white" />;
      default:
        return <ArrowUp className="size-6 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1f130b] text-[#faf7f2] overflow-hidden animate-in fade-in duration-200 font-sans selection:bg-amber-500 selection:text-white">
      {/* TOP TURN-BY-TURN HUD MANEUVER BANNER — Signature Aroma Roasted Espresso Bar */}
      <div className="relative z-[1000] bg-[#3c2415] border-b border-amber-900/60 shadow-2xl p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Coffee className="size-4" />
            </div>
            <div className="flex items-center gap-1.5 truncate">
              {isBatchMode && stopsQueue ? (
                <Badge className="bg-amber-950/80 text-amber-300 border-amber-500/40 text-[10px] font-bold shrink-0">
                  TSP Stop {currentStopIdx + 1}/{stopsQueue.length}
                </Badge>
              ) : null}
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-100 truncate">
                {activeIsPickedUp ? `Drop to ${activeCustName || "Customer"}` : "Pickup at Aroma Cafe"} · #{activeOrderId.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Fuel Saver Badge */}
            {(fuelSavedPercentage || 0) > 0 && (
              <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-[10px] hidden sm:inline-flex items-center gap-1">
                🌱 {fuelSavedPercentage}% Saved
              </Badge>
            )}

            {/* Batch Stops Queue Drawer Toggle */}
            {isBatchMode && stopsQueue && (
              <button
                onClick={() => setShowBatchQueue(!showBatchQueue)}
                className="px-2.5 py-1 rounded-xl bg-amber-950/80 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-semibold flex items-center gap-1"
                title="View All Batch Stops"
              >
                <Layers className="size-3.5 text-amber-400" />
                <span className="hidden sm:inline">Stops</span> ({currentStopIdx + 1}/{stopsQueue.length})
              </button>
            )}

            {/* Quick 1-Tap Traffic Reporter */}
            <button
              onClick={() => setShowTrafficModal(true)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                currentRouteTraffic.multiplier >= 2.0
                  ? "bg-red-950/80 border-red-500 text-red-200 animate-pulse"
                  : currentRouteTraffic.multiplier >= 1.5
                  ? "bg-amber-950/80 border-amber-500 text-amber-200"
                  : "bg-amber-950/40 border-amber-800 text-amber-200 hover:text-white"
              }`}
              title="Report Live Traffic"
            >
              <span className="text-xs">🚦</span>
              <span className="hidden sm:inline">Traffic</span>
              <span className="font-mono text-[11px] font-bold">({currentRouteTraffic.multiplier}x)</span>
            </button>

            {wakeLockActive && (
              <Badge className="bg-amber-950/60 text-amber-300 border-amber-500/30 text-[10px] hidden sm:inline-flex items-center gap-1">
                <Zap className="size-3 text-amber-400" /> Awake
              </Badge>
            )}

            <button
              onClick={() => setShowEtaBreakdown(!showEtaBreakdown)}
              className="px-2.5 py-1 rounded-xl bg-amber-950/40 text-amber-200 hover:text-white border border-amber-800 text-xs font-semibold flex items-center gap-1.5"
              title="View Dual-Leg ETA"
            >
              <Clock className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dual ETA</span>
              {showEtaBreakdown ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            <button
              onClick={() => setShowItinerary(!showItinerary)}
              className="px-2.5 py-1 rounded-xl bg-amber-950/40 text-amber-200 hover:text-white border border-amber-800 text-xs font-semibold flex items-center gap-1.5"
              title="View Maneuver Steps"
            >
              <List className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">Steps</span> ({maneuvers.length})
            </button>

            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (!voiceEnabled) speakInstruction("Voice navigation enabled.");
              }}
              className="p-1.5 rounded-xl bg-amber-950/40 text-amber-200 hover:text-white border border-amber-800"
              title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
            >
              {voiceEnabled ? <Volume2 className="size-4 text-amber-400" /> : <VolumeX className="size-4 text-stone-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-amber-950/40 text-amber-200 hover:text-white border border-amber-800"
              title="Close Navigation"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Primary Maneuver Card — Aroma Warm Roast Gradient */}
        <div className="bg-gradient-to-r from-[#2b1810] via-[#3c2415] to-[#25140b] p-3.5 rounded-2xl border border-amber-500/40 shadow-[0_10px_30px_rgba(217,119,6,0.15)]">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shrink-0 border border-amber-300/40">
              {getManeuverIcon(currentManeuver.direction)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                  {currentManeuver.distanceMeters > 0 ? `In ${currentManeuver.distanceMeters} meters` : "Current Step"}
                </span>
                {currentManeuver.streetName && (
                  <span className="text-[10px] bg-amber-950/90 text-amber-200 px-2 py-0.5 rounded-md border border-amber-500/30 truncate max-w-[150px]">
                    {currentManeuver.streetName}
                  </span>
                )}
                {currentRouteTraffic.multiplier > 1.0 && (
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded-md font-mono">
                    🚦 {currentRouteTraffic.multiplier}x Traffic
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base text-[#faf7f2] truncate mt-0.5">
                {currentManeuver.instruction}
              </h3>
            </div>
          </div>

          {/* Next Preview Pill */}
          {currentManeuver.nextPreview && (
            <div className="mt-2.5 pt-2 border-t border-amber-900/60 flex items-center gap-1.5 text-xs text-amber-200/70">
              <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Then</span>
              <span className="truncate">{currentManeuver.nextPreview}</span>
            </div>
          )}
        </div>

        {/* Dual-Leg ETA Breakdown Expandable Dropdown */}
        {showEtaBreakdown && dualLegEta && (
          <div className="p-3 bg-[#24130a] border border-amber-500/40 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Timer className="size-3.5 text-amber-400" /> Dual-Leg Estimated Time Analysis
              </span>
              <span className="text-[11px] text-amber-200/80">
                Final Delivery: <strong className="text-amber-100">{dualLegEta.totalTrip.finalDeliveryTimestamp}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#3c2415]/80 rounded-xl border border-amber-900/60">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Leg 1 · To Aroma Cafe HQ</span>
                <p className="font-bold text-amber-100 mt-0.5">{dualLegEta.leg1RiderToCafe.etaTimestamp} ({dualLegEta.leg1RiderToCafe.durationMins}m)</p>
                <div className="mt-1 flex items-center gap-1 text-[10px]">
                  {dualLegEta.leg1RiderToCafe.isFoodReady ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Check className="size-3" /> Food Ready & Packed
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">
                      Cooking: {dualLegEta.leg1RiderToCafe.prepTimeRemainingMins}m left
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-[#3c2415]/80 rounded-xl border border-amber-900/60">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Leg 2 · To Customer Drop</span>
                <p className="font-bold text-emerald-400 mt-0.5">{dualLegEta.leg2CafeToCustomer.etaTimestamp} ({dualLegEta.leg2CafeToCustomer.durationMins}m)</p>
                <span className="text-[10px] text-amber-200/70 block mt-1 truncate">
                  {activeDestLabel}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULL INTERACTIVE LEAFLET ROAD MAP CANVAS */}
      <div className="relative flex-1 w-full bg-[#1b1008] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Recalculate DSA Route Floating Button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => calculateRoute()}
          disabled={isRecalculating}
          className="absolute top-3 right-3 z-[1000] bg-[#3c2415]/95 text-amber-100 border border-amber-500/40 backdrop-blur shadow-lg rounded-xl text-xs h-8 px-2.5 hover:bg-amber-900"
        >
          <RefreshCw className={`size-3.5 mr-1.5 text-amber-400 ${isRecalculating ? "animate-spin" : ""}`} />
          Recalculate
        </Button>

        {/* Live Traffic Settings & Incident Management Modal Overlay */}
        {showTrafficModal && (
          <div className="absolute inset-x-3 top-3 z-[2000] bg-[#2b1810]/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl p-4 space-y-3.5 animate-in slide-in-from-top-2 max-h-[85%] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🚦</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-amber-100">Live Traffic & Congestion Settings</h4>
                  <p className="text-[11px] text-amber-200/70">
                    Dynamic traffic multipliers scale ETA and route choice with 30-min TTL.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrafficModal(false)}
                className="p-1 rounded-lg bg-amber-950 text-amber-300 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Traffic Level Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-amber-200 block">Select Road Congestion Level:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleReportTrafficLevel("NORMAL")}
                  className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-950/80 text-center transition-all group active:scale-95"
                >
                  <div className="size-3 rounded-full bg-emerald-500 mx-auto mb-1" />
                  <span className="font-bold text-xs text-emerald-300 block">Normal</span>
                  <span className="text-[10px] text-amber-200/60 font-mono">1.0x ETA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportTrafficLevel("MODERATE")}
                  className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-950/80 text-center transition-all group active:scale-95"
                >
                  <div className="size-3 rounded-full bg-amber-500 mx-auto mb-1" />
                  <span className="font-bold text-xs text-amber-300 block">Moderate</span>
                  <span className="text-[10px] text-amber-200/60 font-mono">1.5x (+50%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportTrafficLevel("HEAVY")}
                  className="p-2.5 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-950/80 text-center transition-all group active:scale-95"
                >
                  <div className="size-3 rounded-full bg-red-500 mx-auto mb-1 animate-pulse" />
                  <span className="font-bold text-xs text-red-300 block">Heavy Jam</span>
                  <span className="text-[10px] text-amber-200/60 font-mono">2.0x (+100%)</span>
                </button>
              </div>
            </div>

            {/* Impact Radius Scope Selection */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-amber-200 block">Impact Radius Scope:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "0.5 km", desc: "Junction", value: 0.5 },
                  { label: "1.0 km", desc: "Sector", value: 1.0 },
                  { label: "2.0 km", desc: "Corridor", value: 2.0 },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setTrafficRadiusKm(r.value)}
                    className={`p-2 rounded-xl border text-center text-xs transition-all ${
                      trafficRadiusKm === r.value
                        ? "border-amber-400 bg-amber-500/20 text-amber-100 font-bold"
                        : "border-amber-900/60 bg-[#3c2415]/60 text-amber-200/70 hover:bg-amber-950"
                    }`}
                  >
                    <span className="block font-bold">{r.label}</span>
                    <span className="text-[10px] opacity-75">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Bottlenecks & Clear Control */}
            <div className="pt-2 border-t border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-200">
                  Active Zones: {getActiveIncidents().length} Reported
                </span>
                <button
                  type="button"
                  onClick={handleClearAllTraffic}
                  className="text-[11px] text-amber-400 hover:text-amber-200 underline font-semibold"
                >
                  Clear All Traffic
                </button>
              </div>

              {getActiveIncidents().length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {getActiveIncidents().map((inc) => {
                    const minsLeft = Math.max(1, Math.round((inc.expiresAt - Date.now()) / 60000));
                    return (
                      <div
                        key={inc.id}
                        className="p-1.5 px-2.5 rounded-lg bg-[#3c2415]/60 border border-amber-900/60 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-amber-100 font-medium">
                          {inc.level} ({inc.multiplier}x) · {inc.radiusKm}km
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400 text-[10px]">{minsLeft}m left</span>
                          <button
                            onClick={() => {
                              removeIncident(inc.id);
                              toast.info("Incident removed.");
                              calculateRoute();
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi-Order Batch Queue Drawer Overlay */}
        {showBatchQueue && isBatchMode && stopsQueue && (
          <div className="absolute inset-x-3 top-3 bottom-3 z-[2000] bg-[#2b1810]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-2">
            <div className="p-3 border-b border-amber-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-100">TSP Batch Delivery Queue</span>
                {fuelSavedPercentage && (
                  <Badge className="bg-emerald-900/80 text-emerald-200 border-emerald-500/40 text-[10px]">
                    🌱 {fuelSavedPercentage}% Saved
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setShowBatchQueue(false)}
                className="p-1 rounded-lg bg-amber-950 text-amber-300 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {stopsQueue.map((st, idx) => {
                const isCurrent = idx === currentStopIdx;
                const isCompleted = completedStopIds.has(st.orderId);

                return (
                  <div
                    key={st.orderId}
                    onClick={() => {
                      setCurrentStopIdx(idx);
                      setShowBatchQueue(false);
                      toast.info(`Switched focus to Stop #${idx + 1}: ${st.customerName}`);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-amber-950/90 border-amber-500 shadow-md ring-1 ring-amber-400"
                        : isCompleted
                        ? "bg-emerald-950/30 border-emerald-500/30 opacity-70"
                        : "bg-[#3c2415]/60 border-amber-900/60 hover:bg-amber-950/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-amber-600 text-white shadow-md"
                            : "bg-[#3c2415] text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs sm:text-sm text-amber-100 truncate">{st.customerName}</p>
                          <span className="font-mono text-[10px] text-amber-300/60">#{st.orderId.slice(-6).toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] text-amber-200/70 truncate">{st.address}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-900/60 text-emerald-300"
                            : isCurrent
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                            : "bg-amber-950/60 text-amber-300/80"
                        }`}
                      >
                        {isCompleted ? "Delivered" : isCurrent ? "Active Leg" : "Next Stop"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Itinerary Drawer / Steps List Overlay */}
        {showItinerary && (
          <div className="absolute inset-x-3 top-3 bottom-3 z-[2000] bg-[#2b1810]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2">
            <div className="p-3 border-b border-amber-900/60 flex items-center justify-between">
              <span className="font-bold text-sm text-amber-100 flex items-center gap-1.5">
                <List className="size-4 text-amber-400" /> Full Route Itinerary ({maneuvers.length} steps)
              </span>
              <button
                onClick={() => setShowItinerary(false)}
                className="p-1 rounded-lg bg-amber-950 text-amber-300 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 divide-y divide-amber-900/40 space-y-1">
              {maneuvers.map((m, idx) => {
                const isCurrent = idx === currentManeuverIdx;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                      isCurrent ? "bg-amber-950/90 border border-amber-500/40" : "hover:bg-amber-950/40"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isCurrent ? "bg-amber-600 text-white" : "bg-[#3c2415] text-amber-300 border border-amber-800"}`}>
                      {getManeuverIcon(m.direction)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${isCurrent ? "text-amber-300 font-bold" : "text-amber-100"}`}>
                        {m.instruction}
                      </p>
                      <p className="text-[11px] text-amber-200/60 mt-0.5">
                        {m.distanceMeters}m · {m.streetName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TRIP CONTROLS & FAST ACTIONS — Aroma Roasted Espresso Footer */}
      <div className="relative z-[1000] bg-[#2b1810] border-t border-amber-900/60 p-3 sm:p-4 space-y-2.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#3c2415]/80 p-2 rounded-xl border border-amber-900/60 shadow-inner">
            <span className="text-[10px] text-amber-300/70 uppercase font-semibold block">
              {isBatchMode ? "Batch Distance" : "Distance"}
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-amber-100">{totalDistanceKm} km</span>
          </div>
          <div className="bg-[#3c2415]/80 p-2 rounded-xl border border-amber-900/60 shadow-inner">
            <span className="text-[10px] text-amber-300/70 uppercase font-semibold block">
              {isBatchMode ? "Batch ETA" : "Transit ETA"}
            </span>
            <span className={`font-mono font-bold text-sm sm:text-base ${currentRouteTraffic.multiplier > 1.0 ? "text-red-400" : "text-amber-400"}`}>
              {totalDurationMins} mins
            </span>
          </div>
          <div className="bg-[#3c2415]/80 p-2 rounded-xl border border-amber-900/60 shadow-inner">
            <span className="text-[10px] text-amber-300/70 uppercase font-semibold block">
              {isBatchMode ? "Batch Queue" : "Traffic Level"}
            </span>
            {isBatchMode && stopsQueue ? (
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-300">
                Stop {currentStopIdx + 1} of {stopsQueue.length}
              </span>
            ) : (
              <span className={`font-mono font-bold text-xs sm:text-sm uppercase ${
                currentRouteTraffic.multiplier >= 2.0 ? "text-red-400" : currentRouteTraffic.multiplier >= 1.5 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {currentRouteTraffic.multiplier >= 2.0 ? "Heavy (2x)" : currentRouteTraffic.multiplier >= 1.5 ? "Med (1.5x)" : "Clear (1x)"}
              </span>
            )}
          </div>
        </div>

        {/* Customer Contact Bar */}
        {activeCustPhone && (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${activeCustPhone}`}
              className="flex-1 bg-[#3c2415] hover:bg-amber-900/60 text-amber-100 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-amber-800 transition-colors"
            >
              <Phone className="size-3.5 text-amber-400" /> Call {activeCustName || "Customer"}
            </a>
            <a
              href={`https://wa.me/91${activeCustPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hi ${activeCustName || ""}, I am en route with your Aroma Cafe order #${activeOrderId}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-emerald-600/40 transition-colors"
            >
              <MessageCircle className="size-3.5 text-emerald-400" /> WhatsApp
            </a>
          </div>
        )}

        {/* Direct Completion / State Change Button */}
        <div>
          {!activeIsPickedUp ? (
            <Button
              size="lg"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-2xl h-11 sm:h-12 shadow-lg transition-transform active:scale-[0.99]"
              onClick={() => {
                setInternalPickedUp(true);
                onPickUp(activeOrderId);
                triggerHaptic([150, 80, 150]);
                toast.success("Food picked up from Aroma Cafe! Navigating to customer... ☕🚴");
                speakInstruction("Food picked up from Aroma Cafe. Now routing to customer destination.");
                calculateRoute(currentRiderPos);
              }}
            >
              <Coffee className="size-4 sm:size-5 mr-2" /> ☕ MARK FOOD PICKED UP FROM AROMA CAFE
            </Button>
          ) : isBatchMode && stopsQueue && currentStopIdx < stopsQueue.length - 1 ? (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-2xl h-11 sm:h-12 shadow-lg transition-transform active:scale-[0.99]"
              onClick={handleDeliverAndAdvance}
            >
              <CheckCircle2 className="size-4 sm:size-5 mr-2" /> 🎉 DELIVER STOP #{currentStopIdx + 1} & ADVANCE TO #{currentStopIdx + 2}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl h-11 sm:h-12 shadow-lg transition-transform active:scale-[0.99]"
              onClick={handleDeliverAndAdvance}
            >
              <CheckCircle2 className="size-4 sm:size-5 mr-2" /> 🎉 COMPLETE & MARK DELIVERED
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
