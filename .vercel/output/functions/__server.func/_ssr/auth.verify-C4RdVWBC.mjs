import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.verify-C4RdVWBC.js
var $$splitComponentImporter = () => import("./auth.verify-CrIcjFAh.mjs");
var Route = createFileRoute("/auth/verify")({
	validateSearch: (search) => ({
		mode: typeof search.mode === "string" ? search.mode : void 0,
		oobCode: typeof search.oobCode === "string" ? search.oobCode : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
