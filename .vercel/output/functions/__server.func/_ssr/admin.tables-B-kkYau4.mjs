import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { G as CirclePlus, W as CircleX, b as Plus, g as Settings2, l as Trash2, r as Users, tt as CalendarClock } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./AdminLayout-c6U6disk.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as useTables } from "./tables-CdYxFl78.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.tables-B-kkYau4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminTables() {
	const { tables, reservations, addTableConfig, updateTableConfig, removeTableConfig, addSlot, removeSlot, updateReservationStatus } = useTables();
	const [tableOpen, setTableOpen] = (0, import_react.useState)(false);
	const [slotOpen, setSlotOpen] = (0, import_react.useState)(false);
	const [selectedTable, setSelectedTable] = (0, import_react.useState)(null);
	const [newSlotDate, setNewSlotDate] = (0, import_react.useState)("");
	const [newSlotTime, setNewSlotTime] = (0, import_react.useState)("12:00");
	const [newTable, setNewTable] = (0, import_react.useState)({
		size: 2,
		totalTables: 1
	});
	const [occupancy, setOccupancy] = (0, import_react.useState)({});
	const allPhysicalTables = (0, import_react.useMemo)(() => {
		const list = [];
		tables.forEach((t) => {
			for (let i = 0; i < t.totalTables; i++) list.push({
				id: `${t.id}-${i}`,
				size: t.size,
				label: `T${list.length + 1}`
			});
		});
		return list;
	}, [tables]);
	const toggleStatus = (id) => {
		setOccupancy((prev) => {
			const current = prev[id] || "Free";
			const next = current === "Free" ? "Reserved" : current === "Reserved" ? "Occupied" : "Free";
			return {
				...prev,
				[id]: next
			};
		});
	};
	const handleAddTable = (e) => {
		e.preventDefault();
		addTableConfig({
			size: newTable.size,
			totalTables: newTable.totalTables,
			slots: []
		});
		toast.success(`${newTable.size}-seater table config added.`);
		setTableOpen(false);
	};
	const handleAddSlot = (e) => {
		e.preventDefault();
		if (!selectedTable || !newSlotDate || !newSlotTime) return;
		const datetime = `${newSlotDate}T${newSlotTime}`;
		addSlot(selectedTable.id, datetime);
		toast.success("Slot added.");
		setNewSlotDate("");
	};
	const pendingReservations = reservations.filter((r) => r.status === "Pending");
	const confirmedReservations = reservations.filter((r) => r.status === "Confirmed");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-display font-bold",
				children: "Table Management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: "Configure table sizes, capacity, and available booking slots."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setTableOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Add table type"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid sm:grid-cols-3 gap-4",
			children: [
				{
					label: "Table types",
					value: tables.length,
					icon: Settings2
				},
				{
					label: "Pending bookings",
					value: pendingReservations.length,
					icon: CalendarClock
				},
				{
					label: "Confirmed today",
					value: confirmedReservations.length,
					icon: Users
				}
			].map(({ label, value, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5 flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-full bg-primary/10 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl font-display font-bold",
					children: value
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: label
				})] })]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mt-8 font-display font-semibold text-lg flex items-center justify-between",
			children: ["Live Table Matrix", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 text-xs font-normal",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-secondary border border-border" }), " Free"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-amber-400" }), " Reserved"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-red-500" }), " Occupied"]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 bg-card border border-border rounded-2xl p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4",
				children: [allPhysicalTables.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm w-full text-center py-4",
					children: "No tables configured."
				}), allPhysicalTables.map((t) => {
					const status = occupancy[t.id] || "Free";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => toggleStatus(t.id),
						className: `flex flex-col items-center justify-center size-20 sm:size-24 rounded-xl border ${status === "Free" ? "bg-secondary text-foreground" : status === "Reserved" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-red-100 text-red-800 border-red-300"} transition-all hover:opacity-80`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display font-bold text-lg sm:text-xl",
								children: t.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] uppercase tracking-wider opacity-70",
								children: [t.size, " seats"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium mt-1",
								children: status
							})
						]
					}, t.id);
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 font-display font-semibold text-lg",
			children: "Table Configurations"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
			children: [tables.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-3 bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground",
				children: "No table configurations yet. Add a table type to get started."
			}), tables.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-10 rounded-full bg-primary/10 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display font-semibold",
							children: [t.size, "-seater"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								t.totalTables,
								" table",
								t.totalTables !== 1 ? "s" : "",
								" total"
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						onClick: () => {
							removeTableConfig(t.id);
							toast.success("Table config removed.");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium text-muted-foreground mb-2",
							children: [
								"Available slots (",
								t.slots.filter((s) => s.available).length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5 max-h-32 overflow-y-auto",
							children: [t.slots.sort((a, b) => a.datetime.localeCompare(b.datetime)).map((sl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-xs bg-secondary rounded-lg px-2 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(sl.datetime).toLocaleString("en-IN", {
									dateStyle: "short",
									timeStyle: "short"
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										removeSlot(t.id, sl.datetime);
										toast.success("Slot removed.");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3 text-muted-foreground hover:text-destructive" })
								})]
							}, sl.datetime)), t.slots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No slots yet."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "mt-2 w-full text-xs",
							onClick: () => {
								setSelectedTable(t);
								setSlotOpen(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-3 mr-1" }), " Add slot"]
						})
					]
				})]
			}, t.id))]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mt-10 font-display font-semibold text-lg",
			children: ["Customer Reservations", pendingReservations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full",
				children: [pendingReservations.length, " pending"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 bg-card border border-border rounded-2xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[680px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"ID",
						"Name",
						"Phone",
						"Date & Time",
						"Party",
						"Occasion",
						"Status",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [reservations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 8,
					className: "px-4 py-10 text-center text-muted-foreground",
					children: "No reservations yet."
				}) }), reservations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-secondary/20 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-medium text-primary",
							children: ["#", r.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: r.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs",
							children: new Date(r.slotDatetime).toLocaleString("en-IN", {
								dateStyle: "medium",
								timeStyle: "short"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.partySize
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: r.occasion || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "Confirmed" ? "bg-green-100 text-green-700" : r.status === "Pending" ? "bg-amber-100 text-amber-700" : r.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-secondary text-muted-foreground"}`,
								children: r.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: r.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "h-7 text-xs bg-green-600 hover:bg-green-700 text-white",
									onClick: () => {
										updateReservationStatus(r.id, "Confirmed");
										toast.success("Reservation confirmed.");
									},
									children: "Confirm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs text-destructive hover:text-destructive",
									onClick: () => {
										updateReservationStatus(r.id, "Cancelled");
										toast.success("Reservation cancelled.");
									},
									children: "Cancel"
								})] })
							})
						})
					]
				}, r.id))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: tableOpen,
			onOpenChange: setTableOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add table type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleAddTable,
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Seats per table" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							max: 20,
							value: newTable.size,
							onChange: (e) => setNewTable({
								...newTable,
								size: parseInt(e.target.value) || 2
							}),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Number of tables of this size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							value: newTable.totalTables,
							onChange: (e) => setNewTable({
								...newTable,
								totalTables: parseInt(e.target.value) || 1
							}),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setTableOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Add"
							})]
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: slotOpen,
			onOpenChange: setSlotOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
					"Add slot — ",
					selectedTable?.size,
					"-seater"
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleAddSlot,
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: newSlotDate,
							min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
							onChange: (e) => setNewSlotDate(e.target.value),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: newSlotTime,
							onChange: (e) => setNewSlotTime(e.target.value),
							className: "mt-1.5",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setSlotOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Add slot"
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { AdminTables as component };
