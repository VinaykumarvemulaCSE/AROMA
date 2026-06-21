import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { cafeInfo } from "@/lib/format";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid place-items-center size-9 rounded-full bg-accent text-accent-foreground font-display font-bold">
              A
            </div>
            <span className="font-display font-semibold text-lg">{cafeInfo.name}</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">{cafeInfo.tagline}</p>
          <div className="flex gap-3 mt-5">
            <a
              href={cafeInfo.instagram}
              aria-label="Instagram"
              className="grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={cafeInfo.facebook}
              aria-label="Facebook"
              className="grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={`https://wa.me/${cafeInfo.whatsapp}`}
              aria-label="WhatsApp"
              className="grid place-items-center size-9 rounded-full bg-white/10 hover:bg-white/20"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/menu" className="hover:text-accent">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/reservations" className="hover:text-accent">
                Reservations
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-accent">
                About
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-accent">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-accent">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0" />
              <span>{cafeInfo.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" />
              <a href={`tel:${cafeInfo.phone}`}>{cafeInfo.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              <a href={`mailto:${cafeInfo.email}`}>{cafeInfo.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Hours</h4>
          <p className="mt-4 text-sm text-primary-foreground/80">{cafeInfo.hours}</p>
          <p className="mt-2 text-xs text-primary-foreground/60">Last order 10:30 PM</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <span>
            © {new Date().getFullYear()} {cafeInfo.name}. All rights reserved.
          </span>
          <span>Made with care in Nalgonda.</span>
        </div>
      </div>
    </footer>
  );
}
