"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  ImagePlus,
  Loader2,
  Download,
  CheckSquare,
  Square,
  X,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
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
import { exportMenuToCSV } from "@/lib/export";
import { toast } from "sonner";

export default function AdminMenu() {
  const items = useMenu((s) => s.menu);
  const addMenuItem = useMenu((s) => s.addMenuItem);
  const updateMenuItem = useMenu((s) => s.updateMenuItem);
  const removeMenuItem = useMenu((s) => s.removeMenuItem);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const menuCategories = settings?.categories || categories;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchQ =
        !q ||
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.description.toLowerCase().includes(q.toLowerCase());
      const matchCat = selectedCategory === "All" || i.category === selectedCategory;
      return matchQ && matchCat;
    });
  }, [items, q, selectedCategory]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.id));
    }
  };

  // Bulk actions
  const handleBulkAvailability = async (available: boolean) => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      const item = items.find((i) => i.id === id);
      if (item) {
        await updateMenuItem(id, { ...item, available });
      }
    }
    toast.success(
      `Marked ${selectedIds.length} dishes as ${available ? "Available" : "Hidden"}`,
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} dishes?`)) return;
    for (const id of selectedIds) {
      await removeMenuItem(id);
    }
    toast.success(`Deleted ${selectedIds.length} dishes`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const targetItems =
      selectedIds.length > 0 ? items.filter((i) => selectedIds.includes(i.id)) : filtered;
    exportMenuToCSV(targetItems, "aroma_menu_catalog");
    toast.success(`Exported ${targetItems.length} menu items to CSV`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Menu Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {items.length} total dishes & beverages in catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBulkExport}>
            <Download className="size-4 mr-1.5" /> Export {selectedIds.length ? `Selected (${selectedIds.length})` : "All"} CSV
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4 mr-1.5" /> Add New Dish
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-5 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="flex items-center bg-card rounded-md border border-border px-3 w-full sm:w-64">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes..."
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm"
          >
            <option value="All">All Categories</option>
            {menuCategories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 my-4 bg-primary text-primary-foreground p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Layers className="size-5" />
            <span className="font-semibold text-sm">
              {selectedIds.length} {selectedIds.length === 1 ? "dish" : "dishes"} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-semibold"
              onClick={() => handleBulkAvailability(true)}
            >
              <Eye className="size-3.5 mr-1" /> Mark Available
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-semibold"
              onClick={() => handleBulkAvailability(false)}
            >
              <EyeOff className="size-3.5 mr-1" /> Hide Dishes
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs font-semibold"
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-3.5 mr-1" /> Delete Selected
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-primary-foreground/10 rounded-lg text-primary-foreground transition-colors"
              title="Clear selection"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Menu Table */}
      <div className="mt-5 bg-card border border-border rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10">
                <button onClick={toggleSelectAll} className="grid place-items-center">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4 text-muted-foreground" />
                  )}
                </button>
              </th>
              {["Item", "Category", "Price", "Prep Time", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No dishes found matching your search.
                </td>
              </tr>
            )}
            {filtered.map((i) => {
              const isSelected = selectedIds.includes(i.id);
              return (
                <tr
                  key={i.id}
                  className={`border-t border-border transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-secondary/20"
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(i.id)}
                      className="grid place-items-center"
                    >
                      {isSelected ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={i.image}
                        className="size-10 rounded-lg object-cover shrink-0"
                        alt=""
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block size-2 rounded-full ${i.veg ? "bg-green-600" : "bg-red-600"}`}
                          />
                          <p className="font-medium truncate">{i.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {i.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                  <td className="px-4 py-3 font-semibold">{inr(i.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i.prepTime} min</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        i.available
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      }`}
                    >
                      {i.available ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(i)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm(`Delete "${i.name}" from menu?`)) {
                            await removeMenuItem(i.id);
                            toast.success("Deleted dish");
                          }
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
          toast.success("Saved dish");
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

  const handleOpen = () => {
    if (item)
      setF({ ...item, isDailySpecial: !!item.isDailySpecial, isBestseller: !!item.isBestseller });
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
        idToken,
        base64File: reader.result as string,
        mimeType: file.type,
        sizeInBytes: file.size,
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
          <DialogTitle>{item ? "Edit Dish" : "Add New Dish"}</DialogTitle>
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
                {menuCategories.map((c) => (
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
              <Switch
                checked={!!f.isDailySpecial}
                onCheckedChange={(v) => setF({ ...f, isDailySpecial: v })}
              />{" "}
              Daily Special
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch
                checked={!!f.isBestseller}
                onCheckedChange={(v) => setF({ ...f, isBestseller: v })}
              />{" "}
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
