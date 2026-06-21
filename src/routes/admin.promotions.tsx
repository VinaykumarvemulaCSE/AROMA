import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCoupons, type Coupon } from "@/lib/store/coupon";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Aroma Admin" }] }),
  component: Promotions,
});

const empty: Omit<Coupon, "used"> = {
  code: "",
  discountAmount: 0,
  minOrder: 0,
  maxUses: 0,
  status: "Active",
  description: "",
};

function Promotions() {
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useCoupons();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Omit<Coupon, "used">>(empty);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.code.trim()) return toast.error("Code is required.");
    if (coupons.find((c) => c.code === f.code.toUpperCase())) {
      return toast.error("A coupon with this code already exists.");
    }
    addCoupon({ ...f, code: f.code.toUpperCase(), used: 0 });
    toast.success(`Coupon ${f.code.toUpperCase()} created!`);
    setOpen(false);
    setF(empty);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create fixed-amount discount coupons. Customers enter the code at checkout.
          </p>
        </div>
        <Button
          onClick={() => {
            setF(empty);
            setOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" /> Create coupon
        </Button>
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["Code", "Discount", "Min Order", "Max Uses", "Used", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  <Tag className="size-8 mx-auto mb-2 opacity-30" />
                  No coupons yet. Create one to get started.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr
                key={c.code}
                className="border-t border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{inr(c.discountAmount)} off</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.minOrder > 0 ? `Min ${inr(c.minOrder)}` : "No minimum"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.maxUses === 0 ? "Unlimited" : c.maxUses}
                </td>
                <td className="px-4 py-3">{c.used}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      updateCoupon(c.code, {
                        status: c.status === "Active" ? "Paused" : "Active",
                      })
                    }
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {c.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      removeCoupon(c.code);
                      toast.success("Coupon removed.");
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

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label>
                Coupon code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={f.code}
                onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER50"
                className="mt-1.5 font-mono"
                required
              />
            </div>
            <div>
              <Label>
                Discount amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={f.discountAmount || ""}
                onChange={(e) => setF({ ...f, discountAmount: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 100"
                className="mt-1.5"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Fixed amount deducted from subtotal.
              </p>
            </div>
            <div>
              <Label>Minimum order amount (₹)</Label>
              <Input
                type="number"
                min={0}
                value={f.minOrder || ""}
                onChange={(e) => setF({ ...f, minOrder: parseInt(e.target.value) || 0 })}
                placeholder="0 = no minimum"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Max uses</Label>
              <Input
                type="number"
                min={0}
                value={f.maxUses || ""}
                onChange={(e) => setF({ ...f, maxUses: parseInt(e.target.value) || 0 })}
                placeholder="0 = unlimited"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Description (shown to customer)</Label>
              <Input
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                placeholder="e.g. ₹100 off on orders above ₹399"
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create coupon</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
