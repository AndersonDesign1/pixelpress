# PixelPress

PixelPress is a local-first image compression app built with Astro, React, and browser-side codecs. You drop in a batch of images, the work happens in a web worker, and you get to compare the results before downloading anything.

There is no upload step and no backend doing secret image work somewhere else. The whole point is to keep it simple: run it locally, compress a pile of images, keep the version that actually looks worth keeping, and move on.

## What the app does

- Compresses images in the browser with `@jsquash` codecs
- Optimizes PNGs with `oxipng`
- Generates multiple candidate variants when that helps
- Lets you compare the original and compressed output side by side
- Keeps the best result by default, but still lets you inspect other versions
- Exports one file at a time or bundles the best results into a zip

## Tech stack

- Astro 6 for the site shell and routes (Cloudflare Workers adapter)
- React 19 for the compression workspace
- Tailwind CSS v4 for styling
- Web Workers for codec work
- Cloudflare Workers for deployment
- Bun for installs and scripts

## Project shape

- `src/pages` contains the Astro routes
- `src/components/app` contains the React compression UI
- `src/lib/workers` contains the compression worker
- `src/lib/codecs` contains the codec helpers
- `src/lib/utils` contains shared types, presets, formatting, and storage helpers
- `src/content/changelog` contains changelog entries

The app now lives at `/`. The old `/app` path is redirected for compatibility.

## Getting started

Use Node 24 and Bun.

```bash
node --version
bun install
bun run dev
```

The dev server runs on `http://localhost:4321`.

The default deployment target in this repo is Cloudflare Workers at `https://pixelpress.workers.dev`. If you attach a custom domain, update Astro `site` in `astro.config.mjs` so canonical URLs point at the final hostname.

## Commands

```bash
bun run dev
bun run check
bun run build
bun run preview
bun run deploy
```

## Notes

- `bun run check` runs both linting and `astro check`
- `bun run preview` uses Astro's Cloudflare-aware preview runtime after a build
- Compression stays client-side
- Last-used settings are stored in `localStorage`
- SharedArrayBuffer support is enabled in production through COOP/COEP headers in Astro middleware (`src/middleware.ts`)

## Why it exists

This started from a pretty ordinary annoyance: a lot of image tools are either too limited, too fussy, or too eager to push you toward an upload flow. PixelPress is meant to feel lighter than that. Open it, drop files in, compare the outputs, download the ones you want, done.
