/// <reference lib="webworker" />

import { compressImageData } from '../codecs/compress';
import type { WorkerCompressRequest, WorkerCompressResponse } from '../utils/types';
import { outputExtension } from '../utils/format';
import { buildOutputName } from '../utils/filenames';

function postProgress(id: string, progress: number, stage: 'decoding' | 'encoding') {
  const message: WorkerCompressResponse = { id, kind: 'progress', progress, stage };
  self.postMessage(message);
}

async function fileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to initialize canvas context in worker.');
  }

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return imageData;
}

self.onmessage = async (event: MessageEvent<WorkerCompressRequest>) => {
  const { id, file, settings } = event.data;

  try {
    postProgress(id, 20, 'decoding');
    const imageData = await fileToImageData(file);
    postProgress(id, 60, 'encoding');
    const bytesBuffer = await compressImageData(imageData, settings);
    const requestedExtension = outputExtension(settings.format);
    const outputName = buildOutputName(file.name, requestedExtension);
    const mime = settings.format === 'png' ? 'image/png' : settings.format === 'webp' ? 'image/webp' : settings.format === 'avif' ? 'image/avif' : 'image/jpeg';
    const output = new Blob([bytesBuffer], { type: mime });
    const message: WorkerCompressResponse = { id, kind: 'result', ok: true, output, outputName };
    self.postMessage(message);
  } catch (error) {
    const message: WorkerCompressResponse = {
      id,
      kind: 'result',
      ok: false,
      error: error instanceof Error ? error.message : 'Compression failed unexpectedly.'
    };
    self.postMessage(message);
  }
};
