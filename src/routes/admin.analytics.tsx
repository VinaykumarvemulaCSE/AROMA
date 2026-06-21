import { createFileRoute } from "@tanstack/react-router";
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
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Aroma Admin" }] }),
  component: Analytics,
});

const monthly = Array.from({ length: 12 }, (_, i) => ({
  m: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i],
  orders: 200 + Math.round(Math.random() * 400),
  revenue: 80000 + Math.round(Math.random() * 60000),
}));
const orderType = [
  { n: "Dine-in", v: 42 },
  { n: "Delivery", v: 38 },
  { n: "Takeaway", v: 20 },
];
const colors = ["var(--primary)", "var(--accent)", "var(--sage)"];

function Analytics() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-display font-bold">Analytics</h1>
      <p className="text-muted-foreground">
        Performance overview across orders, revenue and customers.
      </p>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Orders — last 12 months</h2>
          <div className="h-72 mt-3">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="m" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line dataKey="orders" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Revenue — last 12 months</h2>
          <div className="h-72 mt-3">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="m" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Order type split</h2>
          <div className="h-72 mt-3">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={orderType} dataKey="v" nameKey="n" innerRadius={50} outerRadius={90}>
                  {orderType.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-display font-semibold">Customer growth</h2>
          <div className="h-72 mt-3">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="m" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line dataKey="orders" stroke="var(--sage)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
