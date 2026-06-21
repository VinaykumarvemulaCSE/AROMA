import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CalendarClock,
  Users,
  BarChart3,
  Settings,
  UserCog,
  Tag,
  Star,
  LogOut,
  Menu as MenuIcon,
  X,
  TableProperties,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import { signOutUser } from "@/lib/auth/session";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarClock },
  { to: "/admin/tables", label: "Table Mgmt", icon: TableProperties },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/promotions", label: "Promotions", icon: Tag },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children?: ReactNode }) {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const orders = useOrders((s) => s.orders);
  const lastOrderTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!orders.length) return;
    
    // Find the latest order timestamp
    const latestTime = Math.max(...orders.map(o => o.createdAt));
    
    // If it's the first render (lastOrderTimeRef is 0), just set it and don't beep
    if (lastOrderTimeRef.current === 0) {
      lastOrderTimeRef.current = latestTime;
      return;
    }

    // If there's a newer order, beep
    if (latestTime > lastOrderTimeRef.current) {
      lastOrderTimeRef.current = latestTime;
      
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.error("Failed to play notification sound", e);
        }
      }
    }
  }, [orders, soundEnabled]);

  useEffect(() => {
    if (!initialized) return;
    if (!user || user.role !== "admin") {
      navigate({
        to: "/admin/login",
        search: { redirect: pathname },
        replace: true,
      });
    }
  }, [initialized, user, navigate]);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    navigate({ to: "/admin/login" });
  };

  if (!initialized) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {nav.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <Icon className="size-4" /> {n.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border sticky top-0 h-screen shrink-0">
        <Link to="/admin" className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <div className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-display font-bold">
            A
          </div>
          <div>
            <p className="font-display font-semibold leading-none">Aroma Admin</p>
            <p className="text-[10px] uppercase text-muted-foreground tracking-widest mt-0.5">
              Nalgonda
            </p>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm">
            <span className="flex items-center gap-3">
              Sound Alerts
            </span>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-card border-b border-border h-14 px-4 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setDrawer(true)} aria-label="Open menu">
            <MenuIcon className="size-5" />
          </button>
          <span className="font-display font-semibold">Aroma Admin</span>
        </header>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children ?? <Outlet />}
        </main>
      </div>

      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <span className="font-display font-semibold">Aroma Admin</span>
              <button onClick={() => setDrawer(false)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              <NavLinks onClick={() => setDrawer(false)} />
            </nav>
            <div className="p-3 border-t border-border space-y-2">
              <div className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm">
                <span className="flex items-center gap-3">
                  Sound Alerts
                </span>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
