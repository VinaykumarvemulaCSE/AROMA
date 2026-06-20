import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Gallery — Aroma Cafe Nalgonda" },
    { name: "description", content: "Step inside Aroma Cafe — our space, our food, our team." },
  ] }),
  component: Gallery,
});

const photos = [
  { src: "photo-1559339352-11d035aa65de", cat: "Interior" },
  { src: "photo-1414235077428-338989a2e8c0", cat: "Interior" },
  { src: "photo-1517248135467-4c7edcad34c4", cat: "Food" },
  { src: "photo-1554118811-1e0d58224f24", cat: "Food" },
  { src: "photo-1572442388796-11668a67e53d", cat: "Food" },
  { src: "photo-1461023058943-07fcbe16d735", cat: "Food" },
  { src: "photo-1525351484163-7529414344d8", cat: "Food" },
  { src: "photo-1576092768241-dec231879fc3", cat: "Food" },
  { src: "photo-1554118811-1e0d58224f24", cat: "Interior" },
  { src: "photo-1559339352-11d035aa65de", cat: "Interior" },
  { src: "photo-1517248135467-4c7edcad34c4", cat: "Events" },
  { src: "photo-1414235077428-338989a2e8c0", cat: "Events" },
];

const cats = ["All", "Interior", "Food", "Events"] as const;

function Gallery() {
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = cat === "All" ? photos : photos.filter((p) => p.cat === cat);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold">Gallery</h1>
        <p className="mt-2 text-muted-foreground">A glimpse inside Aroma Cafe.</p>
        <div className="mt-6 flex gap-2 flex-wrap">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm border ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((p, i) => (
            <button key={i} onClick={() => setOpen(i)} className="aspect-square rounded-2xl overflow-hidden group">
              <img src={`https://images.unsplash.com/${p.src}?auto=format&fit=crop&w=600&q=80`} alt={p.cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4" onClick={() => setOpen(null)}>
          <button className="absolute top-4 right-4 text-white"><X /></button>
          <img src={`https://images.unsplash.com/${list[open].src}?auto=format&fit=crop&w=1600&q=85`} alt="" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </SiteLayout>
  );
}
