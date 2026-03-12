import type { FormatPreference, OutputFormat } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(1)} ${units[unit]}`;
}

export function outputExtension(format: OutputFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

export function formatLabel(format: FormatPreference): string {
  if (format === "original") {
    return "Original";
  }

  return format === "jpeg" ? "JPEG" : format.toUpperCase();
}

export function formatFromMimeType(mimeType: string): OutputFormat | null {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpeg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return null;
  }
}

export function formatFromFilename(name: string): OutputFormat | null {
  const extension = name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "jpeg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    case "avif":
      return "avif";
    default:
      return null;
  }
}

export function formatFromFile(file: Pick<File, "name" | "type">) {
  return formatFromMimeType(file.type) ?? formatFromFilename(file.name);
}

export function resolveOutputFormat(
  file: Pick<File, "name" | "type">,
  preferredFormat: FormatPreference
): OutputFormat {
  if (preferredFormat !== "original") {
    return preferredFormat;
  }

  return formatFromFile(file) ?? "webp";
}

export function savingsPercent(sizeDelta: number, originalSize: number) {
  if (!originalSize) {
    return 0;
  }

  return Math.round((Math.abs(sizeDelta) / originalSize) * 100);
}

export function settingsSignature({
  format,
  lossless,
  quality,
}: {
  format: FormatPreference;
  lossless: boolean;
  quality: number;
}) {
  return `${format}:${quality}:${lossless ? "lossless" : "lossy"}`;
}
