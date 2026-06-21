import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aroma Cafe Nalgonda" },
      {
        name: "description",
        content:
          "The story of Aroma Cafe & Restaurant — a family-run cafe in the heart of Nalgonda.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section
        className="relative h-[40vh] min-h-[280px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        <div className="relative mx-auto max-w-5xl px-4 h-full flex items-end pb-10 text-white">
          <h1 className="text-5xl font-display font-bold">Our story</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 prose prose-neutral">
        <p className="text-lg leading-relaxed">
          Aroma Cafe was born in 2019 from a simple idea — Nalgonda deserved a place where great
          coffee, honest food and warm hospitality came together under one roof.
        </p>
        <p className="mt-4 text-muted-foreground">
          What started as a 12-seater on Clock Tower Road has grown into a much-loved space for
          first dates, family birthdays, after-school treats and quiet afternoons with a book. We're
          family-run, chef-led, and obsessed with sourcing — our coffee comes from Chikmagalur, our
          paneer is made fresh daily, and our desserts are baked every morning.
        </p>
        <h2 className="mt-10 text-2xl font-display font-bold">What we stand for</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground list-disc list-inside">
          <li>Real ingredients. No frozen shortcuts.</li>
          <li>Fair prices, generous portions.</li>
          <li>Hospitality that makes you feel at home.</li>
        </ul>
      </section>
    </SiteLayout>
  );
}
