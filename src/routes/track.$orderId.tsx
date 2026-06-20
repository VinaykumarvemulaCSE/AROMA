import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, Package, Truck, ChefHat, Phone, MessageCircle, Download, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { cafeInfo, inr } from "@/lib/format";
import { downloadBill } from "@/lib/bill";
import { useOrders, type Order, type OrderStatus } from "@/lib/store/orders";

export const Route = createFileRoute("/track/$orderId")({
  head: () => ({ meta: [{ title: "Track order — Aroma Cafe" }] }),
  component: TrackPage,
});

type Stage = {
  key: OrderStatus;
  label: string;
  icon: typeof Check;
  description: string;
};

const stages: Stage[] = [
  { key: "Pending",          label: "Order Placed",      icon: Clock,       description: "Waiting for restaurant to confirm your order." },
  { key: "Confirmed",        label: "Order Confirmed",   icon: Check,       description: "Restaurant has accepted your order." },
  { key: "Preparing",        label: "Being Prepared",    icon: ChefHat,     description: "Our chefs are preparing your meal." },
  { key: "Ready",            label: "Ready",             icon: Package,     description: "Your order is packed and ready." },
  { key: "Out for Delivery", label: "Out for Delivery",  icon: Truck,       description: "Your order is on its way!" },
  { key: "Delivered",        label: "Delivered",         icon: Check,       description: "Enjoy your meal! 🎉" },
];

const statusIndex = (s: OrderStatus) => stages.findIndex((st) => st.key === s);

function TrackPage() {
  const { orderId } = Route.useParams();
  const orders = useOrders((s) => s.orders);
  const listenToOrder = useOrders((s) => s.listenToOrder);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = listenToOrder(orderId, setTrackedOrder);
    return unsub;
  }, [orderId, listenToOrder]);

  const order = orders.find((o) => o.id === orderId) ?? trackedOrder;

  if (!order) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-32 px-4">
          <AlertCircle className="size-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Order not found</p>
          <p className="text-muted-foreground mt-1 text-sm">It may have been placed before the new tracking system.</p>
        </div>
      </SiteLayout>
    );
  }

  const currentStageIdx = statusIndex(order.status as OrderStatus);
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div className={`size-16 rounded-full grid place-items-center mx-auto ${isCancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            {isCancelled ? <AlertCircle className="size-8" /> : <Check className="size-8" />}
          </div>
          <h1 className="mt-4 text-2xl font-display font-bold">
            {isCancelled ? "Order Cancelled" : isDelivered ? "Order Delivered! 🎉" : "Order Placed!"}
          </h1>
          <p className="text-muted-foreground">
            Order <strong>#{order.id}</strong> · {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
          {!isDelivered && !isCancelled && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" /> ETA: 30–45 minutes
            </p>
          )}
        </div>

        {/* Status banner */}
        {order.status === "Pending" && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 flex items-start gap-2">
            <Clock className="size-4 mt-0.5 shrink-0" />
            <p>Your order is waiting for the restaurant to confirm. Tracking will update automatically once accepted.</p>
          </div>
        )}

        {/* Tracking timeline */}
        {!isCancelled && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-5">Tracking</h2>
            <ol className="relative">
              {stages.map((s, i) => {
                const done = i <= currentStageIdx;
                const active = i === currentStageIdx;
                const Icon = s.icon;
                return (
                  <li key={s.key} className="flex gap-4 pb-6 last:pb-0 relative">
                    {i < stages.length - 1 && (
                      <span className={`absolute left-[18px] top-9 bottom-0 w-px transition-colors ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                    <span className={`relative grid place-items-center size-9 rounded-full shrink-0 transition-all ${
                      done ? "bg-primary text-primary-foreground" :
                      "bg-secondary text-muted-foreground"
                    } ${active ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                      <Icon className="size-4" />
                    </span>
                    <div className="pt-1">
                      <p className={`font-medium ${done ? "" : "text-muted-foreground"}`}>{s.label}</p>
                      {done && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <a href={`tel:${cafeInfo.phone}`}>
            <Button variant="outline" className="w-full"><Phone className="size-4 mr-2" /> Call restaurant</Button>
          </a>
          <a href={`https://wa.me/${cafeInfo.whatsapp}`} target="_blank" rel="noreferrer">
            <Button className="w-full"><MessageCircle className="size-4 mr-2" /> Chat on WhatsApp</Button>
          </a>
        </div>

        {/* Order summary */}
        <div className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold">Order summary</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((i) => (
              <li key={i.id} className="py-2 flex justify-between text-sm">
                <span>{i.qty} × {i.name}</span><span>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST</span><span>{inr(order.tax)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{order.delivery === 0 ? "FREE" : inr(order.delivery)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon ({order.couponCode})</span><span>-{inr(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display font-bold text-base pt-1 border-t border-border mt-1">
              <span>Total</span><span>{inr(order.total)}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Delivering to {order.addr.line1}, {order.addr.city} {order.addr.pin}
          </p>
          <Button className="mt-4 w-full" onClick={() => downloadBill(order as any)}>
            <Download className="size-4 mr-2" /> Download bill
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
