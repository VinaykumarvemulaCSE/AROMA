// src/lib/store/reviews.ts
// Reviews are stored in Firestore. Customers submit via server function (status: "pending").
// Admins approve/reject. Only "approved" reviews show on the public /reviews page.

import { create } from "zustand";
import { db } from "../firebase";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { submitReview as submitReviewApi } from "../api/reviews";

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
  addReview: (
    r: Omit<StoredReview, "id" | "date" | "helpful" | "verified" | "status">,
  ) => Promise<void>;
  setStatus: (id: string, status: ReviewStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
  listenToReviews: (role?: "admin" | "public") => () => void;
};

export const useReviews = create<ReviewsState>()((set) => ({
  reviews: [],

  addReview: async (r) => {
    await submitReviewApi({ data: r });
  },

  setStatus: async (id, status) => {
    await updateDoc(doc(db, "reviews", id), { status });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, "reviews", id));
  },

  listenToReviews: (role = "public") => {
    const q =
      role === "admin"
        ? query(collection(db, "reviews"), orderBy("date", "desc"))
        : query(
            collection(db, "reviews"),
            where("status", "==", "approved"),
            orderBy("date", "desc"),
          );

    return onSnapshot(
      q,
      (snapshot) => {
        set({
          reviews: snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as StoredReview),
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
