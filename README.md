# PixelPress (Astro + React Image Compressor)

PixelPress is a single-repo Astro project with:

- Astro marketing/content pages (`/`, `/features`, `/about`, `/changelog`, `/docs`)
- A React + TypeScript compressor app at `/app`
- Browser-side compression via jSquash codecs inside Web Workers
- Tailwind CSS styling
- Static-first deployment target for Vercel

## Why this architecture

- **Cheap hosting:** static-first Astro output with no image-processing backend.
- **Privacy-first:** images are compressed entirely in-browser and are never uploaded.
- **Performance:** heavy codec work is pushed to workers and loaded lazily.

## Project structure

- `src/layouts` shared Astro shell
- `src/pages` marketing pages + `/app`
- `src/content/changelog` markdown changelog entries
- `src/components/marketing` reusable content components
- `src/components/app` React compressor UI components
- `src/lib/codecs` lazy-loaded jSquash adapters
- `src/lib/workers` worker pipeline
- `src/lib/utils` types, presets, storage helpers
- `src/styles` global Tailwind styles

## Commands

```bash
bun install
bun run dev
bun run check
bun run build
bun run preview
```

## Notes

- No server-side image processing is used.
- Presets included: Lossless, High Quality, WebP, AVIF, Blog Optimized, Social Optimized.
- Last-used settings are persisted in `localStorage`.
