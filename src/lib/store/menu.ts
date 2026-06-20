// src/lib/store/menu.ts
import { create } from "zustand";
import { db } from "../firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
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

export const useMenu = create<MenuState>()((set) => ({
  menu: [],

  addMenuItem: async (item) => {
    const id = `item-${Date.now()}`;
    await setDoc(doc(db, "menu_items", id), { ...item, id });
  },

  updateMenuItem: async (id, patch) => {
    await updateDoc(doc(db, "menu_items", id), patch);
  },

  removeMenuItem: async (id) => {
    await deleteDoc(doc(db, "menu_items", id));
  },

  listenToMenu: () => {
    const q = query(collection(db, "menu_items"));
    return onSnapshot(q, (snapshot) => {
      set({ menu: snapshot.docs.map((doc) => doc.data() as MenuItem) });
    });
  },
}));
