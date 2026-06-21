# Aroma Cafe & Restaurant

A modern Indian restaurant website with online ordering, table reservations, customer reviews, and a full admin panel. Built with Firebase for real-time data synchronization and email notifications.

> Built on TanStack Start v1 (React 19 + Vite 7), styled with Tailwind CSS v4 and shadcn/ui.

## Features

### For Customers

- **Menu Browsing**: Search, category filters, dietary filters (veg/non-veg)
- **Online Ordering**: Add to cart, multi-step checkout, WhatsApp confirmation
- **Order Tracking**: Real-time status updates with email notifications
- **Table Reservations**: Book tables with time slots, email confirmations
- **Customer Account**: Profile management, order history, favorites
- **Reviews**: Submit reviews with ratings, approval workflow
- **Gallery**: Browse restaurant ambiance photos
- **Contact Form**: Send inquiries with email notifications

### For Restaurant (Admin Panel)

- **Dashboard**: KPIs, recent activity, analytics
- **Order Management**: View, update status, cancel orders with email notifications
- **Menu Management**: Add/edit menu items, categories, pricing
- **Reservation Management**: View, confirm, cancel reservations with email notifications
- **Review Moderation**: Approve/reject customer reviews with email notifications
- **Customer Management**: View customer profiles, order history
- **Staff Management**: Manage staff roles and permissions
- **Settings**: Configure restaurant details, hours, contact info

## Tech Stack

- **Framework**: TanStack Start v1 (file-based routing, SSR-ready)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (Radix)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Email**: Nodemailer with SMTP
- **Charts**: Recharts
- **Build**: Vite 7
- **Runtime**: Node.js
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- SMTP email service (e.g., Gmail, SendGrid, Mailgun)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AROMA-CAFE

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@aromacafe.in
ADMIN_EMAIL=admin@aromacafe.in

# Application URL
VITE_APP_URL=https://your-domain.com
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage (for images)

2. **Configure Authentication**
   - Enable Email/Password sign-in
   - Set up custom claims for admin role
   - Configure email verification

3. **Firestore Security Rules**
   - Deploy the rules from `firestore.rules`
   - Run: `firebase deploy --only firestore:rules`

4. **Firestore Indexes**
   - Deploy indexes from `firestore.indexes.json`
   - Run: `firebase deploy --only firestore:indexes`

5. **Get Firebase Config**
   - Go to Project Settings → General
   - Copy the Firebase config values
   - Add them to your `.env` file

### SMTP Email Setup

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App Passwords
3. Use the App Password in `SMTP_PASS`

**For SendGrid:**
1. Create a SendGrid account
2. Generate API Key
3. Use API Key as `SMTP_PASS` with host `smtp.sendgrid.net`

**For Mailgun:**
1. Create a Mailgun account
2. Get SMTP credentials from dashboard
3. Use provided credentials in `.env`

### Running the Application

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The development server will start on `http://localhost:5173` (or next available port).

## Project Structure

```
src/
  routes/              File-based routes (each file = a URL)
    index.tsx          Home page
    menu.tsx           Menu browsing
    checkout.tsx       Order checkout
    reservations.tsx   Table reservations
    reviews.tsx        Customer reviews
    profile.tsx       User profile
    contact.tsx        Contact form
    admin/             Admin panel routes
      index.tsx        Admin dashboard
      orders.tsx       Order management
      menu.tsx         Menu management
      reservations.tsx Reservation management
      reviews.tsx      Review moderation
  components/
    layout/            Header, Footer, BottomNav, SiteLayout
    admin/             AdminLayout (sidebar + topbar)
    menu/              MenuCard, CategoryFilter
    ui/                shadcn/ui primitives
  lib/
    firebase.ts        Firebase initialization
    auth/              Authentication logic
    store/             Zustand stores (cart, auth, orders, etc.)
    api/               Server functions
    email.ts           Email sending functions
    whatsapp.ts        WhatsApp deep-link builder
    format.ts          INR formatter
  styles.css          Tailwind v4 entry & theme tokens
firestore.rules       Firestore security rules
firestore.indexes.json Firestore indexes
.env.example          Environment variables template
```

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env`

5. **Deploy Firebase Rules**
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy to your hosting provider**
   - Upload the `dist/` folder
   - Configure build settings for your provider
   - Set environment variables

3. **Deploy Firebase**
```bash
firebase deploy
```

## Maintenance & Updates

### Adding New Features

1. **Create a new route** in `src/routes/`
2. **Add server functions** in `src/lib/api/`
3. **Update stores** in `src/lib/store/`
4. **Add email notifications** in `src/lib/email.ts`
5. **Update Firestore rules** if needed

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Firebase Updates

1. **Update Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

2. **Update Firestore Indexes**
```bash
firebase deploy --only firestore:indexes
```

3. **Backup Data**
   - Use Firebase Console → Firestore → Export Data
   - Or use Firebase CLI: `firestore export`

### Email Configuration

- Test email delivery before production
- Monitor SMTP limits and quotas
- Set up email bounce handling
- Configure DKIM/SPF records for better deliverability

## Potential Improvements

### CMS Dashboard for Content Management

**Gallery Management:**
- Add Firestore collection `gallery_items`
- Create admin gallery management page
- Add image upload via Cloudinary
- Implement drag-and-drop reordering
- Add category filtering

**Blog/News Management:**
- Add Firestore collection `blog_posts`
- Create admin blog editor
- Add rich text editor (e.g., TipTap)
- Implement SEO metadata
- Add scheduled publishing

**Menu Management:**
- Add bulk import/export
- Implement menu categories hierarchy
- Add ingredient tracking
- Add allergen information
- Implement seasonal menus

### Additional Features

**Payment Integration:**
- Razorpay integration for Indian market
- Stripe integration for international
- UPI payment support
- Payment history and receipts

**Loyalty Program:**
- Points system for orders
- Reward redemption
- Referral program
- Birthday rewards

**Advanced Analytics:**
- Customer behavior tracking
- Sales forecasting
- Inventory management
- Staff performance metrics

**Mobile App:**
- React Native mobile app
- Push notifications
- Offline ordering
- Location-based ordering

**Delivery System:**
- Delivery tracking
- Driver management
- Delivery zones
- Delivery fee calculation

## Troubleshooting

### Common Issues

**Firebase Connection Issues:**
- Check Firebase config in `.env`
- Verify Firebase project is enabled
- Check Firestore rules for permissions
- Ensure Firebase SDK is initialized correctly

**Email Not Sending:**
- Verify SMTP credentials
- Check SMTP port (587 for TLS, 465 for SSL)
- Test with SMTP provider's test tools
- Check firewall/network settings
- Verify email format and content

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version (18+)
- Verify all dependencies are installed

**Firebase Rules Errors:**
- Check Firestore console for rule errors
- Test rules in Firebase Console → Firestore → Rules
- Verify rule syntax and logic
- Check for circular dependencies

## Support

For issues and questions:
- Check Firebase Console for errors
- Review browser console for client-side errors
- Check server logs for backend errors
- Verify environment variables are set correctly

## License

TBD

## Credits

Built with ❤️ for Aroma Cafe & Restaurant
