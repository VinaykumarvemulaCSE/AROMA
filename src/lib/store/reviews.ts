// src/lib/store/reviews.ts
// Reviews are stored in Firestore. Customers submit (status: "pending").
// Admins approve/reject. Only "approved" reviews show on the public /reviews page.

import { create } from "zustand";
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type StoredReview = {
  id: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  itemId?: string;
  helpful: number;
  verified: boolean;
  status: ReviewStatus;
};

type ReviewsState = {
  reviews: StoredReview[];
  addReview: (r: Omit<StoredReview, "id" | "date" | "helpful" | "verified" | "status">) => Promise<void>;
  setStatus: (id: string, status: ReviewStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
  listenToReviews: () => () => void;
};

export const useReviews = create<ReviewsState>()((set) => ({
  reviews: [],

  addReview: async (r) => {
    await addDoc(collection(db, "reviews"), {
      ...r,
      date: new Date().toISOString().slice(0, 10),
      helpful: 0,
      verified: false,
      status: "pending",
    });
  },

  setStatus: async (id, status) => {
    await updateDoc(doc(db, "reviews", id), { status });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, "reviews", id));
  },

  listenToReviews: () => {
    const q = query(collection(db, "reviews"), orderBy("date", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        set({
          reviews: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StoredReview)),
        });
      },
      (error) => {
        console.error("Error listening to reviews:", error);
      },
    );
  },
}));

// Legacy compat alias — keeping for any residual references
export const reviewsStore = {
  getAll: () => useReviews.getState().reviews,
  getApproved: () => useReviews.getState().reviews.filter((r) => r.status === "approved"),
  add: (r: Omit<StoredReview, "id" | "date" | "helpful" | "verified" | "status">) =>
    useReviews.getState().addReview(r),
  setStatus: (id: string, status: ReviewStatus) => useReviews.getState().setStatus(id, status),
  remove: (id: string) => useReviews.getState().remove(id),
  subscribe: (_fn: () => void) => () => {},
};
