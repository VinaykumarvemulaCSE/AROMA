// Zustand store for app auth state. Firebase Auth is the source of truth;
// AuthProvider syncs via onAuthStateChanged. Only favorites are persisted locally.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "admin";
};

type AuthState = {
  user: User | null;
  initialized: boolean;
  favorites: string[];
  setUser: (u: User) => void;
  clearUser: () => void;
  setInitialized: (value: boolean) => void;
  /** @deprecated Use setUser — kept for profile info edits */
  signIn: (u: User) => void;
  /** @deprecated Use signOutUser from @/lib/auth/session */
  signOut: () => void;
  toggleFav: (id: string) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      initialized: false,
      favorites: [],
      setUser: (u) => set({ user: u }),
      clearUser: () => set({ user: null }),
      setInitialized: (value) => set({ initialized: value }),
      signIn: (u) => set({ user: u }),
      signOut: () => set({ user: null }),
      toggleFav: (id) =>
        set({
          favorites: get().favorites.includes(id)
            ? get().favorites.filter((f) => f !== id)
            : [...get().favorites, id],
        }),
    }),
    {
      name: "aroma-auth",
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);
