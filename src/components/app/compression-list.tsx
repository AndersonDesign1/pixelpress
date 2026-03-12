import { Icon } from "@iconify/react";
import { formatBytes } from "../../lib/utils/format";
import type { CompressionJob } from "../../lib/utils/types";

interface CompressionListProps {
  jobs: CompressionJob[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

function statusIcon(status: string) {
  switch (status) {
    case "queued":
      return (
        <Icon className="text-muted" icon="hugeicons:time-02" width={14} />
      );
    case "processing":
      return (
        <Icon
          className="animate-spin text-text"
          icon="hugeicons:loading-03"
          width={14}
        />
      );
    case "done":
      return (
        <Icon
          className="text-success"
          icon="hugeicons:checkmark-circle-02"
          width={14}
        />
      );
    case "error":
      return (
        <Icon className="text-error" icon="hugeicons:alert-circle" width={14} />
      );
    default:
      return null;
  }
}

export function CompressionList({
  jobs,
  selectedId,
  onSelect,
}: CompressionListProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-border border-b bg-white/[0.018] md:w-[260px] md:border-r md:border-b-0">
      <div className="flex items-center justify-between border-border border-b px-4 py-3">
        <span className="font-semibold text-[0.78rem] text-muted uppercase tracking-[0.12em]">
          Files
        </span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-soft px-1.5 font-bold text-[0.72rem] text-text">
          {jobs.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {jobs.map((job) => {
          const ratio = job.output
            ? Math.round((1 - job.output.size / job.file.size) * 100)
            : null;
          const active = selectedId === job.id;

          return (
            <button
              className={`mb-1.5 flex w-full flex-col gap-1 rounded-[0.6rem] border px-3 py-2 text-left transition ${
                active
                  ? "border-border-strong bg-white/6"
                  : "border-transparent bg-transparent hover:bg-white/4"
              }`}
              key={job.id}
              onClick={() => onSelect(job.id)}
              type="button"
            >
              <div className="flex items-center gap-2">
                {statusIcon(job.status)}
                <span className="flex-1 truncate font-medium text-[0.85rem] text-text">
                  {job.file.name}
                </span>
              </div>

              <div className="flex gap-2 pl-6 text-[0.75rem] text-muted">
                <span>{formatBytes(job.file.size)}</span>
                {job.output && ratio !== null && (
                  <span className="font-semibold text-success">-{ratio}%</span>
                )}
              </div>

              {job.error ? (
                <p className="pl-6 text-[0.73rem] text-error leading-[1.35]">
                  {job.error}
                </p>
              ) : null}

              {job.status === "processing" && (
                <div className="mt-1 ml-6 h-0.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#999,#ccc)] transition-[width] duration-200 ease-out"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
