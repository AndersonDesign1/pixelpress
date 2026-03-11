import type { CompressionSettings, OutputFormat } from '../utils/types';

export async function compressImageData(imageData: ImageData, settings: CompressionSettings): Promise<ArrayBuffer> {
  const format: OutputFormat = settings.format === 'original' ? 'jpeg' : settings.format;

  if (format === 'webp') {
    const { encode } = await import('@jsquash/webp');
    return encode(imageData, {
      quality: settings.quality,
      near_lossless: settings.quality > 90 ? 100 : 0,
      exact: settings.stripMetadata ? 0 : 1
    });
  }

  if (format === 'avif') {
    const { encode } = await import('@jsquash/avif');
    return encode(imageData, {
      quality: settings.quality,
      speed: 7
    });
  }

  if (format === 'png') {
    const { encode } = await import('@jsquash/png');
    return encode(imageData);
  }

  const { encode } = await import('@jsquash/jpeg');
  return encode(imageData, {
    quality: settings.quality,
    baseline: false,
    optimize_coding: true
  });
}
