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

const INITIAL_STAFF: StaffMember[] = [
  { id: "staff-1", name: "Rahul Kumar", role: "Rider / Delivery Partner", email: "rahul.rider@aromacafe.in", phone: "9876543210", active: true },
  { id: "staff-2", name: "Vikram Singh", role: "Rider / Delivery Partner", email: "vikram.rider@aromacafe.in", phone: "9876543211", active: true },
  { id: "staff-3", name: "Suresh Patel", role: "Rider / Delivery Partner", email: "suresh.rider@aromacafe.in", phone: "9876543212", active: true },
  { id: "staff-4", name: "Anil Sharma", role: "Head Chef", email: "anil.chef@aromacafe.in", phone: "9876543213", active: true },
];

export const useStaff = create<StaffState>()((set) => ({
  staff: INITIAL_STAFF,

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
      if (!snapshot.empty) {
        set({ staff: snapshot.docs.map((doc) => doc.data() as StaffMember) });
      }
    });
  },
}));
