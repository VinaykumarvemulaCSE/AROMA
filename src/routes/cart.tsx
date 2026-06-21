import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Aroma Cafe" },
      { name: "description", content: "Review your order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 0 ? (subtotal >= 499 ? 0 : 40) : 0;
  const total = subtotal + tax + delivery;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 pb-32 lg:pb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Your cart</h1>
        {lines.length === 0 ? (
          <div className="mt-14 text-center bg-card border border-border rounded-2xl py-16 px-6">
            <ShoppingBag className="size-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-lg">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground">Add a few dishes to get started.</p>
            <Link to="/menu">
              <Button className="mt-5">Browse menu</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {lines.map((l) => (
                <div key={l.id} className="bg-card border border-border rounded-2xl p-3">
                  {/* Top row: image + name + delete */}
                  <div className="flex items-start gap-3">
                    <img
                      src={l.image}
                      alt={l.name}
                      className="size-16 sm:size-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{l.name}</p>
                      <p className="text-sm text-muted-foreground">{inr(l.price)} each</p>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-muted-foreground hover:text-destructive p-2 shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {/* Bottom row: qty + line total */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center border border-border rounded-full">
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        className="size-9 grid place-items-center"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.id, l.qty + 1)}
                        className="size-9 grid place-items-center"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display font-semibold">{inr(l.price * l.qty)}</span>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
                <Link to="/menu">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continue shopping
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={clear}
                  className="text-destructive w-full sm:w-auto"
                >
                  Clear cart
                </Button>
              </div>
            </div>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
              <h2 className="font-display font-semibold text-lg">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                <Row label="GST (5%)" value={inr(tax)} />
                <Row label="Delivery" value={delivery === 0 ? "FREE" : inr(delivery)} />
                {subtotal < 499 && (
                  <p className="text-xs text-muted-foreground">
                    Add {inr(499 - subtotal)} more for free delivery.
                  </p>
                )}
                <div className="border-t border-border pt-3 mt-3 flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span>{inr(total)}</span>
                </div>
              </dl>
              <Link to="/checkout">
                <Button size="lg" className="w-full mt-5">
                  Proceed to checkout
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Pay via WhatsApp after order confirmation
              </p>
            </aside>
          </div>
        )}
      </section>

      {/* Mobile sticky checkout bar */}
      {lines.length > 0 && (
        <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 px-4 pb-3">
          <div className="mx-auto max-w-md bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-display font-bold text-lg leading-none">{inr(total)}</p>
            </div>
            <Link to="/checkout" className="flex-1">
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
