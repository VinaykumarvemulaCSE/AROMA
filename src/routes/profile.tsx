import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Star,
  Calendar,
} from "lucide-react";
import { signOutUser } from "@/lib/auth/session";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/store/auth";
import { useAddresses, type SavedAddress } from "@/lib/store/address";
import { useMenu } from "@/lib/store/menu";
import { useTables } from "@/lib/store/tables";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { MenuCard } from "@/components/menu/MenuCard";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My profile — Aroma Cafe" }] }),
  component: Profile,
});

const emptyAddr: Omit<SavedAddress, "id"> = {
  label: "Home",
  line1: "",
  line2: "",
  landmark: "",
  city: "Nalgonda",
  pin: "",
  phone: "",
  isDefault: false,
};

function Profile() {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const favs = useAuth((s) => s.favorites);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  const menu = useMenu((s) => s.menu);
  const { reservations } = useTables();

  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();
  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress, "id">>(emptyAddr);

  const [notif, setNotif] = useState({ email: true, sms: true, promo: false });

  if (!initialized) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md text-center py-24 px-4">
          <p className="text-muted-foreground">Loading…</p>
        </section>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md text-center py-24 px-4">
          <UserIcon className="size-12 mx-auto text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-display font-bold">Sign in to continue</h1>
          <p className="text-muted-foreground mt-2">
            Access your orders, reservations and favorites.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link to="/auth/login" search={{ redirect: "/profile" }}>
              <Button>Sign in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="outline">Create account</Button>
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const favItems = menu.filter((m) => favs.includes(m.id));
  const userReservations = reservations.filter(
    (r) => r.phone === user?.phone || r.email === user?.email,
  );

  const handleSignOut = async () => {
    await signOutUser();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  // Address dialog open helpers
  const openAdd = () => {
    setEditingAddr(null);
    setAddrForm(emptyAddr);
    setAddrOpen(true);
  };
  const openEdit = (a: SavedAddress) => {
    setEditingAddr(a);
    setAddrForm({
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      landmark: a.landmark,
      city: a.city,
      pin: a.pin,
      phone: a.phone,
      isDefault: a.isDefault,
    });
    setAddrOpen(true);
  };
  const handleSaveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.line1 || !addrForm.pin || !addrForm.phone) {
      toast.error("Please fill in Address line 1, Pincode, and Phone.");
      return;
    }
    if (editingAddr) {
      updateAddress(editingAddr.id, addrForm);
      toast.success("Address updated.");
    } else {
      addAddress(addrForm);
      toast.success("Address saved.");
    }
    setAddrOpen(false);
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} className="size-16 rounded-full object-cover" alt="avatar" />
          ) : (
            <div className="size-16 grid place-items-center rounded-full bg-primary text-primary-foreground font-display font-bold text-2xl">
              {user.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="info" className="mt-8">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="size-3.5 mr-1" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="reservations">
              <Calendar className="size-3.5 mr-1" />
              Reservations
            </TabsTrigger>
            <TabsTrigger value="favs">
              <Heart className="size-3.5 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="notif">
              <Bell className="size-3.5 mr-1" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* ── Info tab ── */}
          <TabsContent value="info" className="mt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setUser({
                  ...user,
                  name: String(fd.get("n") ?? user.name),
                  phone: String(fd.get("p") ?? ""),
                });
                toast.success("Saved");
              }}
              className="bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4 max-w-2xl"
            >
              <div>
                <Label>Name</Label>
                <Input name="n" defaultValue={user.name} className="mt-1.5" />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  defaultValue={user.email}
                  className="mt-1.5"
                  disabled
                  title="Email is managed by Firebase Auth"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Phone</Label>
                <Input name="p" defaultValue={user.phone} className="mt-1.5" placeholder="+91 …" />
              </div>
              <Button type="submit" className="sm:col-span-2 w-fit">
                Save changes
              </Button>
            </form>
          </TabsContent>

          {/* ── Addresses tab ── */}
          <TabsContent value="addresses" className="mt-6">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
                </p>
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-4 mr-1" /> Add address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <MapPin className="size-10 mx-auto text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No saved addresses yet.</p>
                  <Button className="mt-4" variant="outline" onClick={openAdd}>
                    Add new address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className={`bg-card border rounded-2xl p-4 flex items-start gap-3 transition-all ${a.isDefault ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
                    >
                      <MapPin
                        className={`size-5 mt-0.5 shrink-0 ${a.isDefault ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{a.label}</span>
                          {a.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {[
                            a.line1,
                            a.line2,
                            a.landmark && `Near ${a.landmark}`,
                            `${a.city} ${a.pin}`,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{a.phone}</p>
                        <div className="flex gap-2 mt-2">
                          {!a.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => {
                                setDefault(a.id);
                                toast.success("Default address updated.");
                              }}
                            >
                              <Star className="size-3 mr-1" /> Set default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="size-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => {
                              removeAddress(a.id);
                              toast.success("Address removed.");
                            }}
                          >
                            <Trash2 className="size-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Reservations tab ── */}
          <TabsContent value="reservations" className="mt-6">
            {userReservations.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-2xl">
                <Calendar className="size-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">No reservations yet.</p>
                <Link to="/reservations">
                  <Button className="mt-4">Make a reservation</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                {userReservations.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-card border rounded-2xl p-4 flex items-start gap-3 transition-all ${
                      r.status === "Confirmed"
                        ? "border-green-200 ring-1 ring-green-200/50"
                        : r.status === "Cancelled"
                          ? "border-destructive/20"
                          : "border-border"
                    }`}
                  >
                    <Calendar
                      className={`size-5 mt-0.5 shrink-0 ${
                        r.status === "Confirmed"
                          ? "text-green-600"
                          : r.status === "Cancelled"
                            ? "text-destructive"
                            : "text-accent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{r.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            r.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : r.status === "Pending"
                                ? "bg-blue-100 text-blue-700"
                                : r.status === "Cancelled"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        📅{" "}
                        {new Date(r.slotDatetime).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        🕐{" "}
                        {new Date(r.slotDatetime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        👥 {r.partySize} guest{r.partySize !== 1 ? "s" : ""}
                      </p>
                      {r.occasion && (
                        <p className="text-sm text-muted-foreground">🎉 {r.occasion}</p>
                      )}
                      {r.seat && <p className="text-sm text-muted-foreground">🪑 {r.seat}</p>}
                      {r.notes && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Favorites tab ── */}
          <TabsContent value="favs" className="mt-6">
            {favItems.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Heart className="size-10 mx-auto text-muted-foreground" />
                <p className="mt-3">No favorites yet.</p>
                <Link to="/menu">
                  <Button className="mt-4">Browse menu</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favItems.map((i) => (
                  <MenuCard key={i.id} item={i} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Notifications tab ── */}
          <TabsContent value="notif" className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 max-w-2xl">
              <Toggle
                label="Email updates"
                v={notif.email}
                on={(v) => setNotif({ ...notif, email: v })}
              />
              <Toggle
                label="SMS updates"
                v={notif.sms}
                on={(v) => setNotif({ ...notif, sms: v })}
              />
              <Toggle
                label="Promotional offers"
                v={notif.promo}
                on={(v) => setNotif({ ...notif, promo: v })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link to="/orders">
            <Button variant="outline">
              <ShoppingBag className="size-4 mr-2" />
              Order history
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Add / Edit address dialog ── */}
      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAddr ? "Edit address" : "Add new address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAddr} className="space-y-4 mt-2">
            <div>
              <Label>Label</Label>
              <RadioGroup
                value={addrForm.label}
                onValueChange={(v) => setAddrForm({ ...addrForm, label: v })}
                className="flex gap-4 mt-1.5"
              >
                {["Home", "Work", "Other"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value={t} /> {t}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>
                Address line 1 <span className="text-destructive">*</span>
              </Label>
              <AddressAutocomplete
                value={addrForm.line1}
                onChange={(raw, parsed) => {
                  if (parsed) {
                    setAddrForm((f) => ({
                      ...f,
                      line1: parsed.line1 || raw,
                      city: parsed.city || f.city,
                      pin: parsed.pin || f.pin,
                    }));
                  } else {
                    setAddrForm((f) => ({ ...f, line1: raw }));
                  }
                }}
                placeholder="House / flat, street…"
                className="mt-1.5"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Address line 2</Label>
                <Input
                  value={addrForm.line2}
                  onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                  className="mt-1.5"
                  placeholder="Area, colony"
                />
              </div>
              <div>
                <Label>Landmark</Label>
                <Input
                  value={addrForm.landmark}
                  onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                  className="mt-1.5"
                  placeholder="Near…"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={addrForm.pin}
                  onChange={(e) => setAddrForm({ ...addrForm, pin: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label>
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={addrForm.isDefault}
                onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                className="rounded border-border"
              />
              Set as default address
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setAddrOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingAddr ? "Save changes" : "Add address"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
