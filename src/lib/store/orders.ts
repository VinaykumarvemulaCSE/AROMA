// src/lib/store/orders.ts
// Shared store for customer orders, now backed by real-time Firestore synchronization.

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
  where,
  getDoc,
} from "firebase/firestore";
import { sendOrderStatusEmail } from "../api/order-status-email";
import { sendOrderCancellationEmail } from "../api/order-cancellation-email";
import { auth } from "../firebase";
import { useAuth } from "./auth";

async function requireAdminIdToken() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Admin authentication required to send notifications.");
  }
  return token;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

// Valid status transitions
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Preparing", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [], // Terminal state
  Cancelled: [], // Terminal state
};

function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

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
  latitude?: number;
  longitude?: number;
};

export type Contact = {
  name: string;
  email?: string;
  phone: string;
  method: string;
  note?: string;
  cutlery: boolean;
};

export type AssignedRiderInfo = {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string;
  status: string;
  deliveryState?: string;
  currentLat?: number;
  currentLng?: number;
  updatedAt?: number;
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
  isDeleted?: boolean;
  assignedRider?: AssignedRiderInfo;
};

type OrdersState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateStatusWithLoading: (
    id: string,
    status: OrderStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  assignRiderToOrder: (
    orderId: string,
    riderInfo: AssignedRiderInfo,
    newOrderStatus?: OrderStatus
  ) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  listenToOrders: (userId?: string, role?: "customer" | "admin") => () => void;
  listenToOrder: (orderId: string, onOrder: (order: Order | null) => void) => () => void;
};

export const useOrders = create<OrdersState>()((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateStatus: async (id, status) => {
    // Get order details before updating
    const orderRef = doc(db, "orders", id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.error("Order not found:", id);
      return;
    }

    const order = orderSnap.data() as Order;
    const oldStatus = order.status;

    // Validate status transition
    if (!isValidStatusTransition(oldStatus, status)) {
      console.error(`Invalid status transition: ${oldStatus} → ${status}`);
      throw new Error(`Cannot change order status from ${oldStatus} to ${status}`);
    }

    // Update status in Firestore
    await updateDoc(orderRef, { status });

    // Send email notification if status changed and customer has email
    if (oldStatus !== status && order.contact.email) {
      try {
        // Check if user has email notifications enabled (if user exists)
        const user = useAuth.getState().user;
        const emailEnabled = !user || user.notifications?.email !== false;

        if (emailEnabled) {
          // Send cancellation email specifically
          const idToken = await requireAdminIdToken();
          if (status === "Cancelled") {
            await sendOrderCancellationEmail({
              data: {
                idToken,
                orderId: order.id,
                customerName: order.contact.name,
                customerEmail: order.contact.email,
                items: order.items,
                total: order.total,
              },
            });
          } else {
            // Send regular status update email
            await sendOrderStatusEmail({
              data: {
                idToken,
                orderId: order.id,
                customerName: order.contact.name,
                customerEmail: order.contact.email,
                status,
                items: order.items,
                total: order.total,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to send order email:", error);
        // Don't throw error - email failure shouldn't block status update
      }
    }
  },

  updateStatusWithLoading: async (id, status) => {
    try {
      // Delegate so status emails still fire
      await useOrders.getState().updateStatus(id, status);
      return { success: true };
    } catch (error) {
      console.error("Failed to update order status:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  assignRiderToOrder: async (id, riderInfo, newOrderStatus) => {
    try {
      const orderRef = doc(db, "orders", id);
      const updateData: Record<string, any> = {
        assignedRider: riderInfo,
      };
      if (newOrderStatus) {
        updateData.status = newOrderStatus;
      }

      await updateDoc(orderRef, updateData);

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                assignedRider: riderInfo,
                ...(newOrderStatus ? { status: newOrderStatus } : {}),
              }
            : o
        ),
      }));
    } catch (error) {
      console.error("Failed to assign rider to order in Firestore:", error);
    }
  },

  deleteOrder: async (id: string) => {
    // 1. Optimistically remove from state immediately
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));

    const orderRef = doc(db, "orders", id);
    try {
      await deleteDoc(orderRef);
    } catch (error: any) {
      
      console.warn("Firestore deleteDoc encountered issue, applying soft-delete fallback:", error);
      try {
        await updateDoc(orderRef, { isDeleted: true, status: "Cancelled" });
      } catch (innerError) {
        console.error("Firestore backup updateDoc also failed:", innerError);
      }
    }
  },
  listenToOrders: (userId, role) => {
    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    // If customer with userId, only listen to their own orders
    if (role === "customer" && userId) {
      q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs
          .map((doc) => doc.data() as Order)
          .filter((o) => !o.isDeleted);
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
