"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useGallery } from "@/lib/store/gallery";
import { optimizeImage } from "@/lib/cloudinary-utils";

const cats = ["All", "Interior", "Food", "Events", "Other"] as const;

export default function Gallery() {
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
              onClick={() => {
                setCat(c);
                setOpen(null);
              }}
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
              className="relative aspect-square rounded-2xl overflow-hidden group"
            >
              <Image
                src={optimizeImage(p.url, 800)}
                alt={p.caption || p.category}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </section>

      {open !== null && list[open] && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(null);
            }}
          >
            <X className="size-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw] w-[800px] h-[600px]">
            <Image
              src={optimizeImage(list[open].url, 1600)}
              alt={list[open].caption || list[open].category}
              fill
              className="rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
