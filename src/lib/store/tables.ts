// src/lib/store/tables.ts
// Admin configures table sizes, capacity, and available booking slots.
// Now backed by real-time Firestore synchronization.

import { create } from "zustand";
import { db } from "../firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDoc } from "firebase/firestore";

export type TimeSlot = {
  datetime: string;   // ISO date + time e.g. "2026-06-20T19:30"
  available: boolean;
};

export type TableConfig = {
  id: string;
  size: number;          // seats per table e.g. 2, 4, 6, 8
  totalTables: number;   // total physical tables of this size
  slots: TimeSlot[];     // available booking slots for this size
};

export type Reservation = {
  id: string;
  tableConfigId: string;
  slotDatetime: string;
  partySize: number;
  name: string;
  email?: string;
  phone: string;
  occasion?: string;
  seat?: string;
  notes?: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  createdAt: number;
};

type TableState = {
  tables: TableConfig[];
  reservations: Reservation[];

  // Admin actions
  addTableConfig: (t: Omit<TableConfig, "id">) => Promise<void>;
  updateTableConfig: (id: string, patch: Partial<TableConfig>) => Promise<void>;
  removeTableConfig: (id: string) => Promise<void>;
  addSlot: (tableId: string, datetime: string) => Promise<void>;
  removeSlot: (tableId: string, datetime: string) => Promise<void>;

  updateReservationStatus: (id: string, status: Reservation["status"]) => Promise<void>;

  // Query
  findAvailableTable: (date: string, time: string, partySize: number) => TableConfig | null;

  // Listeners
  listenToTables: () => () => void;
  listenToReservations: () => () => void;
};

export const useTables = create<TableState>()((set, get) => ({
  tables: [],
  reservations: [],

  addTableConfig: async (t) => {
    const id = `tbl-${Date.now()}`;
    await setDoc(doc(db, "tables", id), { ...t, id });
  },

  updateTableConfig: async (id, patch) => {
    await updateDoc(doc(db, "tables", id), patch);
  },

  removeTableConfig: async (id) => {
    await deleteDoc(doc(db, "tables", id));
  },

  addSlot: async (tableId, datetime) => {
    const docRef = doc(db, "tables", tableId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const t = snap.data() as TableConfig;
    const slots = [...t.slots.filter((sl) => sl.datetime !== datetime), { datetime, available: true }];
    await updateDoc(docRef, { slots });
  },

  removeSlot: async (tableId, datetime) => {
    const docRef = doc(db, "tables", tableId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const t = snap.data() as TableConfig;
    const slots = t.slots.filter((sl) => sl.datetime !== datetime);
    await updateDoc(docRef, { slots });
  },

  findAvailableTable: (date, time, partySize) => {
    const datetime = `${date}T${time}`;
    const { tables, reservations } = get();

    return (
      tables.find((t) => {
        if (t.size < partySize) return false;
        const slot = t.slots.find((sl) => sl.datetime === datetime && sl.available);
        if (!slot) return false;
        
        const booked = reservations.filter(
          (r) =>
            r.tableConfigId === t.id &&
            r.slotDatetime === datetime &&
            r.status !== "Cancelled"
        ).length;
        
        return booked < t.totalTables;
      }) ?? null
    );
  },

  updateReservationStatus: async (id, status) => {
    await updateDoc(doc(db, "reservations", id), { status });
  },

  listenToTables: () => {
    const q = query(collection(db, "tables"));
    return onSnapshot(q, (snapshot) => {
      set({ tables: snapshot.docs.map((doc) => doc.data() as TableConfig) });
    });
  },

  listenToReservations: () => {
    const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      set({ reservations: snapshot.docs.map((doc) => doc.data() as Reservation) });
    });
  },
}));
