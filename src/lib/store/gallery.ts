// src/lib/store/gallery.ts
import { create } from "zustand";
import { db } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export type GalleryImage = {
  id: string;
  url: string;
  publicId?: string;
  category: "Interior" | "Food" | "Events" | "Other";
  caption?: string;
  order: number;
  createdAt: number;
};

type GalleryState = {
  images: GalleryImage[];
  loading: boolean;
  fetchImages: () => Promise<void>;
  addImage: (image: Omit<GalleryImage, "id" | "createdAt">) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
};

export function extractCloudinaryPublicId(url: string): string | undefined {
  if (!url || !url.includes("cloudinary.com")) return undefined;
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return undefined;
    const pathAfterUpload = url.substring(uploadIndex + 8);
    const pathNoVersion = pathAfterUpload.replace(/^v\d+\//, "");
    const lastDotIndex = pathNoVersion.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return pathNoVersion.substring(0, lastDotIndex);
    }
    return pathNoVersion;
  } catch {
    return undefined;
  }
}

export const useGallery = create<GalleryState>()((set, get) => ({
  images: [],
  loading: false,

  fetchImages: async () => {
    set({ loading: true });
    try {
      const snap = await getDocs(collection(db, "gallery"));
      const images = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryImage[];
      // Sort by order field
      images.sort((a, b) => a.order - b.order);
      set({ images });
    } catch (e) {
      console.error("Failed to fetch gallery images", e);
    } finally {
      set({ loading: false });
    }
  },

  addImage: async (image) => {
    try {
      const docRef = await addDoc(collection(db, "gallery"), {
        ...image,
        createdAt: Date.now(),
      });
      set((state) => ({
        images: [...state.images, { id: docRef.id, ...image, createdAt: Date.now() }],
      }));
    } catch (e) {
      console.error("Failed to add gallery image", e);
      throw e;
    }
  },

  deleteImage: async (id) => {
    try {
      const image = get().images.find((img) => img.id === id);
      const publicId =
        image?.publicId || (image?.url ? extractCloudinaryPublicId(image.url) : undefined);

      if (publicId) {
        try {
          const { auth } = await import("../firebase");
          const idToken = await auth.currentUser?.getIdToken();
          if (idToken) {
            const { secureDeleteImage } = await import("../api/cloudinary");
            await secureDeleteImage({ idToken, publicId });
          }
        } catch (cloudErr) {
          console.warn("Cloudinary delete failed, proceeding with Firestore deletion:", cloudErr);
        }
      }

      await deleteDoc(doc(db, "gallery", id));
      set((state) => ({
        images: state.images.filter((img) => img.id !== id),
      }));
    } catch (e) {
      console.error("Failed to delete gallery image", e);
      throw e;
    }
  },
}));
