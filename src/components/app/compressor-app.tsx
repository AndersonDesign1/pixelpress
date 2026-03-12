import { strToU8, zip } from "fflate";
import { useEffect, useMemo, useRef, useState } from "react";
import { sanitizeFilename } from "../../lib/utils/filenames";
import { loadSettings, saveSettings } from "../../lib/utils/storage";
import type {
  CompressionJob,
  CompressionSettings,
  WorkerCompressResponse,
} from "../../lib/utils/types";
import { CompressionList } from "./compression-list";
import { Dropzone } from "./dropzone";
import { ToolbarControls } from "./preset-controls";
import { PreviewPanel } from "./preview-panel";

const defaultSettings: CompressionSettings = {
  format: "webp",
  quality: 82,
  lossless: false,
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function uniqueName(original: string, used: Set<string>): string {
  const normalizedOriginal = sanitizeFilename(original, "image.jpg");

  if (!used.has(normalizedOriginal)) {
    used.add(normalizedOriginal);
    return normalizedOriginal;
  }

  const dotIndex = normalizedOriginal.lastIndexOf(".");
  const base =
    dotIndex > -1 ? normalizedOriginal.slice(0, dotIndex) : normalizedOriginal;
  const ext = dotIndex > -1 ? normalizedOriginal.slice(dotIndex) : "";

  let count = 1;
  while (used.has(`${base}-${count}${ext}`)) {
    count += 1;
  }

  const next = `${base}-${count}${ext}`;
  used.add(next);
  return next;
}

export default function CompressorApp() {
  const [settings, setSettings] = useState<CompressionSettings>(
    () => loadSettings() ?? defaultSettings
  );
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string>("");
  const workerRef = useRef<Worker | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedId),
    [jobs, selectedId]
  );
  const isProcessing = useMemo(
    () => jobs.some((job) => job.status === "processing"),
    [jobs]
  );
  const hasCompleted = useMemo(
    () => jobs.some((job) => job.status === "done"),
    [jobs]
  );
  const hasSelectedOutput = !!(selectedJob?.output && selectedJob?.outputName);
  const hasJobs = jobs.length > 0;

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  function ensureWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../../lib/workers/compression.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current.onmessage = (
        event: MessageEvent<WorkerCompressResponse>
      ) => {
        setJobs((current) =>
          current.map((job) => {
            if (job.id !== event.data.id) {
              return job;
            }

            if (event.data.kind === "progress") {
              return {
                ...job,
                progress: Math.max(job.progress, event.data.progress),
              };
            }

            if (!event.data.ok) {
              return {
                ...job,
                status: "error",
                error: event.data.error,
                progress: 100,
              };
            }

            return {
              ...job,
              status: "done",
              progress: 100,
              output: event.data.output,
              outputName: event.data.outputName,
            };
          })
        );
      };
      workerRef.current.onerror = () => {
        setGlobalError("Compression worker failed. Please refresh.");
        setJobs((current) =>
          current.map((job) =>
            job.status === "processing"
              ? {
                  ...job,
                  status: "error",
                  error: "Worker failed.",
                  progress: 100,
                }
              : job
          )
        );
      };
    }
    return workerRef.current;
  }

  function addFiles(files: File[]) {
    const next = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued" as const,
        progress: 0,
      }));

    if (!next.length) {
      setGlobalError("Please select image files only.");
      return;
    }

    setGlobalError("");
    const worker = ensureWorker();
    const currentSettings = settingsRef.current;
    saveSettings(currentSettings);

    setJobs((current) => {
      const processingNext = next.map((job) => {
        worker.postMessage({
          id: job.id,
          file: job.file,
          settings: currentSettings,
        });
        return { ...job, status: "processing" as const, progress: 5 };
      });

      const combined = [...current, ...processingNext];
      setSelectedId((existing) => existing ?? combined[0]?.id ?? null);
      return combined;
    });
  }

  function clearQueue() {
    if (isProcessing) {
      return;
    }
    setJobs([]);
    setSelectedId(null);
    setGlobalError("");
  }

  function downloadSelected() {
    if (selectedJob?.output && selectedJob.outputName) {
      downloadBlob(selectedJob.output, selectedJob.outputName);
    }
  }

  async function downloadAllZip() {
    const completed = jobs.filter((job) => job.output && job.outputName);
    if (!completed.length) {
      setGlobalError("No completed files to download.");
      return;
    }

    try {
      const archive: Record<string, Uint8Array> = {
        "README.txt": strToU8(
          "Generated by PixelPress. Compression happened entirely in your browser."
        ),
      };
      const usedNames = new Set<string>(Object.keys(archive));

      for (const job of completed) {
        if (!(job.outputName && job.output)) {
          continue;
        }
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

      const zipBytes = new Uint8Array(zipData.byteLength);
      zipBytes.set(zipData);
      downloadBlob(
        new Blob([zipBytes], { type: "application/zip" }),
        "pixelpress-compressed.zip"
      );
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Failed to create zip archive."
      );
    }
  }

  if (!hasJobs) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex flex-1 flex-col">
          <Dropzone onFiles={addFiles} />
        </div>
        {globalError && (
          <p className="border-[color:color-mix(in_oklab,var(--color-error)_30%,transparent)] border-t bg-[color:color-mix(in_oklab,var(--color-error)_12%,transparent)] px-4 py-2.5 text-center text-[0.88rem] text-[color:color-mix(in_oklab,var(--color-error)_72%,white_28%)]">
            {globalError}
          </p>
        )}
        <ToolbarControls
          hasCompleted={hasCompleted}
          hasJobs={hasJobs}
          hasSelectedOutput={hasSelectedOutput}
          isProcessing={isProcessing}
          onChange={setSettings}
          onClear={clearQueue}
          onDownloadSelected={downloadSelected}
          onDownloadZip={downloadAllZip}
          settings={settings}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <CompressionList
          jobs={jobs}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <PreviewPanel job={selectedJob} />
          <Dropzone compact onFiles={addFiles} />
        </div>
      </div>
      {globalError && (
        <p className="border-[color:color-mix(in_oklab,var(--color-error)_30%,transparent)] border-t bg-[color:color-mix(in_oklab,var(--color-error)_12%,transparent)] px-4 py-2.5 text-center text-[0.88rem] text-[color:color-mix(in_oklab,var(--color-error)_72%,white_28%)]">
          {globalError}
        </p>
      )}
      <ToolbarControls
        hasCompleted={hasCompleted}
        hasJobs={hasJobs}
        hasSelectedOutput={hasSelectedOutput}
        isProcessing={isProcessing}
        onChange={setSettings}
        onClear={clearQueue}
        onDownloadSelected={downloadSelected}
        onDownloadZip={downloadAllZip}
        settings={settings}
      />
    </div>
  );
}
