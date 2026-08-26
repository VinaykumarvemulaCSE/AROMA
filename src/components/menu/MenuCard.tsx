import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Flame } from "lucide-react";
import type { MenuItem } from "@/lib/mock/menu";
import { inr } from "@/lib/format";
import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { optimizeImage } from "@/lib/cloudinary-utils";
import { haptic } from "@/lib/haptics";

export function MenuCard({ item, onOpen }: { item: MenuItem; onOpen?: (id: string) => void }) {
  const fav = useAuth((s) => s.favorites.includes(item.id));
  const toggleFav = useAuth((s) => s.toggleFav);
  const add = useCart((s) => s.add);
  const cartLine = useCart((s) => s.lines.find((l) => l.id === item.id));
  const setQty = useCart((s) => s.setQty);

  const qty = cartLine?.qty ?? 0;

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <button
          onClick={() => onOpen?.(item.id)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Open ${item.name}`}
        >
          <Image
            src={optimizeImage(item.image, 600)}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-108 transition-transform duration-500"
          />
        </button>
        <div className="pointer-events-none absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
          {item.tags.includes("Bestseller") && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-sm flex items-center gap-0.5 animate-pulse">
              🔥 Bestseller
            </span>
          )}
          {item.tags.includes("New") && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-sage text-white shadow-sm">
              ✨ New
            </span>
          )}
          {item.tags.includes("Chef's Special") && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-600 text-white shadow-sm flex items-center gap-0.5">
              ☕ Chef's Special
            </span>
          )}
          {item.tags.includes("Vegan") && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-600 text-white shadow-sm flex items-center gap-0.5">
              🌿 Vegan
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            toggleFav(item.id);
            toast.success(fav ? "Removed from favorites" : "Added to favorites");
          }}
          className="absolute top-3 right-3 grid place-items-center size-8 rounded-full bg-background/95 backdrop-blur shadow-md hover:scale-110 active:scale-90 transition-all z-10"
          aria-label="Toggle favorite"
        >
          <Heart
            className={`size-4 transition-colors ${fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center p-0.5 size-4 rounded-sm border ${item.veg ? "border-green-600" : "border-red-600"}`}
                title={item.veg ? "Vegetarian" : "Non-Vegetarian"}
              >
                <span
                  className={`size-2 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`}
                />
              </span>
              <h3 className="font-display font-semibold text-base truncate group-hover:text-primary transition-colors">
                {item.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Footer actions row */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-foreground">
              {inr(item.price)}
            </span>
            {item.spice > 0 && (
              <span className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: item.spice }).map((_, i) => (
                  <Flame
                    key={i}
                    className="size-3 text-rose-500 fill-rose-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            )}
          </div>

          <div className="shrink-0">
            {qty > 0 ? (
              <div className="flex items-center border border-primary bg-primary/5 rounded-full overflow-hidden h-9 shadow-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("light");
                    setQty(item.id, qty - 1);
                  }}
                  className="px-3 hover:bg-primary/10 h-full font-semibold transition-colors active:scale-75 text-primary"
                >
                  −
                </button>
                <span className="w-6 text-center text-xs font-bold text-foreground">{qty}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("light");
                    setQty(item.id, qty + 1);
                  }}
                  className="px-3 hover:bg-primary/10 h-full font-semibold transition-colors active:scale-75 text-primary"
                >
                  +
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  haptic("medium");
                  add(item);
                  toast.success(`Added ${item.name} to cart`);
                }}
                className="rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all px-4"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuCardLink({ item }: { item: MenuItem }) {
  return (
    <Link href={`/menu#${item.id}`} className="contents">
      <MenuCard item={item} />
    </Link>
  );
}
