"use client";

import Link from "next/link";
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Star,
  Printer,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useMenu } from "@/lib/store/menu";
import { useOrders } from "@/lib/store/orders";
import { useReviews } from "@/lib/store/reviews";
import { useMemo, useState } from "react";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { printCafeAuditReport } from "@/lib/print-invoice";

const CATEGORY_COLORS = [
  "#e11d48", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export default function AdminDashboard() {
  const menu = useMenu((s) => s.menu);
  const orders = useOrders((s) => s.orders);
  const reviews = useReviews((s) => s.reviews);

  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "30days" | "all">("7days");

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

  // --- Category Revenue Breakdown (Donut Chart) ---
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    periodOrders.forEach((o) => {
      if (o.status === "Cancelled") return;
      o.items.forEach((item) => {
        const menuItem = menu.find((m) => m.id === item.id);
        const cat = menuItem?.category || "Other";
        map[cat] = (map[cat] || 0) + item.price * item.qty;
      });
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [periodOrders, menu]);

  // --- Timeline Revenue Trend ---
  const timelineData = useMemo(() => {
    const daysCount = dateFilter === "today" ? 1 : dateFilter === "7days" ? 7 : 30;
    if (dateFilter === "today") {
      const hours: Record<number, { revenue: number; orders: number }> = {};
      periodOrders.forEach((o) => {
        const h = new Date(o.createdAt).getHours();
        if (!hours[h]) hours[h] = { revenue: 0, orders: 0 };
        hours[h].orders += 1;
        if (o.status !== "Cancelled") hours[h].revenue += o.total;
      });
      return Array.from({ length: 14 }, (_, i) => {
        const hr = i + 8;
        return {
          d: `${hr}:00`,
          revenue: hours[hr]?.revenue || 0,
          orders: hours[hr]?.orders || 0,
        };
      });
    }

    const days = Array.from({ length: daysCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysCount - 1 - i));
      return {
        label: d.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          weekday: daysCount <= 7 ? "short" : undefined,
        }),
        date: d.toDateString(),
        revenue: 0,
        orders: 0,
      };
    });

    periodOrders.forEach((o) => {
      const day = days.find((d) => d.date === new Date(o.createdAt).toDateString());
      if (day) {
        day.orders += 1;
        if (o.status !== "Cancelled") day.revenue += o.total;
      }
    });

    return days.map((d) => ({ d: d.label, revenue: d.revenue, orders: d.orders }));
  }, [periodOrders, dateFilter]);

  // --- Top Selling Items ---
  const topSellingDishes = useMemo(() => {
    const map: Record<string, { name: string; category: string; count: number; revenue: number }> =
      {};
    periodOrders.forEach((o) => {
      if (o.status === "Cancelled") return;
      o.items.forEach((item) => {
        if (!map[item.id]) {
          const menuItem = menu.find((m) => m.id === item.id);
          map[item.id] = {
            name: item.name,
            category: menuItem?.category || "Special",
            count: 0,
            revenue: 0,
          };
        }
        map[item.id].count += item.qty;
        map[item.id].revenue += item.price * item.qty;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [periodOrders, menu]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const handlePrintAudit = () => {
    const completedOrders = periodOrders.filter((o) => o.status !== "Cancelled");
    printCafeAuditReport({
      title: "Cafe Performance & Sales Audit",
      dateRange:
        dateFilter === "today"
          ? "Today"
          : dateFilter === "7days"
            ? "Last 7 Days"
            : dateFilter === "30days"
              ? "Last 30 Days"
              : "All Time",
      totalRevenue: periodRevenue,
      totalOrders: completedOrders.length,
      avgOrderValue: completedOrders.length ? Math.round(periodRevenue / completedOrders.length) : 0,
      topItems: topSellingDishes,
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard & Analytics</h1>
          <p className="text-muted-foreground">
            Real-time sales, order trends, and cafe performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <Button size="sm" onClick={handlePrintAudit}>
            <Printer className="size-4 mr-1.5" /> Print Audit PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<ShoppingBag className="text-primary" />}
          label="Total Orders"
          value={String(periodOrders.length)}
          trend={`${dateFilter === "today" ? "Today" : "Selected period"}`}
        />
        <Kpi
          icon={<IndianRupee className="text-green-600" />}
          label="Gross Revenue"
          value={inr(periodRevenue)}
          trend="Excl. cancelled"
        />
        <Kpi
          icon={<Users className="text-amber-500" />}
          label="Active Kitchen Orders"
          value={String(activeOrders)}
          trend="In preparation / transit"
        />
        <Kpi
          icon={<Star className="text-gold fill-gold" />}
          label="Customer Rating"
          value={String(avgRating)}
          trend={`${reviews.filter((r) => r.status === "approved").length} verified`}
        />
      </div>

      {/* Main Charts Row */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-display font-semibold text-lg">Sales & Revenue Trend</h2>
              <p className="text-xs text-muted-foreground">Revenue and completed order volume</p>
            </div>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === "revenue" ? inr(v) : v,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Donut Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="mb-2">
            <h2 className="font-display font-semibold text-lg">Category Sales</h2>
            <p className="text-xs text-muted-foreground">Revenue share by food/drink category</p>
          </div>

          <div className="h-72 mt-2">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => inr(v)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-foreground">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No category sales in this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Top Selling Dishes & Recent Orders */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Top Selling Dishes</h2>
              <p className="text-xs text-muted-foreground">Best-sellers in current period</p>
            </div>
            <Link href="/admin/menu" className="text-xs text-primary font-medium hover:underline">
              View Menu
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {topSellingDishes.map((m, i) => (
              <li key={m.name} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold size-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.category} · {m.count} sold
                    </p>
                  </div>
                </div>
                <span className="font-display font-bold text-sm shrink-0">{inr(m.revenue)}</span>
              </li>
            ))}
            {topSellingDishes.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No orders recorded for this period
              </li>
            )}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
              <p className="text-xs text-muted-foreground">Incoming & processed orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-primary font-medium hover:underline"
            >
              Manage Orders
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {recentOrders.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    #{o.id} · {o.contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.length} {o.items.length === 1 ? "item" : "items"} ·{" "}
                    {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary font-medium">
                    {o.status}
                  </span>
                  <span className="font-semibold text-sm">{inr(o.total)}</span>
                </div>
              </li>
            ))}
            {recentOrders.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">No orders yet</li>
            )}
          </ul>
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
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="p-2 rounded-xl bg-secondary/50">{icon}</div>
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-display font-bold text-foreground">{value}</p>
      {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
    </div>
  );
}
