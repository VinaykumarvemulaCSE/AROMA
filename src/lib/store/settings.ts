// src/lib/store/settings.ts
import { create } from "zustand";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cafeInfo } from "../format";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type DayKey = (typeof DAYS)[number];

export type Settings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  whatsappOnly: boolean;
  deliveryEnabled: boolean;
  minOrder: number;
  freeDeliveryAbove: number;
  gst: number;
  hours: Record<DayKey, { open: string; close: string }>;
};

export const DEFAULTS: Settings = {
  name: cafeInfo.name,
  phone: cafeInfo.phone,
  email: cafeInfo.email,
  address: cafeInfo.address,
  whatsapp: cafeInfo.whatsapp,
  whatsappOnly: true,
  deliveryEnabled: true,
  minOrder: 150,
  freeDeliveryAbove: 499,
  gst: 5,
  hours: DAYS.reduce(
    (acc, d) => ({ ...acc, [d]: { open: "08:00", close: "23:00" } }),
    {} as Settings["hours"],
  ),
};

type SettingsState = {
  settings: Settings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: (newSettings: Settings) => Promise<void>;
};

export const useSettings = create<SettingsState>()((set) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const snap = await getDoc(doc(db, "settings", "restaurant"));
      if (snap.exists()) {
        const data = snap.data();
        set({
          settings: {
            ...DEFAULTS,
            ...data,
            hours: { ...DEFAULTS.hours, ...(data.hours || {}) },
          } as Settings,
        });
      } else {
        set({ settings: DEFAULTS });
      }
    } catch (e) {
      console.error("Failed to fetch settings from Firestore", e);
      set({ settings: DEFAULTS });
    } finally {
      set({ loading: false });
    }
  },

  saveSettings: async (newSettings: Settings) => {
    await setDoc(doc(db, "settings", "restaurant"), newSettings);
    set({ settings: newSettings });
  },
}));
