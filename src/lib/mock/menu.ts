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

const img = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const menu: MenuItem[] = [
  {
    id: "m1",
    name: "Cappuccino",
    description: "Rich espresso topped with velvety steamed milk foam.",
    longDescription:
      "Our signature cappuccino features a double shot of single-origin espresso, perfectly balanced with silky microfoam and a dusting of cocoa.",
    price: 180,
    category: "Beverages",
    image: img("photo-1572442388796-11668a67e53d"),
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
    image: img("photo-1461023058943-07fcbe16d735"),
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
    image: img("photo-1576092768241-dec231879fc3"),
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
    image: img("photo-1525351484163-7529414344d8"),
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
    image: img("photo-1668236543090-82eba5ee5976"),
    veg: true,
    spice: 2,
    prepTime: 15,
    tags: ["Bestseller", "Vegan"],
    available: true,
  },
  {
    id: "m6",
    name: "Paneer Tikka",
    description: "Char-grilled cottage cheese, capsicum, onions, mint chutney.",
    price: 280,
    category: "Starters",
    image: img("photo-1631452180519-c014fe946bc7"),
    veg: true,
    spice: 2,
    prepTime: 18,
    tags: ["Bestseller"],
    available: true,
  },
  {
    id: "m7",
    name: "Chicken 65",
    description: "Andhra-style fried chicken, curry leaves, green chilli.",
    price: 320,
    category: "Starters",
    image: img("photo-1626777552726-4a6b54c97e46"),
    veg: false,
    spice: 3,
    prepTime: 20,
    tags: ["Chef's Special"],
    available: true,
  },
  {
    id: "m8",
    name: "Butter Chicken",
    description: "Tandoor chicken in a silky tomato-butter gravy.",
    price: 380,
    category: "Main Course",
    image: img("photo-1603894584373-5ac82b2ae398"),
    veg: false,
    spice: 1,
    prepTime: 25,
    tags: ["Bestseller"],
    available: true,
  },
  {
    id: "m9",
    name: "Dal Makhani",
    description: "Slow-cooked black lentils, cream, fenugreek butter.",
    price: 260,
    category: "Main Course",
    image: img("photo-1626100134240-ab23b9b7d3e0"),
    veg: true,
    spice: 1,
    prepTime: 20,
    tags: [],
    available: true,
  },
  {
    id: "m10",
    name: "Hyderabadi Biryani",
    description: "Dum-cooked basmati, saffron, tender mutton, mirchi salan.",
    price: 420,
    category: "Main Course",
    image: img("photo-1563379091339-03b21ab4a4f8"),
    veg: false,
    spice: 2,
    prepTime: 35,
    tags: ["Bestseller", "Chef's Special"],
    available: true,
  },
  {
    id: "m11",
    name: "Butter Garlic Naan",
    description: "Tandoor-baked, brushed with garlic butter and coriander.",
    price: 80,
    category: "Breads & Rice",
    image: img("photo-1610057099443-fde8c4d50f91"),
    veg: true,
    spice: 0,
    prepTime: 8,
    tags: [],
    available: true,
  },
  {
    id: "m12",
    name: "Tiramisu",
    description: "Mascarpone, espresso-soaked ladyfingers, cocoa dust.",
    price: 240,
    category: "Desserts",
    image: img("photo-1571877227200-a0d98ea607e9"),
    veg: true,
    spice: 0,
    prepTime: 5,
    tags: ["Chef's Special"],
    available: true,
  },
  {
    id: "m13",
    name: "Gulab Jamun",
    description: "Warm khoya dumplings in cardamom-rose syrup. Two pieces.",
    price: 120,
    category: "Desserts",
    image: img("photo-1601303516534-bdf8d2dcb4e1"),
    veg: true,
    spice: 0,
    prepTime: 5,
    tags: [],
    available: true,
  },
  {
    id: "m14",
    name: "Aroma Brunch Combo",
    description: "Avocado toast, masala dosa, cappuccino, fresh juice.",
    price: 599,
    category: "Combos",
    image: img("photo-1533089860892-a7c6f0a88666"),
    veg: false,
    spice: 1,
    prepTime: 20,
    tags: ["New", "Chef's Special"],
    available: true,
  },
];

export const todaysSpecial = ["m4", "m10", "m12"];
export const bestsellers = ["m1", "m3", "m5", "m8", "m10"];
export const newArrivals = ["m2", "m14"];

export const getMenu = () => menu;
export const getItem = (id: string) => menu.find((m) => m.id === id);
