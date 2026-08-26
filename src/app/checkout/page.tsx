"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Tag,
  X,
  MapPin,
  Home as HomeIcon,
  Briefcase as WorkIcon,
  HelpCircle,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/store/cart";
import { useAddresses } from "@/lib/store/address";
import { useAuth } from "@/lib/store/auth";
import { useSettings } from "@/lib/store/settings";
import { useCoupons } from "@/lib/store/coupon";
import { auth } from "@/lib/firebase";
import { createOrder } from "@/lib/api/orders";
import { validateCouponCode } from "@/lib/api/coupons";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { inr } from "@/lib/format";
import { buildOrderWhatsAppUrl, openWhatsAppInTab, WA_PENDING_KEY } from "@/lib/whatsapp";
import { toast } from "sonner";
import { extract10DigitPhone } from "@/lib/utils";

const steps = ["Review", "Address", "Contact", "Confirm"] as const;

type AddrForm = {
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  pin: string;
  phone: string;
  type: string;
  notes: string;
};
type ContactForm = {
  name: string;
  email: string;
  phone: string;
  method: string;
  note: string;
  cutlery: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const { addresses } = useAddresses();
  const settings = useSettings((s) => s.settings);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const gstRate = settings?.gst ?? 5;
  const freeDeliveryThreshold = settings?.freeDeliveryAbove ?? 499;
  const deliveryFee = settings?.deliveryFee ?? 40;
  const tax = Math.round((subtotal * gstRate) / 100);
  const delivery = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;

  const [step, setStep] = useState(0);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [guestProceed, setGuestProceed] = useState(false);
  const [showManualAddressForm, setShowManualAddressForm] = useState(false);

  // Coupons live listener
  const { coupons, listenToCoupons } = useCoupons();
  useEffect(() => {
    return listenToCoupons();
  }, [listenToCoupons]);

  // Auto-fill address from saved default address or user profile
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const [addr, setAddr] = useState<AddrForm>({
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    landmark: defaultAddress?.landmark ?? "",
    city: defaultAddress?.city ?? "Nalgonda",
    pin: defaultAddress?.pin ?? "",
    phone: defaultAddress?.phone ?? user?.phone ?? "",
    type: defaultAddress?.label ?? "Home",
    notes: "",
  });

  // Toggle manual form when saved addresses load
  useEffect(() => {
    if (addresses.length > 0) {
      setShowManualAddressForm(false);
    } else {
      setShowManualAddressForm(true);
    }
  }, [addresses.length]);

  const [contact, setContact] = useState<ContactForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    method: "whatsapp",
    note: "",
    cutlery: true,
  });
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill forms when user logs in or addresses change
  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: extract10DigitPhone(user.phone || prev.phone),
      }));
    }
  }, [user]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddress) {
      setAddr({
        line1: defaultAddress.line1,
        line2: defaultAddress.line2 ?? "",
        landmark: defaultAddress.landmark ?? "",
        city: defaultAddress.city,
        pin: defaultAddress.pin,
        phone: extract10DigitPhone(defaultAddress.phone || user?.phone || ""),
        type: defaultAddress.label,
        notes: "",
      });
    }
  }, [addresses, user]);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + tax + delivery - discount);

  // Filter available coupons for suggestions
  const activeSuggestedCoupons = coupons.filter(
    (c) =>
      c.status === "Active" && subtotal >= c.minOrder && (c.maxUses === 0 || c.used < c.maxUses),
  );

  const applySuggestedCoupon = async (code: string) => {
    setCouponInput(code);
    try {
      const result = await validateCouponCode({ code, subtotal });
      if (!result.valid) {
        toast.error(result.error);
        return;
      }
      setAppliedCoupon({
        code: result.coupon.code,
        discountAmount: result.coupon.discountAmount,
      });
      toast.success(`🎉 Coupon ${code} applied successfully!`);
    } catch {
      toast.error("Failed to apply coupon.");
    }
  };

  // ── Saved address selector ──
  const applySaved = (id: string) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setAddr({
      line1: a.line1,
      line2: a.line2 ?? "",
      landmark: a.landmark ?? "",
      city: a.city,
      pin: a.pin,
      phone: a.phone,
      type: a.label,
      notes: "",
    });
    setShowManualAddressForm(false);
    toast.success(`Address "${a.label}" loaded.`);
  };

  // ── Coupon logic ──
  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const result = await validateCouponCode({
        code: couponInput,
        subtotal,
      });
      if (!result.valid) {
        toast.error(result.error);
        return;
      }
      setAppliedCoupon({
        code: result.coupon.code,
        discountAmount: result.coupon.discountAmount,
      });
      toast.success(`🎉 ${inr(result.coupon.discountAmount)} off applied!`);
    } catch {
      toast.error("Could not validate coupon. Please try again.");
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  if (lines.length === 0 && step < 3) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-32 px-4">
          <p>Your cart is empty.</p>
          <Button className="mt-4" onClick={() => router.push("/menu")}>
            Browse menu
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const next = () => {
    if (step === 0 && !user && !guestProceed) {
      setShowGuestDialog(true);
      return;
    }
    if (step === 1) {
      if (!addr.line1 || !addr.pin || !addr.phone) {
        toast.error("Please fill in all required address fields (Line 1, Pincode, Phone).");
        return;
      }
      if (!/^\d{6}$/.test(addr.pin.replace(/\s/g, ""))) {
        toast.error("Please enter a valid 6-digit Pincode.");
        return;
      }
    }
    if (step === 2) {
      if (!contact.name || !contact.phone) {
        toast.error("Please fill in your Name and Phone number.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ""))) {
        toast.error("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const placeOrder = async () => {
    if (isSubmitting || step !== 3) return;
    setIsSubmitting(true);

    // Pre-open tab synchronously while still inside the user click handler
    const waTab = window.open("about:blank", "_blank");

    const finalLines = lines.map((l) => ({ id: l.id, qty: l.qty, name: l.name, price: l.price }));
    const finalAppliedCoupon = appliedCoupon ? { ...appliedCoupon } : null;
    const finalAddr = { ...addr } as AddrForm;
    const finalContact = { ...contact } as ContactForm;

    finalContact.phone = finalContact.phone.replace(/\D/g, "");
    finalAddr.phone = finalAddr.phone.replace(/\D/g, "");
    finalAddr.pin = finalAddr.pin.replace(/\s/g, "");

    try {
      const idToken = user && auth.currentUser ? await auth.currentUser.getIdToken() : undefined;

      const res = await createOrder({
        items: finalLines.map((l) => ({ id: l.id, qty: l.qty })),
        couponCode: finalAppliedCoupon?.code,
        addr: {
          line1: finalAddr.line1,
          ...(finalAddr.line2 && { line2: finalAddr.line2 }),
          ...(finalAddr.landmark && { landmark: finalAddr.landmark }),
          city: finalAddr.city,
          pin: finalAddr.pin,
          phone: finalAddr.phone,
          type: finalAddr.type,
          ...(finalAddr.notes && { notes: finalAddr.notes }),
        },
        contact: {
          name: finalContact.name,
          ...(finalContact.email && { email: finalContact.email }),
          phone: finalContact.phone,
          method: finalContact.method,
          ...(finalContact.note && { note: finalContact.note }),
          cutlery: finalContact.cutlery,
        },
        ...(idToken ? { idToken } : {}),
      });

      if (!res.success || !res.orderId) {
        waTab?.close();
        toast.error(res.error || "Failed to create order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const createdAt = Date.now();
      const waOrder = {
        id: res.orderId,
        items: finalLines,
        subtotal: res.subtotal,
        tax: res.tax,
        delivery: res.delivery,
        discount: res.discount,
        couponCode: finalAppliedCoupon?.code,
        total: res.total,
        addr: {
          line1: finalAddr.line1,
          line2: finalAddr.line2,
          landmark: finalAddr.landmark,
          city: finalAddr.city,
          pin: finalAddr.pin,
          type: finalAddr.type,
          notes: finalAddr.notes,
          phone: finalAddr.phone,
        },
        contact: {
          name: finalContact.name,
          phone: finalContact.phone,
          email: finalContact.email,
          method: finalContact.method,
          note: finalContact.note,
          cutlery: finalContact.cutlery,
        },
        createdAt,
      };

      const waUrl = buildOrderWhatsAppUrl(waOrder, settings?.whatsapp);
      const opened = openWhatsAppInTab(waTab, waOrder, settings?.whatsapp);
      if (!opened) {
        sessionStorage.setItem(WA_PENDING_KEY(res.orderId), waUrl);
      }

      sessionStorage.setItem(`track-phone-${res.orderId}`, finalContact.phone);

      clear();
      toast.success("Order placed! Waiting for admin to confirm.");
      await new Promise((r) => setTimeout(r, 300));

      const search = opened ? "" : "?wa=1";
      router.push(`/track/${res.orderId}${search}`);
    } catch (err: any) {
      waTab?.close();
      console.error(err);
      toast.error(err.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-12">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-4 sm:mt-6 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-[70px] sm:min-w-0">
              <span
                className={`grid place-items-center size-7 shrink-0 rounded-full text-xs font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={`text-xs sm:text-sm truncate ${i === step ? "font-semibold text-foreground" : "text-muted-foreground hidden sm:inline"}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px min-w-[12px] ${i < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Collapsible Order Summary Accordion on Mobile */}
          {step > 0 && step < 3 && (
            <div className="lg:hidden w-full bg-secondary/35 rounded-xl border border-border/80 overflow-hidden mb-4">
              <details className="group">
                <summary className="flex items-center justify-between p-3.5 cursor-pointer select-none font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <span>Order Summary ({lines.length} items)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-bold">{inr(total)}</span>
                    <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="p-3.5 pt-0 border-t border-border/40 text-sm space-y-2.5 bg-card/40">
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="flex justify-between items-center text-xs text-muted-foreground"
                    >
                      <span>
                        {l.qty} × {l.name}
                      </span>
                      <span>{inr(l.qty * l.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/40 pt-2 flex justify-between font-bold text-xs mt-2">
                    <span>Payable Total</span>
                    <span>{inr(total)}</span>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Main panel */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            {/* Step 0 — Review order */}
            {step === 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Review your order</h2>
                <ul className="divide-y divide-border">
                  {lines.map((l) => (
                    <li key={l.id} className="py-3 flex items-center gap-3">
                      <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={l.image}
                          fill
                          sizes="56px"
                          className="object-cover"
                          alt={l.name}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{l.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty {l.qty} · {inr(l.price)}
                        </p>
                      </div>
                      <span className="font-semibold">{inr(l.qty * l.price)}</span>
                    </li>
                  ))}
                </ul>

                {/* Coupon section */}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Tag className="size-4 text-primary" /> Apply coupon
                  </p>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                      <span className="font-mono font-semibold text-green-700">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-sm text-green-600 flex-1">
                        — {inr(appliedCoupon.discountAmount)} off applied!
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="font-mono"
                          onKeyDown={(e) =>
                            e.key === "Enter" && (e.preventDefault(), applyCoupon())
                          }
                          disabled={isSubmitting}
                        />
                        <Button type="button" variant="outline" onClick={applyCoupon}>
                          Apply
                        </Button>
                      </div>

                      {/* Coupon Auto-Suggestions */}
                      {activeSuggestedCoupons.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Available Offers
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeSuggestedCoupons.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => applySuggestedCoupon(c.code)}
                                className="flex items-center justify-between p-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all text-left group active:scale-[0.98]"
                              >
                                <div className="min-w-0">
                                  <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
                                    <Tag className="size-3" /> {c.code}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground block mt-0.5 truncate max-w-[200px]">
                                    {c.description || `Save ${inr(c.discountAmount)}`}
                                  </span>
                                </div>
                                <span className="text-xs text-primary font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">
                                  Apply
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1 — Delivery address */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display font-semibold text-lg">Delivery address</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Specify where we should deliver your warm delights.
                  </p>
                </div>

                {/* Saved address picker */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="size-4 text-primary" /> Select saved address
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((a) => {
                        const isSelected = addr.line1 === a.line1 && addr.pin === a.pin;
                        const Icon =
                          a.label === "Home" ? HomeIcon : a.label === "Work" ? WorkIcon : MapPin;
                        // Map local constants to avoid symbol overlap
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => applySaved(a.id)}
                            disabled={isSubmitting}
                            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm"
                                : "border-border hover:border-primary/60 hover:bg-secondary/10"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-foreground">
                                  {a.label}
                                </span>
                                {a.isDefault && (
                                  <span className="text-[9px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {a.line1}, {a.city}
                              </p>
                              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                                {a.phone}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {showManualAddressForm
                          ? "Adding custom address"
                          : "Using selected saved address"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-primary p-0 h-auto hover:bg-transparent hover:text-primary/80 transition-colors"
                        onClick={() => setShowManualAddressForm(!showManualAddressForm)}
                      >
                        {showManualAddressForm ? "Cancel manual entry" : "Enter address manually"}
                      </Button>
                    </div>
                  </div>
                )}

                {showManualAddressForm && (
                  <div className="grid sm:grid-cols-2 gap-4 border border-dashed border-border/80 rounded-2xl p-5 bg-secondary/10 animate-slideDown">
                    <Field label="Address line 1" required className="sm:col-span-2">
                      <AddressAutocomplete
                        value={addr.line1}
                        onChange={(raw, parsed) => {
                          if (parsed)
                            setAddr((f) => ({
                              ...f,
                              line1: parsed.line1 || raw,
                              city: parsed.city || f.city,
                              pin: parsed.pin || f.pin,
                            }));
                          else setAddr((f) => ({ ...f, line1: raw }));
                        }}
                        placeholder="House / flat no, street"
                      />
                    </Field>
                    <Field label="Address line 2">
                      <Input
                        value={addr.line2}
                        onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                        placeholder="Area, colony"
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field label="Landmark">
                      <Input
                        value={addr.landmark}
                        onChange={(e) => setAddr({ ...addr, landmark: e.target.value })}
                        placeholder="Near…"
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field label="City">
                      <Input
                        value={addr.city}
                        onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field label="Pincode" required>
                      <Input
                        value={addr.pin}
                        onChange={(e) => setAddr({ ...addr, pin: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field label="Phone" required>
                      <Input
                        value={addr.phone}
                        onChange={(e) =>
                          setAddr({
                            ...addr,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                        disabled={isSubmitting}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Label>Address type</Label>
                      <RadioGroup
                        value={addr.type}
                        onValueChange={(v) => setAddr({ ...addr, type: v })}
                        className="flex gap-4 mt-2"
                        disabled={isSubmitting}
                      >
                        {["Home", "Work", "Other"].map((t) => (
                          <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                            <RadioGroupItem value={t} /> {t}
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}

                <Field label="Delivery instructions" className="pt-2">
                  <Textarea
                    rows={3}
                    value={addr.notes}
                    onChange={(e) => setAddr({ ...addr, notes: e.target.value })}
                    placeholder="Gate code, where to leave, etc."
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
            )}

            {/* Step 2 — Contact */}
            {step === 2 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Contact & preferences</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" required>
                    <Input
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Field>
                  <Field label="Phone" required>
                    <Input
                      value={contact.phone}
                      onChange={(e) =>
                        setContact({
                          ...contact,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      disabled={isSubmitting}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Label>Preferred contact</Label>
                  <RadioGroup
                    value={contact.method}
                    onValueChange={(v) => setContact({ ...contact, method: v })}
                    className="flex gap-4 mt-2"
                    disabled={isSubmitting}
                  >
                    {["phone", "email", "whatsapp"].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm capitalize">
                        <RadioGroupItem value={t} /> {t}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <Field label="Special requests" className="mt-4">
                  <Textarea
                    rows={3}
                    value={contact.note}
                    onChange={(e) => setContact({ ...contact, note: e.target.value })}
                    placeholder="e.g. No onions, extra spicy…"
                    disabled={isSubmitting}
                  />
                </Field>
                <label className="mt-4 flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={contact.cutlery}
                    onCheckedChange={(v) => setContact({ ...contact, cutlery: !!v })}
                    disabled={isSubmitting}
                  />{" "}
                  Include cutlery
                </label>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Confirm & place order</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-secondary/40 rounded-xl p-4">
                    <p className="text-xs uppercase text-muted-foreground tracking-wider">
                      Deliver to
                    </p>
                    <p className="mt-1">
                      {contact.name} · {contact.phone}
                    </p>
                    <p>
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                    </p>
                    <p>
                      {addr.city} {addr.pin}
                    </p>
                  </div>
                  <div className="bg-secondary/40 rounded-xl p-4">
                    <p className="text-xs uppercase text-muted-foreground tracking-wider">Items</p>
                    {lines.map((l) => (
                      <p key={l.id} className="mt-1">
                        {l.qty} × {l.name}
                      </p>
                    ))}
                  </div>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
                    <Tag className="size-4 text-green-600" />
                    <span className="font-mono font-semibold text-green-700">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-green-600">— {inr(discount)} off applied</span>
                  </div>
                )}
                <div className="mt-4 p-4 rounded-xl bg-accent/20 text-sm flex items-start gap-3">
                  <MessageCircle className="size-5 shrink-0 mt-0.5 text-primary" />
                  <p>
                    You'll be redirected to <strong>WhatsApp</strong> to confirm with our team. Your
                    order tracking will begin once the admin accepts.
                  </p>
                </div>
                <label className="mt-4 flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={agree}
                    onCheckedChange={(v) => setAgree(!!v)}
                    disabled={isSubmitting}
                  />{" "}
                  I agree to the terms and cancellation policy.
                </label>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between gap-2">
              <Button variant="outline" onClick={back} disabled={step === 0 || isSubmitting}>
                <ChevronLeft className="size-4 mr-1" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={next} disabled={isSubmitting}>
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={
                    !agree ||
                    !contact.name ||
                    !contact.phone ||
                    !addr.line1 ||
                    !addr.pin ||
                    isSubmitting
                  }
                >
                  <MessageCircle className="size-4 mr-2" />
                  {isSubmitting ? "Placing order..." : "Place order via WhatsApp"}
                </Button>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-display font-semibold">Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST ({gstRate}%)</dt>
                <dd>{inr(tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{delivery === 0 ? "FREE" : inr(delivery)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt className="flex items-center gap-1">
                    <Tag className="size-3" /> Coupon
                  </dt>
                  <dd>-{inr(discount)}</dd>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-2 flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Guest Checkout Dialog */}
      {showGuestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-lg text-center">
            <h3 className="font-display font-semibold text-lg">Sign in to save your order</h3>
            <p className="text-sm text-muted-foreground mt-2">
              If you continue as a guest, your order details and tracking won't be saved to an
              account.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => router.push("/auth/login?redirect=/checkout")}>
                Sign In or Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowGuestDialog(false);
                  setGuestProceed(true);
                  setStep(1);
                }}
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Floating Checkout Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 sm:p-4 lg:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Payable
            </p>
            <p className="text-lg font-display font-bold text-foreground leading-none mt-0.5">
              {inr(total)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={back} disabled={isSubmitting}>
                <ChevronLeft className="size-4" />
              </Button>
            )}
            {step < 3 ? (
              <Button size="sm" onClick={next} disabled={isSubmitting} className="font-medium">
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={placeOrder}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={
                  !agree ||
                  !contact.name ||
                  !contact.phone ||
                  !addr.line1 ||
                  !addr.pin ||
                  isSubmitting
                }
              >
                <MessageCircle className="size-4 mr-1.5" />
                {isSubmitting ? "Placing..." : "Place Order"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
