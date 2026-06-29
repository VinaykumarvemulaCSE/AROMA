import { n as create } from "../_libs/zustand.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, f as collection, l as updateDoc, n as deleteDoc, o as orderBy, p as doc, r as getDoc, s as query, u as where } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-fWKT_J6G.mjs";
import { a as numberType, o as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reviews-H1x9HWSd.js
var reviewInputSchema = objectType({
	name: stringType().min(2).max(100),
	rating: numberType().int().min(1).max(5),
	title: stringType().min(2).max(120),
	body: stringType().min(10).max(2e3),
	itemId: stringType().optional()
});
var submitReview = createServerFn({ method: "POST" }).validator(reviewInputSchema).handler(createSsrRpc("d3807520bdee2422f9ead2be16ab8770d61a07ce4b1ad3fbd965e7773fd8a16e"));
var sendReviewApprovalEmail = createServerFn({ method: "POST" }).validator(objectType({
	customerName: stringType(),
	customerEmail: stringType().email(),
	reviewText: stringType(),
	rating: numberType(),
	itemName: stringType().optional()
})).handler(createSsrRpc("7dc6b68bf7651471b4c98d4b0deb29e67e9209f64869eae4b4f0db8a2167248a"));
var useReviews = create()((set) => ({
	reviews: [],
	addReview: async (r) => {
		await submitReview({ data: r });
	},
	setStatus: async (id, status) => {
		const reviewRef = doc(db, "reviews", id);
		const reviewSnap = await getDoc(reviewRef);
		if (!reviewSnap.exists()) {
			console.error("Review not found:", id);
			return;
		}
		const review = reviewSnap.data();
		const oldStatus = review.status;
		await updateDoc(reviewRef, { status });
		if (oldStatus !== status && status === "approved") {
			const customerEmail = review.name.includes("@") ? review.name : void 0;
			if (customerEmail) try {
				await sendReviewApprovalEmail({ data: {
					customerName: review.name,
					customerEmail,
					reviewText: review.body,
					rating: review.rating,
					itemName: review.itemId
				} });
			} catch (error) {
				console.error("Failed to send review approval email:", error);
			}
		}
	},
	toggleFeatured: async (id, featured) => {
		await updateDoc(doc(db, "reviews", id), { featured });
	},
	remove: async (id) => {
		await deleteDoc(doc(db, "reviews", id));
	},
	listenToReviews: (role = "public") => {
		return onSnapshot(role === "admin" ? query(collection(db, "reviews"), orderBy("date", "desc")) : query(collection(db, "reviews"), where("status", "==", "approved"), orderBy("date", "desc")), (snapshot) => {
			set({ reviews: snapshot.docs.map((d) => ({
				id: d.id,
				...d.data()
			})) });
		}, (error) => {
			console.error("Error listening to reviews:", error);
		});
	}
}));
//#endregion
export { useReviews as t };
