import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./auth-B6Q2eqo8.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, p as doc, r as getDoc } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as MapPin, O as LogOut, R as Heart, S as Pencil, b as Plus, et as Calendar, f as Star, i as User, k as LoaderCircle, l as Trash2, m as ShoppingBag, nt as Bell, v as Save } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-v4aN8jv8.mjs";
import { r as signOutUser } from "./session-D5n6nfq5.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as useMenu } from "./menu-DvG5qjjW.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as useTables } from "./tables-CdYxFl78.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as useAddresses } from "./address-CMKa8Eys.mjs";
import { n as RadioGroup, r as RadioGroupItem, t as AddressAutocomplete } from "./AddressAutocomplete-lZWJIlm2.mjs";
import { t as MenuCard } from "./MenuCard-28U5LQws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-QdioM4jz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Save user profile to Firestore and update the Zustand auth store.
*/
async function saveUserProfile(uid, profile) {
	await setDoc(doc(db, "users", uid), {
		...profile,
		updatedAt: Date.now()
	}, { merge: true });
	const currentUser = useAuth.getState().user;
	if (currentUser && currentUser.id === uid) useAuth.getState().setUser({
		...currentUser,
		name: profile.name ?? currentUser.name,
		phone: profile.phone ?? currentUser.phone
	});
}
/**
* Load the profile doc for the given user uid.
*/
async function loadUserProfile(uid) {
	const snap = await getDoc(doc(db, "users", uid));
	if (!snap.exists()) return null;
	const data = snap.data();
	return {
		name: data.name ?? "",
		phone: data.phone ?? "",
		email: data.email ?? "",
		avatar: data.avatar,
		notifications: {
			email: data.notifications?.email ?? true,
			sms: data.notifications?.sms ?? true,
			promo: data.notifications?.promo ?? false
		}
	};
}
/**
* Real-time listener for the user profile document.
*/
function listenToUserProfile(uid, callback) {
	return onSnapshot(doc(db, "users", uid), (snap) => {
		if (snap.exists()) {
			const data = snap.data();
			callback({
				name: data.name ?? "",
				phone: data.phone ?? "",
				email: data.email ?? "",
				avatar: data.avatar,
				notifications: {
					email: data.notifications?.email ?? true,
					sms: data.notifications?.sms ?? true,
					promo: data.notifications?.promo ?? false
				}
			});
		}
	});
}
var emptyAddr = {
	label: "Home",
	line1: "",
	line2: "",
	landmark: "",
	city: "Nalgonda",
	pin: "",
	phone: "",
	isDefault: false
};
function Profile() {
	const user = useAuth((s) => s.user);
	const initialized = useAuth((s) => s.initialized);
	const favs = useAuth((s) => s.favorites);
	const navigate = useNavigate();
	const menu = useMenu((s) => s.menu);
	const { reservations } = useTables();
	(0, import_react.useEffect)(() => {
		if (user && !user.emailVerified && user.role === "customer") navigate({ to: "/auth/verify-email" });
	}, [user, navigate]);
	const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();
	const [addrOpen, setAddrOpen] = (0, import_react.useState)(false);
	const [editingAddr, setEditingAddr] = (0, import_react.useState)(null);
	const [addrForm, setAddrForm] = (0, import_react.useState)(emptyAddr);
	const [profileName, setProfileName] = (0, import_react.useState)("");
	const [profilePhone, setProfilePhone] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [notif, setNotif] = (0, import_react.useState)({
		email: true,
		sms: true,
		promo: false
	});
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		const unsub = listenToUserProfile(user.id, (profile) => {
			setProfileName(profile.name || user.name);
			setProfilePhone(profile.phone || user.phone || "");
			setNotif(profile.notifications);
		});
		loadUserProfile(user.id).then((profile) => {
			if (profile) {
				setProfileName(profile.name || user.name);
				setProfilePhone(profile.phone || user.phone || "");
				setNotif(profile.notifications);
			} else {
				setProfileName(user.name);
				setProfilePhone(user.phone || "");
			}
		});
		return unsub;
	}, [
		user?.id,
		user?.name,
		user?.phone
	]);
	const handleSaveProfile = (0, import_react.useCallback)(async (e) => {
		e.preventDefault();
		if (!user) return;
		setSaving(true);
		try {
			await saveUserProfile(user.id, {
				name: profileName,
				phone: profilePhone,
				email: user.email,
				notifications: notif
			});
			toast.success("Profile saved to your account!");
		} catch (err) {
			toast.error("Failed to save profile. Please try again.");
			console.error(err);
		} finally {
			setSaving(false);
		}
	}, [
		user,
		profileName,
		profilePhone,
		notif
	]);
	const handleNotifChange = (0, import_react.useCallback)(async (key, value) => {
		const updated = {
			...notif,
			[key]: value
		};
		setNotif(updated);
		if (user) try {
			await saveUserProfile(user.id, { notifications: updated });
			toast.success("Notification preference saved.");
		} catch {
			toast.error("Failed to save preference.");
		}
	}, [user, notif]);
	if (!initialized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto max-w-md text-center py-24 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-md text-center py-24 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-12 mx-auto text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-2xl font-display font-bold",
				children: "Sign in to continue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-2",
				children: "Access your orders, reservations and favorites."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-2 justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth/login",
					search: { redirect: "/profile" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Sign in" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth/signup",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						children: "Create account"
					})
				})]
			})
		]
	}) });
	const favItems = menu.filter((m) => favs.includes(m.id));
	const userReservations = reservations.filter((r) => r.phone === user?.phone || r.email === user?.email);
	const handleSignOut = async () => {
		await signOutUser();
		toast.success("Signed out");
		navigate({ to: "/" });
	};
	const openAdd = () => {
		setEditingAddr(null);
		setAddrForm(emptyAddr);
		setAddrOpen(true);
	};
	const openEdit = (a) => {
		setEditingAddr(a);
		setAddrForm({
			label: a.label,
			line1: a.line1,
			line2: a.line2,
			landmark: a.landmark,
			city: a.city,
			pin: a.pin,
			phone: a.phone,
			isDefault: a.isDefault
		});
		setAddrOpen(true);
	};
	const handleSaveAddr = (e) => {
		e.preventDefault();
		if (!addrForm.line1 || !addrForm.pin || !addrForm.phone) {
			toast.error("Please fill in Address line 1, Pincode, and Phone.");
			return;
		}
		if (editingAddr) {
			updateAddress(editingAddr.id, addrForm);
			toast.success("Address updated.");
		} else {
			addAddress(addrForm);
			toast.success("Address saved.");
		}
		setAddrOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [
					user.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: user.avatar,
						className: "size-16 rounded-full object-cover",
						alt: "avatar"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-16 grid place-items-center rounded-full bg-primary text-primary-foreground font-display font-bold text-2xl",
						children: user.name[0]?.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-display font-bold",
							children: profileName || user.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-sm",
							children: user.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: handleSignOut,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 mr-2" }), " Sign out"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "info",
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid grid-cols-5 w-full max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "info",
								children: "Info"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "addresses",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 mr-1" }), "Addresses"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "reservations",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 mr-1" }), "Reservations"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "favs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 mr-1" }), "Favorites"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "notif",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5 mr-1" }), "Alerts"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "info",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSaveProfile,
							className: "bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4 max-w-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: profileName,
									onChange: (e) => setProfileName(e.target.value),
									className: "mt-1.5"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									defaultValue: user.email,
									className: "mt-1.5",
									disabled: true,
									title: "Email is managed by Firebase Auth"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profilePhone,
										onChange: (e) => setProfilePhone(e.target.value),
										className: "mt-1.5",
										placeholder: "+91 …"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "sm:col-span-2 w-fit",
									disabled: saving,
									children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }), " Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4 mr-2" }), " Save changes"] })
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "addresses",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										addresses.length,
										" saved address",
										addresses.length !== 1 ? "es" : ""
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: openAdd,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), " Add address"]
								})]
							}), addresses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-card border border-border rounded-2xl p-8 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-10 mx-auto text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-muted-foreground",
										children: "No saved addresses yet."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										variant: "outline",
										onClick: openAdd,
										children: "Add new address"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: addresses.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `bg-card border rounded-2xl p-4 flex items-start gap-3 transition-all ${a.isDefault ? "border-primary ring-1 ring-primary/30" : "border-border"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: `size-5 mt-0.5 shrink-0 ${a.isDefault ? "text-primary" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-sm",
													children: a.label
												}), a.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium",
													children: "Default"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted-foreground mt-0.5",
												children: [
													a.line1,
													a.line2,
													a.landmark && `Near ${a.landmark}`,
													`${a.city} ${a.pin}`
												].filter(Boolean).join(", ")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: a.phone
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2 mt-2",
												children: [
													!a.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "ghost",
														className: "h-7 text-xs",
														onClick: () => {
															setDefault(a.id);
															toast.success("Default address updated.");
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 mr-1" }), " Set default"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "ghost",
														className: "h-7 text-xs",
														onClick: () => openEdit(a),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3 mr-1" }), " Edit"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "ghost",
														className: "h-7 text-xs text-destructive hover:text-destructive",
														onClick: () => {
															removeAddress(a.id);
															toast.success("Address removed.");
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3 mr-1" }), " Remove"]
													})
												]
											})
										]
									})]
								}, a.id))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reservations",
						className: "mt-6",
						children: userReservations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-card border border-border rounded-2xl p-8 text-center max-w-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-10 mx-auto text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-muted-foreground",
									children: "No reservations yet."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/reservations",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										children: "Make a reservation"
									})
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 max-w-2xl",
							children: userReservations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `bg-card border rounded-2xl p-4 flex items-start gap-3 transition-all ${r.status === "Confirmed" ? "border-green-200 ring-1 ring-green-200/50" : r.status === "Cancelled" ? "border-destructive/20" : "border-border"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: `size-5 mt-0.5 shrink-0 ${r.status === "Confirmed" ? "text-green-600" : r.status === "Cancelled" ? "text-destructive" : "text-accent"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-sm",
												children: r.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-[10px] px-2 py-0.5 rounded-full font-medium ${r.status === "Confirmed" ? "bg-green-100 text-green-700" : r.status === "Pending" ? "bg-blue-100 text-blue-700" : r.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`,
												children: r.status
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground mt-1",
											children: [
												"📅",
												" ",
												new Date(r.slotDatetime).toLocaleDateString("en-IN", {
													weekday: "short",
													day: "numeric",
													month: "short"
												}),
												" ",
												"🕐",
												" ",
												new Date(r.slotDatetime).toLocaleTimeString("en-IN", {
													hour: "2-digit",
													minute: "2-digit"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: [
												"👥 ",
												r.partySize,
												" guest",
												r.partySize !== 1 ? "s" : ""
											]
										}),
										r.occasion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: ["🎉 ", r.occasion]
										}),
										r.seat && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: ["🪑 ", r.seat]
										}),
										r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground mt-1",
											children: r.notes
										})
									]
								})]
							}, r.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "favs",
						className: "mt-6",
						children: favItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-card border border-border rounded-2xl p-8 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-10 mx-auto text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3",
									children: "No favorites yet."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/menu",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										children: "Browse menu"
									})
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5",
							children: favItems.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuCard, { item: i }, i.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "notif",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-card border border-border rounded-2xl p-6 space-y-4 max-w-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground mb-2",
									children: "Your notification preferences are saved to your account."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Email updates",
									v: notif.email,
									on: (v) => handleNotifChange("email", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "SMS updates",
									v: notif.sms,
									on: (v) => handleNotifChange("sms", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Promotional offers",
									v: notif.promo,
									on: (v) => handleNotifChange("promo", v)
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 flex gap-3 flex-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4 mr-2" }), "Order history"]
					})
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: addrOpen,
		onOpenChange: setAddrOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingAddr ? "Edit address" : "Add new address" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSaveAddr,
				className: "space-y-4 mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Label" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
						value: addrForm.label,
						onValueChange: (v) => setAddrForm({
							...addrForm,
							label: v
						}),
						className: "flex gap-4 mt-1.5",
						children: [
							"Home",
							"Work",
							"Other"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, { value: t }),
								" ",
								t
							]
						}, t))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Address line 1 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-destructive",
						children: "*"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddressAutocomplete, {
						value: addrForm.line1,
						onChange: (raw, parsed) => {
							if (parsed) setAddrForm((f) => ({
								...f,
								line1: parsed.line1 || raw,
								city: parsed.city || f.city,
								pin: parsed.pin || f.pin
							}));
							else setAddrForm((f) => ({
								...f,
								line1: raw
							}));
						},
						placeholder: "House / flat, street…",
						className: "mt-1.5",
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Address line 2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: addrForm.line2,
								onChange: (e) => setAddrForm({
									...addrForm,
									line2: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "Area, colony"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Landmark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: addrForm.landmark,
								onChange: (e) => setAddrForm({
									...addrForm,
									landmark: e.target.value
								}),
								className: "mt-1.5",
								placeholder: "Near…"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "City" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: addrForm.city,
								onChange: (e) => setAddrForm({
									...addrForm,
									city: e.target.value
								}),
								className: "mt-1.5"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Pincode ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: addrForm.pin,
								onChange: (e) => setAddrForm({
									...addrForm,
									pin: e.target.value
								}),
								className: "mt-1.5",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Phone ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: addrForm.phone,
									onChange: (e) => setAddrForm({
										...addrForm,
										phone: e.target.value
									}),
									className: "mt-1.5",
									required: true
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: addrForm.isDefault,
							onChange: (e) => setAddrForm({
								...addrForm,
								isDefault: e.target.checked
							}),
							className: "rounded border-border"
						}), "Set as default address"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setAddrOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: editingAddr ? "Save changes" : "Add address"
						})]
					})
				]
			})]
		})
	})] });
}
function Toggle({ label, v, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked: v,
			onCheckedChange: on
		})]
	});
}
//#endregion
export { Profile as component };
