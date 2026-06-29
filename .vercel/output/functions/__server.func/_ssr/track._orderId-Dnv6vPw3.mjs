import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track._orderId-Dnv6vPw3.js
var $$splitComponentImporter = () => import("./track._orderId-BHZ0i6Oc.mjs");
var Route = createFileRoute("/track/$orderId")({
	head: () => ({ meta: [{ title: "Track order — Aroma Cafe" }] }),
	validateSearch: (search) => ({ wa: search.wa === 1 || search.wa === "1" ? 1 : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
