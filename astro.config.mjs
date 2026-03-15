import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pixelpress.workers.dev",
  output: "server",
  redirects: {
    "/app": "/",
  },
  integrations: [react()],
  adapter: cloudflare({
    imageService: "compile",
  }),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: [
        "@jsquash/avif",
        "@jsquash/jpeg",
        "@jsquash/oxipng",
        "@jsquash/png",
        "@jsquash/webp",
      ],
    },
    build: {
      target: "esnext",
    },
    worker: {
      format: "es",
    },
  },
});
