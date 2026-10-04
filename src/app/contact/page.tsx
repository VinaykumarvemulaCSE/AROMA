"use client";

import { useState, useEffect, useMemo } from "react";
import { Phone, Mail, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/lib/store/settings";
import { useAuth } from "@/lib/store/auth";
import { sendContactEmail } from "@/lib/api/contact-email";
import { toast } from "sonner";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

import dynamic from "next/dynamic";

const ContactMapCanvas = dynamic(() => import("@/components/contact/ContactMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-2xl bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">
      Loading Store Location Map...
    </div>
  ),
});

export default function Contact() {
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);
  const [loading, setLoading] = useState(false);
  const user = useAuth((s) => s.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const result = await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      if (result?.success) {
        toast.success("Message sent! We'll be in touch soon.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error("Failed to send message. Please try WhatsApp or call us directly.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const storeLat = settings?.latitude ?? 17.4399;
  const storeLng = settings?.longitude ?? 78.4017;
  const storeName = settings?.name || "Aroma Cafe HQ";
  const storeAddress = settings?.address || "Hyderabad, Telangana";

  const mapsLink = settings?.mapsUrl
    ? settings.mapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLng}`;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold">Get in touch</h1>
        <p className="mt-2 text-muted-foreground">We'd love to hear from you.</p>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card
              icon={<Phone className="size-5" />}
              label="Call us"
              value={settings?.phone || ""}
              href={`tel:${settings?.phone || ""}`}
            />
            <Card
              icon={<MessageCircle className="size-5" />}
              label="WhatsApp"
              value="Chat with us"
              href={`https://wa.me/${formatWhatsAppNumber(settings?.whatsapp || "")}`}
            />
            <Card
              icon={<Mail className="size-5" />}
              label="Email"
              value={settings?.email || ""}
              href={`mailto:${settings?.email || ""}`}
            />
            <Card
              icon={<MapPin className="size-5" />}
              label="Visit"
              value={storeAddress}
              href={mapsLink}
            />
            <div className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-md">
              <ContactMapCanvas
                latitude={storeLat}
                longitude={storeLng}
                storeName={storeName}
                address={storeAddress}
              />
            </div>
          </div>
          <form
            onSubmit={submit}
            className="bg-card border border-border rounded-2xl p-6 space-y-4 h-fit"
          >
            <h2 className="font-display font-semibold text-lg">Send a message</h2>
            <div>
              <Label>Name</Label>
              <Input
                id="contact-name"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                id="contact-email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                id="contact-message"
                rows={5}
                className="mt-1.5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Sending…
                </>
              ) : (
                "Send message"
              )}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors"
    >
      <div className="grid place-items-center size-11 rounded-xl bg-secondary text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase text-muted-foreground tracking-wider">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </a>
  );
}
