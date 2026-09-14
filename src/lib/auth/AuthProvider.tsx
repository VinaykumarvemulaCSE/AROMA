import { onIdTokenChanged, type Unsubscribe } from "firebase/auth";
import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import { useTables } from "@/lib/store/tables";
import { useAddresses } from "@/lib/store/address";
import { useCoupons } from "@/lib/store/coupon";
import { useMenu } from "@/lib/store/menu";
import { useReviews } from "@/lib/store/reviews";
import { completeGoogleRedirectSignIn, consumeAuthRedirect } from "./google";
import { mapFirebaseUser, syncFirestoreUserDoc } from "./session";

function scheduleIdleTask(callback: () => void, immediate: boolean) {
  if (immediate || typeof window === "undefined") {
    callback();
    return () => {};
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  const trigger = () => {
    if (cancelled) return;
    type WindowWithIdle = Window & {
      requestIdleCallback?: (
        cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
        options?: { timeout: number },
      ) => number;
    };
    const win = window as WindowWithIdle;
    if (typeof win.requestIdleCallback === "function") {
      win.requestIdleCallback(
        () => {
          if (!cancelled) callback();
        },
        { timeout: 3500 },
      );
      return;
    }
    callback();
  };

  if (document.readyState === "complete") {
    timer = setTimeout(trigger, 1500);
  } else {
    const onLoad = () => {
      timer = setTimeout(trigger, 1500);
    };
    window.addEventListener("load", onLoad, { once: true });
    timer = setTimeout(trigger, 4000);
  }

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuth((s) => s.setUser);
  const clearUser = useAuth((s) => s.clearUser);
  const setInitialized = useAuth((s) => s.setInitialized);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthCriticalRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/orders") ||
    pathname?.startsWith("/auth");

  // Finish Google redirect sign-in (mobile / popup-blocked fallback)
  useEffect(() => {
    let cancelled = false;
    const cancelSchedule = scheduleIdleTask(() => {
      void (async () => {
        const completed = await completeGoogleRedirectSignIn();
        if (cancelled || !completed) return;
        router.push(consumeAuthRedirect("/profile"));
      })();
    }, isAuthCriticalRoute);

    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, [router, isAuthCriticalRoute]);

  // Sync Firebase auth state into Zustand store & Firestore
  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    let cancelled = false;

    const cancelSchedule = scheduleIdleTask(() => {
      if (cancelled) return;
      unsub = onIdTokenChanged(
        auth,
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const mapped = await mapFirebaseUser(firebaseUser);
              setUser(mapped);
              void syncFirestoreUserDoc(firebaseUser, mapped);
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
    }, isAuthCriticalRoute);

    return () => {
      cancelled = true;
      cancelSchedule();
      if (unsub) {
        unsub();
      }
    };
  }, [setUser, clearUser, setInitialized, isAuthCriticalRoute]);

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
    const unsubReviews = listenToReviews("public");

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
      unsubs.push(listenToReviews("admin"));
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
    listenToReviews,
  ]);

  return null;
}
