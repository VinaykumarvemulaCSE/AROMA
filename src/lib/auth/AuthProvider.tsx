import { onAuthStateChanged } from "firebase/auth";
import { useEffect, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import { useTables } from "@/lib/store/tables";
import { useAddresses } from "@/lib/store/address";
import { useCoupons } from "@/lib/store/coupon";
import { useMenu } from "@/lib/store/menu";
import { useReviews } from "@/lib/store/reviews";
import { mapFirebaseUser } from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuth((s) => s.setUser);
  const clearUser = useAuth((s) => s.clearUser);
  const setInitialized = useAuth((s) => s.setInitialized);

  // Sync Firebase auth state into Zustand store
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            setUser(await mapFirebaseUser(firebaseUser));
          } else {
            clearUser();
          }
        } catch (err) {
          console.error("Auth state sync failed:", err);
          clearUser();
        } finally {
          setInitialized(true);
        }
      },
      (err) => {
        console.error("Auth listener error:", err);
        clearUser();
        setInitialized(true);
      },
    );

    return unsubscribe;
  }, [setUser, clearUser, setInitialized]);

  return children;
}

/**
 * FirestoreSync — starts global Firestore listeners once auth has initialized.
 * Placed in AuthProvider to co-locate with auth lifecycle.
 * User-scoped listeners (orders, addresses) restart when the user changes.
 */
export function FirestoreSync() {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const listenToOrders = useOrders((s) => s.listenToOrders);
  const listenToTables = useTables((s) => s.listenToTables);
  const listenToReservations = useTables((s) => s.listenToReservations);
  const listenToAddresses = useAddresses((s) => s.listenToAddresses);
  const listenToCoupons = useCoupons((s) => s.listenToCoupons);
  const listenToMenu = useMenu((s) => s.listenToMenu);
  const listenToReviews = useReviews((s) => s.listenToReviews);

  useEffect(() => {
    if (!initialized) return;
    
    // Public global listeners (only started once)
    const unsubMenu = listenToMenu();
    const unsubTables = listenToTables();
    const unsubReviews = listenToReviews();

    return () => {
      unsubMenu();
      unsubTables();
      unsubReviews();
    };
  }, [initialized, listenToMenu, listenToTables, listenToReviews]);

  useEffect(() => {
    if (!initialized) return;

    const unsubs: Array<() => void> = [];

    // User-specific listeners
    if (user?.id) {
      unsubs.push(listenToOrders(user.id, user.role));
      unsubs.push(listenToAddresses(user.id));
    }

    // Admin-specific listeners
    if (user?.role === "admin") {
      unsubs.push(listenToReservations());
      unsubs.push(listenToCoupons());
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [
    initialized,
    user?.id,
    user?.role,
    listenToOrders,
    listenToAddresses,
    listenToReservations,
    listenToCoupons,
  ]);

  return null;
}
