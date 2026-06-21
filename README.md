# Aroma

A modern Indian restaurant website with online ordering, table reservations, customer reviews, and a full admin panel.

> Built on TanStack Start v1 (React 19 + Vite 7), styled with Tailwind v4 and shadcn/ui.

## Features

### For customers

- Browse the menu with search, category & dietary filters
- Add to cart, checkout in 3 steps, and confirm via WhatsApp (full order details sent automatically)
- Track order status and download a printable bill
- Book a table, browse the gallery, leave a review
- Customer account with order history

### For the restaurant (admin panel)

- Dashboard with KPIs and recent activity
- Manage orders, menu, customers, reservations, promotions, staff
- Moderate customer reviews (approve / reject)
- Settings, analytics, role-based admin access (planned)

## Tech stack

- **Framework** — TanStack Start v1 (file-based routing, SSR-ready)
- **UI** — React 19, Tailwind CSS v4, shadcn/ui (Radix)
- **Charts** — Recharts
- **Build** — Vite 7
- **Runtime** — Node.js
- **Persistence** — localStorage today; Supabase planned for v2

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in the console.

## Project structure

```
src/
  routes/            File-based routes (each file = a URL)
  components/
    layout/          Header, Footer, BottomNav, SiteLayout
    admin/           AdminLayout (sidebar + topbar)
    menu/            MenuCard etc.
    ui/              shadcn/ui primitives
  lib/
    store/           Local stores (cart, auth, reviews)
    mock/            Seed data (menu, reviews)
    whatsapp.ts      WhatsApp deep-link builder
    bill.ts          Printable bill generator
    format.ts        INR formatter
  styles.css         Tailwind v4 entry & theme tokens
docs/
  AUDIT.md           Full website audit (page-by-page)
  SITEMAP.md         Route map
  PENDING.md         Roadmap & pending features
```

## Routes

See [`docs/SITEMAP.md`](docs/SITEMAP.md) for the complete route list.

## Data persistence

Today everything (cart, orders, reviews, admin settings) lives in the browser's `localStorage`. This means:

- Data is per-device, per-browser — different devices see different data.
- The admin pages are mostly powered by mock data and do not yet share state with the customer flow (except Reviews).

The next phase is to enable Supabase so orders, reservations, menu, customers, and reviews live in a real database with proper auth.

## Roadmap

See [`docs/PENDING.md`](docs/PENDING.md) for the prioritized backlog (Quick wins → Cloud → Notifications → Payments → Nice-to-haves).

## Audit

A complete page-by-page status of what's working, partial, or mock is in [`docs/AUDIT.md`](docs/AUDIT.md).

## License

TBD.
