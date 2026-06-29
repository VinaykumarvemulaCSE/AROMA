import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B6Q2eqo8.js
var useAuth = create()(persist((set, get) => ({
	user: null,
	initialized: false,
	favorites: [],
	setUser: (u) => set({ user: u }),
	clearUser: () => set({ user: null }),
	setInitialized: (value) => set({ initialized: value }),
	signIn: (u) => set({ user: u }),
	signOut: () => set({ user: null }),
	toggleFav: (id) => set({ favorites: get().favorites.includes(id) ? get().favorites.filter((f) => f !== id) : [...get().favorites, id] })
}), {
	name: "aroma-auth",
	partialize: (state) => ({ favorites: state.favorites })
}));
//#endregion
export { useAuth as t };
