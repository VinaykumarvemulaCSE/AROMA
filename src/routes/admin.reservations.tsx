import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Users, Check, X, Clock } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTables, type Reservation } from "@/lib/store/tables";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Aroma Admin" }] }),
  component: AdminRes,
});

const statusColor: Record<Reservation["status"], string> = {
  Pending:   "bg-amber-100 text-amber-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
};

function AdminRes() {
  const { reservations, updateReservationStatus } = useTables();
  const [view, setView] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<"All" | Reservation["status"]>("All");

  const list = filter === "All" ? reservations : reservations.filter((r) => r.status === filter);

  const setStatus = (id: string, s: Reservation["status"]) => {
    updateReservationStatus(id, s);
    if (view?.id === id) setView((v) => (v ? { ...v, status: s } : v));
    toast.success(`Reservation ${id} → ${s}`);
  };

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = reservations.filter((r) => r.slotDatetime.startsWith(today)).length;
  const pendingCount = reservations.filter((r) => r.status === "Pending").length;
  const confirmedCount = reservations.filter((r) => r.status === "Confirmed").length;
  const thisWeek = reservations.filter((r) => {
    const d = new Date(r.slotDatetime);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / 86400000;
    return diff >= -1 && diff <= 7;
  }).length;

  return (
    <AdminLayout>
      <h1 className="text-2xl sm:text-3xl font-display font-bold">Reservations</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Today's bookings", v: todayCount, icon: CalendarClock },
          { l: "This week", v: thisWeek, icon: Users },
          { l: "Pending confirmation", v: pendingCount, icon: Clock },
          { l: "Confirmed", v: confirmedCount, icon: Check },
        ].map((c) => (
          <div key={c.l} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 grid place-items-center shrink-0">
              <c.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{c.v}</p>
              <p className="text-xs text-muted-foreground">{c.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
              filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
            }`}
          >
            {s}
            {s === "Pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["ID", "Guest", "Phone", "Date & Time", "Party", "Occasion", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No reservations yet. They will appear here as customers book tables.
                </td>
              </tr>
            )}
            {list.map((r) => (
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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {r.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => setStatus(r.id, "Confirmed")}
                        >
                          <Check className="size-3" /> Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                          onClick={() => setStatus(r.id, "Cancelled")}
                        >
                          <X className="size-3" /> Cancel
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setView(r)}>
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reservation #{view?.id}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Guest</p>
                  <p className="font-medium">{view.name}</p>
                  <p>{view.phone}</p>
                  {view.email && <p className="text-muted-foreground">{view.email}</p>}
                </div>
                <div className="bg-secondary/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Booking details</p>
                  <p className="font-medium">{new Date(view.slotDatetime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  <p>{view.partySize} guests</p>
                  {view.occasion && <p className="text-muted-foreground">{view.occasion}</p>}
                </div>
              </div>

              {view.notes && (
                <div className="bg-secondary/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Special requests</p>
                  <p>{view.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2">Update status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["Confirmed", "Completed", "Cancelled"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={view.status === s ? "default" : "outline"}
                      onClick={() => setStatus(view.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
