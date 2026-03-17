import type {
  CompressionSettings,
  CompressionStrategy,
  OutputFormat,
} from "../utils/types";

const pngOptimiseOptions = {
  interlace: false,
  level: 2,
  optimiseAlpha: true,
} as const;

async function encodeToPng(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/png");
  return encode(imageData);
}

async function optimisePng(
  pngData: ArrayBuffer | ImageData
): Promise<ArrayBuffer> {
  const { optimise } = await import("@jsquash/oxipng");
  return optimise(pngData, pngOptimiseOptions);
}

export async function compressPngFile(file: File): Promise<ArrayBuffer> {
  return optimisePng(await file.arrayBuffer());
}

export async function compressImageData(
  imageData: ImageData,
  settings: CompressionSettings & { format: OutputFormat },
  strategy: CompressionStrategy
): Promise<ArrayBuffer> {
  const format = settings.format;

  if (strategy === "png-optimize") {
    try {
      return await optimisePng(imageData);
    } catch {
      return encodeToPng(imageData);
    }
  }

  if (strategy === "png-encode-fallback" || format === "png") {
    return encodeToPng(imageData);
  }

  if (format === "webp") {
    const { encode } = await import("@jsquash/webp");
    return encode(imageData, {
      exact: 0,
      near_lossless:
        strategy === "webp-lossless" || settings.lossless ? 100 : 0,
      quality:
        strategy === "webp-lossless" || settings.lossless
          ? 100
          : settings.quality,
    });
  }

  if (format === "avif") {
    const { encode } = await import("@jsquash/avif");
    return encode(imageData, {
      quality: settings.lossless ? 100 : settings.quality,
      speed: 7,
    });
  }

  const { encode } = await import("@jsquash/jpeg");
  return encode(imageData, {
    baseline: false,
    optimize_coding: true,
    quality: settings.quality,
  });
}
