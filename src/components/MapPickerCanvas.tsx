"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  center: { latitude: number; longitude: number };
  onCenterChange: (lat: number, lng: number) => void;
};

export function MapPickerCanvas({ center, onCenterChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const isInternalMove = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let isDestroyed = false;

    // Fix Leaflet default icon paths in Next.js bundler if needed
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Initialize Leaflet map (No Web Workers, 100% reliable)
    const map = L.map(containerRef.current, {
      center: [center.latitude, center.longitude],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("moveend", () => {
      if (isDestroyed) return;
      const c = map.getCenter();
      isInternalMove.current = true;
      onCenterChange(c.lat, c.lng);
      setTimeout(() => {
        isInternalMove.current = false;
      }, 100);
    });

    mapRef.current = map;

    // Auto resize map when container size changes (e.g. Radix dialog open animation)
    const resizeObserver = new ResizeObserver(() => {
      if (!isDestroyed && mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Recalculate canvas size on mount after dialog animation
    const timer1 = setTimeout(() => {
      if (!isDestroyed) map.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      if (!isDestroyed) map.invalidateSize();
    }, 450);

    return () => {
      isDestroyed = true;
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync external center changes (e.g. search selection or GPS button)
  useEffect(() => {
    if (mapRef.current && !isInternalMove.current) {
      const currentCenter = mapRef.current.getCenter();
      const diffLat = Math.abs(currentCenter.lat - center.latitude);
      const diffLng = Math.abs(currentCenter.lng - center.longitude);

      if (diffLat > 0.0001 || diffLng > 0.0001) {
        mapRef.current.setView([center.latitude, center.longitude], 16);
      }
    }
  }, [center.latitude, center.longitude]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[180px] bg-muted overflow-hidden relative z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
