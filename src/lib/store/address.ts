// src/lib/store/address.ts
// Persists saved delivery addresses per user in Firestore.

import { create } from "zustand";
import { db } from "../firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, getDocs, writeBatch } from "firebase/firestore";
import { useAuth } from "./auth";

export type SavedAddress = {
  id: string;
  label: string;       // e.g. "Home", "Work", "Mom's place"
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  pin: string;
  phone: string;
  isDefault: boolean;
};

type AddressState = {
  addresses: SavedAddress[];
  addAddress: (a: Omit<SavedAddress, "id">) => Promise<void>;
  updateAddress: (id: string, patch: Partial<SavedAddress>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  listenToAddresses: (userId?: string) => () => void;
};

export const useAddresses = create<AddressState>()((set, get) => ({
  addresses: [],

  addAddress: async (a) => {
    const userId = useAuth.getState().user?.id;
    if (!userId) return;

    const id = `addr-${Date.now()}`;
    const { addresses } = get();
    
    const isDefault = addresses.length === 0 ? true : a.isDefault;
    const addrCol = collection(db, "users", userId, "addresses");

    if (isDefault && addresses.length > 0) {
      // Unset previous defaults in a batch
      const batch = writeBatch(db);
      addresses.forEach(addr => {
        if (addr.isDefault) {
          batch.update(doc(addrCol, addr.id), { isDefault: false });
        }
      });
      batch.set(doc(addrCol, id), { ...a, id, isDefault: true });
      await batch.commit();
    } else {
      await setDoc(doc(addrCol, id), { ...a, id, isDefault });
    }
  },

  updateAddress: async (id, patch) => {
    const userId = useAuth.getState().user?.id;
    if (!userId) return;
    await updateDoc(doc(db, "users", userId, "addresses", id), patch);
  },

  removeAddress: async (id) => {
    const userId = useAuth.getState().user?.id;
    if (!userId) return;
    const { addresses } = get();
    await deleteDoc(doc(db, "users", userId, "addresses", id));

    // If removed default, promote the first remaining
    const remaining = addresses.filter(a => a.id !== id);
    if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
      await updateDoc(doc(db, "users", userId, "addresses", remaining[0].id), { isDefault: true });
    }
  },

  setDefault: async (id) => {
    const userId = useAuth.getState().user?.id;
    if (!userId) return;
    const { addresses } = get();
    
    const batch = writeBatch(db);
    addresses.forEach(addr => {
      const ref = doc(db, "users", userId, "addresses", addr.id);
      if (addr.id === id) {
        batch.update(ref, { isDefault: true });
      } else if (addr.isDefault) {
        batch.update(ref, { isDefault: false });
      }
    });
    await batch.commit();
  },

  listenToAddresses: (userId) => {
    if (!userId) {
      set({ addresses: [] });
      return () => {};
    }
    const q = query(collection(db, "users", userId, "addresses"));
    return onSnapshot(
      q,
      (snapshot) => {
        set({ addresses: snapshot.docs.map((doc) => doc.data() as SavedAddress) });
      },
      (error) => {
        console.error("Error listening to addresses:", error);
        set({ addresses: [] });
      },
    );
  },
}));
