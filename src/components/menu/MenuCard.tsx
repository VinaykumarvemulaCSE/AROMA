import { Link } from "@tanstack/react-router";
import { Heart, Leaf, Flame } from "lucide-react";
import type { MenuItem } from "@/lib/mock/menu";
import { inr } from "@/lib/format";
import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { optimizeImage } from "@/lib/cloudinary-utils";

export function MenuCard({ item, onOpen }: { item: MenuItem; onOpen?: (id: string) => void }) {
  const fav = useAuth((s) => s.favorites.includes(item.id));
  const toggleFav = useAuth((s) => s.toggleFav);
  const add = useCart((s) => s.add);

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        <button
          onClick={() => onOpen?.(item.id)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Open ${item.name}`}
        >
          <img
            src={optimizeImage(item.image, 600)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </button>
        <div className="pointer-events-none absolute top-2 left-2 flex gap-1 flex-wrap">
          {item.tags.includes("Bestseller") && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gold text-espresso">
              Bestseller
            </span>
          )}
          {item.tags.includes("New") && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sage text-white">
              New
            </span>
          )}
          {item.tags.includes("Chef's Special") && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-destructive text-destructive-foreground">
              Chef's
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(item.id);
            toast.success(fav ? "Removed from favorites" : "Added to favorites");
          }}
          className="absolute top-2 right-2 grid place-items-center size-8 rounded-full bg-background/90 backdrop-blur"
          aria-label="Toggle favorite"
        >
          <Heart className={`size-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block size-3 border-2 ${item.veg ? "border-sage" : "border-destructive"} p-0.5`}
              >
                <span
                  className={`block size-full rounded-full ${item.veg ? "bg-sage" : "bg-destructive"}`}
                />
              </span>
              <h3 className="font-display font-semibold truncate">{item.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {item.spice > 0 &&
              Array.from({ length: item.spice }).map((_, i) => (
                <Flame key={i} className="size-3 text-destructive" />
              ))}
            {item.tags.includes("Vegan") && <Leaf className="size-3 text-sage" />}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-bold text-lg">{inr(item.price)}</span>
          <Button
            size="sm"
            onClick={() => {
              add(item);
              toast.success(`Added ${item.name}`);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MenuCardLink({ item }: { item: MenuItem }) {
  return (
    <Link to="/menu" hash={item.id} className="contents">
      <MenuCard item={item} />
    </Link>
  );
}
