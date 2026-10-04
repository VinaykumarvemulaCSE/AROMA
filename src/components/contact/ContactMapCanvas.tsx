"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  latitude: number;
  longitude: number;
  storeName: string;
  address: string;
};

export default function ContactMapCanvas({ latitude, longitude, storeName, address }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let isDestroyed = false;

    // Custom Cafe Pin Icon
    const cafeIcon = L.divIcon({
      className: "custom-cafe-contact-pin",
      html: `
        <div style="background-color: #d97706; color: white; width: 40px; height: 40px; border-radius: 9999px; box-shadow: 0 10px 20px -3px rgba(217,119,6,0.5); border: 3px solid white; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
            <line x1="6" x2="6" y1="2" y2="4"></line>
            <line x1="10" x2="10" y1="2" y2="4"></line>
            <line x1="14" x2="14" y1="2" y2="4"></line>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { icon: cafeIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; padding: 4px; text-align: center;">
        <strong style="font-size: 14px; color: #d97706; display: block;">☕ ${storeName}</strong>
        <p style="font-size: 11px; color: #4b5563; margin-top: 4px; line-height: 1.3;">${address}</p>
      </div>
    `).openPopup();

    mapRef.current = map;

    const timer1 = setTimeout(() => !isDestroyed && map.invalidateSize(), 200);
    const timer2 = setTimeout(() => !isDestroyed && map.invalidateSize(), 500);

    return () => {
      isDestroyed = true;
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, storeName, address]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-border shadow-inner"
      style={{ width: "100%", height: "100%", minHeight: "320px" }}
    />
  );
}
