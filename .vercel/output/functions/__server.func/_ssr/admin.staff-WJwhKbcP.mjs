import { o as __toESM } from "../_runtime.mjs";
import { n as create } from "../_libs/zustand.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, c as setDoc, f as collection, l as updateDoc, n as deleteDoc, p as doc, s as query } from "../_libs/@firebase/firestore+[...].mjs";
import { n as db } from "./firebase-BbfQi5rt.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.staff-WJwhKbcP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var useStaff = create()((set) => ({
	staff: [],
	addStaff: async (member) => {
		const id = `staff-${Date.now()}`;
		await setDoc(doc(db, "staff", id), {
			...member,
			id
		});
	},
	updateStaff: async (id, patch) => {
		await updateDoc(doc(db, "staff", id), patch);
	},
	removeStaff: async (id) => {
		await deleteDoc(doc(db, "staff", id));
	},
	listenToStaff: () => {
		return onSnapshot(query(collection(db, "staff")), (snapshot) => {
			set({ staff: snapshot.docs.map((doc) => doc.data()) });
		});
	}
}));
function Staff() {
	const staff = useStaff((s) => s.staff);
	const addStaff = useStaff((s) => s.addStaff);
	const updateStaff = useStaff((s) => s.updateStaff);
	const removeStaff = useStaff((s) => s.removeStaff);
	const listenToStaff = useStaff((s) => s.listenToStaff);
	(0, import_react.useEffect)(() => {
		const unsub = listenToStaff();
		return () => unsub();
	}, [listenToStaff]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [f, setF] = (0, import_react.useState)({
		name: "",
		role: "Waiter",
		email: "",
		phone: "",
		active: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-display font-bold",
				children: "Staff"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setF({
						name: "",
						role: "Waiter",
						email: "",
						phone: "",
						active: true
					});
					setOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Add staff"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[640px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Name",
						"Role",
						"Email",
						"Phone",
						"Status",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: staff.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-medium",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: s.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: s.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: s.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => updateStaff(s.id, { active: !s.active }),
								className: `text-xs px-2 py-1 rounded-full ${s.active ? "bg-sage/20 text-sage" : "bg-secondary"}`,
								children: s.active ? "Active" : "Inactive"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: async () => {
									await removeStaff(s.id);
									toast.success("Removed");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
							})
						})
					]
				}, s.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add staff member" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: async (e) => {
						e.preventDefault();
						if (!f.name || !f.email) return;
						await addStaff(f);
						toast.success("Added");
						setOpen(false);
					},
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.name,
							onChange: (e) => setF({
								...f,
								name: e.target.value
							}),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: f.role,
								onChange: (e) => setF({
									...f,
									role: e.target.value
								}),
								className: "mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm",
								children: [
									"Owner",
									"Manager",
									"Chef",
									"Waiter",
									"Delivery"
								].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: r }, r))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: f.phone,
								onChange: (e) => setF({
									...f,
									phone: e.target.value
								}),
								className: "mt-1.5"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: f.email,
							onChange: (e) => setF({
								...f,
								email: e.target.value
							}),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Add"
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { Staff as component };
