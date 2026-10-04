"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Order, type OrderStatus, useOrders } from "@/lib/store/orders";
import { useRiders } from "@/lib/store/rider";
import { calculateHaversineDistance, buildGoogleMapsNavUrl } from "@/lib/location";
import { buildRoadNetworkGraph, dijkstraShortestPath } from "@/lib/dsa/routing";
import { useTraffic } from "@/lib/store/traffic";
import { inr } from "@/lib/format";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

// Aroma Cafe Store Default Location (Hyderabad, Telangana)
const CAFE_STORE_LOCATION = {
  lat: 17.4399,
  lng: 78.4017,
  name: "Aroma Cafe Store",
  address: "Jubilee Hills, Hyderabad, Telangana 500081",
};

const statusColors: Record<OrderStatus, string> = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Preparing: "#a855f7",
  Ready: "#6366f1",
  "Out for Delivery": "#06b6d4",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

type Props = {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (order: Order | null) => void;
  filterStatus: "All" | OrderStatus;
  storeLocation?: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
};

export function DeliveryAreaMapCanvas({
  orders,
  selectedOrderId,
  onSelectOrder,
  filterStatus,
  storeLocation,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);

  const riders = useRiders((s) => s.riders);
  const activeStore = storeLocation || CAFE_STORE_LOCATION;

  // Store marker icon
  const createStoreIcon = () => {
    return L.divIcon({
      className: "custom-store-pin",
      html: `
        <div style="
          background-color: #8b5cf6;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6), 0 2px 6px rgba(0,0,0,0.3);
          border: 3px solid white;
          font-weight: bold;
          font-size: 14px;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20],
    });
  };

  // Order pin marker icon
  const createOrderIcon = (status: OrderStatus, isSelected: boolean) => {
    const color = statusColors[status] || "#6b7280";
    const scale = isSelected ? "transform: scale(1.25); z-index: 999;" : "";
    return L.divIcon({
      className: "custom-order-pin",
      html: `
        <div style="${scale} transition: transform 0.2s ease;">
          <div style="
            background-color: ${color};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Rider pin marker icon
  const createRiderIcon = (name: string) => {
    return L.divIcon({
      className: "custom-rider-pin",
      html: `
        <div style="
          background-color: #d97706;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(217, 119, 6, 0.7);
          border: 2px solid white;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <circle cx="15" cy="5" r="1"/>
            <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix Leaflet icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      center: [activeStore.lat, activeStore.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // 5 km Primary Delivery Zone Circle
    L.circle([activeStore.lat, activeStore.lng], {
      radius: 5000,
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "4, 6",
    }).addTo(map);

    // 10 km Extended Delivery Geofence Circle
    L.circle([activeStore.lat, activeStore.lng], {
      radius: 10000,
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.03,
      weight: 1,
      dashArray: "6, 8",
    }).addTo(map);

    // Add Cafe Store Marker
    const storeMarker = L.marker([activeStore.lat, activeStore.lng], {
      icon: createStoreIcon(),
      zIndexOffset: 1000,
    }).addTo(map);

    storeMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
        <strong style="font-size: 14px; color: #6d28d9;">${activeStore.name}</strong>
        <p style="margin: 4px 0 0; color: #4b5563;">${activeStore.address}</p>
        <span style="display: inline-block; margin-top: 6px; font-size: 11px; background: #ede9fe; color: #6d28d9; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">Store HQ</span>
      </div>
    `);

    storeMarkerRef.current = storeMarker;

    const layerGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = layerGroup;
    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers whenever orders or filter changes
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markersGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [
      [activeStore.lat, activeStore.lng],
    ];

    const filteredOrders = orders.filter((o) => {
      const matchFilter = filterStatus === "All" || o.status === filterStatus;
      const hasCoords =
        o.addr.latitude !== undefined &&
        o.addr.longitude !== undefined &&
        o.addr.latitude !== 0 &&
        o.addr.longitude !== 0;
      return matchFilter && hasCoords;
    });

    filteredOrders.forEach((o) => {
      const lat = o.addr.latitude!;
      const lng = o.addr.longitude!;
      bounds.push([lat, lng]);

      const isSelected = selectedOrderId === o.id;
      const dist = calculateHaversineDistance(
        activeStore.lat,
        activeStore.lng,
        lat,
        lng
      );

      const navUrl = buildGoogleMapsNavUrl(o.addr);
      const phoneClean = formatWhatsAppNumber(o.contact.phone);
      const whatsappUrl = phoneClean
        ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hi ${o.contact.name}, this is Aroma Cafe regarding your Order #${o.id}.`)}`
        : "";

      const marker = L.marker([lat, lng], {
        icon: createOrderIcon(o.status, isSelected),
      });

      // Build rich interactive popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; width: 220px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #111827;">Order #${o.id}</strong>
            <span style="font-size: 10px; background: ${statusColors[o.status] || "#6b7280"}; color: white; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">
              ${o.status}
            </span>
          </div>
          <p style="margin: 0; font-weight: 600; color: #374151;">${o.contact.name}</p>
          <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">${o.contact.phone}</p>
          <p style="margin: 4px 0; color: #4b5563; font-size: 12px;">${o.addr.line1}, ${o.addr.city}</p>
          <div style="margin: 6px 0; font-size: 11px; background: #f3f4f6; padding: 4px 8px; border-radius: 6px; display: flex; justify-content: space-between;">
            <span>Distance: <strong>${dist} km</strong></span>
            <span>Total: <strong>${inr(o.total)}</strong></span>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 8px;">
            <a href="${navUrl}" target="_blank" style="flex: 1; text-align: center; background: #2563eb; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-block;">
              Start Navigation
            </a>
            ${
              whatsappUrl
                ? `<a href="${whatsappUrl}" target="_blank" style="background: #16a34a; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-block;">
                    WhatsApp
                  </a>`
                : ""
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectOrder(o);
      });

      marker.addTo(layerGroup);
    });

    // Draw Dijkstra Shortest Path Polyline when an order is selected
    const selectedOrder = orders.find((o) => o.id === selectedOrderId);
    if (selectedOrder && selectedOrder.addr.latitude && selectedOrder.addr.longitude) {
      const destLat = selectedOrder.addr.latitude;
      const destLng = selectedOrder.addr.longitude;

      const graph = buildRoadNetworkGraph(activeStore.lat, activeStore.lng, destLat, destLng);
      const dijkstraRes = dijkstraShortestPath(graph, "cafe", "customer");

      const polylineCoords: L.LatLngExpression[] = dijkstraRes.path.map((node) => [node.lat, node.lng]);

      // Draw Dijkstra route polyline
      const routePolyline = L.polyline(polylineCoords, {
        color: "#8b5cf6",
        weight: 5,
        opacity: 0.85,
        dashArray: "10, 8",
      });
      routePolyline.addTo(layerGroup);

      // Add intermediate Dijkstra junction node markers
      dijkstraRes.path.forEach((node) => {
        if (node.id !== "cafe" && node.id !== "customer") {
          const junctionIcon = L.divIcon({
            className: "custom-junction-pin",
            html: `
              <div style="
                background-color: #3b82f6;
                color: white;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
                border: 2px solid white;
                font-size: 10px;
                font-weight: bold;
              ">
                📍
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const jMarker = L.marker([node.lat, node.lng], { icon: junctionIcon });
          jMarker.bindPopup(`<strong>Dijkstra Waypoint:</strong> ${node.name}`);
          jMarker.addTo(layerGroup);
        }
      });
    }

    // Render active online rider markers
    riders.filter((r) => r.isOnline).forEach((r) => {
      bounds.push([r.currentLat, r.currentLng]);
      const riderMarker = L.marker([r.currentLat, r.currentLng], {
        icon: createRiderIcon(r.name),
        zIndexOffset: 800,
      });

      const riderPopupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px; width: 180px;">
          <strong style="font-size: 14px; color: #d97706;">🚴 ${r.name}</strong>
          <p style="margin: 4px 0 2px; color: #374151;">Status: <span style="font-weight: 600; text-transform: capitalize; color: #059669;">${r.status}</span></p>
          <p style="margin: 2px 0; color: #6b7280; font-size: 11px;">Active Orders: <strong>${r.activeOrdersCount}</strong></p>
          <p style="margin: 2px 0; color: #6b7280; font-size: 11px;">Vehicle: <span style="text-transform: capitalize;">${r.vehicleType || "bike"}</span></p>
        </div>
      `;

      riderMarker.bindPopup(riderPopupHtml);
      riderMarker.addTo(layerGroup);
    });

    // Render crowd-sourced traffic incident bottlenecks on admin map
    const activeIncidents = useTraffic.getState().getActiveIncidents();
    activeIncidents.forEach((inc) => {
      const isHeavy = inc.level === "HEAVY";
      const color = isHeavy ? "#dc2626" : "#f59e0b";
      const remainingMins = Math.max(1, Math.round((inc.expiresAt - Date.now()) / 60000));

      L.circle([inc.lat, inc.lng], {
        radius: (inc.radiusKm || 0.75) * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: "4, 4",
      }).addTo(layerGroup);

      const trafficIcon = L.divIcon({
        className: "admin-traffic-pin",
        html: `
          <div style="
            background: ${color};
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px ${color}88;
            border: 2px solid white;
            font-size: 13px;
          ">
            🚦
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const mark = L.marker([inc.lat, inc.lng], { icon: trafficIcon }).addTo(layerGroup);
      mark.bindPopup(`
        <div style="font-size: 12px; font-family: inherit;">
          <strong style="color: ${color};">${inc.level} Traffic (${inc.multiplier}x)</strong>
          <p style="margin: 2px 0; color: #475569;">${inc.description || "Reported slow zone"}</p>
          <span style="font-size: 10px; color: #94a3b8;">Expires in ${remainingMins}m (TTL)</span>
        </div>
      `);
    });
  }, [orders, riders, filterStatus, selectedOrderId, activeStore.lat, activeStore.lng, onSelectOrder]);

  return (
    <div className="relative w-full h-full min-h-[450px] flex-1 rounded-2xl overflow-hidden border border-border shadow-xs">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[450px] flex-1 bg-muted z-10"
        style={{ minHeight: "450px", height: "100%" }}
      />
    </div>
  );
}
