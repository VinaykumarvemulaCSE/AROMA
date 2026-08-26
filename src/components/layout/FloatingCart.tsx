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

  // Hide on pages where user is interacting with accounts, orders, checkout, or admin
  const isHidden =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/profile" ||
    pathname === "/orders" ||
    pathname.startsWith("/track") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin");

  if (isHidden || cartCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-16 md:bottom-8 inset-x-0 z-30 px-4 flex justify-center pointer-events-none transition-all duration-300">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white px-5 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-sm"
      >
        <div className="relative flex items-center justify-center">
          <ShoppingBag className="size-4" />
          <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-extrabold size-4 rounded-full flex items-center justify-center shadow-sm">
            {cartCount}
          </span>
        </div>
        <span className="text-sm font-semibold tracking-wide">
          {inr(cartSubtotal)}
        </span>
        <span className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-0.5 transition-colors">
          View Cart <ChevronRight className="size-3" />
        </span>
      </Link>
    </div>
  );
}
