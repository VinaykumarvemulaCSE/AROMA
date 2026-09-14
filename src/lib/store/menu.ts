// src/lib/store/menu.ts
import { create } from "zustand";
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
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import("../firebase"),
      import("firebase/firestore"),
    ]);
    const id = `item-${Date.now()}`;
    await setDoc(doc(db, "menu_items", id), { ...item, id });
  },

  updateMenuItem: async (id, patch) => {
    const [{ db }, { doc, updateDoc }] = await Promise.all([
      import("../firebase"),
      import("firebase/firestore"),
    ]);
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
          await secureDeleteImage({ idToken, publicId: item.publicId });
        }
      }
    } catch (e) {
      console.error("Failed to delete Cloudinary image for menu item:", e);
    }
    const [{ db }, { doc, deleteDoc }] = await Promise.all([
      import("../firebase"),
      import("firebase/firestore"),
    ]);
    await deleteDoc(doc(db, "menu_items", id));
  },

  listenToMenu: () => {
    let unsubscribe = () => {};
    void (async () => {
      const [{ db }, { collection, onSnapshot, query }] = await Promise.all([
        import("../firebase"),
        import("firebase/firestore"),
      ]);
      const q = query(collection(db, "menu_items"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        set({ menu: snapshot.docs.map((doc) => doc.data() as MenuItem) });
      });
    })();
    return () => unsubscribe();
  },
}));
