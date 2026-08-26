"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu as MenuIcon, Search, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/lib/store/auth";
import { useSettings } from "@/lib/store/settings";
import { getCafeInfo } from "@/lib/format";
import { Button } from "@/components/ui/button";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reserve" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const user = useAuth((s) => s.user);
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const info = getCafeInfo(settings);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
              <div className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-display font-bold shrink-0">
                {info.logoLetters || "A"}
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-display font-semibold text-base truncate">
                  {info.name.split(" ")[0]}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                  Cafe · {info.locationName || "Nalgonda"}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  href={l.to}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === l.to
                      ? "text-foreground !font-semibold"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <a href={`tel:${info.phone}`} className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon">
                  <Phone className="size-4" />
                </Button>
              </a>
              <Link href="/menu">
                <Button variant="ghost" size="icon">
                  <Search className="size-4" />
                </Button>
              </Link>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="size-4" />
                </Button>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid place-items-center size-4 text-[10px] font-bold rounded-full bg-accent text-accent-foreground">
                    {count}
                  </span>
                )}
              </Link>
              <Link href={user ? "/profile" : "/auth/login"}>
                <Button variant="ghost" size="icon">
                  <User className="size-4" />
                </Button>
              </Link>
              <button
                className="md:hidden p-2"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer rendered as sibling of header to escape backdrop-blur containing block */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-1.5 bg-secondary/80 hover:bg-secondary border border-border shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary ${
                    pathname === l.to ? "bg-secondary" : ""
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className={`px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary ${
                  pathname === "/cart" ? "bg-secondary" : ""
                }`}
              >
                Cart{count > 0 ? ` (${count})` : ""}
              </Link>
              <Link
                href={user ? "/profile" : "/auth/login"}
                onClick={() => setOpen(false)}
                className={`px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary ${
                  pathname === "/profile" || pathname === "/auth/login" ? "bg-secondary" : ""
                }`}
              >
                {user ? "My account" : "Sign in"}
              </Link>
              <a
                href={`tel:${info.phone}`}
                className="px-3 py-3 rounded-lg text-base font-medium hover:bg-secondary"
              >
                Call {info.phone}
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
