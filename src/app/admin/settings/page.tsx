"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings, DEFAULTS, DAYS, type Settings } from "@/lib/store/settings";

export default function AdminSettings() {
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
              <Input
                value={s.logoLetters || ""}
                onChange={(e) => upd("logoLetters", e.target.value)}
              />
            </Field>
            <Field label="Location Name">
              <Input
                value={s.locationName || ""}
                onChange={(e) => upd("locationName", e.target.value)}
              />
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

        <Card title="Tax & Invoicing">
          <Field label="GST %">
            <Input
              type="number"
              value={s.gst}
              onChange={(e) => upd("gst", Number(e.target.value))}
            />
          </Field>
        </Card>

        <Card title="Automated Reports & Sales Digest">
          <div className="space-y-3">
            <Field label="Digest Recipient Email">
              <Input
                type="email"
                placeholder="owner@aroma.com"
                defaultValue={s.email || "owner@aroma.com"}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Frequency">
                <select className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm">
                  <option value="daily">Daily Digest (9:00 PM)</option>
                  <option value="weekly">Weekly Summary (Sun)</option>
                  <option value="monthly">Monthly Audit</option>
                </select>
              </Field>
              <Field label="Format">
                <select className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm">
                  <option value="pdf">PDF Report + CSV</option>
                  <option value="summary">Email Summary</option>
                </select>
              </Field>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                toast.success("Scheduled Digest simulated!", {
                  description: `A test sales digest has been sent to ${s.email || "owner@aroma.com"}.`,
                });
              }}
            >
              Send Test Digest Now
            </Button>
          </div>
        </Card>

        <Card title="Live Kitchen & Store Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <p className="text-sm font-medium">Show Live Status Badge to Customers</p>
                <p className="text-xs text-muted-foreground">
                  Displays the real-time operational status (Open / Rush / Closed) pill on Home and Menu pages
                </p>
              </div>
              <input
                type="checkbox"
                checked={s.showLiveStatus !== false}
                onChange={(e) => upd("showLiveStatus", e.target.checked)}
                className="size-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <Field label="Operating Mode Override">
              <select
                value={s.storeStatusOverride || "auto"}
                onChange={(e) => upd("storeStatusOverride", e.target.value as any)}
                className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm font-medium"
              >
                <option value="auto">🟢 Automatic (8:00 AM – 11:00 PM + Rush Hours)</option>
                <option value="open">🟢 Force Open (Accepting Orders)</option>
                <option value="busy">🟡 Force Rush Hour (Kitchen Busy · High Prep Time)</option>
                <option value="closed">🔴 Force Kitchen Closed (Maintenance / Holiday)</option>
              </select>
            </Field>
            <Field label="Custom Store Banner Notice (Optional)">
              <Input
                placeholder="e.g. Closed today for Diwali / Private Event"
                value={s.storeNotice || ""}
                onChange={(e) => upd("storeNotice", e.target.value)}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              When enabled, customers see instant live updates regarding prep times, rush hours, and kitchen closures.
            </p>
          </div>
        </Card>

        <Card title="Deal of the Day & Flash Banner (CMS)">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Flash Deal Banner</p>
                <p className="text-xs text-muted-foreground">
                  Displays an animated countdown deal ribbon across all customer screens
                </p>
              </div>
              <input
                type="checkbox"
                checked={s.flashSaleEnabled !== false}
                onChange={(e) => upd("flashSaleEnabled", e.target.checked)}
                className="size-5 rounded accent-primary cursor-pointer"
              />
            </div>

            {/* Current Deal Banner Status */}
            <div className="pt-1">
              {(() => {
                if (s.flashSaleEnabled === false) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                      <span className="size-1.5 rounded-full bg-stone-400" />
                      Status: Inactive (Disabled)
                    </span>
                  );
                }
                const expiryTime = s.flashSaleExpiresAt ? new Date(s.flashSaleExpiresAt).getTime() : null;
                const isExpired = expiryTime ? expiryTime <= Date.now() : false;

                if (isExpired && expiryTime) {
                  const d = new Date(expiryTime);
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        Expired on {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Hidden from customers
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 2 * 3600 * 1000);
                          upd("flashSaleExpiresAt", d.toISOString());
                          toast.success("Timer extended by 2 hours!");
                        }}
                        className="text-xs font-semibold text-primary underline hover:opacity-80 cursor-pointer"
                      >
                        + Extend 2h
                      </button>
                    </div>
                  );
                }

                if (expiryTime) {
                  const diff = expiryTime - Date.now();
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active · Expires in {hours > 0 ? `${hours}h ` : ""}{mins}m (One-time)
                    </span>
                  );
                }

                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Active (Default Hours)
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Field label="Badge Label">
                <Input
                  placeholder="e.g. FLASH DEAL, TODAY ONLY"
                  value={s.flashSaleBadge || ""}
                  onChange={(e) => upd("flashSaleBadge", e.target.value)}
                />
              </Field>
              <Field label="Coupon Code">
                <Input
                  placeholder="e.g. AROMA20"
                  value={s.flashSaleCode || ""}
                  onChange={(e) => upd("flashSaleCode", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Offer Announcement Headline">
              <Input
                placeholder="e.g. Flat 20% OFF on all Starters & Shakes"
                value={s.flashSaleText || ""}
                onChange={(e) => upd("flashSaleText", e.target.value)}
              />
            </Field>

            <Field label="Expiration Date & Time (One-Time Timer)">
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  value={(() => {
                    if (s.flashSaleExpiresAt) {
                      const d = new Date(s.flashSaleExpiresAt);
                      if (!isNaN(d.getTime())) {
                        const pad = (n: number) => String(n).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        const mm = pad(d.getMonth() + 1);
                        const dd = pad(d.getDate());
                        const hh = pad(d.getHours());
                        const min = pad(d.getMinutes());
                        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                      }
                    }
                    return "";
                  })()}
                  onChange={(e) => {
                    if (!e.target.value) {
                      upd("flashSaleExpiresAt", "");
                      return;
                    }
                    const d = new Date(e.target.value);
                    upd("flashSaleExpiresAt", d.toISOString());
                  }}
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 2 * 3600 * 1000);
                      upd("flashSaleExpiresAt", d.toISOString());
                    }}
                    className="px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-secondary/80 cursor-pointer font-medium"
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 6 * 3600 * 1000);
                      upd("flashSaleExpiresAt", d.toISOString());
                    }}
                    className="px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-secondary/80 cursor-pointer font-medium"
                  >
                    +6 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(23, 59, 0, 0);
                      upd("flashSaleExpiresAt", d.toISOString());
                    }}
                    className="px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-secondary/80 cursor-pointer font-medium"
                  >
                    Today 11:59 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      d.setHours(23, 59, 0, 0);
                      upd("flashSaleExpiresAt", d.toISOString());
                    }}
                    className="px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-secondary/80 cursor-pointer font-medium"
                  >
                    Tomorrow 11:59 PM
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once this time is reached, the banner stops showing completely. It will not repeat or restart until you set a new time.
                </p>
              </div>
            </Field>
          </div>
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
