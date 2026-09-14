/**
 * Optimizes an image URL (Cloudinary or Unsplash) by injecting format,
 * quality auto-optimizations, and an optional width limit for responsive loading.
 */
export function optimizeImage(url: string, width?: number): string {
  if (!url || typeof url !== "string") return url || "";

  // Handle Unsplash images
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      if (width) {
        parsed.searchParams.set("w", String(width));
      }
      parsed.searchParams.set("q", "75");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  if (!url.includes("res.cloudinary.com")) return url;

  // Enforce HTTPS
  const secureUrl = url.replace(/^http:\/\//i, "https://");

  const parts = secureUrl.split("/upload/");
  if (parts.length !== 2) return secureUrl;

  // Prevent double-applying if transformations are already present
  if (parts[1].includes("f_auto") || parts[1].includes("q_auto")) {
    return secureUrl;
  }

  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`c_limit,w_${width}`);

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
