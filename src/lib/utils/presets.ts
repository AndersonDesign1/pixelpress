import type { CompressionPreset } from "./types";

export const presets: CompressionPreset[] = [
  {
    id: "lossless",
    label: "Lossless",
    description: "Preserve quality with PNG output.",
    settings: { format: "png", quality: 100, lossless: true },
  },
  {
    id: "high-quality",
    label: "High Quality",
    description: "Great visual quality with JPEG.",
    settings: { format: "jpeg", quality: 88, lossless: false },
  },
  {
    id: "webp",
    label: "WebP",
    description: "Balanced modern format for web usage.",
    settings: { format: "webp", quality: 82, lossless: false },
  },
  {
    id: "avif",
    label: "AVIF",
    description: "Maximum compression for modern browsers.",
    settings: { format: "avif", quality: 60, lossless: false },
  },
  {
    id: "blog",
    label: "Blog Optimized",
    description: "Fast-loading article images.",
    settings: { format: "webp", quality: 74, lossless: false },
  },
  {
    id: "social",
    label: "Social Optimized",
    description: "High-impact visuals tuned for social feeds.",
    settings: { format: "jpeg", quality: 80, lossless: false },
  },
];
