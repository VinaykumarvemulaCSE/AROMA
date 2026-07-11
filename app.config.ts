import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    preset: "vercel",
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
});
