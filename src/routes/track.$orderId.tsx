import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock,
  Package,
  Truck,
  ChefHat,
  Phone,
  MessageCircle,
  Download,
  AlertCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cafeInfo, inr } from "@/lib/format";
import { downloadBill } from "@/lib/bill";
import { useAuth } from "@/lib/store/auth";
import { useOrders, type Order, type OrderStatus } from "@/lib/store/orders";
import { getOrderForTracking } from "@/lib/api/orders";
import { buildOrderWhatsAppUrl, WA_PENDING_KEY } from "@/lib/whatsapp";

export const Route = createFileRoute("/track/$orderId")({
  head: () => ({ meta: [{ title: "Track order — Aroma Cafe" }] }),
  validateSearch: (search: Record<string, unknown>): { wa?: number } => ({
    wa: search.wa === 1 || search.wa === "1" ? 1 : undefined,
  }),
  component: TrackPage,
});

type Stage = {
  key: OrderStatus;
  label: string;
  icon: typeof Check;
  description: string;
};

const stages: Stage[] = [
  {
    key: "Pending",
    label: "Order Placed",
    icon: Clock,
    description: "Waiting for restaurant to confirm your order.",
  },
  {
    key: "Confirmed",
    label: "Order Confirmed",
    icon: Check,
    description: "Restaurant has accepted your order.",
  },
  {
    key: "Preparing",
    label: "Being Prepared",
    icon: ChefHat,
    description: "Our chefs are preparing your meal.",
  },
  { key: "Ready", label: "Ready", icon: Package, description: "Your order is packed and ready." },
  {
    key: "Out for Delivery",
    label: "Out for Delivery",
    icon: Truck,
    description: "Your order is on its way!",
  },
  { key: "Delivered", label: "Delivered", icon: Check, description: "Enjoy your meal! 🎉" },
];

const statusIndex = (s: OrderStatus) => stages.findIndex((st) => st.key === s);

