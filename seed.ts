import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("\n❌ Error: Service account key file not found.");
  console.error("Please follow these steps:");
  console.error("1. Go to Firebase Console -> Project Settings -> Service Accounts.");
  console.error("2. Click 'Generate new private key' and download the JSON file.");
  console.error(
    "3. Save it in this project's root folder exactly as 'firebase-service-account.json'.\n",
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Data
const menuItems = [
  {
    id: "m1",
    name: "Cappuccino",
    description: "Rich espresso topped with velvety steamed milk foam.",
    price: 180,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
    veg: true,
    spice: 0,
    prepTime: 5,
    tags: ["Bestseller"],
    available: true,
  },
  {
    id: "m2",
    name: "Cold Brew",
    description: "Slow-steeped 18 hours for a smooth, low-acid coffee.",
    price: 220,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
    veg: true,
    spice: 0,
    prepTime: 3,
    tags: ["New"],
    available: true,
  },
  {
    id: "m3",
    name: "Masala Chai",
    description: "Hand-ground spices, full-cream milk, brewed strong.",
    price: 90,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    veg: true,
    spice: 1,
    prepTime: 4,
    tags: ["Bestseller"],
    available: true,
  },
  {
    id: "m4",
    name: "Avocado Toast",
    description: "Sourdough, smashed avocado, chilli flakes, poached egg.",
    price: 320,
    category: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    veg: false,
    spice: 1,
    prepTime: 12,
    tags: ["Chef's Special"],
    available: true,
  },
  {
    id: "m5",
    name: "Masala Dosa",
    description: "Crispy rice crepe with spiced potato, coconut chutney.",
    price: 180,
    category: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    veg: true,
    spice: 2,
    prepTime: 15,
    tags: ["Bestseller", "Vegan"],
    available: true,
  },
  {
    id: "m8",
    name: "Butter Chicken",
    description: "Tandoor chicken in a silky tomato-butter gravy.",
    price: 380,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    veg: false,
    spice: 1,
    prepTime: 25,
    tags: ["Bestseller"],
    available: true,
  },
  {
    id: "m10",
    name: "Hyderabadi Biryani",
    description: "Dum-cooked basmati, saffron, tender mutton, mirchi salan.",
    price: 420,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    veg: false,
    spice: 2,
    prepTime: 35,
    tags: ["Bestseller", "Chef's Special"],
    available: true,
  },
  {
    id: "m12",
    name: "Tiramisu",
    description: "Mascarpone, espresso-soaked ladyfingers, cocoa dust.",
    price: 240,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    veg: true,
    spice: 0,
    prepTime: 5,
    tags: ["Chef's Special"],
    available: true,
  },
];

const tables = [
  {
    id: "t2",
    size: 2,
    totalTables: 5,
    slots: [
      { datetime: "2026-06-20T12:00", available: true },
      { datetime: "2026-06-20T19:00", available: true },
    ],
  },
  {
    id: "t4",
    size: 4,
    totalTables: 4,
    slots: [
      { datetime: "2026-06-20T12:30", available: true },
      { datetime: "2026-06-20T19:00", available: true },
    ],
  },
  { id: "t6", size: 6, totalTables: 2, slots: [{ datetime: "2026-06-20T19:30", available: true }] },
];

const coupons = [
  {
    code: "WELCOME50",
    discountAmount: 50,
    minOrder: 199,
    maxUses: 0,
    used: 0,
    status: "Active",
    description: "₹50 off on your first order above ₹199",
  },
  {
    code: "AROMA100",
    discountAmount: 100,
    minOrder: 399,
    maxUses: 500,
    used: 0,
    status: "Active",
    description: "₹100 off on orders above ₹399",
  },
];

const reviews = [
  {
    name: "Priya Reddy",
    rating: 5,
    title: "Best cafe in Nalgonda!",
    body: "Absolutely loved the Cappuccino and Avocado Toast. The ambience is so cozy and the staff is incredibly welcoming. Will definitely be back!",
    date: "2026-06-10",
    helpful: 4,
    verified: true,
    status: "approved",
  },
  {
    name: "Arjun Kumar",
    rating: 5,
    title: "Hyderabadi Biryani is a must-try",
    body: "The dum biryani here is absolutely authentic. Rich saffron aroma and perfectly tender mutton. The best I've had outside of Hyderabad itself!",
    date: "2026-06-12",
    helpful: 7,
    verified: true,
    status: "approved",
  },
  {
    name: "Meera Sharma",
    rating: 4,
    title: "Wonderful brunch spot",
    body: "Came here for the Masala Dosa and wasn't disappointed. Crispy, golden and served with fresh coconut chutney. The Cold Brew coffee was also excellent.",
    date: "2026-06-14",
    helpful: 2,
    verified: false,
    status: "approved",
  },
  {
    name: "Rahul Nair",
    rating: 5,
    title: "Tiramisu is divine!",
    body: "I didn't expect to find such an authentic Tiramisu in Nalgonda but here we are. Perfect mascarpone, just the right espresso kick. Phenomenal.",
    date: "2026-06-15",
    helpful: 3,
    verified: true,
    status: "approved",
  },
  {
    name: "Divya Patel",
    rating: 4,
    title: "Great for families",
    body: "Brought my whole family for dinner. The Butter Chicken was rich and creamy. The staff was super attentive to our kids too. 10/10 experience.",
    date: "2026-06-16",
    helpful: 1,
    verified: false,
    status: "approved",
  },
  {
    name: "Test User",
    rating: 3,
    title: "Decent experience overall",
    body: "The food was good but the wait time was a bit long during the weekend rush. Would recommend booking in advance.",
    date: "2026-06-17",
    helpful: 0,
    verified: false,
    status: "pending",
  },
];

async function seed() {
  console.log("Seeding Menu Items...");
  for (const item of menuItems) {
    await db.collection("menu_items").doc(item.id).set(item);
  }

  console.log("Seeding Tables...");
  for (const table of tables) {
    await db.collection("tables").doc(table.id).set(table);
  }

  console.log("Seeding Coupons...");
  for (const c of coupons) {
    await db.collection("coupons").doc(c.code).set(c);
  }

  console.log("Seeding Reviews...");
  for (const r of reviews) {
    await db.collection("reviews").add(r);
  }

  console.log("✅ Seed complete! Menu, Tables, Coupons, and Reviews are now in Firestore.");
  console.log(
    "📝 Note: Coupon used counts are reset to 0. Clear the reviews collection before client handoff.",
  );
  process.exit(0);
}

seed();
