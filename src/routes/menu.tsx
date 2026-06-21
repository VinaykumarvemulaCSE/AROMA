import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MenuCard } from "@/components/menu/MenuCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categories, type Category } from "@/lib/mock/menu";
import { useMenu } from "@/lib/store/menu";
import { useCart } from "@/lib/store/cart";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { optimizeImage } from "@/lib/cloudinary-utils";

type Diet = "all" | "veg" | "nonveg";
type Sort = "popular" | "rating" | "price-asc" | "price-desc" | "new";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Aroma Cafe & Restaurant" },
      {
        name: "description",
        content:
          "Browse our menu — specialty coffee, breakfast, mains, desserts and more. Order online for delivery or pickup.",
      },
      { property: "og:title", content: "Menu — Aroma Cafe" },
      { property: "og:description", content: "Specialty coffee, breakfast, mains, desserts." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [diet, setDiet] = useState<Diet>("all");
  const [price, setPrice] = useState<[number, number]>([0, 1000]);
  const [sort, setSort] = useState<Sort>("popular");
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const menu = useMenu((s) => s.menu);

  const items = useMemo(() => {
    let arr = menu.filter((m) => {
      if (cat !== "All" && m.category !== cat) return false;
      if (q && !`${m.name} ${m.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (diet === "veg" && !m.veg) return false;
      if (diet === "nonveg" && m.veg) return false;
      if (m.price < price[0] || m.price > price[1]) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        arr = [...arr].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr = [...arr].sort((a, b) => b.price - a.price);
        break;
      case "new":
        arr = [...arr].sort((a) => (a.tags.includes("New") ? -1 : 1));
        break;
      default:
        break;
    }
    return arr;
  }, [q, cat, diet, price, sort]);

  const clearAll = () => {
    setQ("");
    setCat("All");
    setDiet("all");
    setPrice([0, 1000]);
    setSort("popular");
  };
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (cat !== "All") activeFilters.push({ label: cat, clear: () => setCat("All") });
  if (diet !== "all")
    activeFilters.push({
      label: diet === "veg" ? "Veg only" : "Non-veg only",
      clear: () => setDiet("all"),
    });
  if (price[0] > 0 || price[1] < 1000)
    activeFilters.push({
      label: `${inr(price[0])}–${inr(price[1])}`,
      clear: () => setPrice([0, 1000]),
    });

  return (
    <SiteLayout>
      <section className="bg-secondary/30 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl sm:text-5xl font-display font-bold">Our Menu</h1>
          <p className="mt-2 text-muted-foreground">
            Specialty coffee, hearty meals & sweet endings.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <div className="flex items-center bg-card rounded-full px-4 border border-border w-full sm:w-96">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dishes, drinks…"
                className="border-0 focus-visible:ring-0 bg-transparent"
              />
            </div>
            <Button variant="outline" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="size-4 mr-2" /> Filters
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="popular">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="new">Newest</option>
            </select>
          </div>

          {/* Categories chips */}
          <div className="mt-5 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              <Chip active={cat === "All"} onClick={() => setCat("All")}>
                All
              </Chip>
              {categories.map((c) => (
                <Chip key={c.name} active={cat === c.name} onClick={() => setCat(c.name)}>
                  <span className="mr-1.5">{c.icon}</span>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {activeFilters.map((f) => (
                <button
                  key={f.label}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-accent/30 hover:bg-accent/50"
                >
                  {f.label} <X className="size-3" />
                </button>
              ))}
              <button onClick={clearAll} className="text-xs text-muted-foreground underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted-foreground mb-4">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg">No dishes match these filters.</p>
            <Button variant="outline" onClick={clearAll} className="mt-4">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((i) => (
              <MenuCard key={i.id} item={i} onOpen={setOpenId} />
            ))}
          </div>
        )}
      </section>

      {/* FILTERS DIALOG */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <p className="font-semibold mb-2 text-sm">Dietary</p>
              <div className="flex gap-2">
                {(["all", "veg", "nonveg"] as Diet[]).map((d) => (
                  <Chip key={d} active={diet === d} onClick={() => setDiet(d)}>
                    {d === "all" ? "All" : d === "veg" ? "Veg" : "Non-veg"}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2 text-sm">
                Price range: {inr(price[0])} – {inr(price[1])}
              </p>
              <Slider
                min={0}
                max={1000}
                step={50}
                value={price}
                onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={clearAll} className="flex-1">
                Clear
              </Button>
              <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ItemDialog id={openId} onClose={() => setOpenId(null)} />
    </SiteLayout>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function ItemDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const menu = useMenu((s) => s.menu);
  const item = id ? menu.find((m) => m.id === id) : null;
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  if (!item) return null;

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="aspect-[16/9] w-full">
          <img
            src={optimizeImage(item.image, 1200)}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`inline-block size-3 border-2 ${item.veg ? "border-sage" : "border-destructive"} p-0.5`}
                >
                  <span
                    className={`block size-full rounded-full ${item.veg ? "bg-sage" : "bg-destructive"}`}
                  />
                </span>
                <span>{item.category}</span>
                <span>·</span>
                <span>{item.prepTime} min</span>
              </div>
              <h2 className="mt-1 text-2xl font-display font-bold">{item.name}</h2>
            </div>
            <span className="font-display text-2xl font-bold">{inr(item.price)}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {item.longDescription || item.description}
          </p>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center border border-border rounded-full">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="size-9 grid place-items-center"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-9 grid place-items-center">
                +
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                add(item, qty);
                toast.success(`Added ${qty} × ${item.name}`);
                onClose();
                setQty(1);
              }}
            >
              Add {qty} to cart · {inr(item.price * qty)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
