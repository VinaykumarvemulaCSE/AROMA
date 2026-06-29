import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    preset: "vercel",
    prerender: {
      routes: ["/"],
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
});
