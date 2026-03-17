import type { CompressionSettings, FormatPreference } from "./types";

// v3 was used during the PNG mode rollout before we changed the reload defaults.
const STORAGE_KEY = "pixelpress:last-settings:v4";
const validFormats: FormatPreference[] = [
  "original",
  "jpeg",
  "png",
  "webp",
  "avif",
];

function isValidSettings(value: unknown): value is CompressionSettings {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<CompressionSettings>;
  return (
    typeof candidate.quality === "number" &&
    candidate.quality >= 1 &&
    candidate.quality <= 100 &&
    typeof candidate.format === "string" &&
    validFormats.includes(candidate.format as FormatPreference) &&
    typeof candidate.lossless === "boolean" &&
    (candidate.pngMode === "lossless" || candidate.pngMode === "compressed") &&
    typeof candidate.pngColors === "number" &&
    candidate.pngColors >= 2 &&
    candidate.pngColors <= 256
  );
}

export function loadSettings(): CompressionSettings | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSettings(parsed)) {
      return null;
    }

    return {
      ...parsed,
      format: "original",
      lossless: false,
    };
  } catch {
    return null;
  }
}

export function saveSettings(settings: CompressionSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
