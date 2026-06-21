import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, IndianRupee, Users, Star, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useMenu } from "@/lib/store/menu";
import { useOrders } from "@/lib/store/orders";
import { useReviews } from "@/lib/store/reviews";
import { useMemo, useState } from "react";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Aroma Admin" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const menu = useMenu((s) => s.menu);
  const orders = useOrders((s) => s.orders);
  const reviews = useReviews((s) => s.reviews);

  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "30days" | "all">("today");

  const periodOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (dateFilter === "today") return d.toDateString() === now.toDateString();
      if (dateFilter === "7days") return now.getTime() - d.getTime() <= 7 * 24 * 3600 * 1000;
      if (dateFilter === "30days") return now.getTime() - d.getTime() <= 30 * 24 * 3600 * 1000;
      return true;
    });
  }, [orders, dateFilter]);

  const periodRevenue = useMemo(
    () =>
      periodOrders.reduce(
        (sum, o) => (!["Cancelled"].includes(o.status) ? sum + o.total : sum),
        0,
      ),
    [periodOrders],
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length,
    [orders],
  );
  const avgRating = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved");
    if (!approved.length) return "—";
    const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
    return avg.toFixed(1);
  }, [reviews]);

  // --- Charts ---
  // Build last 7 days revenue chart from real orders
  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: d.toDateString(),
        revenue: 0,
      };
    });
    orders.forEach((o) => {
      const day = days.find((d) => d.date === new Date(o.createdAt).toDateString());
      if (day && !["Cancelled"].includes(o.status)) day.revenue += o.total;
    });
    return days.map((d) => ({ d: d.label, revenue: d.revenue }));
  }, [orders]);

  // Hourly orders for period (rough distribution, most useful for "today")
  const hourly = useMemo(() => {
    const hours: Record<number, number> = {};
    periodOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      hours[h] = (hours[h] || 0) + 1;
    });
    return Array.from({ length: 12 }, (_, i) => ({
      h: `${(i + 9) % 24}:00`,
      orders: hours[i + 9] || 0,
    }));
  }, [periodOrders]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const latestReviews = useMemo(
    () => reviews.filter((r) => r.status === "approved").slice(0, 3),
    [reviews],
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's how Aroma is doing.</p>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as any)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<ShoppingBag />}
          label="Orders (Period)"
          value={String(periodOrders.length)}
          trend=""
        />
        <Kpi icon={<IndianRupee />} label="Revenue (Period)" value={inr(periodRevenue)} trend="" />
        <Kpi icon={<Users />} label="Active orders" value={String(activeOrders)} trend="" />
        <Kpi icon={<Star />} label="Avg rating" value={String(avgRating)} trend="" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display font-semibold">Revenue this week</h2>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Orders by hour (Period)</h2>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={hourly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="h" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Top menu items</h2>
          <ul className="mt-4 divide-y divide-border">
            {menu.slice(0, 5).map((m, i) => (
              <li key={m.id} className="py-3 flex items-center gap-3">
                <span className="text-sm font-bold w-5 text-muted-foreground">{i + 1}</span>
                <img src={m.image} className="size-10 rounded object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                </div>
                <span className="font-semibold">{inr(m.price)}</span>
              </li>
            ))}
            {menu.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No menu items yet</li>
            )}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentOrders.map((o) => (
              <li key={o.id} className="py-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    #{o.id} · {o.contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{o.items.length} items</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary">{o.status}</span>
                <span className="font-semibold w-20 text-right">{inr(o.total)}</span>
              </li>
            ))}
            {recentOrders.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No orders yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Latest approved reviews</h2>
          <Link to="/admin/reviews" className="text-xs text-primary hover:underline">
            Manage reviews
          </Link>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {latestReviews.map((r) => (
            <div key={r.id} className="bg-secondary/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.name}</span>
                <span className="text-xs flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3 fill-gold text-gold" />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.body}</p>
            </div>
          ))}
          {latestReviews.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-3 py-4 text-center">
              No approved reviews yet
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Kpi({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="size-9 grid place-items-center rounded-lg bg-secondary text-primary">
          {icon}
        </div>
        {trend && (
          <span className="text-xs flex items-center gap-0.5 text-sage font-medium">
            <TrendingUp className="size-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
