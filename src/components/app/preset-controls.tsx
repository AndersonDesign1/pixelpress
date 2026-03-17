import { Icon } from "@iconify/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { buildSettingsForFormat, formatOptions } from "../../lib/utils/format";
import { presets } from "../../lib/utils/presets";
import type { CompressionSettings, OutputFormat } from "../../lib/utils/types";

interface ToolbarControlsProps {
  activePresetId: string | null;
  hasCompleted: boolean;
  hasJobs: boolean;
  hasSelection: boolean;
  isProcessing: boolean;
  onApplyPreset: (presetId: string) => void;
  onApplySettings: (settings: CompressionSettings) => void;
  onChange: (settings: CompressionSettings) => void;
  onClear: () => void;
  onDownloadSelected: () => void;
  onDownloadZip: () => void;
  settings: CompressionSettings;
  sourceFormat: OutputFormat | null;
}

interface FineTuneContentProps {
  hasSelection: boolean;
  isProcessing: boolean;
  onApplySettings: (settings: CompressionSettings) => void;
  onChange: (settings: CompressionSettings) => void;
  selectedPresetLabel: string | null;
  settings: CompressionSettings;
  showingCustomSettings: boolean;
  sourceFormat: OutputFormat | null;
  toolbarButtonClass: string;
}

function getPngHelpText(
  settings: CompressionSettings,
  sourceFormat: OutputFormat | null
) {
  if (
    (settings.format === "original" ? sourceFormat : settings.format) !== "png"
  ) {
    return null;
  }

  if (settings.pngMode === "compressed") {
    return "Compressed PNG keeps PNG output and transparency, but reduces colors a little for stronger savings.";
  }

  if (settings.format === "png") {
    return "PNG export stays lossless and preserves transparency. Switch to Compressed PNG when you want a smaller PNG without converting formats.";
  }

  return "Original PNG mode now keeps PNG output and runs a lossless optimization pass instead of silently converting to WebP.";
}

