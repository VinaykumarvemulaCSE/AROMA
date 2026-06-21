// src/lib/store/tables.ts
// Admin configures table sizes, capacity, and available booking slots.
// Now backed by real-time Firestore synchronization.

import { create } from "zustand";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { sendReservationStatusEmail } from "../api/reservation-status-email";

export type TimeSlot = {
  datetime: string; // ISO date + time e.g. "2026-06-20T19:30"
  available: boolean;
};

export type TableConfig = {
  id: string;
  size: number; // seats per table e.g. 2, 4, 6, 8
  totalTables: number; // total physical tables of this size
  slots: TimeSlot[]; // available booking slots for this size
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

function mapReservationDoc(data: Record<string, unknown>): Reservation {
  const customer = data.customer as Record<string, unknown> | undefined;
  const reservation = data.reservation as Record<string, unknown> | undefined;

  return {
    id: String(data.id ?? ""),
    tableConfigId: String(data.tableConfigId ?? ""),
    slotDatetime: String(data.slotDatetime ?? ""),
    partySize: Number(reservation?.guests ?? data.partySize ?? 0),
    name: String(customer?.name ?? data.name ?? ""),
    email: customer?.email ? String(customer.email) : undefined,
    phone: String(customer?.phone ?? data.phone ?? ""),
    occasion: reservation?.occasion ? String(reservation.occasion) : undefined,
    seat: reservation?.seat ? String(reservation.seat) : undefined,
    notes: reservation?.notes ? String(reservation.notes) : undefined,
    status: (data.status as Reservation["status"]) ?? "Pending",
    createdAt: Number(data.createdAt ?? 0),
  };
}

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
    const slots = [
      ...t.slots.filter((sl) => sl.datetime !== datetime),
      { datetime, available: true },
    ];
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
            r.tableConfigId === t.id && r.slotDatetime === datetime && r.status !== "Cancelled",
        ).length;

        return booked < t.totalTables;
      }) ?? null
    );
  },

  updateReservationStatus: async (id, status) => {
    // Get reservation details before updating
    const reservationRef = doc(db, "reservations", id);
    const reservationSnap = await getDoc(reservationRef);
    
    if (!reservationSnap.exists()) {
      console.error("Reservation not found:", id);
      return;
    }

    const reservation = reservationSnap.data() as Reservation;
    const oldStatus = reservation.status;

    // Update status in Firestore
    await updateDoc(reservationRef, { status });

    // Send email notification if status changed and customer has email
    if (oldStatus !== status && reservation.email) {
      try {
        await sendReservationStatusEmail({
          data: {
            reservationId: reservation.id,
            customerName: reservation.name,
            customerEmail: reservation.email,
            status,
            date: reservation.slotDatetime.split("T")[0],
            timeSlot: reservation.slotDatetime.split("T")[1],
            guests: reservation.partySize,
          },
        });
      } catch (error) {
        console.error("Failed to send reservation status email:", error);
        // Don't throw error - email failure shouldn't block status update
      }
    }
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
      set({
        reservations: snapshot.docs.map((doc) =>
          mapReservationDoc(doc.data() as Record<string, unknown>),
        ),
      });
    });
  },
}));
