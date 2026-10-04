// src/lib/auto-dispatch.ts
// Automatic order dispatch system

import { useRiders } from "@/lib/store/rider";
import { useOrders } from "@/lib/store/orders";
import { useSettings } from "@/lib/store/settings";

/**
 * Check if auto-dispatch is enabled for an order
 */
export function shouldAutoDispatchOrder(orderStatus: string): boolean {
  return orderStatus === "Ready";
}

/**
 * Automatically dispatch an order to the best available rider
 */
export async function autoDispatchOrderToRider(orderId: string): Promise<{
  success: boolean;
  riderId?: string;
  riderName?: string;
  message: string;
}> {
  try {
    const orders = useOrders.getState().orders;
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Check if order already has a rider assigned
    if (order.assignedRider) {
      return {
        success: false,
        message: "Order already has a rider assigned",
      };
    }

    // Get store location
    const settings = useSettings.getState().settings;
    const storeLocation = {
      lat: settings?.latitude ?? 17.0544,
      lng: settings?.longitude ?? 79.2671,
    };

    // Auto-dispatch using existing rider store logic
    const result = useRiders.getState().autoDispatchOrder(
      {
        id: order.id,
        customerName: order.contact.name,
        customerPhone: order.contact.phone,
        address: `${order.addr.line1}, ${order.addr.city}`,
        lat: order.addr.latitude ?? storeLocation.lat + 0.005,
        lng: order.addr.longitude ?? storeLocation.lng + 0.005,
      },
      storeLocation
    );

    if (result.assignedRider) {
      return {
        success: true,
        riderId: result.assignedRider.id,
        riderName: result.assignedRider.name,
        message: `Order auto-dispatched to ${result.assignedRider.name}`,
      };
    } else {
      return {
        success: false,
        message: result.reason || "No available riders",
      };
    }
  } catch (error) {
    console.error("Auto-dispatch error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Auto-dispatch failed",
    };
  }
}

/**
 * Monitor orders and auto-dispatch when appropriate
 * Call this in a component that listens to order changes
 */
export function setupAutoDispatchMonitor(
  onDispatch?: (orderId: string, riderId: string, riderName: string) => void
): () => void {
  const unsubscribe = useOrders.subscribe((state) => {
    state.orders.forEach((order) => {
      // Check if order should be auto-dispatched
      if (
        shouldAutoDispatchOrder(order.status) &&
        !order.assignedRider &&
        order.addr.latitude &&
        order.addr.longitude
      ) {
        // Dispatch order
        autoDispatchOrderToRider(order.id).then((result) => {
          if (result.success && result.riderId && result.riderName) {
            console.log(`[Auto-Dispatch] Order ${order.id} → ${result.riderName}`);
            onDispatch?.(order.id, result.riderId, result.riderName);
          }
        });
      }
    });
  });

  return unsubscribe;
}
