import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { CalendarClock, Check, Users, AlertCircle, Info, Save } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/store/auth";
import { useSettings, type DayKey } from "@/lib/store/settings";
import { createReservation, checkAvailability } from "@/lib/api/reservations";
import { toast } from "sonner";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reserve a table — Aroma Cafe Nalgonda" },
      {
        name: "description",
        content:
          "Book a table at Aroma Cafe & Restaurant. Free cancellation up to 24 hours before.",
      },
    ],
  }),
  component: Reservations,
});

const occasions = [
  "",
  "Birthday",
  "Anniversary",
  "Engagement",
  "Business Meeting",
  "Family Gathering",
  "Other",
];

function Reservations() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const maxPartySize = settings?.maxPartySize ?? 20;
  const bookingWindowDays = settings?.bookingWindowDays ?? 30;

  // Load saved preferences from user profile
  const savedPrefs = user?.reservationPrefs || {};

  const [form, setForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: savedPrefs.preferredTime || "19:30",
    party: savedPrefs.preferredParty || 2,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    occasion: "",
    notes: savedPrefs.defaultNote || "",
    seat: savedPrefs.preferredSeat || "",
    agree: false,
  });

  const getDayOfWeek = (dateStr: string): DayKey => {
    const date = new Date(dateStr);
    const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const days: DayKey[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const dayKey = getDayOfWeek(form.date);
  const dayHours = settings?.hours?.[dayKey] || { open: "08:00", close: "23:00" };

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    try {
      const [openH, openM] = dayHours.open.split(":").map(Number);
      const [closeH, closeM] = dayHours.close.split(":").map(Number);
      
      let currentH = openH;
      let currentM = openM >= 30 ? 30 : 0;
      if (openM > 0 && openM < 30) {
        currentM = 30;
      } else if (openM > 30) {
        currentH += 1;
        currentM = 0;
      }
      
      const maxH = closeM === 0 ? closeH - 1 : closeH;
      const maxM = closeM === 0 ? 0 : (closeM >= 30 ? 30 : 0);
      
      while (currentH < maxH || (currentH === maxH && currentM <= maxM)) {
        slots.push(`${currentH.toString().padStart(2, "0")}:${currentM.toString().padStart(2, "0")}`);
        currentM += 30;
        if (currentM >= 60) {
          currentH += 1;
          currentM = 0;
        }
      }
    } catch (e) {
      return Array.from({ length: 22 }, (_, i) => {
        const h = 11 + Math.floor(i / 2);
        const m = i % 2 === 0 ? "00" : "30";
        return `${h.toString().padStart(2, "0")}:${m}`;
      }).filter((t) => parseInt(t.split(":")[0]) <= 21);
    }
    return slots.length > 0 ? slots : ["19:00", "19:30", "20:00", "20:30"];
  }, [dayHours]);

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: timeSlots[0] }));
    }
  }, [timeSlots, form.time]);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [savePrefs, setSavePrefs] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) return toast.error("Please accept the booking policy.");
    if (!form.name || !form.phone) return toast.error("Name and phone are required.");

    setSubmitting(true);
    try {
      const availability = await checkAvailability({
        data: {
          date: form.date,
          timeSlot: form.time,
          guests: form.party,
        },
      });

      if (!availability.available) {
        toast.error("No tables available for this time slot. Please try a different date/time.");
        return;
      }

      const res = await createReservation({
        data: {
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
          tableConfigId: availability.tableConfigId,
        },
      });

      // Save reservation preferences if user checked the option
      if (savePrefs && user) {
        setUser({
          ...user,
          reservationPrefs: {
            preferredTime: form.time,
            preferredParty: form.party,
            preferredSeat: form.seat,
            defaultNote: form.notes,
          },
        });
        toast.success("Preferences saved for future bookings!");
      }

      setDone(res.reservationId);
      toast.success("Table reserved! The restaurant will confirm shortly.");
    } catch (err) {
      console.error(err);
      // Server-side validation will return specific availability errors
      toast.error(
        err instanceof Error ? err.message : "Failed to create reservation. Please try again.",
      );
    } finally {
      setSubmitting(false);
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
            <p>
              <strong>Date:</strong>{" "}
              {new Date(form.date).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p>
              <strong>Time:</strong> {form.time}
            </p>
            <p>
              <strong>Party:</strong> {form.party} guest{form.party !== 1 && "s"}
            </p>
            <p>
              <strong>Name:</strong> {form.name}
            </p>
            {form.occasion && (
              <p>
                <strong>Occasion:</strong> {form.occasion}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Status is <strong>Pending</strong> — the restaurant will confirm your booking via{" "}
            {form.email || form.phone}.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setDone(null);
            }}
          >
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
          <p className="mt-2 text-muted-foreground">
            We hold your table for 15 minutes past your booking time.
          </p>
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
                max={new Date(Date.now() + bookingWindowDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Time" required>
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                {timeSlots.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Party size" required>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground shrink-0" />
                <Input
                  type="number"
                  min={1}
                  max={maxPartySize}
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: parseInt(e.target.value) || 1 })}
                />
              </div>
            </Field>
          </div>

          {/* Server-side validation notice */}
          <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Availability verified on booking</p>
              <p className="text-xs text-blue-800 mt-1">
                Table availability is confirmed by our server when you submit. This ensures accurate
                real-time slot management across concurrent bookings.
              </p>
            </div>
          </div>
        </div>

        {/* Guest details */}
        <div className="bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone" required>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </Field>
          <Field label="Occasion">
            <select
              value={form.occasion}
              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              {occasions.map((o) => (
                <option key={o} value={o}>
                  {o || "—"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Seating preference" className="sm:col-span-2">
            <Input
              placeholder="Window, quiet corner, outdoor…"
              value={form.seat}
              onChange={(e) => setForm({ ...form, seat: e.target.value })}
            />
          </Field>
          <Field label="Special requests" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Dietary needs, decorations, allergies…"
            />
          </Field>
        </div>

        {/* Policy */}
        <div className="bg-secondary/30 rounded-2xl p-5 text-sm space-y-3">
          <div>
            <p className="font-semibold">Booking policy</p>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              <li>Free cancellation up to 24 hours before your reservation.</li>
              <li>We hold your table for 15 minutes past your booking time.</li>
              <li>Availability is confirmed when the restaurant accepts your booking.</li>
            </ul>
          </div>
          <label className="flex items-start gap-2">
            <Checkbox
              checked={form.agree}
              onCheckedChange={(v) => setForm({ ...form, agree: !!v })}
            />
            <span>I accept the booking policy.</span>
          </label>
          {user && (
            <label className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2 -mx-2 px-4">
              <Checkbox checked={savePrefs} onCheckedChange={(v) => setSavePrefs(!!v)} />
              <span className="text-xs">
                Save my preferences (time, party size, seating) for faster bookings
              </span>
            </label>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                name: "",
                email: "",
                phone: "",
                occasion: "",
                notes: "",
                seat: "",
                agree: false,
              })
            }
            disabled={submitting}
          >
            Clear
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Booking…" : "Book table"}
          </Button>
        </div>
      </form>
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
