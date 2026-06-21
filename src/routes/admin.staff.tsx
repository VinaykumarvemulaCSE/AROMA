import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Aroma Admin" }] }),
  component: Staff,
});

type S = { name: string; role: string; email: string; phone: string; active: boolean };

function Staff() {
  const [rows, setRows] = useState<S[]>([
    {
      name: "Ramesh Kumar",
      role: "Owner",
      email: "owner@aroma.in",
      phone: "+91 80195 51015",
      active: true,
    },
    {
      name: "Lakshmi N.",
      role: "Manager",
      email: "mgr@aroma.in",
      phone: "+91 80195 51015",
      active: true,
    },
    {
      name: "Chef Suresh",
      role: "Chef",
      email: "chef@aroma.in",
      phone: "+91 80195 51015",
      active: true,
    },
    {
      name: "Anil Reddy",
      role: "Waiter",
      email: "anil@aroma.in",
      phone: "+91 80195 51015",
      active: true,
    },
  ]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<S>({ name: "", role: "Waiter", email: "", phone: "", active: true });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Staff</h1>
        <Button
          onClick={() => {
            setF({ name: "", role: "Waiter", email: "", phone: "", active: true });
            setOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" /> Add staff
        </Button>
      </div>
      <div className="mt-6 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["Name", "Role", "Email", "Phone", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.email} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      setRows((a) =>
                        a.map((x) => (x.email === s.email ? { ...x, active: !x.active } : x)),
                      )
                    }
                    className={`text-xs px-2 py-1 rounded-full ${s.active ? "bg-sage/20 text-sage" : "bg-secondary"}`}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setRows((a) => a.filter((x) => x.email !== s.email));
                      toast.success("Removed");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add staff member</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!f.name || !f.email) return;
              setRows((a) => [f, ...a]);
              toast.success("Added");
              setOpen(false);
            }}
            className="space-y-3"
          >
            <div>
              <Label>Name</Label>
              <Input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <select
                  value={f.role}
                  onChange={(e) => setF({ ...f, role: e.target.value })}
                  className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
                >
                  {["Owner", "Manager", "Chef", "Waiter", "Delivery"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={f.phone}
                  onChange={(e) => setF({ ...f, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
