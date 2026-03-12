import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { formatBytes } from "../../lib/utils/format";
import type { CompressionJob } from "../../lib/utils/types";

interface PreviewPanelProps {
  job?: CompressionJob;
}

export function PreviewPanel({ job }: PreviewPanelProps) {
  const [view, setView] = useState<"original" | "compressed">("original");
  const [previewSize, setPreviewSize] = useState({ height: 1, width: 1 });
  const originalUrl = useMemo(
    () => (job?.file ? URL.createObjectURL(job.file) : null),
    [job?.file]
  );
  const outputUrl = useMemo(
    () => (job?.output ? URL.createObjectURL(job.output) : null),
    [job?.output]
  );
  const showUrl = view === "compressed" && outputUrl ? outputUrl : originalUrl;

  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [originalUrl, outputUrl]);

  useEffect(() => {
    if (job?.output) {
      setView("compressed");
    } else {
      setView("original");
    }
  }, [job?.output]);

  useEffect(() => {
    if (!showUrl) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      setPreviewSize({
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
      });
    };
    image.src = showUrl;

    return () => {
      image.onload = null;
    };
  }, [showUrl]);

  if (!job) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[0.9rem] text-muted opacity-60">
          <Icon className="text-muted" icon="hugeicons:image-01" width={28} />
          <p>Select a file to preview</p>
        </div>
      </div>
    );
  }
  const ratio = job.output
    ? Math.round((1 - job.output.size / job.file.size) * 100)
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-border border-b px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-[0.85rem]">
          <Icon className="text-muted" icon="hugeicons:image-02" width={15} />
          <span className="max-w-[18rem] truncate font-semibold text-text">
            {job.file.name}
          </span>
          <span className="whitespace-nowrap text-muted">
            {formatBytes(job.file.size)}
          </span>
          {job.output && (
            <>
              <Icon
                className="text-muted/50"
                icon="hugeicons:arrow-right-01"
                width={13}
              />
              <span className="whitespace-nowrap text-muted">
                {formatBytes(job.output.size)}
              </span>
              {ratio !== null && (
                <span className="whitespace-nowrap font-semibold text-success">
                  -{ratio}%
                </span>
              )}
            </>
          )}
        </div>

        {job.output && (
          <div className="flex overflow-hidden rounded-[0.5rem] border border-border">
            <button
              className={`px-3 py-1.5 font-medium text-[0.78rem] transition ${
                view === "original"
                  ? "bg-white/8 text-text"
                  : "bg-transparent text-muted hover:bg-white/5"
              }`}
              onClick={() => setView("original")}
              type="button"
            >
              Original
            </button>
            <button
              className={`px-3 py-1.5 font-medium text-[0.78rem] transition ${
                view === "compressed"
                  ? "bg-white/8 text-text"
                  : "bg-transparent text-muted hover:bg-white/5"
              }`}
              onClick={() => setView("compressed")}
              type="button"
            >
              Compressed
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center bg-[repeating-conic-gradient(rgba(255,255,255,0.03)_0%_25%,transparent_0%_50%)] p-4 [background-size:20px_20px]">
        {showUrl ? (
          <img
            alt={`${view === "compressed" ? "Compressed" : "Original"} ${job.file.name}`}
            className="max-h-full max-w-full rounded-[0.4rem] object-contain"
            height={previewSize.height}
            src={showUrl}
            width={previewSize.width}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[0.9rem] text-muted opacity-60">
            {job.status === "processing" ? (
              <>
                <Icon
                  className="animate-spin text-text"
                  icon="hugeicons:loading-03"
                  width={24}
                />
                <p>Compressing…</p>
              </>
            ) : (
              <p>Waiting for compression</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
