import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, ChevronLeft, MessageCircle, Tag, X, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/store/cart";
import { useOrders } from "@/lib/store/orders";
import { useAddresses } from "@/lib/store/address";
import { useCoupons } from "@/lib/store/coupon";
import { useAuth } from "@/lib/store/auth";
import { createOrder } from "@/lib/api/orders";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { cafeInfo, inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Aroma Cafe" }] }),
  component: CheckoutPage,
});

const steps = ["Review", "Address", "Contact", "Confirm"] as const;

type AddrForm = {
  line1: string; line2: string; landmark: string;
  city: string; pin: string; phone: string; type: string; notes: string;
};
type ContactForm = {
  name: string; email: string; phone: string;
  method: string; note: string; cutlery: boolean;
};

function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const { addresses } = useAddresses();
  const { validateCoupon, incrementUsed } = useCoupons();

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal >= 499 ? 0 : 40;

  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState<AddrForm>({
    line1: "", line2: "", landmark: "", city: "Nalgonda", pin: "", phone: "", type: "Home", notes: "",
  });
  const [contact, setContact] = useState<ContactForm>({
    name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "",
    method: "whatsapp", note: "", cutlery: true,
  });
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + tax + delivery - discount);

  // ── Saved address selector ──
  const applySaved = (id: string) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setAddr({
      line1: a.line1, line2: a.line2 ?? "", landmark: a.landmark ?? "",
      city: a.city, pin: a.pin, phone: a.phone, type: a.label, notes: "",
    });
    toast.success(`Address "${a.label}" loaded.`);
  };

  // ── Coupon logic ──
  const applyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = validateCoupon(couponInput, subtotal);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setAppliedCoupon({ code: result.code, discountAmount: result.discountAmount });
    toast.success(`🎉 ${result.description || `${inr(result.discountAmount)} off applied!`}`);
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
          <Button className="mt-4" onClick={() => navigate({ to: "/menu" })}>Browse menu</Button>
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
      if (!/^\d{6}$/.test(addr.pin.replace(/\s/g, ''))) {
        toast.error("Please enter a valid 6-digit Pincode.");
        return;
      }
    }
    if (step === 2) {
      if (!contact.name || !contact.phone) {
        toast.error("Please fill in your Name and Phone number.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ''))) {
        toast.error("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const placeOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 1. Securely create the order via the backend API.
    // This calculates actual prices, applies valid coupons, writes to Firestore,
    // and securely dispatches the confirmation email.
    const res = await createOrder({
      data: {
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        couponCode: appliedCoupon?.code,
        addr: {
          line1: addr.line1, line2: addr.line2 || undefined, landmark: addr.landmark || undefined,
          city: addr.city, pin: addr.pin, phone: addr.phone, type: addr.type, notes: addr.notes || undefined,
        },
        contact: {
          name: contact.name, email: contact.email || "", phone: contact.phone,
          method: contact.method, note: contact.note || undefined, cutlery: contact.cutlery,
        },
        userId: user?.id,
      }
    });

    if (!res.orderId) {
      toast.error("Failed to create order. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const now = new Date();

    // Build WhatsApp message
    const itemsText = lines
      .map((l, i) => `${i + 1}. ${l.name}\n   ${l.qty} × ${inr(l.price)} = ${inr(l.qty * l.price)}`)
      .join("\n");
    const addressParts = [addr.line1, addr.line2, addr.landmark && `Near ${addr.landmark}`, `${addr.city} ${addr.pin}`]
      .filter(Boolean)
      .join(", ");

    const msgLines = [
      `🛎️ *NEW ORDER #${res.orderId}*`,
      `Aroma Cafe & Restaurant — Nalgonda`,
      `📅 ${now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
      ``,
      `👤 *Customer*`,
      `${contact.name}`,
      `📞 ${contact.phone}${contact.email ? `\n✉️ ${contact.email}` : ""}`,
      ``,
      `🛍️ *Items (${lines.length})*`,
      itemsText,
      ``,
      `💰 *Bill*`,
      `Subtotal: ${inr(subtotal)}`,
      `GST (5%): ${inr(tax)}`,
      `Delivery: ${delivery === 0 ? "FREE" : inr(delivery)}`,
      appliedCoupon ? `Coupon (${appliedCoupon.code}): -${inr(discount)}` : "",
      `*TOTAL: ${inr(total)}*`,
      ``,
      `📍 *Deliver to* (${addr.type})`,
      addressParts,
      addr.notes ? `📝 Delivery note: ${addr.notes}` : "",
      ``,
      contact.note ? `⭐ *Special request:* ${contact.note}` : "",
      contact.cutlery ? `🍴 Cutlery: Yes` : `🍴 Cutlery: No`,
      ``,
      `Please confirm this order. Thank you!`,
    ]
      .filter((s) => s !== null && s !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");

    const waUrl = `https://wa.me/${cafeInfo.whatsapp}?text=${encodeURIComponent(msgLines)}`;

    // Increment coupon usage
    if (appliedCoupon) incrementUsed(appliedCoupon.code);

    clear();
    window.open(waUrl, "_blank");
    toast.success("Order placed! Waiting for admin to confirm.");
    navigate({ to: "/track/$orderId", params: { orderId: res.orderId } });
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-display font-bold">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-1 sm:gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <span className={`grid place-items-center size-7 shrink-0 rounded-full text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={`text-sm truncate ${i === step ? "font-semibold" : "text-muted-foreground hidden sm:inline"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
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
                      <div className="flex-1"><p className="font-medium">{l.name}</p><p className="text-sm text-muted-foreground">Qty {l.qty} · {inr(l.price)}</p></div>
                      <span className="font-semibold">{inr(l.qty * l.price)}</span>
                    </li>
                  ))}
                </ul>

                {/* Coupon section */}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-3"><Tag className="size-4 text-primary" /> Apply coupon</p>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                      <span className="font-mono font-semibold text-green-700">{appliedCoupon.code}</span>
                      <span className="text-sm text-green-600 flex-1">— {inr(appliedCoupon.discountAmount)} off applied!</span>
                      <button onClick={removeCoupon} className="text-green-600 hover:text-green-800"><X className="size-4" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="font-mono"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      />
                      <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
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
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5"><MapPin className="size-3.5" /> Saved addresses</p>
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applySaved(a.id)}
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
                        if (parsed) setAddr((f) => ({ ...f, line1: parsed.line1 || raw, city: parsed.city || f.city, pin: parsed.pin || f.pin }));
                        else setAddr((f) => ({ ...f, line1: raw }));
                      }}
                      placeholder="House / flat no, street"
                    />
                  </Field>
                  <Field label="Address line 2"><Input value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} placeholder="Area, colony" /></Field>
                  <Field label="Landmark"><Input value={addr.landmark} onChange={(e) => setAddr({ ...addr, landmark: e.target.value })} placeholder="Near…" /></Field>
                  <Field label="City"><Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></Field>
                  <Field label="Pincode" required><Input value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value })} /></Field>
                  <Field label="Phone" required><Input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} /></Field>
                </div>
                <div className="mt-4">
                  <Label>Address type</Label>
                  <RadioGroup value={addr.type} onValueChange={(v) => setAddr({ ...addr, type: v })} className="flex gap-4 mt-2">
                    {["Home", "Work", "Other"].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm"><RadioGroupItem value={t} /> {t}</label>
                    ))}
                  </RadioGroup>
                </div>
                <Field label="Delivery instructions" className="mt-4">
                  <Textarea rows={3} value={addr.notes} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} placeholder="Gate code, where to leave, etc." />
                </Field>
              </div>
            )}

            {/* Step 2 — Contact */}
            {step === 2 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Contact & preferences</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" required><Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
                  <Field label="Email"><Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
                  <Field label="Phone" required><Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
                </div>
                <div className="mt-4">
                  <Label>Preferred contact</Label>
                  <RadioGroup value={contact.method} onValueChange={(v) => setContact({ ...contact, method: v })} className="flex gap-4 mt-2">
                    {["phone", "email", "whatsapp"].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm capitalize"><RadioGroupItem value={t} /> {t}</label>
                    ))}
                  </RadioGroup>
                </div>
                <Field label="Special requests" className="mt-4">
                  <Textarea rows={3} value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} placeholder="e.g. No onions, extra spicy…" />
                </Field>
                <label className="mt-4 flex items-center gap-2 text-sm">
                  <Checkbox checked={contact.cutlery} onCheckedChange={(v) => setContact({ ...contact, cutlery: !!v })} /> Include cutlery
                </label>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Confirm & place order</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-secondary/40 rounded-xl p-4">
                    <p className="text-xs uppercase text-muted-foreground tracking-wider">Deliver to</p>
                    <p className="mt-1">{contact.name} · {contact.phone}</p>
                    <p>{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                    <p>{addr.city} {addr.pin}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-xl p-4">
                    <p className="text-xs uppercase text-muted-foreground tracking-wider">Items</p>
                    {lines.map((l) => <p key={l.id} className="mt-1">{l.qty} × {l.name}</p>)}
                  </div>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
                    <Tag className="size-4 text-green-600" />
                    <span className="font-mono font-semibold text-green-700">{appliedCoupon.code}</span>
                    <span className="text-green-600">— {inr(discount)} off applied</span>
                  </div>
                )}
                <div className="mt-4 p-4 rounded-xl bg-accent/20 text-sm flex items-start gap-3">
                  <MessageCircle className="size-5 shrink-0 mt-0.5 text-primary" />
                  <p>You'll be redirected to <strong>WhatsApp</strong> to confirm with our team. Your order tracking will begin once the admin accepts.</p>
                </div>
                <label className="mt-4 flex items-start gap-2 text-sm">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} /> I agree to the terms and cancellation policy.
                </label>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between gap-2">
              <Button variant="outline" onClick={back} disabled={step === 0}><ChevronLeft className="size-4 mr-1" /> Back</Button>
              {step < 3 ? (
                <Button onClick={next}>Next <ChevronRight className="size-4 ml-1" /></Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={!agree || !contact.name || !contact.phone || !addr.line1 || !addr.pin || isSubmitting}
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
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">GST (5%)</dt><dd>{inr(tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{delivery === 0 ? "FREE" : inr(delivery)}</dd></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt className="flex items-center gap-1"><Tag className="size-3" /> Coupon</dt>
                  <dd>-{inr(discount)}</dd>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-2 flex justify-between font-display font-bold text-lg">
                <span>Total</span><span>{inr(total)}</span>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-sm">{label}{required && <span className="text-destructive">*</span>}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
