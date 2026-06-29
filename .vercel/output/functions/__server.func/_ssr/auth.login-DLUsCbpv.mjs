import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.login-DLUsCbpv.js
var $$splitComponentImporter = () => import("./auth.login-DVDVepeE.mjs");
var Route = createFileRoute("/auth/login")({
	head: () => ({ meta: [{ title: "Sign in — Aroma Cafe" }] }),
	validateSearch: (search) => ({ redirect: typeof search.redirect === "string" ? search.redirect : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
