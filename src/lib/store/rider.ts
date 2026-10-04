import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type RiderProfile,
  type RiderAvailabilityStatus,
  type DeliveryState,
  findBestRiderForOrder,
} from "@/lib/dsa/routing";
import { useOrders, type OrderStatus } from "@/lib/store/orders";
import { updateRiderPositionInFirebase } from "@/lib/firebase/rider-positions";

export type DeliveryAssignment = {
  orderId: string;
  riderId: string;
  assignedAt: number;
  deliveryState: DeliveryState;
  status: "assigned" | "picked_up" | "en_route" | "delivered" | "failed";
  customerName: string;
  customerPhone: string;
  address: string;
  lat: number;
  lng: number;
  failureReason?: string;
};

const INITIAL_RIDERS: RiderProfile[] = [
  {
    id: "rider-1",
    name: "Rahul Kumar",
    phone: "9876543210",
    pin: "1234",
    currentLat: 17.0544,
    currentLng: 79.2671,
    isOnline: true,
    availability: "AVAILABLE",
    status: "idle",
    activeOrdersCount: 0,
    batteryLevel: 85,
    vehicleType: "bike",
    todayDeliveries: 5,
    completedDeliveries: 2,
    pendingDeliveries: 3,
  },
  {
    id: "rider-2",
    name: "Vikram Singh",
    phone: "9876543211",
    pin: "2345",
    currentLat: 17.0544,
    currentLng: 79.2671,
    isOnline: true,
    availability: "AVAILABLE",
    status: "idle",
    activeOrdersCount: 0,
    batteryLevel: 92,
    vehicleType: "scooter",
    todayDeliveries: 4,
    completedDeliveries: 3,
    pendingDeliveries: 1,
  },
  {
    id: "rider-3",
    name: "Suresh Patel",
    phone: "9876543212",
    pin: "3456",
    currentLat: 17.0544,
    currentLng: 79.2671,
    isOnline: true,
    availability: "AVAILABLE",
    status: "idle",
    activeOrdersCount: 0,
    batteryLevel: 78,
    vehicleType: "bike",
    todayDeliveries: 6,
    completedDeliveries: 4,
    pendingDeliveries: 2,
  },
];

type RiderState = {
  riders: RiderProfile[];
  assignments: Record<string, DeliveryAssignment>;
  currentRiderId: string;
  setCurrentRiderId: (id: string) => void;
  setRiderAvailability: (riderId: string, availability: RiderAvailabilityStatus) => void;
  toggleRiderOnline: (riderId: string) => void;
  updateRiderLocation: (riderId: string, lat: number, lng: number) => void;
  updateRiderStatus: (riderId: string, status: RiderProfile["status"]) => void;
  autoDispatchOrder: (
    order: {
      id: string;
      customerName: string;
      customerPhone: string;
      address: string;
      lat: number;
      lng: number;
    },
    storeLocation?: { lat: number; lng: number }
  ) => { assignedRider: RiderProfile | null; matchScore: number; reason: string };
  syncRidersToStore: (storeLocation: { lat: number; lng: number }) => void;
  updateDeliveryState: (orderId: string, newState: DeliveryState) => void;
  rejectAssignment: (orderId: string) => { reassigned: boolean; newRider?: RiderProfile };
  failDelivery: (orderId: string, reason: string) => void;
};

