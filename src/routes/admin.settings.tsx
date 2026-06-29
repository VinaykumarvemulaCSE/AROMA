import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings, DEFAULTS, DAYS, type Settings } from "@/lib/store/settings";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Aroma Admin" }] }),
  component: AdminSettings,
});

// Types and defaults are now in src/lib/store/settings.ts

function AdminSettings() {
  const { settings, fetchSettings, saveSettings, loading } = useSettings();
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    fetchSettings().then(() => {
      const current = useSettings.getState().settings;
      if (current) setS(current);
    });
  }, [fetchSettings]);

  const save = async () => {
    try {
      await saveSettings(s);
      toast.success("Settings saved to Firestore");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  };

  const upd = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <h1 className="text-2xl sm:text-3xl font-display font-bold">Settings</h1>
      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Card title="Restaurant info">
          <Field label="Name">
            <Input value={s.name} onChange={(e) => upd("name", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input value={s.tagline} onChange={(e) => upd("tagline", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={s.phone} onChange={(e) => upd("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={s.email} onChange={(e) => upd("email", e.target.value)} />
          </Field>
          <Field label="Address">
            <Textarea rows={2} value={s.address} onChange={(e) => upd("address", e.target.value)} />
          </Field>
          <Field label="Google Maps URL">
            <Input value={s.mapsUrl} onChange={(e) => upd("mapsUrl", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Logo Letter(s)">
              <Input value={s.logoLetters || ""} onChange={(e) => upd("logoLetters", e.target.value)} />
            </Field>
            <Field label="Location Name">
              <Input value={s.locationName || ""} onChange={(e) => upd("locationName", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram URL">
              <Input value={s.instagram || ""} onChange={(e) => upd("instagram", e.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <Input value={s.facebook || ""} onChange={(e) => upd("facebook", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (out of 5)">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={s.rating}
                onChange={(e) => upd("rating", Number(e.target.value))}
              />
            </Field>
            <Field label="Review count">
              <Input
                type="number"
                min="0"
                value={s.reviewCount}
                onChange={(e) => upd("reviewCount", Number(e.target.value))}
              />
            </Field>
          </div>
        </Card>

        <Card title="Operating hours">
          {DAYS.map((d) => (
            <div key={d} className="grid grid-cols-[2.5rem_1fr_auto_1fr] items-center gap-2">
              <span className="text-sm font-medium">{d}</span>
              <Input
                type="time"
                value={s.hours[d].open}
                onChange={(e) =>
                  upd("hours", { ...s.hours, [d]: { ...s.hours[d], open: e.target.value } })
                }
                className="w-full min-w-0 px-2"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                value={s.hours[d].close}
                onChange={(e) =>
                  upd("hours", { ...s.hours, [d]: { ...s.hours[d], close: e.target.value } })
                }
                className="w-full min-w-0 px-2"
              />
            </div>
          ))}
        </Card>

        <Card title="Delivery & ordering">
          <Toggle
            label="Accept delivery orders"
            v={s.deliveryEnabled}
            on={(v) => upd("deliveryEnabled", v)}
          />
          <Toggle
            label="WhatsApp-only ordering"
            v={s.whatsappOnly}
            on={(v) => upd("whatsappOnly", v)}
          />
          <Field label="WhatsApp number">
            <Input value={s.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Delivery Fee (₹)">
              <Input
                type="number"
                value={s.deliveryFee}
                onChange={(e) => upd("deliveryFee", Number(e.target.value))}
              />
            </Field>
            <Field label="Minimum order (₹)">
              <Input
                type="number"
                value={s.minOrder}
                onChange={(e) => upd("minOrder", Number(e.target.value))}
              />
            </Field>
            <Field label="Free delivery above (₹)">
              <Input
                type="number"
                value={s.freeDeliveryAbove}
                onChange={(e) => upd("freeDeliveryAbove", Number(e.target.value))}
              />
            </Field>
          </div>
        </Card>

        <Card title="Reservation rules">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Party Size">
              <Input
                type="number"
                value={s.maxPartySize}
                onChange={(e) => upd("maxPartySize", Number(e.target.value))}
              />
            </Field>
            <Field label="Booking window (days)">
              <Input
                type="number"
                value={s.bookingWindowDays}
                onChange={(e) => upd("bookingWindowDays", Number(e.target.value))}
              />
            </Field>
          </div>
        </Card>

        <Card title="Tax">
          <Field label="GST %">
            <Input
              type="number"
              value={s.gst}
              onChange={(e) => upd("gst", Number(e.target.value))}
            />
          </Field>
        </Card>

        <Card title="Menu Categories">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {s.categories?.map((c, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 bg-secondary text-sm px-3 py-1.5 rounded-full border border-border"
                >
                  <span>{c.icon}</span>
                  <span className="font-medium">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = s.categories.filter((_, idx) => idx !== index);
                      upd("categories", updated);
                    }}
                    className="text-muted-foreground hover:text-destructive ml-1"
                    aria-label="Delete category"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              <Input
                placeholder="Category Name (e.g. Pasta)"
                id="new-cat-name"
                className="flex-1"
              />
              <Input
                placeholder="Emoji (e.g. 🍝)"
                id="new-cat-emoji"
                className="w-24 text-center"
              />
              <Button
                type="button"
                onClick={() => {
                  const nameEl = document.getElementById("new-cat-name") as HTMLInputElement;
                  const emojiEl = document.getElementById("new-cat-emoji") as HTMLInputElement;
                  const name = nameEl?.value.trim();
                  const icon = emojiEl?.value.trim() || "🍽️";
                  if (!name) {
                    toast.error("Category name is required.");
                    return;
                  }
                  if (s.categories?.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
                    toast.error("Category already exists.");
                    return;
                  }
                  const updated = [...(s.categories || []), { name, icon }];
                  upd("categories", updated);
                  if (nameEl) nameEl.value = "";
                  if (emojiEl) emojiEl.value = "";
                  toast.success(`Category "${name}" added.`);
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <Button size="lg" onClick={save} className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Loading…" : "Save changes"}
        </Button>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-3 min-w-0">
      <h2 className="font-display font-semibold">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="min-w-0 truncate">{label}</Label>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
