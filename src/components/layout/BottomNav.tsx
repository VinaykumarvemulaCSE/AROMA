import { Link } from "@tanstack/react-router";
import { Home, UtensilsCrossed, CalendarClock, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/store/cart";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/reservations", label: "Reserve", icon: CalendarClock },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function BottomNav() {
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background border-t border-border">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className="flex flex-col items-center justify-center py-2 text-[11px] text-muted-foreground"
                activeProps={{ className: "!text-primary" }}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {it.to === "/cart" && count > 0 && (
                    <span className="absolute -top-1 -right-2 grid place-items-center size-4 text-[9px] font-bold rounded-full bg-accent text-accent-foreground">
                      {count}
                    </span>
                  )}
                </span>
                <span className="mt-0.5">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
