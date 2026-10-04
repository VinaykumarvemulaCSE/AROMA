"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type RiderPosition } from "@/lib/firebase/rider-positions";
import { useTraffic } from "@/lib/store/traffic";

type Props = {
  storeLocation: { lat: number; lng: number; name: string };
  customerLocation: { lat: number; lng: number; address: string };
  riderPosition?: RiderPosition | { lat: number; lng: number; riderName: string; vehicleType?: string } | null;
  riderName?: string;
};

export function CustomerTrackingMapCanvas({
  storeLocation,
  customerLocation,
  riderPosition,
  riderName = "Delivery Partner",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Store Icon
  const createStoreIcon = () =>
    L.divIcon({
      className: "custom-store-pin",
      html: `
        <div style="
          background: #78350f;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(120, 53, 15, 0.5);
          border: 3px solid white;
          font-size: 16px;
        ">
          ☕
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19],
    });

  // Customer Icon
  const createCustomerIcon = () =>
    L.divIcon({
      className: "custom-customer-pin",
      html: `
        <div style="
          background: #059669;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5);
          border: 3px solid white;
          font-size: 16px;
        ">
          🏠
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19],
    });

  // Rider Icon with live pulse
  const createRiderIcon = (name: string) =>
    L.divIcon({
      className: "custom-rider-live-pin",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(245, 158, 11, 0.3);
            animation: pulse 1.8s infinite ease-in-out;
          "></div>
          <div style="
            background: #f59e0b;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.6);
            border: 3px solid white;
            font-size: 18px;
            z-index: 10;
          ">
            🚴
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      center: [storeLocation.lat, storeLocation.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
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

  // Update map contents dynamically
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Store marker
    const storeMarker = L.marker([storeLocation.lat, storeLocation.lng], {
      icon: createStoreIcon(),
      zIndexOffset: 500,
    }).addTo(layerGroup);
    storeMarker.bindPopup(`<strong>📍 ${storeLocation.name}</strong><br/>Pickup Location`);
    bounds.push([storeLocation.lat, storeLocation.lng]);

    // Customer marker
    if (customerLocation.lat && customerLocation.lng) {
      const custMarker = L.marker([customerLocation.lat, customerLocation.lng], {
        icon: createCustomerIcon(),
        zIndexOffset: 600,
      }).addTo(layerGroup);
      custMarker.bindPopup(`<strong>🏠 Customer Drop Location</strong><br/>${customerLocation.address}`);
      bounds.push([customerLocation.lat, customerLocation.lng]);
    }

    // Live Rider marker & polyline
    if (riderPosition?.lat && riderPosition?.lng) {
      const riderMarker = L.marker([riderPosition.lat, riderPosition.lng], {
        icon: createRiderIcon(riderName),
        zIndexOffset: 1000,
      }).addTo(layerGroup);

      riderMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; text-align: center;">
          <strong style="color: #d97706; font-size: 13px;">🚴 ${riderName}</strong>
          <p style="margin: 2px 0 0; color: #059669; font-weight: 600;">Live Location Broadcast Active</p>
        </div>
      `);

      bounds.push([riderPosition.lat, riderPosition.lng]);

      // Connect Store -> Rider -> Customer route line
      if (customerLocation.lat && customerLocation.lng) {
        const routeLine = L.polyline(
          [
            [storeLocation.lat, storeLocation.lng],
            [riderPosition.lat, riderPosition.lng],
            [customerLocation.lat, customerLocation.lng],
          ],
          {
            color: "#f59e0b",
            weight: 4,
            opacity: 0.8,
            dashArray: "8, 8",
          }
        ).addTo(layerGroup);
      }
    } else if (customerLocation.lat && customerLocation.lng) {
      // Connect Direct Store -> Customer route line if rider hasn't broadcasted GPS yet
      L.polyline(
        [
          [storeLocation.lat, storeLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ],
        {
          color: "#059669",
          weight: 3,
          opacity: 0.6,
          dashArray: "6, 6",
        }
      ).addTo(layerGroup);
    }

    // Render crowd-sourced traffic incident layers
    const activeIncidents = useTraffic.getState().getActiveIncidents();
    activeIncidents.forEach((inc) => {
      const isHeavy = inc.level === "HEAVY";
      const color = isHeavy ? "#dc2626" : "#f59e0b";
      const remainingMins = Math.max(1, Math.round((inc.expiresAt - Date.now()) / 60000));

      // Visual radius circle
      L.circle([inc.lat, inc.lng], {
        radius: (inc.radiusKm || 0.75) * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: "4, 4",
      }).addTo(layerGroup);

      // Center incident icon
      const trafficPin = L.divIcon({
        className: "custom-traffic-pin",
        html: `
          <div style="
            background: ${color};
            color: white;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px ${color}88;
            border: 2px solid white;
            font-size: 11px;
            font-weight: bold;
          ">
            🚦
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const mark = L.marker([inc.lat, inc.lng], { icon: trafficPin }).addTo(layerGroup);
      mark.bindPopup(`
        <div style="font-size: 11px; font-family: inherit;">
          <strong style="color: ${color};">${inc.level} Traffic (${inc.multiplier}x)</strong>
          <p style="margin: 2px 0 0; color: #64748b;">${inc.description || "Reported congestion"}</p>
          <span style="font-size: 10px; color: #94a3b8;">Expires in ${remainingMins} mins</span>
        </div>
      `);
    });

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }, [storeLocation, customerLocation, riderPosition, riderName]);

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-amber-200/80 shadow-inner">
      <div ref={containerRef} className="w-full h-full bg-stone-100" />
    </div>
  );
}