function TrackPage() {
  const { orderId } = Route.useParams();
  const { wa: waSearch } = Route.useSearch();
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const orders = useOrders((s) => s.orders);
  const listenToOrder = useOrders((s) => s.listenToOrder);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [trackError, setTrackError] = useState<string | null>(null);
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(() =>
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem(WA_PENDING_KEY(orderId)) : null,
  );

  const fetchGuestOrder = useCallback(
    async (phone: string) => {
      setTrackError(null);
      try {
        const res = await getOrderForTracking({ data: { orderId, phone } });
        setTrackedOrder(res.order as Order);
        setNeedsPhone(false);
      } catch (err) {
        setTrackedOrder(null);
        setTrackError(err instanceof Error ? err.message : "Could not load order.");
      } finally {
        setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!initialized) return;

    const ownedOrder = orders.find((o) => o.id === orderId);
    if (ownedOrder) {
      setTrackedOrder(ownedOrder);
      setLoading(false);
      setNeedsPhone(false);
      return;
    }

    const storedPhone = sessionStorage.getItem(`track-phone-${orderId}`);
    let resolved = false;
    let unsub: (() => void) | undefined;
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(
      () => {
        if (resolved) return;
        if (storedPhone) {
          void fetchGuestOrder(storedPhone);
          pollInterval = setInterval(() => void fetchGuestOrder(storedPhone), 30000);
        } else {
          setLoading(false);
          setNeedsPhone(true);
        }
      },
      user?.id ? 5000 : 0,
    );

    if (user?.id) {
      unsub = listenToOrder(orderId, (order) => {
        if (order?.userId === user.id) {
          resolved = true;
          clearTimeout(timeoutId);
          if (pollInterval) clearInterval(pollInterval);
          setTrackedOrder(order);
          setLoading(false);
          setNeedsPhone(false);
        } else if (order === null && storedPhone) {
          resolved = true;
          clearTimeout(timeoutId);
          void fetchGuestOrder(storedPhone);
        }
      });
    } else if (storedPhone) {
      clearTimeout(timeoutId);
      void fetchGuestOrder(storedPhone);
      pollInterval = setInterval(() => void fetchGuestOrder(storedPhone), 30000);
    } else {
      clearTimeout(timeoutId);
      setLoading(false);
      setNeedsPhone(true);
    }

    return () => {
      unsub?.();
      clearTimeout(timeoutId);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [initialized, orderId, user?.id, orders, listenToOrder, fetchGuestOrder]);

  useEffect(() => {
    if (!user?.id) return;
    const live = orders.find((o) => o.id === orderId);
    if (live) setTrackedOrder(live);
  }, [orders, orderId, user?.id]);

  const order = trackedOrder;

  const whatsAppUrl = useMemo(() => {
    if (pendingWaUrl) return pendingWaUrl;
    if (!order) return null;
    return buildOrderWhatsAppUrl({
      id: order.id,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      delivery: order.delivery,
      discount: order.discount,
      couponCode: order.couponCode,
      total: order.total,
      addr: order.addr,
      contact: order.contact,
      createdAt: order.createdAt,
      status: order.status,
    });
  }, [pendingWaUrl, order]);

  const showWhatsAppFallback = Boolean(whatsAppUrl && (waSearch === 1 || pendingWaUrl));

  if (!initialized || loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-32 px-4">
          <p className="text-muted-foreground">Loading order…</p>
        </div>
      </SiteLayout>
    );
  }

  if (needsPhone && !order) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md py-24 px-4">
          <h1 className="text-2xl font-display font-bold text-center">Verify your order</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Enter the phone number used when placing order #{orderId}.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void fetchGuestOrder(phoneInput.replace(/\D/g, ""));
            }}
          >
            <div>
              <Label>Phone number</Label>
              <Input
                className="mt-1.5"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            {trackError && <p className="text-sm text-destructive">{trackError}</p>}
            <Button type="submit" className="w-full">
              Track order
            </Button>
          </form>
        </div>
      </SiteLayout>
    );
  }

  if (!order) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-32 px-4">
          <AlertCircle className="size-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Order not found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {trackError ?? "Check the order ID and phone number, then try again."}
          </p>
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
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div
            className={`size-16 rounded-full grid place-items-center mx-auto ${isCancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
          >
            {isCancelled ? <AlertCircle className="size-8" /> : <Check className="size-8" />}
          </div>
          <h1 className="mt-4 text-2xl font-display font-bold">
            {isCancelled
              ? "Order Cancelled"
              : isDelivered
                ? "Order Delivered! 🎉"
                : "Order Placed!"}
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

        {showWhatsAppFallback && whatsAppUrl && order.status === "Pending" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-green-900">Confirm your order on WhatsApp</p>
              <p className="text-green-800 mt-0.5">
                Send the order details to our team so we can accept it.
              </p>
            </div>
            <a href={whatsAppUrl} target="_blank" rel="noreferrer">
              <Button className="w-full sm:w-auto shrink-0">
                <MessageCircle className="size-4 mr-2" /> Send order to WhatsApp
              </Button>
            </a>
          </div>
        )}

        {order.status === "Pending" && !showWhatsAppFallback && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 flex items-start gap-2">
            <Clock className="size-4 mt-0.5 shrink-0" />
            <p>
              Your order is waiting for the restaurant to confirm. Tracking will update
              automatically once accepted.
            </p>
          </div>
        )}

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
                      <span
                        className={`absolute left-[18px] top-9 bottom-0 w-px transition-colors ${done ? "bg-primary" : "bg-border"}`}
                      />
                    )}
                    <span
                      className={`relative grid place-items-center size-9 rounded-full shrink-0 transition-all ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      } ${active ? "ring-4 ring-primary/20 scale-110" : ""}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="pt-1">
                      <p className={`font-medium ${done ? "" : "text-muted-foreground"}`}>
                        {s.label}
                      </p>
                      {done && (
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <a href={`tel:${cafeInfo.phone}`}>
            <Button variant="outline" className="w-full">
              <Phone className="size-4 mr-2" /> Call restaurant
            </Button>
          </a>
          <a href={`https://wa.me/${cafeInfo.whatsapp}`} target="_blank" rel="noreferrer">
            <Button className="w-full">
              <MessageCircle className="size-4 mr-2" /> Chat on WhatsApp
            </Button>
          </a>
        </div>

        <div className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold">Order summary</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((i) => (
              <li key={i.id} className="py-2 flex justify-between text-sm">
                <span>
                  {i.qty} × {i.name}
                </span>
                <span>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{inr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST</span>
              <span>{inr(order.tax)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{order.delivery === 0 ? "FREE" : inr(order.delivery)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon ({order.couponCode})</span>
                <span>-{inr(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display font-bold text-base pt-1 border-t border-border mt-1">
              <span>Total</span>
              <span>{inr(order.total)}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Delivering to {order.addr.line1}, {order.addr.city} {order.addr.pin}
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => downloadBill(order as Parameters<typeof downloadBill>[0])}
          >
            <Download className="size-4 mr-2" /> Download bill
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
