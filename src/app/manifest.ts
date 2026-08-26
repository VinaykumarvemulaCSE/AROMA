import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aroma Cafe & Restaurant — Nalgonda",
    short_name: "Aroma Cafe",
    description: "Specialty coffee, artisanal pastries, and hearty meals in Nalgonda.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1917",
    theme_color: "#3b281f",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
