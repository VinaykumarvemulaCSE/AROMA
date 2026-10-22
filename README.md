# Aroma Cafe

A full-stack cafe platform: a customer storefront, a real-time kitchen dashboard,
and a rider navigation system built on a custom shortest-path router.

Live: https://aromacafe.eu.cc

[![Aroma Cafe storefront](https://res.cloudinary.com/dgelvlvqs/image/upload/w_1200,q_auto,f_auto/v1792617687/portfolio/fjjk3cgilrsaatn444dz.jpg)](https://aromacafe.eu.cc)

## What it does

**Customers** browse the menu, check out as a guest or signed-in user, track the
order live, reserve a table, and reorder a past order in one tap.

**Staff** run the cafe from a real-time dashboard: incoming orders, status
changes, menu and image management, reservations, tables, coupons, reviews and
settings. New orders trigger an audio alert so nothing sits unnoticed.

**Riders** get an in-app navigation screen instead of being pushed out to a
third-party map — route, turns, voice prompts and multi-stop batches.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Data**: Firebase Firestore, Firebase Auth (email/password + Google)
- **Server**: Next.js Server Actions, Firebase Admin SDK
- **State**: Zustand
- **Validation**: Zod (server-side)
- **Media**: Cloudinary
- **Maps**: Leaflet, with a hand-built Dijkstra router

## Architecture

The UI is client-rendered so Firestore listeners can stay subscribed while a
screen is open. Anything that must not run in the browser — checkout,
reservations, coupons, email, Cloudinary uploads — is a Server Action that
validates input with Zod before touching Firebase.

Checkout never trusts the cart. The order action re-reads every menu item,
rejects unavailable ones, recomputes subtotal, GST and delivery from Firestore
settings, and re-checks the coupon's status, minimum order and usage cap.

Admin access is controlled by an `admin` custom claim, enforced in Firestore
security rules — not by hiding the route.

## Rider navigation

A weighted graph is built from the store, road junctions and delivery stops, and
Dijkstra picks the shortest path with traffic-weighted edge costs. The route is
drawn with Leaflet; haversine distance drives step detection, maneuver prompts
and voice guidance via SpeechSynthesis. Multi-stop batches are ordered on the
same graph.

Known limitation: the graph is synthetic, so the drawn line connects the store,
junctions and stops rather than following real road geometry. A production build
would keep Dijkstra for stop ordering and fetch geometry from OSRM.

## Getting started

Prerequisites: Node.js 22.12+, a Firebase project with Auth and Firestore, and a
Cloudinary account.

```bash
git clone https://github.com/VinaykumarvemulaCSE/AROMA.git
cd AROMA
npm install
cp .env.example .env   # fill in Firebase, Cloudinary, SMTP and admin settings
npm run dev
```

Open http://localhost:3000.

### Admin bootstrap

```bash
npm run set-admin -- you@example.com                    # grant the admin custom claim
npm run set-admin-password -- you@example.com "NewPass"  # set or rotate the password
```

### Deploy rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Known limitations

- Route geometry is synthetic (see above).
- Reviews are approved manually from the admin dashboard, so the public list only
  shows what staff have cleared.
- Payment is not integrated; orders are confirmed over WhatsApp/SMTP.

## License

Academic project. Not licensed for commercial use.
