import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, CalendarClock, Users, Settings2, PlusCircle, XCircle } from "lucide-react";
import { useTables, type TableConfig } from "@/lib/store/tables";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tables")({
  head: () => ({ meta: [{ title: "Table Management — Aroma Admin" }] }),
  component: AdminTables,
});

function AdminTables() {
  const { tables, reservations, addTableConfig, updateTableConfig, removeTableConfig, addSlot, removeSlot, updateReservationStatus } = useTables();

  const [tableOpen, setTableOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("12:00");
  const [newTable, setNewTable] = useState({ size: 2, totalTables: 1 });

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    addTableConfig({ size: newTable.size, totalTables: newTable.totalTables, slots: [] });
    toast.success(`${newTable.size}-seater table config added.`);
    setTableOpen(false);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !newSlotDate || !newSlotTime) return;
    const datetime = `${newSlotDate}T${newSlotTime}`;
    addSlot(selectedTable.id, datetime);
    toast.success("Slot added.");
    setNewSlotDate("");
  };

  const pendingReservations = reservations.filter((r) => r.status === "Pending");
  const confirmedReservations = reservations.filter((r) => r.status === "Confirmed");

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Table Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure table sizes, capacity, and available booking slots.
          </p>
        </div>
        <Button onClick={() => setTableOpen(true)}>
          <Plus className="size-4 mr-2" /> Add table type
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {[
          { label: "Table types", value: tables.length, icon: Settings2 },
          { label: "Pending bookings", value: pendingReservations.length, icon: CalendarClock },
          { label: "Confirmed today", value: confirmedReservations.length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
              <Icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table configs */}
      <h2 className="mt-8 font-display font-semibold text-lg">Table Configurations</h2>
      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.length === 0 && (
          <div className="col-span-3 bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
            No table configurations yet. Add a table type to get started.
          </div>
        )}
        {tables.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">{t.size}-seater</p>
                  <p className="text-xs text-muted-foreground">{t.totalTables} table{t.totalTables !== 1 ? "s" : ""} total</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => { removeTableConfig(t.id); toast.success("Table config removed."); }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>

            {/* Slots */}
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Available slots ({t.slots.filter((s) => s.available).length})
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {t.slots
                  .sort((a, b) => a.datetime.localeCompare(b.datetime))
                  .map((sl) => (
                    <div
                      key={sl.datetime}
                      className="flex items-center gap-1 text-xs bg-secondary rounded-lg px-2 py-1"
                    >
                      <span>{new Date(sl.datetime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                      <button onClick={() => { removeSlot(t.id, sl.datetime); toast.success("Slot removed."); }}>
                        <XCircle className="size-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                {t.slots.length === 0 && (
                  <p className="text-xs text-muted-foreground">No slots yet.</p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full text-xs"
                onClick={() => { setSelectedTable(t); setSlotOpen(true); }}
              >
                <PlusCircle className="size-3 mr-1" /> Add slot
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Reservations */}
      <h2 className="mt-10 font-display font-semibold text-lg">
        Customer Reservations
        {pendingReservations.length > 0 && (
          <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {pendingReservations.length} pending
          </span>
        )}
      </h2>
      <div className="mt-3 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["ID", "Name", "Phone", "Date & Time", "Party", "Occasion", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No reservations yet.
                </td>
              </tr>
            )}
            {reservations.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">#{r.id}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                <td className="px-4 py-3 text-xs">
                  {new Date(r.slotDatetime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3">{r.partySize}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.occasion || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    r.status === "Confirmed" ? "bg-green-100 text-green-700"
                    : r.status === "Pending" ? "bg-amber-100 text-amber-700"
                    : r.status === "Cancelled" ? "bg-red-100 text-red-700"
                    : "bg-secondary text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.status === "Pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => { updateReservationStatus(r.id, "Confirmed"); toast.success("Reservation confirmed."); }}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => { updateReservationStatus(r.id, "Cancelled"); toast.success("Reservation cancelled."); }}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add table dialog */}
      <Dialog open={tableOpen} onOpenChange={setTableOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add table type</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTable} className="space-y-4 mt-2">
            <div>
              <Label>Seats per table</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={newTable.size}
                onChange={(e) => setNewTable({ ...newTable, size: parseInt(e.target.value) || 2 })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Number of tables of this size</Label>
              <Input
                type="number"
                min={1}
                value={newTable.totalTables}
                onChange={(e) => setNewTable({ ...newTable, totalTables: parseInt(e.target.value) || 1 })}
                className="mt-1.5"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setTableOpen(false)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add slot dialog */}
      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add slot — {selectedTable?.size}-seater</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSlot} className="space-y-4 mt-2">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newSlotDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSlotOpen(false)}>Cancel</Button>
              <Button type="submit">Add slot</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
