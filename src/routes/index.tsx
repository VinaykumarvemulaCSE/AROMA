import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Clock,
  Truck,
  Search,
  ChevronRight,
  Quote,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/menu/MenuCard";
import { useMenu } from "@/lib/store/menu";
import { useSettings } from "@/lib/store/settings";
import { useReviews } from "@/lib/store/reviews";
import { reviews as mockReviews } from "@/lib/mock/reviews";
import { useGallery } from "@/lib/store/gallery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aroma Cafe & Restaurant — Nalgonda's favourite cafe" },
      {
        name: "description",
        content:
          "Specialty coffee, fresh-baked goods and fine dining. Order online, reserve a table or visit us in the heart of Nalgonda.",
      },
      { property: "og:title", content: "Aroma Cafe & Restaurant — Nalgonda" },
      {
        property: "og:description",
        content: "Order online or reserve a table at Nalgonda's favourite cafe.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "Restaurant"],
          name: "Aroma Cafe & Restaurant",
          image:
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Clock Tower Road",
            addressLocality: "Nalgonda",
            addressRegion: "Telangana",
            postalCode: "508001",
            addressCountry: "IN",
          },
          telephone: "+91 80195 51015",
          servesCuisine: ["Coffee", "Cafe", "Indian", "Continental"],
          openingHours: "Mo-Su 11:00-23:00",
        }),
      },
    ],
  }),
  component: Home,
});

const heroSlides = [
  {
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80",
    title: "Brewed with love.",
    sub: "Single-origin coffee, hand-pulled every morning.",
  },
  {
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    title: "Slow food, fast service.",
    sub: "Fresh, seasonal plates from our kitchen to your table.",
  },
  {
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    title: "A second home in Nalgonda.",
    sub: "Warm interiors, quiet corners, conversations that linger.",
  },
];

function Home() {
  const menu = useMenu((s) => s.menu);
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState("");
  const { images, fetchImages, loading } = useGallery();
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch gallery images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const liveReviews = useReviews((s) => s.reviews);

  // Show items flagged in Firebase; empty if none have been flagged yet.
  const specials = useMemo(() => menu.filter((m) => !!m.isDailySpecial), [menu]);
  const best = useMemo(() => menu.filter((m) => !!m.isBestseller), [menu]);

  const testimonials = useMemo(() => {
    let list = liveReviews.filter((r) => r.status === "approved" && r.featured);
    if (list.length === 0) {
      list = liveReviews.filter((r) => r.status === "approved");
    }
    if (list.length === 0) {
      return mockReviews.slice(0, 3);
    }
    return list.slice(0, 3);
  }, [liveReviews]);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            role="img"
            aria-label={s.title}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16 text-white">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-1 rounded-full">
              <Star className="size-3.5 fill-gold text-gold" /> {settings?.rating || 4.7} ·{" "}
              {settings?.reviewCount || 1284} reviews
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-1 rounded-full">
              <MapPin className="size-3.5" /> Nalgonda
            </span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-3xl">
            {heroSlides[slide].title}
          </h1>
          <p className="mt-3 max-w-xl text-base sm:text-lg text-white/85">
            {heroSlides[slide].sub}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <Link to="/menu" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Order Now
              </Button>
            </Link>
            <Link to="/reservations" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                Reserve Table
              </Button>
            </Link>
            <a href={`tel:${settings?.phone || ""}`} className="hidden sm:inline-flex">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Phone className="size-4 mr-2" /> Call
              </Button>
            </a>
            <a href={`https://wa.me/${settings?.whatsapp || ""}`} className="hidden sm:inline-flex">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <MessageCircle className="size-4 mr-2" /> WhatsApp
              </Button>
            </a>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-5 w-full max-w-md flex bg-white rounded-full pl-4 pr-1 py-1 items-center shadow-2xl"
          >
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes…"
              className="border-0 focus-visible:ring-0 text-foreground bg-transparent min-w-0"
            />
            <Link to="/menu" search={{ q } as never}>
              <Button size="sm" className="rounded-full shrink-0">
                Find
              </Button>
            </Link>
          </form>

          <div className="mt-6 flex gap-1.5" role="group" aria-label="Slideshow controls">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "bg-white w-8" : "bg-white/40 w-4"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* QUICK INFO CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: "Open Now", value: "Until 11:00 PM" },
            { icon: MapPin, label: "Location", value: "Clock Tower Rd · 2.1 km" },
            {
              icon: Star,
              label: "Rating",
              value: `${settings?.rating || 4.7} / 5 · ${settings?.reviewCount || 1284}`,
            },
            { icon: Truck, label: "Home Delivery", value: "30-40 min · ₹40" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div className="grid place-items-center size-11 rounded-xl bg-secondary text-primary">
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="font-semibold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY'S SPECIAL */}
      <Section
        title="Today's Special"
        sub="Hand-picked by our chef for today"
        link={{ to: "/menu", label: "See full menu" }}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {specials.map((i) => (
            <MenuCard key={i.id} item={i} />
          ))}
        </div>
      </Section>

      {/* BESTSELLERS */}
      <Section
        title="Bestsellers"
        sub="What Nalgonda is loving this week"
        link={{ to: "/menu", label: "View all" }}
      >
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {best.map((i) => (
            <MenuCard key={i.id} item={i} />
          ))}
        </div>
      </Section>

      {/* WHY CHOOSE US */}
      <section className="bg-secondary/40 py-16 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center">
            Why we're loved
          </h2>
          <div className="mt-10 grid md:grid-cols-4 gap-5">
            {[
              {
                emoji: "☕",
                t: "Single-origin coffee",
                d: "Beans from Chikmagalur, roasted weekly.",
              },
              { emoji: "🌿", t: "Fresh & seasonal", d: "Locally sourced produce, never frozen." },
              {
                emoji: "👨‍🍳",
                t: "Chef-led kitchen",
                d: "Authentic Indian + continental, no shortcuts.",
              },
              { emoji: "🪴", t: "Cosy space", d: "Wooden interiors, plants and quiet corners." },
            ].map((c) => (
              <div key={c.t} className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="text-3xl">{c.emoji}</div>
                <h3 className="mt-3 font-display font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section
        title="What our guests say"
        sub="Real reviews from Aroma regulars"
        link={{ to: "/reviews", label: "Read all reviews" }}
      >
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((r) => (
            <figure key={r.id} className="bg-card border border-border rounded-2xl p-6">
              <Quote className="size-6 text-accent" />
              <blockquote className="mt-3 text-sm leading-relaxed">"{r.body}"</blockquote>
              <figcaption className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-gold text-gold" />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

        {/* GALLERY PREVIEW */}
        <Section
          title="A glimpse inside"
          sub="The space, the plates, the people"
          link={{ to: "/gallery", label: "View gallery" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              <p>Loading gallery...</p>
            ) : (
              images.map((img) => (
                <Link to="/gallery" key={img.id} className="block aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              ))
            )}
          </div>
        </Section>

      <div className="h-16" />
    </SiteLayout>
  );
}

function Section({
  title,
  sub,
  link,
  children,
}: {
  title: string;
  sub?: string;
  link?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold">{title}</h2>
          {sub && <p className="text-muted-foreground mt-1">{sub}</p>}
        </div>
        {link && (
          <Link
            to={link.to}
            className="text-sm font-medium text-primary hover:text-accent flex items-center gap-1 shrink-0"
          >
            {link.label} <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
