"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, CalendarClock, Image, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/reservations", label: "Reserve", icon: CalendarClock },
  { to: "/gallery", label: "Gallery", icon: Image },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/checkout") return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                href={it.to}
                className={`flex flex-col items-center justify-center py-2 text-[11px] ${
                  pathname === it.to ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="mt-0.5">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
