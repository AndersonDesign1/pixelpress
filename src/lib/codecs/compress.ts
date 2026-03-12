import type {
  CompressionSettings,
  CompressionStrategy,
  OutputFormat,
} from "../utils/types";

async function encodeToPng(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/png");
  return encode(imageData);
}

async function optimisePng(
  data: ArrayBuffer,
  level: number
): Promise<ArrayBuffer> {
  const { optimise } = await import("@jsquash/oxipng");
  return optimise(data, {
    interlace: false,
    level,
    optimiseAlpha: true,
  });
}

export async function compressImageData(
  imageData: ImageData,
  settings: CompressionSettings & { format: OutputFormat },
  strategy: CompressionStrategy
): Promise<ArrayBuffer> {
  const format = settings.format;

  if (strategy === "oxipng") {
    const pngBuffer = await encodeToPng(imageData);
    return optimisePng(pngBuffer, settings.lossless ? 4 : 2);
  }

  if (strategy === "png-encode" || format === "png") {
    const pngBuffer = await encodeToPng(imageData);
    return optimisePng(pngBuffer, settings.lossless ? 3 : 2);
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

export function optimiseSourcePng(
  sourceBuffer: ArrayBuffer,
  lossless: boolean
): Promise<ArrayBuffer> {
  return optimisePng(sourceBuffer, lossless ? 4 : 2);
}
