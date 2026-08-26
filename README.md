# Aroma Cafe

A modern, responsive, and full-featured e-commerce and cafe management application built with Next.js and Firebase.

## 🌟 Key Features

### ☕ For Customers

- **Intuitive Menu Browsing**: Browse categories (Coffee, Bakery, Breakfast, etc.) with beautiful imagery and smooth animations.
- **Smart Cart & Checkout**: Persistent cart state, guest checkout support, and secure order processing.
- **1-Click Reorder**: Instantly re-populate your cart with your favorite past orders.
- **Real-Time Order Tracking**: Track the status of your order live from preparation to delivery.
- **Table Reservations**: Book a table with real-time slot availability.
- **Secure Authentication**: Email/Password and Google OAuth sign-in.

### 💼 For Administrators

- **Live Order Dashboard**: Real-time order monitoring with dynamic audio alerts (barista bell chimes) for new pending orders.
- **Menu Management**: Full CRUD capabilities for menu items, including rich image uploads via Cloudinary.
- **Reservation & Table Management**: View and manage bookings, and configure table availability visually.
- **Role-Based Access Control**: Secure admin dashboard protected by custom Firebase claims and middleware.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Firebase Project (with Firestore and Auth enabled)
- A Cloudinary Account

### 1. Clone & Install

```bash
git clone https://github.com/VinaykumarvemulaCSE/AROMA.git
cd AROMA
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase and Cloudinary credentials:

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Firebase Security Rules

Ensure you deploy the included Firestore rules and composite indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 📝 License

This project is proprietary and confidential.
