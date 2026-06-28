import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, Image as ImageIcon, Upload, ImagePlus } from "lucide-react";
import { useGallery } from "@/lib/store/gallery";
import { secureUploadGalleryImage } from "@/lib/api/cloudinary";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery Management — Aroma Admin" }] }),
  component: AdminGallery,
});

function AdminGallery() {
  const { images, loading, fetchImages, addImage, deleteImage } = useGallery();
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newImage, setNewImage] = useState({
    url: "",
    publicId: "",
    category: "Interior" as const,
    caption: "",
    order: 0,
  });

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

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

      const res = await secureUploadGalleryImage({
        data: {
          idToken,
          base64File: reader.result as string,
          mimeType: file.type,
          sizeInBytes: file.size,
        },
      });

      setNewImage((prev) => ({ ...prev, url: res.url, publicId: res.publicId || "" }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAdd = async () => {
    if (!newImage.url.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    try {
      await addImage({
        url: newImage.url,
        publicId: newImage.publicId,
        category: newImage.category,
        caption: newImage.caption,
        order: images.length,
      });
      toast.success("Image added successfully");
      setNewImage({ url: "", publicId: "", category: "Interior", caption: "", order: 0 });
      setIsAdding(false);
    } catch {
      toast.error("Failed to add image");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteImage(id);
      toast.success("Image deleted successfully");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const categories = ["Interior", "Food", "Events", "Other"] as const;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's photo gallery</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="size-4 mr-2" /> Add Image
        </Button>
      </div>

      {/* Add Image Form */}
      {isAdding && (
        <div className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Add New Image</h2>
          
          {/* Image upload section */}
          <div className="mb-4">
            <Label>Image</Label>
            <div className="mt-1.5 space-y-2">
              {newImage.url && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img src={newImage.url} alt="Preview" className="w-full h-full object-cover" />
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
                    const url = prompt("Paste image URL:", newImage.url);
                    if (url) setNewImage((prev) => ({ ...prev, url }));
                  }}
                >
                  <ImagePlus className="size-3.5 mr-1.5" /> Paste URL
                </Button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={newImage.category}
                onValueChange={(value: any) => setNewImage({ ...newImage, category: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Caption (Optional)</Label>
              <Input
                value={newImage.caption}
                onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                placeholder="Image description"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleAdd} disabled={loading || uploading}>
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : "Add Image"}
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="mt-6">
        {loading && images.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="size-8 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <ImageIcon className="size-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No images in gallery yet</p>
            <Button onClick={() => setIsAdding(true)} className="mt-4">
              Add your first image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border">
                <img
                  src={image.url}
                  alt={image.caption || image.category}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 size-8 shadow-sm"
                  aria-label="Delete image"
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-4 pointer-events-none">
                  <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded mb-2">
                    {image.category}
                  </span>
                  {image.caption && (
                    <p className="text-white text-xs text-center line-clamp-2">{image.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
