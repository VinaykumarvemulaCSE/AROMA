"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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
  Save,
  Loader2,
  Download,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { signOutUser } from "@/lib/auth/session";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extract10DigitPhone } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/store/auth";
import { useAddresses, type SavedAddress } from "@/lib/store/address";
import { useMenu } from "@/lib/store/menu";
import { useTables } from "@/lib/store/tables";
import { useOrders } from "@/lib/store/orders";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { inr } from "@/lib/format";
import { downloadBill } from "@/lib/bill";
import { MenuCard } from "@/components/menu/MenuCard";
import { toast } from "sonner";
import { saveUserProfile, loadUserProfile, listenToUserProfile } from "@/lib/store/profile";

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

export default function Profile() {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const favs = useAuth((s) => s.favorites);
  const router = useRouter();
  const menu = useMenu((s) => s.menu);
  const { reservations } = useTables();
  const orders = useOrders((s) => s.orders);
  const reorderCart = useCart((s) => s.reorder);

  // Redirect unauthenticated or unverified email/password users
  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push("/auth/login?redirect=/profile");
      return;
    }
    // Google/OAuth users are verified; only gate password signups without verification
    if (!user.emailVerified && user.role === "customer") {
      router.push("/auth/verify-email");
    }
  }, [initialized, user, router]);

  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();
  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress, "id">>(emptyAddr);

  // Profile form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Notification preferences
  const [notif, setNotif] = useState({ email: true, sms: true, promo: false });

  // Load profile from Firestore on mount
  useEffect(() => {
    if (!user?.id) return;

    const unsub = listenToUserProfile(user.id, (profile) => {
      setProfileName(profile.name || user.name);
      setProfilePhone(extract10DigitPhone(profile.phone || user.phone));
      setNotif(profile.notifications);
    });

    // Also load once initially (in case snapshot is slow)
    loadUserProfile(user.id).then((profile) => {
      if (profile) {
        setProfileName(profile.name || user.name);
        setProfilePhone(profile.phone || user.phone || "");
        setNotif(profile.notifications);
      } else {
        setProfileName(user.name);
        setProfilePhone(user.phone || "");
      }
    });

    return unsub;
  }, [user?.id, user?.name, user?.phone]);

  const handleSaveProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSaving(true);
      try {
        await saveUserProfile(user.id, {
          name: profileName,
          phone: profilePhone,
          email: user.email,
          notifications: notif,
        });
        toast.success("Profile saved to your account!");
      } catch (err) {
        toast.error("Failed to save profile. Please try again.");
        console.error(err);
      } finally {
        setSaving(false);
      }
    },
    [user, profileName, profilePhone, notif],
  );

  const handleNotifChange = useCallback(
    async (key: "email" | "sms" | "promo", value: boolean) => {
      const updated = { ...notif, [key]: value };
      setNotif(updated);
      if (user) {
        try {
          await saveUserProfile(user.id, { notifications: updated });
          toast.success("Notification preference saved.");
        } catch {
          toast.error("Failed to save preference.");
        }
      }
    },
    [user, notif],
  );

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
            <Link href="/auth/login?redirect=/profile">
              <Button>Sign in</Button>
            </Link>
            <Link href="/auth/signup">
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
  const userOrders = orders.filter((o) => o.userId === user?.id);

  const handleSignOut = async () => {
    await signOutUser();
    toast.success("Signed out");
    router.push("/");
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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-32 md:py-12 md:pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {user.avatar ? (
            <div className="relative size-16 rounded-full overflow-hidden shrink-0">
              <Image src={user.avatar} fill sizes="64px" className="object-cover" alt="avatar" />
            </div>
          ) : (
            <div className="size-16 grid place-items-center rounded-full bg-primary text-primary-foreground font-display font-bold text-2xl">
              {user.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="sm:flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold truncate">{profileName || user.name}</h1>
            <p className="text-muted-foreground text-sm truncate">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="mt-2 w-full sm:w-auto sm:mt-0">
            <LogOut className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>

        <Tabs defaultValue="info" className="mt-6 sm:mt-8">
          <div className="w-full overflow-x-auto pb-1 scrollbar-none px-2 sm:px-0">
            <TabsList className="inline-flex w-full justify-start h-auto p-1.5 border gap-1 select-none bg-muted/60 rounded-xl flex-wrap">
              <TabsTrigger value="info" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                Info
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                <ShoppingBag className="size-3.5 mr-1.5" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                <MapPin className="size-3.5 mr-1.5" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="reservations" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                <Calendar className="size-3.5 mr-1.5" />
                Reservations
              </TabsTrigger>
              <TabsTrigger value="favs" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                <Heart className="size-3.5 mr-1.5" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="notif" className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0">
                <Bell className="size-3.5 mr-1.5" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Info tab ── */}
          <TabsContent value="info" className="mt-6">
            <form
              onSubmit={handleSaveProfile}
              className="bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4 max-w-2xl"
            >
              <div>
                <Label>Name</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="mt-1.5"
                />
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
                <Input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1.5"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                />
              </div>
              <Button type="submit" className="sm:col-span-2 w-fit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" /> Save changes
                  </>
                )}
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

          {/* ── Orders tab ── */}
          <TabsContent value="orders" className="mt-6">
            <div className="max-w-2xl">
              {userOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <ShoppingBag className="size-10 mx-auto text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No orders yet.</p>
                  <Link href="/menu">
                    <Button className="mt-4" variant="outline">
                      Browse menu
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">#{o.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(o.createdAt).toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {o.items.length} items · {o.items.map((i) => i.name).join(", ")}
                        </p>
                        <p className="font-display font-semibold mt-1">{inr(o.total)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => {
                            reorderCart(
                              o.items.map((i) => ({
                                id: i.id,
                                name: i.name,
                                price: i.price,
                                image:
                                  i.image ||
                                  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
                                qty: i.qty || 1,
                              })),
                            );
                            toast.success("Items added to your cart!");
                            router.push("/cart");
                          }}
                        >
                          <RotateCcw className="size-3 mr-1" /> Reorder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => downloadBill(o)}
                        >
                          <Download className="size-3 mr-1" /> Bill
                        </Button>
                        <Link href={`/track/${o.id}`}>
                          <Button size="sm" className="h-8 text-xs">
                            Track
                          </Button>
                        </Link>
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
                <Link href="/reservations">
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
                <Link href="/menu">
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
              <p className="text-sm text-muted-foreground mb-2">
                Your notification preferences are saved to your account.
              </p>
              <Toggle
                label="Email updates"
                v={notif.email}
                on={(v) => handleNotifChange("email", v)}
              />
              <Toggle label="SMS updates" v={notif.sms} on={(v) => handleNotifChange("sms", v)} />
              <Toggle
                label="Promotional offers"
                v={notif.promo}
                on={(v) => handleNotifChange("promo", v)}
              />
            </div>
          </TabsContent>
        </Tabs>
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
                  onChange={(e) =>
                    setAddrForm({
                      ...addrForm,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="mt-1.5"
                  maxLength={10}
                  placeholder="10-digit mobile number"
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
