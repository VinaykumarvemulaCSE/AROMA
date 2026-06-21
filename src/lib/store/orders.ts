// src/lib/store/orders.ts
// Shared store for customer orders, now backed by real-time Firestore synchronization.

import { create } from "zustand";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type OrderLine = {
  id: string;
  name: string;
  qty: number;
  price: number;
  image: string;
};

export type Address = {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  pin: string;
  phone: string;
  type: string;
  notes?: string;
};

export type Contact = {
  name: string;
  email?: string;
  phone: string;
  method: string;
  note?: string;
  cutlery: boolean;
};

export type Order = {
  id: string;
  items: OrderLine[];
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number; // coupon discount applied
  couponCode?: string;
  total: number;
  addr: Address;
  contact: Contact;
  status: OrderStatus;
  createdAt: number;
  userId?: string;
};

type OrdersState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  listenToOrders: (userId?: string, role?: "customer" | "admin") => () => void;
  listenToOrder: (orderId: string, onOrder: (order: Order | null) => void) => () => void;
};

export const useOrders = create<OrdersState>()((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateStatus: async (id, status) => {
    // Update status in Firestore
    await updateDoc(doc(db, "orders", id), { status });
  },
  listenToOrders: (userId, role) => {
    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    // If customer, only listen to their own orders
    if (role === "customer" && userId) {
      q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
    } else if (role !== "admin") {
      // If not logged in and not admin, we shouldn't listen to anything globally
      // (Unless we want guest tracking, which we handle separately by direct doc fetch)
      set({ orders: [] });
      return () => {};
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => doc.data() as Order);
        set({ orders: fetchedOrders });
      },
      (error) => {
        console.error("Error listening to orders:", error);
      },
    );

    return unsubscribe;
  },

  listenToOrder: (orderId, onOrder) => {
    const ref = doc(db, "orders", orderId);
    return onSnapshot(
      ref,
      (snapshot) => {
        onOrder(snapshot.exists() ? (snapshot.data() as Order) : null);
      },
      (error) => {
        console.error("Error listening to order:", error);
        onOrder(null);
      },
    );
  },
}));
