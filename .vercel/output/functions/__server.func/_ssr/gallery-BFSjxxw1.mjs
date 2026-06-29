import { n as create } from "../_libs/zustand.mjs";
import "../_libs/firebase.mjs";
import { f as collection, i as getDocs, n as deleteDoc, p as doc, t as addDoc } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gallery-BFSjxxw1.js
var useGallery = create()((set, get) => ({
	images: [],
	loading: false,
	fetchImages: async () => {
		set({ loading: true });
		try {
			const images = (await getDocs(collection(db, "gallery"))).docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
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
				createdAt: Date.now()
			});
			set((state) => ({ images: [...state.images, {
				id: docRef.id,
				...image,
				createdAt: Date.now()
			}] }));
		} catch (e) {
			console.error("Failed to add gallery image", e);
			throw e;
		}
	},
	deleteImage: async (id) => {
		try {
			const image = get().images.find((img) => img.id === id);
			if (image?.publicId) {
				const { auth } = await import("./firebase-BbfQi5rt.mjs").then((n) => n.r).then((n) => n.r);
				const idToken = await auth.currentUser?.getIdToken();
				if (idToken) {
					const { secureDeleteImage } = await import("./cloudinary-BiHnQsyx.mjs");
					await secureDeleteImage({ data: {
						idToken,
						publicId: image.publicId
					} });
				}
			}
			await deleteDoc(doc(db, "gallery", id));
			set((state) => ({ images: state.images.filter((img) => img.id !== id) }));
		} catch (e) {
			console.error("Failed to delete gallery image", e);
			throw e;
		}
	}
}));
//#endregion
export { useGallery as t };
