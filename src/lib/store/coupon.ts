// src/lib/store/coupon.ts
// Coupon definitions are created by the admin and stored in Firestore.
// The customer selects/enters a code at checkout and this store resolves the discount.

import { create } from "zustand";
import { db } from "../firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";

export type Coupon = {
  code: string;           // e.g. "WELCOME50"
  discountAmount: number; // fixed INR amount off the subtotal e.g. 50
  minOrder: number;       // minimum subtotal required e.g. 299
  maxUses: number;        // 0 = unlimited
  used: number;
  status: "Active" | "Paused";
  description?: string;   // e.g. "₹50 off on orders above ₹299"
};

type CouponState = {
  coupons: Coupon[];
  addCoupon: (c: Coupon) => Promise<void>;
  updateCoupon: (code: string, patch: Partial<Coupon>) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  // Validate and return the coupon if applicable, or an error string
  validateCoupon: (code: string, subtotal: number) => Coupon | string;
  incrementUsed: (code: string) => Promise<void>;
  listenToCoupons: () => () => void;
};

export const useCoupons = create<CouponState>()((set, get) => ({
  coupons: [],

  addCoupon: async (c) => {
    await setDoc(doc(db, "coupons", c.code.toUpperCase()), { ...c, code: c.code.toUpperCase() });
  },

  updateCoupon: async (code, patch) => {
    await updateDoc(doc(db, "coupons", code.toUpperCase()), patch);
  },

  removeCoupon: async (code) => {
    await deleteDoc(doc(db, "coupons", code.toUpperCase()));
  },

  validateCoupon: (code, subtotal) => {
    const c = get().coupons.find((x) => x.code === code.toUpperCase().trim());
    if (!c) return "Invalid coupon code.";
    if (c.status === "Paused") return "This coupon is not active.";
    if (c.maxUses > 0 && c.used >= c.maxUses)
      return "This coupon has reached its usage limit.";
    if (subtotal < c.minOrder)
      return `Minimum order of ₹${c.minOrder} required.`;
    return c;
  },

  incrementUsed: async (code) => {
    const c = get().coupons.find((x) => x.code === code.toUpperCase().trim());
    if (c) {
      await updateDoc(doc(db, "coupons", code.toUpperCase()), { used: c.used + 1 });
    }
  },

  listenToCoupons: () => {
    const q = query(collection(db, "coupons"));
    return onSnapshot(
      q,
      (snapshot) => {
        set({ coupons: snapshot.docs.map((doc) => doc.data() as Coupon) });
      },
      (error) => {
        console.error("Error listening to coupons:", error);
      },
    );
  },
}));