export const useRiders = create<RiderState>()(
  persist(
    (set, get) => ({
      riders: INITIAL_RIDERS,
      assignments: {},
      currentRiderId: "rider-1",

      setCurrentRiderId: (id) => set({ currentRiderId: id }),

      setRiderAvailability: (riderId, availability) =>
        set((state) => {
          const isOnline = availability !== "OFFLINE";
          const newStatus: RiderProfile["status"] =
            availability === "ON_DELIVERY"
              ? "en_route"
              : availability === "AVAILABLE"
              ? "idle"
              : "offline";

          const updatedRiders = state.riders.map((r) =>
            r.id === riderId
              ? {
                  ...r,
                  availability,
                  isOnline,
                  status: newStatus,
                }
              : r
          );
          const rider = updatedRiders.find((r) => r.id === riderId);
          if (rider) {
            void updateRiderPositionInFirebase(riderId, {
              riderName: rider.name,
              lat: rider.currentLat,
              lng: rider.currentLng,
              isOnline,
              availability,
              batteryLevel: rider.batteryLevel,
              vehicleType: rider.vehicleType,
            });
          }
          return { riders: updatedRiders };
        }),

      toggleRiderOnline: (riderId) =>
        set((state) => {
          const target = state.riders.find((r) => r.id === riderId);
          if (!target) return state;
          const nextIsOnline = !target.isOnline;
          const nextAvailability: RiderAvailabilityStatus = nextIsOnline ? "AVAILABLE" : "OFFLINE";
          const nextStatus: RiderProfile["status"] = nextIsOnline ? "idle" : "offline";

          const updatedRiders = state.riders.map((r) =>
            r.id === riderId
              ? {
                  ...r,
                  isOnline: nextIsOnline,
                  availability: nextAvailability,
                  status: nextStatus,
                }
              : r
          );
          const rider = updatedRiders.find((r) => r.id === riderId);
          if (rider) {
            void updateRiderPositionInFirebase(riderId, {
              riderName: rider.name,
              lat: rider.currentLat,
              lng: rider.currentLng,
              isOnline: nextIsOnline,
              availability: nextAvailability,
              batteryLevel: rider.batteryLevel,
              vehicleType: rider.vehicleType,
            });
          }
          return { riders: updatedRiders };
        }),

      updateRiderLocation: (riderId, lat, lng) =>
        set((state) => {
          const updatedRiders = state.riders.map((r) =>
            r.id === riderId ? { ...r, currentLat: lat, currentLng: lng } : r
          );

          const rider = updatedRiders.find((r) => r.id === riderId);
          if (rider) {
            // Sync to Firebase for real-time tracking
            void updateRiderPositionInFirebase(riderId, {
              riderName: rider.name,
              lat,
              lng,
              isOnline: rider.isOnline,
              availability: rider.availability,
              batteryLevel: rider.batteryLevel,
              vehicleType: rider.vehicleType,
            });

            Object.values(state.assignments).forEach((asgn) => {
              if (
                asgn.riderId === riderId &&
                asgn.deliveryState !== "DELIVERED" &&
                asgn.deliveryState !== "DELIVERY_FAILED"
              ) {
                void useOrders.getState().assignRiderToOrder(asgn.orderId, {
                  id: rider.id,
                  name: rider.name,
                  phone: rider.phone,
                  vehicleType: rider.vehicleType,
                  status: rider.status,
                  deliveryState: asgn.deliveryState,
                  currentLat: lat,
                  currentLng: lng,
                  updatedAt: Date.now(),
                });
              }
            });
          }

          return { riders: updatedRiders };
        }),

      updateRiderStatus: (riderId, status) =>
        set((state) => ({
          riders: state.riders.map((r) => (r.id === riderId ? { ...r, status } : r)),
        })),

      syncRidersToStore: (storeLocation) =>
        set((state) => ({
          riders: state.riders.map((r) =>
            r.status === "idle" || r.availability === "AVAILABLE"
              ? { ...r, currentLat: storeLocation.lat, currentLng: storeLocation.lng }
              : r
          ),
        })),

      autoDispatchOrder: (order, storeLocation) => {
        const activeStore = storeLocation || { lat: 17.0544, lng: 79.2671 };
        const riders = get().riders;

        const match = findBestRiderForOrder(activeStore, riders);

        if (match.bestRider) {
          const rider = match.bestRider;
          const riderId = rider.id;

          set((state) => ({
            assignments: {
              ...state.assignments,
              [order.id]: {
                orderId: order.id,
                riderId,
                assignedAt: Date.now(),
                deliveryState: "ASSIGNED",
                status: "assigned",
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                address: order.address,
                lat: order.lat,
                lng: order.lng,
              },
            },
            riders: state.riders.map((r) =>
              r.id === riderId
                ? {
                    ...r,
                    currentLat: activeStore.lat,
                    currentLng: activeStore.lng,
                    status: "idle",
                    availability: "AVAILABLE",
                    activeOrdersCount: r.activeOrdersCount + 1,
                    pendingDeliveries: r.pendingDeliveries + 1,
                  }
                : r
            ),
          }));

          void useOrders.getState().assignRiderToOrder(
            order.id,
            {
              id: rider.id,
              name: rider.name,
              phone: rider.phone,
              vehicleType: rider.vehicleType,
              status: "idle",
              deliveryState: "ASSIGNED",
              currentLat: activeStore.lat,
              currentLng: activeStore.lng,
              updatedAt: Date.now(),
            },
            "Ready"
          );
        }

        return {
          assignedRider: match.bestRider,
          matchScore: match.matchScore,
          reason: match.reason,
        };
      },

      updateDeliveryState: (orderId, newState) =>
        set((state) => {
          let assignment = state.assignments[orderId];
          const currentRiderId = state.currentRiderId || "rider-1";

          // Fallback if assignment didn't exist in local store yet
          if (!assignment) {
            const orderFromStore = useOrders.getState().orders.find((o) => o.id === orderId);
            const assignedRiderId = orderFromStore?.assignedRider?.id || currentRiderId;

            assignment = {
              orderId,
              riderId: assignedRiderId,
              assignedAt: Date.now(),
              deliveryState: newState,
              status: "en_route",
              customerName: orderFromStore?.contact.name || "Customer",
              customerPhone: orderFromStore?.contact.phone || "",
              address: orderFromStore ? `${orderFromStore.addr.line1}, ${orderFromStore.addr.city}` : "",
              lat: orderFromStore?.addr.latitude ?? 17.0544,
              lng: orderFromStore?.addr.longitude ?? 79.2671,
            };
          }

          let legacyStatus: DeliveryAssignment["status"] = "assigned";
          let mappedOrderStatus: OrderStatus | undefined;

          if (newState === "ASSIGNED") {
            legacyStatus = "assigned";
            mappedOrderStatus = "Ready";
          } else if (newState === "ACCEPTED") {
            legacyStatus = "en_route";
            mappedOrderStatus = "Ready";
          } else if (newState === "PICKED_UP") {
            legacyStatus = "en_route";
            mappedOrderStatus = "Out for Delivery";
          } else if (newState === "IN_TRANSIT" || newState === "ARRIVING") {
            legacyStatus = "en_route";
            mappedOrderStatus = "Out for Delivery";
          } else if (newState === "DELIVERED") {
            legacyStatus = "delivered";
            mappedOrderStatus = "Delivered";
          } else if (newState === "DELIVERY_FAILED") {
            legacyStatus = "failed";
          }

          const updatedAssignments = {
            ...state.assignments,
            [orderId]: { ...assignment, deliveryState: newState, status: legacyStatus },
          };

          let updatedRiders = state.riders;
          const rider = state.riders.find((r) => r.id === assignment!.riderId) || state.riders[0];

          if (newState === "DELIVERED") {
            updatedRiders = state.riders.map((r) => {
              if (r.id === rider.id) {
                const remainingCount = Math.max(0, r.activeOrdersCount - 1);
                return {
                  ...r,
                  activeOrdersCount: remainingCount,
                  completedDeliveries: r.completedDeliveries + 1,
                  pendingDeliveries: Math.max(0, r.pendingDeliveries - 1),
                  availability: remainingCount === 0 ? "AVAILABLE" : "ON_DELIVERY",
                  status: remainingCount === 0 ? "idle" : "en_route",
                };
              }
              return r;
            });
          } else if (newState === "ASSIGNED") {
            updatedRiders = state.riders.map((r) =>
              r.id === rider.id
                ? {
                    ...r,
                    status: "idle",
                    availability: "ON_DELIVERY",
                    activeOrdersCount: r.activeOrdersCount + 1,
                    pendingDeliveries: r.pendingDeliveries + 1,
                  }
                : r
            );
          } else if (newState === "PICKED_UP" || newState === "IN_TRANSIT" || newState === "ARRIVING") {
            updatedRiders = state.riders.map((r) =>
              r.id === rider.id
                ? {
                    ...r,
                    status: "en_route",
                    availability: "ON_DELIVERY",
                  }
                : r
            );
          }

          if (rider) {
            void useOrders.getState().assignRiderToOrder(
              orderId,
              {
                id: rider.id,
                name: rider.name,
                phone: rider.phone,
                vehicleType: rider.vehicleType,
                status: rider.status,
                deliveryState: newState,
                currentLat: rider.currentLat,
                currentLng: rider.currentLng,
                updatedAt: Date.now(),
              },
              mappedOrderStatus
            );
          }

          return {
            assignments: updatedAssignments,
            riders: updatedRiders,
          };
        }),

      rejectAssignment: (orderId) => {
        const state = get();
        let assignment = state.assignments[orderId];
        const currentRiderId = state.currentRiderId || "rider-1";

        if (!assignment) {
          const orderFromStore = useOrders.getState().orders.find((o) => o.id === orderId);
          const assignedRiderId = orderFromStore?.assignedRider?.id || currentRiderId;
          assignment = {
            orderId,
            riderId: assignedRiderId,
            assignedAt: Date.now(),
            deliveryState: "REJECTED",
            status: "failed",
            customerName: orderFromStore?.contact.name || "Customer",
            customerPhone: orderFromStore?.contact.phone || "",
            address: "",
            lat: 17.0544,
            lng: 79.2671,
          };
        }

        const previousRiderId = assignment.riderId;

        // Mark current assignment REJECTED
        set((prev) => ({
          assignments: {
            ...prev.assignments,
            [orderId]: { ...assignment!, deliveryState: "REJECTED" },
          },
          riders: prev.riders.map((r) =>
            r.id === previousRiderId
              ? {
                  ...r,
                  activeOrdersCount: Math.max(0, r.activeOrdersCount - 1),
                  availability: "AVAILABLE",
                  status: "idle",
                }
              : r
          ),
        }));

        // Reassign to next available rider
        const otherRiders = get().riders.filter((r) => r.id !== previousRiderId && r.isOnline);
        const match = findBestRiderForOrder({ lat: 17.0544, lng: 79.2671 }, otherRiders);

        if (match.bestRider) {
          const newRider = match.bestRider;
          set((prev) => ({
            assignments: {
              ...prev.assignments,
              [orderId]: {
                ...assignment!,
                riderId: newRider.id,
                deliveryState: "ASSIGNED",
                status: "assigned",
                assignedAt: Date.now(),
              },
            },
            riders: prev.riders.map((r) =>
              r.id === newRider.id
                ? {
                    ...r,
                    status: "en_route",
                    availability: "ON_DELIVERY",
                    activeOrdersCount: r.activeOrdersCount + 1,
                  }
                : r
            ),
          }));

          void useOrders.getState().assignRiderToOrder(
            orderId,
            {
              id: newRider.id,
              name: newRider.name,
              phone: newRider.phone,
              vehicleType: newRider.vehicleType,
              status: "en_route",
              deliveryState: "ASSIGNED",
              currentLat: newRider.currentLat,
              currentLng: newRider.currentLng,
              updatedAt: Date.now(),
            },
            "Out for Delivery"
          );

          return { reassigned: true, newRider: match.bestRider };
        }

        return { reassigned: false };
      },

      failDelivery: (orderId, reason) => {
        set((state) => {
          const assignment = state.assignments[orderId];
          if (!assignment) return state;

          return {
            assignments: {
              ...state.assignments,
              [orderId]: {
                ...assignment,
                deliveryState: "DELIVERY_FAILED",
                status: "failed",
                failureReason: reason,
              },
            },
            riders: state.riders.map((r) =>
              r.id === assignment.riderId
                ? {
                    ...r,
                    activeOrdersCount: Math.max(0, r.activeOrdersCount - 1),
                    availability: "AVAILABLE",
                    status: "idle",
                  }
                : r
            ),
          };
        });
      },
    }),
    {
      name: "aroma_riders_store",
    }
  )
);
