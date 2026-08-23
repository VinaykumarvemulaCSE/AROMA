import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/lib/mock/menu";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  note?: string;
};

type CartState = {
  lines: CartLine[];
  add: (item: MenuItem, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  reorder: (lines: CartLine[]) => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.id === item.id);
          if (existing) {
            return {
              lines: s.lines.map((l) => (l.id === item.id ? { ...l, qty: l.qty + qty } : l)),
            };
          }
          return {
            lines: [
              ...s.lines,
              { id: item.id, name: item.name, price: item.price, image: item.image, qty },
            ],
          };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.id !== id)
              : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
      reorder: (newLines) =>
        set((s) => {
          // Merge new items into existing cart or replace
          const existingMap = new Map(s.lines.map((l) => [l.id, { ...l }]));
          for (const line of newLines) {
            if (existingMap.has(line.id)) {
              existingMap.get(line.id)!.qty += line.qty;
            } else {
              existingMap.set(line.id, { ...line });
            }
          }
          return { lines: Array.from(existingMap.values()) };
        }),
      count: () => get().lines.reduce((s, l) => s + l.qty, 0),
      subtotal: () => get().lines.reduce((s, l) => s + l.qty * l.price, 0),
    }),
    { name: "aroma-cart" },
  ),
);
