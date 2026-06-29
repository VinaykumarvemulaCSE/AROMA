import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, Check, X, Trash2, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReviews, type StoredReview, type ReviewStatus } from "@/lib/store/reviews";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Aroma Admin" }] }),
  component: () => (
    <AdminLayout>
      <AdminReviews />
    </AdminLayout>
  ),
});

function AdminReviews() {
  const list = useReviews((s) => s.reviews);
  const setStatus = useReviews((s) => s.setStatus);
  const removeReview = useReviews((s) => s.remove);
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [q, setQ] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const counts = useMemo(
    () => ({
      total: list.length,
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
    }),
    [list],
  );

  const filtered = useMemo(() => {
    return list.filter((r) => {
      if (r.status !== tab) return false;
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !r.name.toLowerCase().includes(s) &&
          !r.title.toLowerCase().includes(s) &&
          !r.body.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [list, tab, q, ratingFilter]);

  const handleSetStatus = (id: string, status: ReviewStatus, msg: string) => {
    setStatus(id, status);
    toast.success(msg);
  };
  const remove = (id: string) => {
    removeReview(id);
    toast.success("Review deleted");
  };

  const Stat = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-display font-bold mt-1 ${tone ?? ""}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve or reject customer reviews before they appear on the site.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={counts.total} />
        <Stat label="Pending" value={counts.pending} tone="text-gold" />
        <Stat label="Approved" value={counts.approved} tone="text-sage" />
        <Stat label="Rejected" value={counts.rejected} tone="text-destructive" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, title, content..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ReviewStatus)}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              No {tab} reviews{q || ratingFilter !== "all" ? " match your filters" : ""}.
            </div>
          )}
          {filtered.map((r) => (
            <article key={r.id} className="bg-card border border-border rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 grid place-items-center rounded-full bg-secondary font-display font-semibold shrink-0">
                    {r.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
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
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleSetStatus(r.id, "approved", "Review approved")}
                  >
                    <Check className="size-4" /> Approve
                  </Button>
                )}
                {r.status === "approved" && (
                  <Button
                    size="sm"
                    variant={r.featured ? "default" : "outline"}
                    className={r.featured ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
                    onClick={async () => {
                      await useReviews.getState().toggleFeatured(r.id, !r.featured);
                      toast.success(r.featured ? "Removed from homepage" : "Featured on homepage");
                    }}
                  >
                    <Star className="size-4 mr-1.5" />
                    {r.featured ? "Featured" : "Feature"}
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetStatus(r.id, "rejected", "Review rejected")}
                  >
                    <X className="size-4" /> Reject
                  </Button>
                )}
                {r.status !== "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetStatus(r.id, "pending", "Moved back to pending")}
                  >
                    Move to pending
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
