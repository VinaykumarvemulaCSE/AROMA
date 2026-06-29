import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ratingBreakdown } from "@/lib/mock/reviews";
import { useReviews } from "@/lib/store/reviews";
import { useSettings } from "@/lib/store/settings";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Aroma Cafe Nalgonda" },
      { name: "description", content: "Read what our guests say about Aroma Cafe & Restaurant." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const allReviews = useReviews((s) => s.reviews);
  const addReview = useReviews((s) => s.addReview);
  const reviews = allReviews.filter((r) => r.status === "approved");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !body.trim()) return;
    await addReview({ name: name.trim(), rating, title: title.trim(), body: body.trim() });
    setName("");
    setTitle("");
    setBody("");
    setRating(5);
    setOpen(false);
    toast.success("Thanks! Your review was submitted for approval.");
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Reviews</h1>
            <p className="mt-2 text-muted-foreground">Honest words from Aroma regulars.</p>
          </div>
          <Button onClick={() => setOpen(true)}>Write a review</Button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-6xl font-display font-bold">{settings?.rating || 4.7}</p>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.floor(settings?.rating || 4.7) ? "fill-gold text-gold" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{settings?.reviewCount || 1284} reviews</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-3 py-1">
                <span className="text-sm w-6">{s}★</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gold"
                    style={{ width: `${ratingBreakdown[s as 5]}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {ratingBreakdown[s as 5]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {reviews.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              No reviews yet — be the first to share your experience!
            </div>
          )}
          {reviews.map((r) => (
            <article key={r.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 grid place-items-center rounded-full bg-secondary font-display font-semibold">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {r.name}{" "}
                      {r.verified && (
                        <span className="text-xs text-sage font-normal">· Verified</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-gold text-gold" />
                  ))}
                </span>
              </div>
              <h3 className="mt-3 font-display font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              {r.helpful > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  👍 {r.helpful} found this helpful
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Your rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}>
                    <Star
                      className={`size-7 ${s <= rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Your name</Label>
              <Input
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1.5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
              />
            </div>
            <div>
              <Label>Your review</Label>
              <Textarea
                rows={4}
                maxLength={500}
                className="mt-1.5"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews are checked by our team before appearing publicly.
            </p>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
