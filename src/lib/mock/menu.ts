export type Category =
  | "Breakfast"
  | "Starters"
  | "Main Course"
  | "Breads & Rice"
  | "Desserts"
  | "Beverages"
  | "Combos";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: Category;
  image: string;
  publicId?: string;
  veg: boolean;
  spice: 0 | 1 | 2 | 3;
  prepTime: number; // mins
  tags: ("Bestseller" | "New" | "Chef's Special" | "Vegan" | "Gluten-Free")[];
  available: boolean;
  isDailySpecial?: boolean;
  isBestseller?: boolean;
};

export const categories: { name: Category; icon: string }[] = [
  { name: "Breakfast", icon: "🍳" },
  { name: "Starters", icon: "🥗" },
  { name: "Main Course", icon: "🍛" },
  { name: "Breads & Rice", icon: "🍚" },
  { name: "Desserts", icon: "🍰" },
  { name: "Beverages", icon: "☕" },
  { name: "Combos", icon: "🍱" },
];

// Mock menu data has been removed — all menu items now come from Firebase.
// Only shared types and category config remain below.
