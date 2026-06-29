import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { o as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import { t as auth } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useOrders } from "./orders-CdMyVVbR.mjs";
import { n as mapFirebaseUser } from "./session-D5n6nfq5.mjs";
import { n as useMenu } from "./menu-DvG5qjjW.mjs";
import { t as useReviews } from "./reviews-H1x9HWSd.mjs";
import { t as Route$27 } from "./admin.login-CVUbNjxs.mjs";
import { t as useCoupons } from "./coupon-ctx-ETPE.mjs";
import { t as useTables } from "./tables-CdYxFl78.mjs";
import { t as Route$28 } from "./auth.login-DLUsCbpv.mjs";
import { t as Route$29 } from "./auth.verify-C4RdVWBC.mjs";
import { t as useAddresses } from "./address-CMKa8Eys.mjs";
import { t as Route$30 } from "./track._orderId-Dnv6vPw3.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-pccjkR6K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthProvider({ children }) {
	const setUser = useAuth((s) => s.setUser);
	const clearUser = useAuth((s) => s.clearUser);
	const setInitialized = useAuth((s) => s.setInitialized);
	(0, import_react.useEffect)(() => {
		return onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) setUser(await mapFirebaseUser(firebaseUser));
				else clearUser();
			} catch (err) {
				console.error("Auth state sync failed:", err);
				clearUser();
			} finally {
				setInitialized(true);
			}
		}, (err) => {
			console.error("Auth listener error:", err);
			clearUser();
			setInitialized(true);
		});
	}, [
		setUser,
		clearUser,
		setInitialized
	]);
	return children;
}
/**
* FirestoreSync — starts global Firestore listeners once auth has initialized.
* Placed in AuthProvider to co-locate with auth lifecycle.
* User-scoped listeners (orders, addresses) restart when the user changes.
*/
function FirestoreSync() {
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const listenToOrders = useOrders((s) => s.listenToOrders);
	const listenToTables = useTables((s) => s.listenToTables);
	const listenToReservations = useTables((s) => s.listenToReservations);
	const listenToAddresses = useAddresses((s) => s.listenToAddresses);
	const listenToCoupons = useCoupons((s) => s.listenToCoupons);
	const listenToMenu = useMenu((s) => s.listenToMenu);
	const listenToReviews = useReviews((s) => s.listenToReviews);
	(0, import_react.useEffect)(() => {
		if (!initialized) return;
		const unsubMenu = listenToMenu();
		const unsubTables = listenToTables();
		const unsubReviews = listenToReviews("public");
		return () => {
			unsubMenu();
			unsubTables();
			unsubReviews();
		};
	}, [
		initialized,
		listenToMenu,
		listenToTables,
		listenToReviews
	]);
	(0, import_react.useEffect)(() => {
		if (!initialized) return;
		const unsubs = [];
		if (user?.id) {
			unsubs.push(listenToOrders(user.id, user.role));
			unsubs.push(listenToAddresses(user.id));
		}
		if (user?.role === "admin") {
			unsubs.push(listenToReservations());
			unsubs.push(listenToCoupons());
			unsubs.push(listenToReviews("admin"));
		}
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [
		initialized,
		user?.id,
		user?.role,
		listenToOrders,
		listenToAddresses,
		listenToReservations,
		listenToCoupons,
		listenToReviews
	]);
	return null;
}
var styles_default = "/assets/styles-DG4h7GLV.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$26 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Aroma Cafe & Restaurant — Nalgonda" },
			{
				name: "description",
				content: "Specialty coffee, fresh-baked goods and fine dining in the heart of Nalgonda. Order online or reserve a table."
			},
			{
				property: "og:title",
				content: "Aroma Cafe & Restaurant — Nalgonda"
			},
			{
				property: "og:description",
				content: "Specialty coffee, fresh-baked goods and fine dining in Nalgonda."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$26.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirestoreSync, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})] })
	});
}
var $$splitComponentImporter$25 = () => import("./reviews-Hh_g9Bgy.mjs");
var Route$25 = createFileRoute("/reviews")({
	head: () => ({ meta: [{ title: "Reviews — Aroma Cafe Nalgonda" }, {
		name: "description",
		content: "Read what our guests say about Aroma Cafe & Restaurant."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./reservations-D2sHuN2A.mjs");
var Route$24 = createFileRoute("/reservations")({
	head: () => ({ meta: [{ title: "Reserve a table — Aroma Cafe Nalgonda" }, {
		name: "description",
		content: "Book a table at Aroma Cafe & Restaurant. Free cancellation up to 24 hours before."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./profile-QdioM4jz.mjs");
var Route$23 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "My profile — Aroma Cafe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./orders-DMG74srh.mjs");
var Route$22 = createFileRoute("/orders")({
	head: () => ({ meta: [{ title: "My orders — Aroma Cafe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./menu-Dacgs1hL.mjs");
var Route$21 = createFileRoute("/menu")({
	head: () => ({ meta: [
		{ title: "Menu — Aroma Cafe & Restaurant" },
		{
			name: "description",
			content: "Browse our menu — specialty coffee, breakfast, mains, desserts and more. Order online for delivery or pickup."
		},
		{
			property: "og:title",
			content: "Menu — Aroma Cafe"
		},
		{
			property: "og:description",
			content: "Specialty coffee, breakfast, mains, desserts."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./gallery-CqmK0xVk.mjs");
var Route$20 = createFileRoute("/gallery")({
	head: () => ({ meta: [{ title: "Gallery — Aroma Cafe Nalgonda" }, {
		name: "description",
		content: "Step inside Aroma Cafe — our space, our food, our team."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./faq-C3l4cLZ1.mjs");
var Route$19 = createFileRoute("/faq")({
	head: () => ({ meta: [{ title: "FAQ — Aroma Cafe" }, {
		name: "description",
		content: "Answers to common questions about ordering, reservations, delivery and more."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./contact-FpBbsmvP.mjs");
var Route$18 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact — Aroma Cafe Nalgonda" }, {
		name: "description",
		content: "Get in touch with Aroma Cafe — phone, email, WhatsApp, or visit us in Nalgonda."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./checkout-D-maSVIA.mjs");
var Route$17 = createFileRoute("/checkout")({
	head: () => ({ meta: [{ title: "Checkout — Aroma Cafe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./cart-BkfjtP4v.mjs");
var Route$16 = createFileRoute("/cart")({
	head: () => ({ meta: [{ title: "Cart — Aroma Cafe" }, {
		name: "description",
		content: "Review your order before checkout."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./admin-DoZWJ3iy.mjs");
var Route$15 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./about-B_5SBzvG.mjs");
var Route$14 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About — Aroma Cafe Nalgonda" }, {
		name: "description",
		content: "The story of Aroma Cafe & Restaurant — a family-run cafe in the heart of Nalgonda."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./routes-C7D91hqA.mjs");
var Route$13 = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "Aroma Cafe & Restaurant — Nalgonda's favourite cafe" },
			{
				name: "description",
				content: "Specialty coffee, fresh-baked goods and fine dining. Order online, reserve a table or visit us in the heart of Nalgonda."
			},
			{
				property: "og:title",
				content: "Aroma Cafe & Restaurant — Nalgonda"
			},
			{
				property: "og:description",
				content: "Order online or reserve a table at Nalgonda's favourite cafe."
			},
			{
				property: "og:image",
				content: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
			}
		],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": ["LocalBusiness", "Restaurant"],
				name: "Aroma Cafe & Restaurant",
				image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
				address: {
					"@type": "PostalAddress",
					streetAddress: "Clock Tower Road",
					addressLocality: "Nalgonda",
					addressRegion: "Telangana",
					postalCode: "508001",
					addressCountry: "IN"
				},
				telephone: "+91 80195 51015",
				servesCuisine: [
					"Coffee",
					"Cafe",
					"Indian",
					"Continental"
				],
				openingHours: "Mo-Su 11:00-23:00"
			})
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin.index-DFKWJK73.mjs");
var Route$12 = createFileRoute("/admin/")({
	head: () => ({ meta: [{ title: "Dashboard — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./auth.verify-email-D4sXJjft.mjs");
var Route$11 = createFileRoute("/auth/verify-email")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./auth.signup-DfxCGCu5.mjs");
var Route$10 = createFileRoute("/auth/signup")({
	head: () => ({ meta: [{ title: "Create account — Aroma Cafe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin.tables-B-kkYau4.mjs");
var Route$9 = createFileRoute("/admin/tables")({
	head: () => ({ meta: [{ title: "Table Management — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin.staff-WJwhKbcP.mjs");
var Route$8 = createFileRoute("/admin/staff")({
	head: () => ({ meta: [{ title: "Staff — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin.settings-CuBHHM5N.mjs");
var Route$7 = createFileRoute("/admin/settings")({
	head: () => ({ meta: [{ title: "Settings — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./admin.reviews-BOJ6s_D-.mjs");
var Route$6 = createFileRoute("/admin/reviews")({
	head: () => ({ meta: [{ title: "Reviews — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./admin.reservations-BGft5e7B.mjs");
var Route$5 = createFileRoute("/admin/reservations")({
	head: () => ({ meta: [{ title: "Reservations — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.promotions-DSd7YnAT.mjs");
var Route$4 = createFileRoute("/admin/promotions")({
	head: () => ({ meta: [{ title: "Promotions — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./admin.orders-CEyyTBlZ.mjs");
var Route$3 = createFileRoute("/admin/orders")({
	head: () => ({ meta: [{ title: "Orders — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.menu-WrVhnuzX.mjs");
var Route$2 = createFileRoute("/admin/menu")({
	head: () => ({ meta: [{ title: "Menu — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.gallery-ljXgNOK9.mjs");
var Route$1 = createFileRoute("/admin/gallery")({
	head: () => ({ meta: [{ title: "Gallery Management — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin.customers-C1tNCjEd.mjs");
var Route = createFileRoute("/admin/customers")({
	head: () => ({ meta: [{ title: "Customers — Aroma Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ReviewsRoute = Route$25.update({
	id: "/reviews",
	path: "/reviews",
	getParentRoute: () => Route$26
});
var ReservationsRoute = Route$24.update({
	id: "/reservations",
	path: "/reservations",
	getParentRoute: () => Route$26
});
var ProfileRoute = Route$23.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$26
});
var OrdersRoute = Route$22.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => Route$26
});
var MenuRoute = Route$21.update({
	id: "/menu",
	path: "/menu",
	getParentRoute: () => Route$26
});
var GalleryRoute = Route$20.update({
	id: "/gallery",
	path: "/gallery",
	getParentRoute: () => Route$26
});
var FaqRoute = Route$19.update({
	id: "/faq",
	path: "/faq",
	getParentRoute: () => Route$26
});
var ContactRoute = Route$18.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$26
});
var CheckoutRoute = Route$17.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$26
});
var CartRoute = Route$16.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => Route$26
});
var AdminRoute = Route$15.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$26
});
var AboutRoute = Route$14.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$26
});
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$26
});
var AdminIndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var TrackOrderIdRoute = Route$30.update({
	id: "/track/$orderId",
	path: "/track/$orderId",
	getParentRoute: () => Route$26
});
var AuthVerifyEmailRoute = Route$11.update({
	id: "/auth/verify-email",
	path: "/auth/verify-email",
	getParentRoute: () => Route$26
});
var AuthVerifyRoute = Route$29.update({
	id: "/auth/verify",
	path: "/auth/verify",
	getParentRoute: () => Route$26
});
var AuthSignupRoute = Route$10.update({
	id: "/auth/signup",
	path: "/auth/signup",
	getParentRoute: () => Route$26
});
var AuthLoginRoute = Route$28.update({
	id: "/auth/login",
	path: "/auth/login",
	getParentRoute: () => Route$26
});
var AdminTablesRoute = Route$9.update({
	id: "/tables",
	path: "/tables",
	getParentRoute: () => AdminRoute
});
var AdminStaffRoute = Route$8.update({
	id: "/staff",
	path: "/staff",
	getParentRoute: () => AdminRoute
});
var AdminSettingsRoute = Route$7.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AdminRoute
});
var AdminReviewsRoute = Route$6.update({
	id: "/reviews",
	path: "/reviews",
	getParentRoute: () => AdminRoute
});
var AdminReservationsRoute = Route$5.update({
	id: "/reservations",
	path: "/reservations",
	getParentRoute: () => AdminRoute
});
var AdminPromotionsRoute = Route$4.update({
	id: "/promotions",
	path: "/promotions",
	getParentRoute: () => AdminRoute
});
var AdminOrdersRoute = Route$3.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => AdminRoute
});
var AdminMenuRoute = Route$2.update({
	id: "/menu",
	path: "/menu",
	getParentRoute: () => AdminRoute
});
var AdminLoginRoute = Route$27.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => AdminRoute
});
var AdminGalleryRoute = Route$1.update({
	id: "/gallery",
	path: "/gallery",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminCustomersRoute: Route.update({
		id: "/customers",
		path: "/customers",
		getParentRoute: () => AdminRoute
	}),
	AdminGalleryRoute,
	AdminLoginRoute,
	AdminMenuRoute,
	AdminOrdersRoute,
	AdminPromotionsRoute,
	AdminReservationsRoute,
	AdminReviewsRoute,
	AdminSettingsRoute,
	AdminStaffRoute,
	AdminTablesRoute,
	AdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	CartRoute,
	CheckoutRoute,
	ContactRoute,
	FaqRoute,
	GalleryRoute,
	MenuRoute,
	OrdersRoute,
	ProfileRoute,
	ReservationsRoute,
	ReviewsRoute,
	AuthLoginRoute,
	AuthSignupRoute,
	AuthVerifyRoute,
	AuthVerifyEmailRoute,
	TrackOrderIdRoute
};
var routeTree = Route$26._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
