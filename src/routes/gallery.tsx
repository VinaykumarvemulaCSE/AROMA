import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useGallery } from "@/lib/store/gallery";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Aroma Cafe Nalgonda" },
      { name: "description", content: "Step inside Aroma Cafe — our space, our food, our team." },
    ],
  }),
  component: Gallery,
});

const cats = ["All", "Interior", "Food", "Events", "Other"] as const;

function Gallery() {
  const { images, loading, fetchImages } = useGallery();
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const list = cat === "All" ? images : images.filter((p) => p.category === cat);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold">Gallery</h1>
        <p className="mt-2 text-muted-foreground">A glimpse inside Aroma Cafe.</p>
        <div className="mt-6 flex gap-2 flex-wrap">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm border ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setOpen(i)}
              className="aspect-square rounded-2xl overflow-hidden group"
            >
              <img
                src={p.url}
                alt={p.caption || p.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4"
          onClick={() => setOpen(null)}
        >
          <button className="absolute top-4 right-4 text-white">
            <X />
          </button>
          <img
            src={list[open].url}
            alt={list[open].caption || list[open].category}
            className="max-h-full max-w-full rounded-xl"
          />
        </div>
      )}
    </SiteLayout>
  );
}
