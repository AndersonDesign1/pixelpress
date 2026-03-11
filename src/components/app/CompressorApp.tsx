import { useEffect, useMemo, useRef, useState } from 'react';
import { strToU8, zip } from 'fflate';
import { Dropzone } from './Dropzone';
import { PresetControls } from './PresetControls';
import { CompressionList } from './CompressionList';
import { PreviewPanel } from './PreviewPanel';
import { loadSettings, saveSettings } from '../../lib/utils/storage';
import { sanitizeFilename } from '../../lib/utils/filenames';
import type { CompressionJob, CompressionSettings, WorkerCompressResponse } from '../../lib/utils/types';

const defaultSettings: CompressionSettings = {
  format: 'webp',
  quality: 82
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function uniqueName(original: string, used: Set<string>): string {
  const normalizedOriginal = sanitizeFilename(original, 'image.jpg');

  if (!used.has(normalizedOriginal)) {
    used.add(normalizedOriginal);
    return normalizedOriginal;
  }

  const dotIndex = normalizedOriginal.lastIndexOf('.');
  const base = dotIndex > -1 ? normalizedOriginal.slice(0, dotIndex) : normalizedOriginal;
  const ext = dotIndex > -1 ? normalizedOriginal.slice(dotIndex) : '';

  let count = 1;
  while (used.has(`${base}-${count}${ext}`)) {
    count += 1;
  }

  const next = `${base}-${count}${ext}`;
  used.add(next);
  return next;
}

export default function CompressorApp() {
  const [settings, setSettings] = useState<CompressionSettings>(() => loadSettings() ?? defaultSettings);
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedId), [jobs, selectedId]);
  const isProcessing = useMemo(() => jobs.some((job) => job.status === 'processing'), [jobs]);
  const queueProgress = useMemo(() => {
    if (jobs.length === 0) return 0;
    return Math.round(jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length);
  }, [jobs]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  function ensureWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../lib/workers/compression.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.onmessage = (event: MessageEvent<WorkerCompressResponse>) => {
        setJobs((current) =>
          current.map((job) => {
            if (job.id !== event.data.id) return job;

            if (event.data.kind === 'progress') {
              return { ...job, progress: Math.max(job.progress, event.data.progress) };
            }

            if (!event.data.ok) {
              return { ...job, status: 'error', error: event.data.error, progress: 100 };
            }

            return {
              ...job,
              status: 'done',
              progress: 100,
              output: event.data.output,
              outputName: event.data.outputName
            };
          })
        );
      };
      workerRef.current.onerror = () => {
        setGlobalError('Compression worker failed to initialize. Please refresh and try again.');
        setJobs((current) =>
          current.map((job) =>
            job.status === 'processing'
              ? { ...job, status: 'error', error: 'Compression worker failed to initialize.', progress: 100 }
              : job
          )
        );
      };
    }
    return workerRef.current;
  }

  function addFiles(files: File[]) {
    const next = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'queued' as const,
        progress: 0
      }));

    if (!next.length) {
      setGlobalError('Please select image files only.');
      return;
    }

    setGlobalError('');
    setJobs((current) => {
      const combined = [...current, ...next];
      setSelectedId((existing) => existing ?? combined[0]?.id ?? null);
      return combined;
    });
  }

  function clearQueue() {
    if (isProcessing) return;
    setJobs([]);
    setSelectedId(null);
    setGlobalError('');
  }

  function runCompression() {
    if (!jobs.length) {
      setGlobalError('Add at least one image before compressing.');
      return;
    }

    setGlobalError('');
    saveSettings(settings);
    const worker = ensureWorker();

    setJobs((current) =>
      current.map((job) => {
        worker.postMessage({ id: job.id, file: job.file, settings });
        return { ...job, status: 'processing', progress: 5, error: undefined, output: undefined, outputName: undefined };
      })
    );
  }

  async function downloadAllZip() {
    const completed = jobs.filter((job) => job.output && job.outputName);
    if (!completed.length) {
      setGlobalError('Compress files first to download a zip.');
      return;
    }

    try {
      const archive: Record<string, Uint8Array> = {
        'README.txt': strToU8('Generated by PixelPress. Compression happened entirely in your browser.')
      };
      const usedNames = new Set<string>(Object.keys(archive));

      for (const job of completed) {
        if (!job.outputName || !job.output) continue;
        const safeName = uniqueName(job.outputName, usedNames);
        archive[safeName] = new Uint8Array(await job.output.arrayBuffer());
      }

      const zipData = await new Promise<Uint8Array>((resolve, reject) => {
        zip(archive, { level: 6 }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });

      const zipBuffer = zipData.buffer.slice(zipData.byteOffset, zipData.byteOffset + zipData.byteLength);
      downloadBlob(new Blob([zipBuffer], { type: 'application/zip' }), 'pixelpress-compressed.zip');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to create zip archive.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Image Compressor App</h1>
        <p className="text-slate-300">All processing stays local in your browser. No uploads, no backend queues.</p>
      </div>

      <Dropzone onFiles={addFiles} />
      <PresetControls settings={settings} onChange={setSettings} />

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
          <span>Queue progress</span>
          <span>{queueProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${queueProgress}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={isProcessing} onClick={runCompression} className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">Compress Batch</button>
        <button type="button" onClick={downloadAllZip} className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white">Download All (.zip)</button>
        <button type="button" disabled={isProcessing} onClick={clearQueue} className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Clear Queue</button>
        {selectedJob?.output && selectedJob.outputName ? (
          <button
            type="button"
            onClick={() => selectedJob?.output && selectedJob.outputName ? downloadBlob(selectedJob.output, selectedJob.outputName) : null}
            className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white"
          >
            Download Selected
          </button>
        ) : null}
      </div>

      <p className="text-sm text-slate-300" aria-live="polite">
        {isProcessing ? 'Compression in progress…' : 'Ready.'}
      </p>

      {globalError ? <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">{globalError}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <CompressionList jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />
        <PreviewPanel job={selectedJob} />
      </div>
    </div>
  );
}
