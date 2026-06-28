// src/lib/store/menu.ts
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
} from "firebase/firestore";
import { categories, type Category, type MenuItem } from "../mock/menu";

export type { Category, MenuItem };
export { categories };

type MenuState = {
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => Promise<void>;
  removeMenuItem: (id: string) => Promise<void>;
  listenToMenu: () => () => void;
};

export const useMenu = create<MenuState>()((set, get) => ({
  menu: [],

  addMenuItem: async (item) => {
    const id = `item-${Date.now()}`;
    await setDoc(doc(db, "menu_items", id), { ...item, id });
  },

  updateMenuItem: async (id, patch) => {
    await updateDoc(doc(db, "menu_items", id), patch);
  },

  removeMenuItem: async (id) => {
    try {
      const item = get().menu.find((i) => i.id === id);
      if (item?.publicId) {
        const { auth } = await import("../firebase");
        const idToken = await auth.currentUser?.getIdToken();
        if (idToken) {
          const { secureDeleteImage } = await import("../api/cloudinary");
          await secureDeleteImage({ data: { idToken, publicId: item.publicId } });
        }
      }
    } catch (e) {
      console.error("Failed to delete image from cloudinary", e);
    }
    
    await deleteDoc(doc(db, "menu_items", id));
  },

  listenToMenu: () => {
    const q = query(collection(db, "menu_items"));
    return onSnapshot(q, (snapshot) => {
      set({ menu: snapshot.docs.map((doc) => doc.data() as MenuItem) });
    });
  },
}));
