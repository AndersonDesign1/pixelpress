import type { CompressionPreset } from "./types";

export const presets: CompressionPreset[] = [
  {
    id: "keep-quality",
    label: "Keep quality",
    description: "Stay close to the original while trimming file size.",
    settings: { format: "original", quality: 90, lossless: false },
  },
  {
    id: "smaller-file",
    label: "Smaller file",
    description:
      "Push harder for smaller output with a careful quality tradeoff.",
    settings: { format: "original", quality: 78, lossless: false },
  },
  {
    id: "modern-web",
    label: "Modern web",
    description: "Convert to WebP for a smaller web-friendly version.",
    settings: { format: "webp", quality: 82, lossless: false },
  },
];
