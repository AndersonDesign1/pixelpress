import { Icon } from "@iconify/react";
import type { CompressionSettings, OutputFormat } from "../../lib/utils/types";

interface ToolbarControlsProps {
  hasCompleted: boolean;
  hasJobs: boolean;
  hasSelectedOutput: boolean;
  isProcessing: boolean;
  onChange: (settings: CompressionSettings) => void;
  onClear: () => void;
  onDownloadSelected: () => void;
  onDownloadZip: () => void;
  settings: CompressionSettings;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
];

export function ToolbarControls({
  settings,
  onChange,
  onDownloadSelected,
  onDownloadZip,
  onClear,
  isProcessing,
  hasJobs,
  hasCompleted,
  hasSelectedOutput,
}: ToolbarControlsProps) {
  const losslessSupported =
    settings.format === "png" || settings.format === "webp";

  const toolbarButtonClass =
    "inline-flex items-center gap-1.5 rounded-[0.55rem] border border-border bg-white/4 px-3 py-1.5 text-[0.82rem] font-medium text-muted-strong whitespace-nowrap hover:border-border-strong hover:bg-white/8";

  return (
    <div className="flex flex-wrap items-center gap-3 border-border border-t bg-black/85 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-[0.78rem] text-muted">
          Format
        </span>
        <div className="flex overflow-hidden rounded-[0.5rem] border border-border">
          {formats.map((fmt) => (
            <button
              className={`border-border border-r px-3 py-1.5 font-semibold text-[0.78rem] transition last:border-r-0 ${
                settings.format === fmt.value
                  ? "bg-accent-soft text-text"
                  : "bg-transparent text-muted hover:bg-white/5"
              }`}
              key={fmt.value}
              onClick={() =>
                onChange({
                  ...settings,
                  format: fmt.value,
                  lossless:
                    fmt.value === "png" || fmt.value === "webp"
                      ? settings.lossless
                      : false,
                })
              }
              type="button"
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden h-6 w-px bg-border md:block" />

      <div className="flex min-w-[220px] flex-1 items-center gap-2 md:max-w-[280px]">
        <span className="whitespace-nowrap text-[0.78rem] text-muted">
          Smaller
        </span>
        <input
          className="h-1 flex-1 disabled:opacity-30"
          disabled={settings.lossless}
          max={100}
          min={1}
          onChange={(event) =>
            onChange({ ...settings, quality: Number(event.target.value) })
          }
          type="range"
          value={settings.quality}
        />
        <span className="whitespace-nowrap text-[0.78rem] text-muted">
          Faster
        </span>
      </div>

      <div className="hidden h-6 w-px bg-border md:block" />

      <label className="inline-flex cursor-pointer items-center gap-1.5 text-[0.78rem] text-muted">
        <input
          checked={settings.lossless}
          className="size-[14px] cursor-pointer"
          disabled={!losslessSupported}
          onChange={(event) =>
            onChange({ ...settings, lossless: event.target.checked })
          }
          type="checkbox"
        />
        <Icon icon="hugeicons:lossless" width={14} />
        Lossless
      </label>

      {!losslessSupported && (
        <span className="text-[0.72rem] text-muted">
          Lossless is available for PNG and WebP.
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {hasSelectedOutput && (
          <button
            className={toolbarButtonClass}
            onClick={onDownloadSelected}
            title="Download selected"
            type="button"
          >
            <Icon icon="hugeicons:download-04" width={15} />
            Download
          </button>
        )}
        {hasCompleted && (
          <button
            className={toolbarButtonClass}
            onClick={onDownloadZip}
            title="Download all as .zip"
            type="button"
          >
            <Icon icon="hugeicons:archive" width={15} />
            .zip
          </button>
        )}
        <button
          className={toolbarButtonClass}
          disabled={isProcessing || !hasJobs}
          onClick={onClear}
          title="Clear queue"
          type="button"
        >
          <Icon icon="hugeicons:delete-02" width={15} />
        </button>
      </div>
    </div>
  );
}
