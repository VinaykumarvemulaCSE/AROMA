// src/lib/store/staff.ts
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

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
};

type StaffState = {
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, "id">) => Promise<void>;
  updateStaff: (id: string, patch: Partial<StaffMember>) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  listenToStaff: () => () => void;
};

export const useStaff = create<StaffState>()((set) => ({
  staff: [],

  addStaff: async (member) => {
    const id = `staff-${Date.now()}`;
    await setDoc(doc(db, "staff", id), { ...member, id });
  },

  updateStaff: async (id, patch) => {
    await updateDoc(doc(db, "staff", id), patch);
  },

  removeStaff: async (id) => {
    await deleteDoc(doc(db, "staff", id));
  },

  listenToStaff: () => {
    const q = query(collection(db, "staff"));
    return onSnapshot(q, (snapshot) => {
      set({ staff: snapshot.docs.map((doc) => doc.data() as StaffMember) });
    });
  },
}));
