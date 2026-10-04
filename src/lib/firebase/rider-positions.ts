// src/lib/firebase/rider-positions.ts
// Firebase operations for real-time rider position tracking

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

export type RiderPosition = {
  riderId: string;
  riderName: string;
  lat: number;
  lng: number;
  lastUpdated: number;
  isOnline: boolean;
  availability: string;
  batteryLevel?: number;
  vehicleType?: string;
};

const RIDER_POSITIONS_COLLECTION = "rider_positions";

/**
 * Update rider position in Firebase (real-time sync)
 */
export async function updateRiderPositionInFirebase(
  riderId: string,
  riderData: {
    riderName: string;
    lat: number;
    lng: number;
    isOnline: boolean;
    availability: string;
    batteryLevel?: number;
    vehicleType?: string;
  }
): Promise<void> {
  try {
    const positionData: RiderPosition = {
      riderId,
      riderName: riderData.riderName,
      lat: riderData.lat,
      lng: riderData.lng,
      lastUpdated: Date.now(),
      isOnline: riderData.isOnline,
      availability: riderData.availability,
      batteryLevel: riderData.batteryLevel,
      vehicleType: riderData.vehicleType,
    };

    await setDoc(doc(db, RIDER_POSITIONS_COLLECTION, riderId), positionData, {
      merge: true,
    });
  } catch (error) {
    console.error("Error updating rider position in Firebase:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time rider position updates
 * Returns unsubscribe function
 */
export function subscribeToRiderPosition(
  riderId: string,
  callback: (position: RiderPosition | null) => void
): () => void {
  const docRef = doc(db, RIDER_POSITIONS_COLLECTION, riderId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data() as RiderPosition);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to rider position:", error);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to all online rider positions
 * Returns unsubscribe function
 */
export function subscribeToAllRiderPositions(
  callback: (positions: RiderPosition[]) => void
): () => void {
  const q = query(
    collection(db, RIDER_POSITIONS_COLLECTION),
    where("isOnline", "==", true),
    orderBy("lastUpdated", "desc"),
    limit(50)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const positions: RiderPosition[] = [];
      querySnapshot.forEach((doc) => {
        positions.push(doc.data() as RiderPosition);
      });
      callback(positions);
    },
    (error) => {
      console.error("Error listening to all rider positions:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Get rider position by ID (one-time fetch)
 */
export async function getRiderPosition(
  riderId: string
): Promise<RiderPosition | null> {
  try {
    const docRef = doc(db, RIDER_POSITIONS_COLLECTION, riderId);
    // Note: In a real implementation, you'd use getDoc here
    // For now, this is a placeholder for future server-side operations
    return null;
  } catch (error) {
    console.error("Error getting rider position:", error);
    return null;
  }
}
