import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft, MessageCircle, Tag, X, MapPin } from "lucide-react";
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
import { auth } from "@/lib/firebase";
import { createOrder } from "@/lib/api/orders";
import { validateCouponCode } from "@/lib/api/coupons";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { inr } from "@/lib/format";
import { buildOrderWhatsAppUrl, openWhatsAppInTab, WA_PENDING_KEY } from "@/lib/whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Aroma Cafe" }] }),
  component: CheckoutPage,
});

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

function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const { addresses } = useAddresses();
  const settings = useSettings((s) => s.settings);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const gstRate = settings?.gst ?? 5;
  const freeDeliveryThreshold = settings?.freeDeliveryAbove ?? 499;
  const tax = Math.round(subtotal * gstRate / 100);
  const delivery = subtotal >= freeDeliveryThreshold ? 0 : 40;

  const [step, setStep] = useState(0);
  
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
        phone: user.phone || prev.phone,
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
        phone: defaultAddress.phone || user?.phone || "",
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
    toast.success(`Address "${a.label}" loaded.`);
  };

  // ── Coupon logic ──
  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const result = await validateCouponCode({
        data: { code: couponInput, subtotal },
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
          <Button className="mt-4" onClick={() => navigate({ to: "/menu" })}>
            Browse menu
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const next = () => {
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
        data: {
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
        },
      });

      if (!res.orderId) {
        waTab?.close();
        toast.error("Failed to create order. Please try again.");
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

      const waUrl = buildOrderWhatsAppUrl(waOrder);
      const opened = openWhatsAppInTab(waTab, waOrder);
      if (!opened) {
        sessionStorage.setItem(WA_PENDING_KEY(res.orderId), waUrl);
      }

      sessionStorage.setItem(`track-phone-${res.orderId}`, finalContact.phone);

      clear();
      toast.success("Order placed! Waiting for admin to confirm.");
      await new Promise((r) => setTimeout(r, 300));
      navigate({
        to: "/track/$orderId",
        params: { orderId: res.orderId },
        search: opened ? {} : { wa: 1 },
      });
    } catch (err) {
      waTab?.close();
      console.error(err);
      toast.error("Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-display font-bold">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-1 sm:gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <span
                className={`grid place-items-center size-7 shrink-0 rounded-full text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={`text-sm truncate ${i === step ? "font-semibold" : "text-muted-foreground hidden sm:inline"}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            {/* Step 0 — Review order */}
            {step === 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Review your order</h2>
                <ul className="divide-y divide-border">
                  {lines.map((l) => (
                    <li key={l.id} className="py-3 flex items-center gap-3">
                      <img src={l.image} className="size-14 rounded-lg object-cover" alt={l.name} />
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
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="font-mono"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                        disabled={isSubmitting}
                      />
                      <Button type="button" variant="outline" onClick={applyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1 — Delivery address */}
            {step === 1 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Delivery address</h2>

                {/* Saved address picker */}
                {addresses.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> Saved addresses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applySaved(a.id)}
                          disabled={isSubmitting}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${addr.line1 === a.line1 ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:border-primary hover:bg-secondary/60"}`}
                        >
                          {a.label} {a.isDefault && "⭐"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">or enter manually</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
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
                      onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Label>Address type</Label>
                  <RadioGroup
                    value={addr.type}
                    onValueChange={(v) => setAddr({ ...addr, type: v })}
                    className="flex gap-4 mt-2"
                    disabled={isSubmitting}
                  >
                    {["Home", "Work", "Other"].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value={t} /> {t}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <Field label="Delivery instructions" className="mt-4">
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
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      disabled={isSubmitting}
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
