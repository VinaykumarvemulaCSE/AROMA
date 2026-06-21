import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { cafeInfo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Aroma Admin" }] }),
  component: AdminSettings,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayKey = (typeof DAYS)[number];

type Settings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  whatsappOnly: boolean;
  deliveryEnabled: boolean;
  minOrder: number;
  freeDeliveryAbove: number;
  gst: number;
  hours: Record<DayKey, { open: string; close: string }>;
};

const DEFAULTS: Settings = {
  name: cafeInfo.name,
  phone: cafeInfo.phone,
  email: cafeInfo.email,
  address: cafeInfo.address,
  whatsapp: cafeInfo.whatsapp,
  whatsappOnly: true,
  deliveryEnabled: true,
  minOrder: 150,
  freeDeliveryAbove: 499,
  gst: 5,
  hours: DAYS.reduce(
    (acc, d) => ({ ...acc, [d]: { open: "08:00", close: "23:00" } }),
    {} as Settings["hours"],
  ),
};

function AdminSettings() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aroma-settings");
      if (raw)
        setS({
          ...DEFAULTS,
          ...JSON.parse(raw),
          hours: { ...DEFAULTS.hours, ...(JSON.parse(raw).hours || {}) },
        });
    } catch (e) {
      console.warn("Failed to load settings from localStorage:", e);
    }
  }, []);

  const save = () => {
    localStorage.setItem("aroma-settings", JSON.stringify(s));
    toast.success("Settings saved");
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
          <Field label="Phone">
            <Input value={s.phone} onChange={(e) => upd("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={s.email} onChange={(e) => upd("email", e.target.value)} />
          </Field>
          <Field label="Address">
            <Textarea rows={2} value={s.address} onChange={(e) => upd("address", e.target.value)} />
          </Field>
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
      </div>
      <div className="mt-6">
        <Button size="lg" onClick={save} className="w-full sm:w-auto">
          Save changes
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
