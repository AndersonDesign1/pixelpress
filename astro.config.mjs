import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  site: "https://pixelpress.app",
  output: "server",
  redirects: {
    "/app": "/",
  },
  integrations: [react()],
  adapter: node({
    mode: "standalone",
  }),
  server: {
    host: true,
    port: Number(process.env.PORT) || 4321,
  },
  vite: {
    plugins: [tailwindcss(), wasm()],
    optimizeDeps: {
      exclude: [
        "@jsquash/avif",
        "@jsquash/jpeg",
        "@jsquash/oxipng",
        "@jsquash/png",
        "@jsquash/webp",
        "imagequant",
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
      plugins: () => [wasm()],
    },
  },
});
