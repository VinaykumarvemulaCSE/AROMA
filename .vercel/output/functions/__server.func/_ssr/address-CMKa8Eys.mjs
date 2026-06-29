import { n as create } from "../_libs/zustand.mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, d as writeBatch, f as collection, l as updateDoc, n as deleteDoc, p as doc, s as query } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/address-CMKa8Eys.js
var useAddresses = create()((set, get) => ({
	addresses: [],
	addAddress: async (a) => {
		const userId = useAuth.getState().user?.id;
		if (!userId) return;
		const id = `addr-${Date.now()}`;
		const { addresses } = get();
		const isDefault = addresses.length === 0 ? true : a.isDefault;
		const addrCol = collection(db, "users", userId, "addresses");
		if (isDefault && addresses.length > 0) {
			const batch = writeBatch(db);
			addresses.forEach((addr) => {
				if (addr.isDefault) batch.update(doc(addrCol, addr.id), { isDefault: false });
			});
			batch.set(doc(addrCol, id), {
				...a,
				id,
				isDefault: true
			});
			await batch.commit();
		} else await setDoc(doc(addrCol, id), {
			...a,
			id,
			isDefault
		});
	},
	updateAddress: async (id, patch) => {
		const userId = useAuth.getState().user?.id;
		if (!userId) return;
		await updateDoc(doc(db, "users", userId, "addresses", id), patch);
	},
	removeAddress: async (id) => {
		const userId = useAuth.getState().user?.id;
		if (!userId) return;
		const { addresses } = get();
		await deleteDoc(doc(db, "users", userId, "addresses", id));
		const remaining = addresses.filter((a) => a.id !== id);
		if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) await updateDoc(doc(db, "users", userId, "addresses", remaining[0].id), { isDefault: true });
	},
	setDefault: async (id) => {
		const userId = useAuth.getState().user?.id;
		if (!userId) return;
		const { addresses } = get();
		const batch = writeBatch(db);
		addresses.forEach((addr) => {
			const ref = doc(db, "users", userId, "addresses", addr.id);
			if (addr.id === id) batch.update(ref, { isDefault: true });
			else if (addr.isDefault) batch.update(ref, { isDefault: false });
		});
		await batch.commit();
	},
	listenToAddresses: (userId) => {
		if (!userId) {
			set({ addresses: [] });
			return () => {};
		}
		return onSnapshot(query(collection(db, "users", userId, "addresses")), (snapshot) => {
			set({ addresses: snapshot.docs.map((doc) => doc.data()) });
		}, (error) => {
			console.error("Error listening to addresses:", error);
			set({ addresses: [] });
		});
	}
}));
//#endregion
export { useAddresses as t };
