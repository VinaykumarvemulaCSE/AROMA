import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cafeInfo } from "@/lib/format";
import { sendContactEmail } from "@/lib/email";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Aroma Cafe Nalgonda" },
      {
        name: "description",
        content: "Get in touch with Aroma Cafe — phone, email, WhatsApp, or visit us in Nalgonda.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const result = await sendContactEmail({
        data: { name: name.trim(), email: email.trim(), message: message.trim() },
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
              value={cafeInfo.phone}
              href={`tel:${cafeInfo.phone}`}
            />
            <Card
              icon={<MessageCircle className="size-5" />}
              label="WhatsApp"
              value="Chat with us"
              href={`https://wa.me/${cafeInfo.whatsapp}`}
            />
            <Card
              icon={<Mail className="size-5" />}
              label="Email"
              value={cafeInfo.email}
              href={`mailto:${cafeInfo.email}`}
            />
            <Card
              icon={<MapPin className="size-5" />}
              label="Visit"
              value={cafeInfo.address}
              href={cafeInfo.mapsUrl}
            />
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <iframe
                title="Map"
                className="w-full h-full"
                src="https://maps.google.com/maps?q=Nalgonda&t=&z=13&ie=UTF8&iwloc=&output=embed"
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
