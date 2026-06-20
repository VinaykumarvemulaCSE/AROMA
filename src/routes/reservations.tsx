import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Check, Users, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTables } from "@/lib/store/tables";
import { AddressAutocomplete, type GoogleLocation } from "@/components/AddressAutocomplete";
import { useAuth } from "@/lib/store/auth";
import { createReservation } from "@/lib/api/reservations";
import { toast } from "sonner";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reserve a table — Aroma Cafe Nalgonda" },
      { name: "description", content: "Book a table at Aroma Cafe & Restaurant. Free cancellation up to 24 hours before." },
    ],
  }),
  component: Reservations,
});

const occasions = ["", "Birthday", "Anniversary", "Engagement", "Business Meeting", "Family Gathering", "Other"];

// Only show half-hour slots from 11:00 to 21:30
const timeSlots = Array.from({ length: 22 }, (_, i) => {
  const h = 11 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}).filter((t) => parseInt(t.split(":")[0]) <= 21);

function Reservations() {
  const user = useAuth((s) => s.user);
  const { findAvailableTable } = useTables();

  const [form, setForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:30",
    party: 2,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    occasion: "",
    notes: "",
    seat: "",
    location: null as GoogleLocation | null,
    agree: false,
  });

  const [availability, setAvailability] = useState<"unchecked" | "available" | "unavailable">("unchecked");
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // Check availability without submitting
  const checkAvailability = () => {
    setChecking(true);
    const table = findAvailableTable(form.date, form.time, form.party);
    setTimeout(() => {
      setAvailability(table ? "available" : "unavailable");
      setChecking(false);
      if (!table) {
        toast.error("No tables available for the selected date, time, and party size. Please try another slot.");
      } else {
        toast.success(`Table available! ${table.size}-seater found for your party.`);
      }
    }, 600);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) return toast.error("Please accept the booking policy.");
    if (!form.name || !form.phone) return toast.error("Name and phone are required.");

    const table = findAvailableTable(form.date, form.time, form.party);
    if (!table) {
      setAvailability("unavailable");
      toast.error("Sorry, no tables are available for the selected slot. Please choose a different time.");
      return;
    }

    try {
      const res = await createReservation({
        data: {
          tableConfigId: table.id,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          reservation: {
            date: form.date,
            timeSlot: form.time,
            guests: form.party,
            occasion: form.occasion,
            seat: form.seat,
            notes: form.notes,
          },
          location: form.location || undefined,
        },
      });
      
      setDone(res.reservationId);
      toast.success("Table reserved! The restaurant will confirm shortly.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create reservation. Please try again.");
    }
  };

  // Success screen
  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl text-center py-20 px-4">
          <div className="size-16 rounded-full bg-green-100 text-green-600 grid place-items-center mx-auto">
            <Check className="size-8" />
          </div>
          <h1 className="mt-4 text-3xl font-display font-bold">Table reserved!</h1>
          <p className="mt-2 text-muted-foreground">Confirmation #{done}</p>
          <div className="mt-6 bg-card border border-border rounded-2xl p-6 text-left max-w-md mx-auto">
            <p><strong>Date:</strong> {new Date(form.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p><strong>Time:</strong> {form.time}</p>
            <p><strong>Party:</strong> {form.party} guest{form.party !== 1 && "s"}</p>
            <p><strong>Name:</strong> {form.name}</p>
            {form.occasion && <p><strong>Occasion:</strong> {form.occasion}</p>}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Status is <strong>Pending</strong> — the restaurant will confirm your booking via {form.email || form.phone}.
          </p>
          <Button className="mt-6" onClick={() => { setDone(null); setAvailability("unchecked"); }}>
            Make another reservation
          </Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-secondary/30 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <CalendarClock className="size-10 mx-auto text-accent" />
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-bold">Reserve a table</h1>
          <p className="mt-2 text-muted-foreground">We hold your table for 15 minutes past your booking time.</p>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Date / Time / Party — with availability check */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-base mb-4">When & how many?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Date" required>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={(e) => { setForm({ ...form, date: e.target.value }); setAvailability("unchecked"); }}
              />
            </Field>
            <Field label="Time" required>
              <select
                value={form.time}
                onChange={(e) => { setForm({ ...form, time: e.target.value }); setAvailability("unchecked"); }}
                className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                {timeSlots.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Party size" required>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground shrink-0" />
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.party}
                  onChange={(e) => { setForm({ ...form, party: parseInt(e.target.value) || 1 }); setAvailability("unchecked"); }}
                />
              </div>
            </Field>
          </div>

          {/* Availability indicator */}
          <div className="mt-4 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={checkAvailability}
              disabled={checking}
            >
              {checking ? "Checking…" : "Check availability"}
            </Button>
            {availability === "available" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="size-4" /> Tables available for this slot!
              </span>
            )}
            {availability === "unavailable" && (
              <span className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" /> No tables available — try another slot.
              </span>
            )}
          </div>
        </div>

        {/* Guest details */}
        <div className="bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></Field>
          <Field label="Occasion">
            <select
              value={form.occasion}
              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              {occasions.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
            </select>
          </Field>
          <Field label="Seating preference" className="sm:col-span-2">
            <Input placeholder="Window, quiet corner, outdoor…" value={form.seat} onChange={(e) => setForm({ ...form, seat: e.target.value })} />
          </Field>
          <Field label="Special requests" className="sm:col-span-2">
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Dietary needs, decorations, allergies…" />
          </Field>
        </div>

        {/* Location Selection */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-base mb-4">Location (Optional)</h2>
          <p className="text-sm text-muted-foreground mb-4">Are you booking for a specific location or event space? Find it on the map.</p>
          <AddressAutocomplete
            value={form.location?.address || ""}
            onChange={(_raw, _parsed, loc) => setForm({ ...form, location: loc || null })}
            placeholder="Search address or landmark"
          />
          {form.location && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border">
              <iframe
                title="Map Preview"
                width="100%"
                height="200"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=place_id:${form.location.placeId}`}
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Policy */}
        <div className="bg-secondary/30 rounded-2xl p-5 text-sm">
          <p className="font-semibold">Booking policy</p>
          <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
            <li>Free cancellation up to 24 hours before your reservation.</li>
            <li>We hold your table for 15 minutes past your booking time.</li>
            <li>Availability is confirmed when the restaurant accepts your booking.</li>
          </ul>
          <label className="mt-3 flex items-start gap-2">
            <Checkbox checked={form.agree} onCheckedChange={(v) => setForm({ ...form, agree: !!v })} />
            I accept the booking policy.
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm({ ...form, name: "", email: "", phone: "", occasion: "", notes: "", seat: "", location: null, agree: false })}
          >
            Clear
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={availability === "unavailable"}
          >
            Book table
          </Button>
        </div>
      </form>
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
