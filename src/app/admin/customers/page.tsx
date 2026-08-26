"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrders } from "@/lib/store/orders";
import { inr } from "@/lib/format";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Users } from "lucide-react";
import { exportCustomersToCSV, type CustomerRecord } from "@/lib/export";
import { toast } from "sonner";

export default function AdminCustomers() {
  const orders = useOrders((s) => s.orders);
  const [q, setQ] = useState("");

  // Derive unique customers by grouping orders on email (fallback to phone)
  const customers = useMemo(() => {
    const map = new Map<string, CustomerRecord>();

    orders.forEach((o) => {
      const key = o.contact.email || o.contact.phone;
      if (!key) return;
      if (map.has(key)) {
        const c = map.get(key)!;
        c.totalOrders += 1;
        c.totalSpent += o.total;
        if (o.createdAt > (c.lastOrderDate || 0)) {
          c.lastOrderDate = o.createdAt;
        }
      } else {
        map.set(key, {
          id: key,
          name: o.contact.name,
          email: o.contact.email || "",
          phone: o.contact.phone,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q.toLowerCase())),
    );
  }, [customers, q]);

  const handleExport = () => {
    exportCustomersToCSV(filtered, "aroma_customers_list");
    toast.success(`Exported ${filtered.length} customers to CSV`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Customers Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers.length} unique customer{customers.length !== 1 ? "s" : ""} from order history
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={customers.length === 0}>
          <Download className="size-4 mr-1.5" /> Export Customers CSV
        </Button>
      </div>

      <div className="mt-5 flex items-center bg-card rounded-md border border-border px-3 w-full sm:w-72">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, phone, email..."
          className="border-0 focus-visible:ring-0"
        />
      </div>

      <div className="mt-5 bg-card border border-border rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["Customer", "Email", "Phone", "Orders", "Lifetime Spend", "Last Order"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-t border-border hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                <td className="px-4 py-3 font-medium">{c.totalOrders}</td>
                <td className="px-4 py-3 font-semibold text-primary">{inr(c.totalSpent)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-IN") : "Never"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
