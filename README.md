# ☕ Aroma Cafe - Full Stack Restaurant Web Application

Welcome to the Aroma Cafe source code! This repository contains a fully-featured, production-ready web application for a modern cafe or restaurant. 

Built with **React, Vite, Tailwind CSS**, and powered by **Firebase** (Backend/Database) and **Cloudinary** (Image Hosting).

This guide is designed to be **"peel the banana and feed it to the kid"** simple. Follow these steps meticulously, and you will have the entire platform running locally and deployed live on your own custom domain.

---

## 🛠️ Tech Stack Overview

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI (accessible components)
- **Backend/Database:** Firebase Firestore (NoSQL Database), Firebase Authentication
- **Media Hosting:** Cloudinary (optimized image delivery)
- **Maps:** Google Maps Places API (for location rendering)
- **Deployment:** Vercel (recommended)

---

## 📋 Step 0: Prerequisites (What you need before starting)

Before touching any code, create accounts for the following services (they all have generous free tiers):

1. **[Node.js](https://nodejs.org/):** Install Node.js (Version 18 or higher). This is required to run the project locally.
2. **[GitHub](https://github.com/):** For hosting your code repository.
3. **[Firebase](https://firebase.google.com/):** For the database and user authentication.
4. **[Cloudinary](https://cloudinary.com/):** For storing menu and gallery images.
5. **[Vercel](https://vercel.com/):** For hosting the live website.
6. **[Google Cloud Console](https://console.cloud.google.com/):** For the Google Maps API Key.

---

## 💻 Step 1: Local Setup & Installation

1. **Clone the repository** to your local machine:
   ```bash
   git clone <your-repository-url>
   cd AROMA-CAFE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *(This downloads all the necessary packages required to run the app).*

---

## 🔐 Step 2: Environment Variables (`.env`)

The application needs "secret keys" to connect to your Firebase, Cloudinary, and Google Maps accounts. 

1. In the root folder, you will see a file named `.env.example`.
2. **Duplicate** this file and rename the copy to strictly `.env`.
3. Open `.env`. It will look like this:

```env
# --- Firebase (Client - Public) ---
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# --- Google Maps Places API (Client - Public) ---
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# --- Cloudinary (Client - Public) ---
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# --- Application URL (Client & Server) ---
VITE_APP_URL=http://localhost:5173

# --- Server Secrets (Server-Only) ---
ADMIN_EMAIL=your_admin_email@example.com

# Nodemailer / SMTP (For sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=no-reply@yourcafe.com
```

*We will fill these values in the next steps.*

---

## 🔥 Step 3: Firebase Setup (Database & Auth)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project**. Name it (e.g., "Aroma Cafe").
3. Disable Google Analytics (optional) and click **Create Project**.

### A. Get your Firebase Config (for `.env`)
1. On the project dashboard, click the **Web icon (</>)** to add a web app.
2. Register the app (name it "Aroma Web").
3. Firebase will show you a `firebaseConfig` object. 
4. **Copy those values into your `.env` file** under the `VITE_FIREBASE_...` section.

### B. Enable Authentication
1. On the left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Click **Email/Password**, enable it, and save.

### C. Set up Firestore Database
1. On the left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Start in **Production mode** and choose a location close to you.
4. Once created, go to the **Rules** tab.
5. Paste the contents of the `firestore.rules` file (found in this repository's root) into the Firebase console and click **Publish**.
6. Go to the **Indexes** tab. You may need to create composite indexes later if the app throws a console error, but it is fine to leave as is for now.

---

## 🖼️ Step 4: Cloudinary Setup (Image Hosting)

We use Cloudinary so the admin can upload images for menu items.

1. Log in to [Cloudinary](https://cloudinary.com/).
2. On your dashboard, you will see your **Cloud Name**. Copy this into your `.env` file as `VITE_CLOUDINARY_CLOUD_NAME`.
3. Go to **Settings (Gear icon) > Upload**.
4. Scroll down to **Upload presets** and click **Add upload preset**.
5. Change **Signing Mode** to **Unsigned**.
6. Set the **Folder** to `aroma-menu` (or whatever you prefer).
7. Save it, and copy the **Preset Name** into your `.env` file as `VITE_CLOUDINARY_UPLOAD_PRESET`.

---

## 🗺️ Step 5: Google Maps Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for **Places API** and **Maps JavaScript API** and Enable both.
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials > API Key**.
6. Copy this key into your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`.

---

## ✉️ Step 6: SMTP / Email Setup (Optional but recommended)

If your app sends emails (like order confirmations or admin alerts):
1. Create a Gmail account (or use SendGrid/Resend).
2. For Gmail: Go to Google Account Security > 2-Step Verification > **App Passwords**.
3. Generate a password for "Mail".
4. Add your email to `SMTP_USER` and the 16-character app password to `SMTP_PASS` in your `.env`.

---

## 👑 Step 7: Setting up the First Admin Account

The admin panel is protected. To make an account an Admin, it needs a "Custom Claim".

1. Create a normal user account by running the app locally and "Signing Up".
2. Go to your Firebase Console -> Authentication -> Users. Find the **UID** of the account you just created.
3. Open a terminal in the project root and create a temporary script `set-admin.mjs`:

```javascript
// set-admin.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// 1. Download your service account key from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
// 2. Save it as service-account.json in the root folder.
const serviceAccount = JSON.parse(readFileSync('./service-account.json'));

initializeApp({ credential: cert(serviceAccount) });

// Replace with the UID from Firebase Auth Console
const UID = 'YOUR_USER_UID_HERE'; 

getAuth().setCustomUserClaims(UID, { admin: true })
  .then(() => console.log('Admin claim set successfully!'))
  .catch((err) => console.error(err));
```

4. Run `npm install firebase-admin` locally if not already installed.
5. Run the script: `node set-admin.mjs`.
6. Log out and log back into the app. You now have access to the `/admin` routes! (Delete the script and the json key afterward).

---

## 🚀 Step 8: Running Locally

Now that everything is configured, start the development server:

```bash
npm run dev
```
Open `http://localhost:5173` in your browser. The app should be running!

---

## 🌐 Step 9: Deployment (Vercel) & Custom Domain

Deploying to Vercel is the easiest and most robust method.

### 1. Push Code to GitHub
1. Create a new repository on GitHub.
2. Push your local code to this repository.

### 2. Import to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New... > Project**.
3. Import your GitHub repository.
4. **CRUCIAL STEP: Environment Variables**. 
   - Open your local `.env` file.
   - Copy EVERY variable and paste them into the "Environment Variables" section in Vercel. 
   - Ensure the framework is set to **Vite**.
5. Click **Deploy**. Vercel will build and launch your site.

### 3. Setup Custom Domain
1. In Vercel, go to your Project Dashboard > **Settings > Domains**.
2. Enter your custom domain (e.g., `www.myawesomecafe.com`).
3. Vercel will give you DNS records (usually an A Record or CNAME).
4. Go to your Domain Registrar (Godaddy, Namecheap, Route53, etc.).
5. Add the DNS records exactly as Vercel provided.
6. Wait 5-15 minutes. Vercel will automatically provision a free SSL certificate, and your site will be live!

---
*Built with ❤️ for the modern web.*
