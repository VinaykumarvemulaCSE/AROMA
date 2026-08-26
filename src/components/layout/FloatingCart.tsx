"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { inr } from "@/lib/format";

export function FloatingCart() {
  const pathname = usePathname();
  const cartLines = useCart((s) => s.lines);
  const cartCount = cartLines.reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = cartLines.reduce((a, l) => a + l.price * l.qty, 0);

  // Do not show on cart or checkout pages, or if cart is empty
  if (pathname === "/cart" || pathname === "/checkout" || cartCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 inset-x-0 z-40 px-4 flex justify-center pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white px-6 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 animate-bounce"
      >
        <ShoppingBag className="size-4 animate-pulse" />
        <span className="text-sm font-semibold tracking-wide">
          {cartCount} {cartCount === 1 ? "item" : "items"} · {inr(cartSubtotal)}
        </span>
        <span className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-bold flex items-center gap-0.5 transition-colors">
          View Cart <ChevronRight className="size-3" />
        </span>
      </Link>
    </div>
  );
}
