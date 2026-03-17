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
        "astro",
        "astro/runtime/client/dev-toolbar/entrypoint.js",
        "astro/virtual-modules/transitions-events.js",
        "astro/virtual-modules/transitions-router.js",
        "astro/virtual-modules/transitions-swap-functions.js",
        "astro/virtual-modules/transitions-types.js",
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
