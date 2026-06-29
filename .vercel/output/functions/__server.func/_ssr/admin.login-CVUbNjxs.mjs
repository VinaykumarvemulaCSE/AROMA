import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.login-CVUbNjxs.js
var $$splitComponentImporter = () => import("./admin.login-BgAiS9S6.mjs");
var Route = createFileRoute("/admin/login")({
	head: () => ({ meta: [{ title: "Admin sign in — Aroma" }] }),
	validateSearch: (search) => ({ redirect: typeof search.redirect === "string" ? search.redirect : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
