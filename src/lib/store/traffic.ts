import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateHaversineDistance } from "@/lib/location";

export type TrafficLevel = "NORMAL" | "MODERATE" | "HEAVY";

export const TRAFFIC_MULTIPLIERS: Record<TrafficLevel, number> = {
  NORMAL: 1.0,
  MODERATE: 1.5,
  HEAVY: 2.0,
};

export const TRAFFIC_TTL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

export type TrafficIncident = {
  id: string;
  lat: number;
  lng: number;
  radiusKm: number;
  level: TrafficLevel;
  multiplier: number;
  reportedBy: string;
  description?: string;
  timestamp: number;
  expiresAt: number;
};

type TrafficState = {
  incidents: TrafficIncident[];
  reportTraffic: (data: {
    lat: number;
    lng: number;
    level: TrafficLevel;
    reportedBy: string;
    description?: string;
    radiusKm?: number;
  }) => TrafficIncident;
  removeIncident: (id: string) => void;
  getActiveIncidents: () => TrafficIncident[];
  getIncidentAt: (lat: number, lng: number) => TrafficIncident | null;
  getRouteTrafficMultiplier: (
    path: Array<{ lat: number; lng: number }>
  ) => { multiplier: number; highestIncident: TrafficIncident | null };
  purgeExpired: () => void;
};

export const useTraffic = create<TrafficState>()(
  persist(
    (set, get) => ({
      incidents: [
        // Demo initial traffic bottleneck (near Jubilee Hills / Cafe zone)
        {
          id: "traffic-init-1",
          lat: 17.4385,
          lng: 78.4025,
          radiusKm: 0.8,
          level: "MODERATE",
          multiplier: 1.5,
          reportedBy: "Rahul Kumar (Rider)",
          description: "Slow traffic near main junction",
          timestamp: Date.now() - 5 * 60 * 1000,
          expiresAt: Date.now() + 25 * 60 * 1000,
        },
      ],

      reportTraffic: (data) => {
        const now = Date.now();
        const multiplier = TRAFFIC_MULTIPLIERS[data.level];
        const newIncident: TrafficIncident = {
          id: `traffic-${now}-${Math.random().toString(36).substr(2, 6)}`,
          lat: data.lat,
          lng: data.lng,
          radiusKm: data.radiusKm || 0.75,
          level: data.level,
          multiplier,
          reportedBy: data.reportedBy,
          description: data.description || `${data.level} traffic reported by ${data.reportedBy}`,
          timestamp: now,
          expiresAt: now + TRAFFIC_TTL_MS,
        };

        // If NORMAL traffic is reported, remove any existing heavy/moderate traffic within radius
        set((state) => {
          const currentValid = state.incidents.filter((inc) => inc.expiresAt > now);
          if (data.level === "NORMAL") {
            const remaining = currentValid.filter(
              (inc) =>
                calculateHaversineDistance(inc.lat, inc.lng, data.lat, data.lng) >
                (data.radiusKm || 0.75)
            );
            return { incidents: remaining };
          }

          // Otherwise update or append
          const filtered = currentValid.filter(
            (inc) =>
              calculateHaversineDistance(inc.lat, inc.lng, data.lat, data.lng) >
              (data.radiusKm || 0.75)
          );
          return { incidents: [newIncident, ...filtered] };
        });

        return newIncident;
      },

      removeIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.filter((i) => i.id !== id),
        }));
      },

      getActiveIncidents: () => {
        const now = Date.now();
        const valid = get().incidents.filter((i) => i.expiresAt > now);
        if (valid.length !== get().incidents.length) {
          set({ incidents: valid });
        }
        return valid;
      },

      getIncidentAt: (lat, lng) => {
        const active = get().getActiveIncidents();
        for (const inc of active) {
          const dist = calculateHaversineDistance(lat, lng, inc.lat, inc.lng);
          if (dist <= inc.radiusKm) {
            return inc;
          }
        }
        return null;
      },

      getRouteTrafficMultiplier: (path) => {
        const active = get().getActiveIncidents();
        if (!active.length || !path.length) {
          return { multiplier: 1.0, highestIncident: null };
        }

        let maxMultiplier = 1.0;
        let worstIncident: TrafficIncident | null = null;

        for (const pt of path) {
          for (const inc of active) {
            const dist = calculateHaversineDistance(pt.lat, pt.lng, inc.lat, inc.lng);
            if (dist <= inc.radiusKm) {
              if (inc.multiplier > maxMultiplier) {
                maxMultiplier = inc.multiplier;
                worstIncident = inc;
              }
            }
          }
        }

        return { multiplier: maxMultiplier, highestIncident: worstIncident };
      },

      purgeExpired: () => {
        const now = Date.now();
        set((state) => ({
          incidents: state.incidents.filter((i) => i.expiresAt > now),
        }));
      },
    }),
    {
      name: "aroma-traffic-storage",
    }
  )
);
