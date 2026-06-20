import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrders } from "@/lib/store/orders";
import { inr } from "@/lib/format";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Aroma Admin" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const orders = useOrders((s) => s.orders);

  // Derive unique customers by grouping orders on email (fallback to phone)
  const customers = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email: string;
      phone: string;
      orders: number;
      spent: number;
      last: string;
    }>();

    orders.forEach((o) => {
      const key = o.contact.email || o.contact.phone;
      if (!key) return;
      if (map.has(key)) {
        const c = map.get(key)!;
        c.orders += 1;
        c.spent += o.total;
        if (new Date(o.createdAt) > new Date(c.last)) {
          c.last = new Date(o.createdAt).toLocaleDateString("en-IN");
        }
      } else {
        map.set(key, {
          name: o.contact.name,
          email: o.contact.email || "—",
          phone: o.contact.phone,
          orders: 1,
          spent: o.total,
          last: new Date(o.createdAt).toLocaleDateString("en-IN"),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  return (
    <AdminLayout>
      <h1 className="text-2xl sm:text-3xl font-display font-bold">Customers</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {customers.length} unique customer{customers.length !== 1 ? "s" : ""} derived from your order history.
      </p>
      <div className="mt-6 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>{["Customer", "Email", "Phone", "Orders", "Lifetime spend", "Last order"].map((h) => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-semibold">{inr(c.spent)}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.last}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No customers yet. They will appear here once orders are placed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
