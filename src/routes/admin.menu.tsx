import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Upload, ImagePlus, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categories, type MenuItem, type Category } from "@/lib/mock/menu";
import { useMenu } from "@/lib/store/menu";
import { useSettings } from "@/lib/store/settings";
import { auth } from "@/lib/firebase";
import { inr } from "@/lib/format";
import { secureUploadImage } from "@/lib/api/cloudinary";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({ meta: [{ title: "Menu — Aroma Admin" }] }),
  component: AdminMenu,
});

function AdminMenu() {
  const items = useMenu((s) => s.menu);
  const addMenuItem = useMenu((s) => s.addMenuItem);
  const updateMenuItem = useMenu((s) => s.updateMenuItem);
  const removeMenuItem = useMenu((s) => s.removeMenuItem);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = items.filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-display font-bold">Menu management</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4 mr-2" /> Add item
        </Button>
      </div>

      <div className="mt-5 flex items-center bg-card rounded-md border border-border px-3 w-72">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dishes"
          className="border-0 focus-visible:ring-0"
        />
      </div>

      <div className="mt-5 bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              {["Item", "Category", "Price", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.id}
                className="border-t border-border hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={i.image}
                      className="size-10 rounded-lg object-cover shrink-0"
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{i.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                <td className="px-4 py-3 font-semibold">{inr(i.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${i.available ? "bg-sage/20 text-sage" : "bg-destructive/10 text-destructive"}`}
                  >
                    {i.available ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(i)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      await removeMenuItem(i.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ItemFormDialog
        open={!!editing || creating}
        item={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (it) => {
          if (editing) await updateMenuItem(it.id, it);
          else await addMenuItem(it);
          toast.success("Saved");
          setEditing(null);
          setCreating(false);
        }}
      />
    </AdminLayout>
  );
}

function ItemFormDialog({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (i: MenuItem) => void;
}) {
  const [f, setF] = useState<MenuItem>(
    item || {
      id: "",
      name: "",
      description: "",
      price: 100,
      category: "Main Course",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      publicId: "",
      veg: true,
      spice: 0,
      prepTime: 15,
      tags: [],
      available: true,
      isDailySpecial: false,
      isBestseller: false,
    },
  );

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync form state whenever the item prop changes (edit vs create)
  useEffect(() => {
    if (item) {
      setF({ ...item, isDailySpecial: !!item.isDailySpecial, isBestseller: !!item.isBestseller });
    } else {
      setF({
        id: "",
        name: "",
        description: "",
        price: 100,
        category: "Main Course",
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        publicId: "",
        veg: true,
        spice: 0,
        prepTime: 15,
        tags: [],
        available: true,
        isDailySpecial: false,
        isBestseller: false,
      });
    }
  }, [item]);

  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const menuCategories = settings?.categories || categories;

  // Sync form state when item prop changes (switching between edit/create)
  const handleOpen = () => {
    if (item) setF({ ...item, isDailySpecial: !!item.isDailySpecial, isBestseller: !!item.isBestseller });
    else
      setF({
        id: "",
        name: "",
        description: "",
        price: 100,
        category: "Main Course",
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        publicId: "",
        veg: true,
        spice: 0,
        prepTime: 15,
        tags: [],
        available: true,
        isDailySpecial: false,
        isBestseller: false,
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        toast.error("You must be signed in as admin to upload images.");
        return;
      }

      const res = await secureUploadImage({
        data: {
          idToken,
          base64File: reader.result as string,
          mimeType: file.type,
          sizeInBytes: file.size,
        },
      });

      setF((prev) => ({ ...prev, image: res.url, publicId: res.publicId || "" }));
      toast.success("Image uploaded securely!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
        else handleOpen();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add new item"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(f);
          }}
          className="space-y-4"
        >
          {/* Image section */}
          <div>
            <Label>Item image</Label>
            <div className="mt-1.5 space-y-2">
              {f.image && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img src={f.image} alt="Preview" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-background/70 grid place-items-center">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {/* Cloudinary upload button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5 mr-1.5" /> Upload image
                    </>
                  )}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Manual URL button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const url = prompt("Paste image URL:", f.image);
                    if (url) setF((prev) => ({ ...prev, image: url }));
                  }}
                >
                  <ImagePlus className="size-3.5 mr-1.5" /> Paste URL
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <select
                value={f.category}
                onChange={(e) => setF({ ...f, category: e.target.value as Category })}
                className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={f.price}
                onChange={(e) => setF({ ...f, price: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prep time (min)</Label>
              <Input
                type="number"
                value={f.prepTime}
                onChange={(e) => setF({ ...f, prepTime: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Spice level</Label>
              <select
                value={f.spice}
                onChange={(e) =>
                  setF({ ...f, spice: (parseInt(e.target.value) || 0) as 0 | 1 | 2 | 3 })
                }
                className="mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value={0}>None 🙂</option>
                <option value={1}>Mild 🌶</option>
                <option value={2}>Medium 🌶🌶</option>
                <option value={3}>Hot 🌶🌶🌶</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={f.veg} onCheckedChange={(v) => setF({ ...f, veg: v })} /> Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={f.available} onCheckedChange={(v) => setF({ ...f, available: v })} />{" "}
              Available
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={!!f.isDailySpecial} onCheckedChange={(v) => setF({ ...f, isDailySpecial: v })} />{" "}
              Daily Special
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={!!f.isBestseller} onCheckedChange={(v) => setF({ ...f, isBestseller: v })} />{" "}
              Bestseller
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
