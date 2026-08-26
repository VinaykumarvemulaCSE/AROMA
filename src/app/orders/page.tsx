"use client";

import Link from "next/link";
import { ShoppingBag, Download } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { downloadBill } from "@/lib/bill";
import { printOrderInvoice } from "@/lib/print-invoice";
import { useAuth } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import { useSettings } from "@/lib/store/settings";
import { haptic } from "@/lib/haptics";
import { Printer } from "lucide-react";

export default function Orders() {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const orders = useOrders((s) => s.orders);
  const settings = useSettings((s) => s.settings);

  if (!initialized) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted-foreground">Loading…</p>
        </section>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md text-center py-24 px-4">
          <ShoppingBag className="size-12 mx-auto text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-display font-bold">Sign in to view orders</h1>
          <p className="text-muted-foreground mt-2">
            Your order history is linked to your account.
          </p>
          <Link href="/auth/login?redirect=/orders" className="inline-block mt-6">
            <Button>Sign in</Button>
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const myOrders = orders.filter((o) => o.userId === user.id);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold">Your orders</h1>
        {myOrders.length === 0 ? (
          <div className="mt-10 bg-card border border-border rounded-2xl p-12 text-center">
            <ShoppingBag className="size-12 mx-auto text-muted-foreground" />
            <p className="mt-4">No orders yet.</p>
            <Link href="/menu">
              <Button className="mt-4">Start ordering</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {myOrders.map((o) => (
              <div
                key={o.id}
                className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-[60%]">
                  <p className="font-semibold">
                    #{o.id}{" "}
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      {new Date(o.createdAt).toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {o.items.length} items ·{" "}
                    {o.items
                      .slice(0, 2)
                      .map((i) => i.name)
                      .join(", ")}
                    {o.items.length > 2 && "…"}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary">{o.status}</span>
                <span className="font-display font-bold">{inr(o.total)}</span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      haptic("light");
                      printOrderInvoice(o, settings);
                    }}
                    title="Print or Save as PDF"
                  >
                    <Printer className="size-4 mr-1.5" />
                    Invoice
                  </Button>
                  <Link href={`/track/${o.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
