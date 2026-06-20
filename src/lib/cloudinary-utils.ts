/**
 * Optimizes a Cloudinary URL by injecting format and quality auto-optimizations,
 * as well as an optional width limit for responsive loading.
 */
export function optimizeImage(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // Prevent double-applying if already present
  if (parts[1].includes("f_auto") || parts[1].includes("q_auto")) {
    return url;
  }

  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
