# Aroma Cafe ☕

A modern, responsive, and full-featured e-commerce and cafe management application built with Next.js and Firebase. This platform bridges the gap between digital ordering and in-store operations, offering a seamless storefront for customers and a powerful real-time kitchen dashboard for cafe staff.

![Aroma Cafe](/public/hero-image.jpg)

## 🎯 The Problem Solved
Local cafes often struggle with managing in-store orders alongside online takeaways, leading to missed orders, long wait times, and a disconnected customer experience. They need a unified system that handles everything from table reservations to online ordering and real-time kitchen notifications without the high fees of third-party delivery apps. Aroma Cafe solves this by providing a unified platform where customers can order seamlessly and staff are instantly notified of new tasks.

## 🌟 Key Features

### 🛒 For Customers
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

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/)

## ⚡ Performance & Approach
- **Hybrid Rendering**: Utilized Next.js Server Components to minimize client-side JavaScript, ensuring fast initial page loads and strong SEO.
- **Real-Time Sync**: Leveraged Firestore snapshot listeners combined with Zustand to create a snappy, live Point of Sale (POS) experience without unnecessary component re-renders.
- **Optimized Media**: All uploaded menu images are processed and delivered via Cloudinary to ensure responsive, next-gen image formats are served globally.

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
Ensure you deploy the included Firestore rules and composite indexes to secure the database:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 📝 License
This project is proprietary and confidential.