function FineTuneContent({
  hasSelection,
  isProcessing,
  onApplySettings,
  onChange,
  selectedPresetLabel,
  settings,
  showingCustomSettings,
  sourceFormat,
  toolbarButtonClass,
}: FineTuneContentProps) {
  const activeFormat =
    settings.format === "original" ? sourceFormat : settings.format;
  const pngOutputActive = activeFormat === "png";
  const losslessSupported = activeFormat === "png" || activeFormat === "webp";
  const qualityDisabled =
    (pngOutputActive && settings.pngMode === "lossless") ||
    (!pngOutputActive && settings.lossless);
  const pngHelpText = getPngHelpText(settings, sourceFormat);
  let presetBadge: ReactNode = null;

  if (showingCustomSettings) {
    presetBadge = (
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.7rem] text-white/52">
        Custom
      </span>
    );
  } else if (selectedPresetLabel) {
    presetBadge = (
      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2 py-0.5 text-[0.7rem] text-emerald-200">
        {selectedPresetLabel}
      </span>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] text-white/42 uppercase tracking-[0.12em]">
            Fine tune
          </span>
          {presetBadge}
        </div>
        <p className="text-[0.74rem] text-white/45">
          Change the format, PNG mode, or quality if you already know what you
          want.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[0.78rem] text-muted">
            Format
          </span>
          <div className="flex overflow-hidden rounded-[0.5rem] border border-border">
            {formatOptions.map((format) => (
              <button
                className={`border-border border-r px-3 py-1.5 font-semibold text-[0.78rem] transition last:border-r-0 ${
                  settings.format === format.value
                    ? "bg-accent-soft text-text"
                    : "bg-transparent text-muted hover:bg-white/5"
                }`}
                key={format.value}
                onClick={() =>
                  onChange(buildSettingsForFormat(settings, format.value))
                }
                type="button"
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-[220px] flex-1 items-center gap-2 md:max-w-[320px]">
          <span className="whitespace-nowrap text-[0.78rem] text-muted">
            Smaller file
          </span>
          <input
            className="h-1 flex-1 disabled:opacity-30"
            disabled={qualityDisabled}
            max={100}
            min={1}
            onChange={(event) =>
              onChange({
                ...settings,
                quality: Number(event.target.value),
              })
            }
            type="range"
            value={settings.quality}
          />
          <span className="whitespace-nowrap text-[0.78rem] text-muted">
            Better detail
          </span>
        </div>

        {pngOutputActive ? (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[0.78rem] text-muted">
              PNG mode
            </span>
            <div className="flex overflow-hidden rounded-[0.5rem] border border-border">
              {[
                { label: "Lossless PNG", value: "lossless" as const },
                { label: "Compressed PNG", value: "compressed" as const },
              ].map((mode) => (
                <button
                  className={`border-border border-r px-3 py-1.5 font-semibold text-[0.78rem] transition last:border-r-0 ${
                    settings.pngMode === mode.value
                      ? "bg-accent-soft text-text"
                      : "bg-transparent text-muted hover:bg-white/5"
                  }`}
                  key={mode.value}
                  onClick={() =>
                    onChange({
                      ...settings,
                      lossless: true,
                      pngColors: mode.value === "compressed" ? 128 : 256,
                      pngMode: mode.value,
                      quality:
                        mode.value === "compressed"
                          ? Math.min(settings.quality, 78)
                          : 100,
                    })
                  }
                  type="button"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[0.78rem] text-muted">
          <input
            checked={settings.lossless}
            className="size-[14px] cursor-pointer"
            disabled={!losslessSupported || pngOutputActive}
            onChange={(event) => {
              const nextSettings = {
                ...settings,
                lossless: event.target.checked,
              };
              onChange(nextSettings);
            }}
            type="checkbox"
          />
          <Icon icon="hugeicons:lossless" width={14} />
          Lossless
        </label>

        <button
          className={toolbarButtonClass}
          disabled={!hasSelection || isProcessing}
          onClick={() => onApplySettings(settings)}
          type="button"
        >
          <Icon icon="hugeicons:refresh" width={15} />
          Apply changes
        </button>
      </div>

      {losslessSupported ? null : (
        <p className="text-[0.74rem] text-white/45">
          Lossless is only available for PNG and WebP output.
        </p>
      )}

      {pngHelpText ? (
        <p className="text-[0.74rem] text-white/45">{pngHelpText}</p>
      ) : null}
    </>
  );
}

export function ToolbarControls({
  activePresetId,
  hasCompleted,
  hasJobs,
  hasSelection,
  isProcessing,
  onApplyPreset,
  onApplySettings,
  onChange,
  onClear,
  onDownloadSelected,
  onDownloadZip,
  settings,
  sourceFormat,
}: ToolbarControlsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? null,
    [activePresetId]
  );
  const showingCustomSettings = !selectedPreset;
  const toolbarButtonClass =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[0.55rem] border border-border bg-white/4 px-3 py-1.5 font-medium text-[0.82rem] text-muted-strong hover:border-border-strong hover:bg-white/8";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      window.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="grid gap-2 border-border border-t bg-black/85 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex items-center gap-2" ref={menuRef}>
          <span className="whitespace-nowrap text-[0.72rem] text-white/42 uppercase tracking-[0.12em]">
            Quick setup
          </span>
          <button
            aria-expanded={menuOpen}
            className={`inline-flex min-w-[11rem] items-center justify-between gap-3 rounded-[0.65rem] border px-3 py-2 text-left transition ${
              menuOpen
                ? "border-border-strong bg-white/8 text-text"
                : "border-border bg-white/[0.03] text-text hover:border-border-strong hover:bg-white/6"
            }`}
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <span className="flex flex-col">
              <span className="font-medium text-[0.82rem]">
                {selectedPreset?.label ?? "Choose a setup"}
              </span>
              <span className="text-[0.72rem] text-white/45">
                {selectedPreset?.description ??
                  "Open Fine tune if you want to steer it yourself"}
              </span>
            </span>
            <Icon
              className={`shrink-0 text-white/55 transition duration-200 ${menuOpen ? "rotate-180" : ""}`}
              icon="hugeicons:arrow-down-01"
              width={16}
            />
          </button>

          <div
            className={`absolute bottom-full left-[5.6rem] z-20 mb-2 w-[18rem] origin-bottom rounded-[0.85rem] border border-border bg-[#0d0d0d]/96 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-200 ${menuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
          >
            {presets.map((preset) => (
              <button
                className={`flex w-full flex-col rounded-[0.65rem] px-3 py-2 text-left transition ${
                  selectedPreset?.id === preset.id
                    ? "bg-emerald-400/10 text-emerald-200"
                    : "text-text hover:bg-white/6"
                }`}
                key={preset.id}
                onClick={() => {
                  onApplyPreset(preset.id);
                  setMenuOpen(false);
                }}
                type="button"
              >
                <span className="font-medium text-[0.82rem]">
                  {preset.label}
                </span>
                <span className="text-[0.72rem] text-white/45">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            className={`${toolbarButtonClass} ${advancedOpen ? "border-border-strong bg-white/8 text-text" : ""}`}
            onClick={() => setAdvancedOpen((current) => !current)}
            type="button"
          >
            <Icon icon="hugeicons:settings-02" width={15} />
            Fine tune
          </button>
          <button
            className={toolbarButtonClass}
            disabled={!hasSelection || isProcessing}
            onClick={onDownloadSelected}
            type="button"
          >
            <Icon icon="hugeicons:download-04" width={15} />
            Download selected
          </button>
          <button
            className={toolbarButtonClass}
            disabled={!hasCompleted}
            onClick={onDownloadZip}
            type="button"
          >
            <Icon icon="hugeicons:archive" width={15} />
            Best zip
          </button>
          <button
            className={toolbarButtonClass}
            disabled={isProcessing || !hasJobs}
            onClick={onClear}
            type="button"
          >
            <Icon icon="hugeicons:delete-02" width={15} />
            Clear
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden rounded-[0.85rem] border transition-[grid-template-rows,opacity,transform,border-color,padding] duration-200 ease-[var(--ease-fluid)] ${
          advancedOpen
            ? "grid-rows-[1fr] border-border bg-white/[0.02] opacity-100"
            : "grid-rows-[0fr] border-transparent bg-transparent opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div
            className={`grid gap-3 px-3 transition-[padding,transform] duration-200 ease-[var(--ease-fluid)] ${
              advancedOpen ? "translate-y-0 py-3" : "-translate-y-1 py-0"
            }`}
          >
            <FineTuneContent
              hasSelection={hasSelection}
              isProcessing={isProcessing}
              onApplySettings={onApplySettings}
              onChange={onChange}
              selectedPresetLabel={selectedPreset?.label ?? null}
              settings={settings}
              showingCustomSettings={showingCustomSettings}
              sourceFormat={sourceFormat}
              toolbarButtonClass={toolbarButtonClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
