import { presets } from '../../lib/utils/presets';
import type { CompressionSettings } from '../../lib/utils/types';

interface PresetControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

export function PresetControls({ settings, onChange }: PresetControlsProps) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">Compression Settings</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.settings)}
            className="rounded-lg border border-white/10 bg-slate-900/80 p-3 text-left hover:border-cyan-400/60"
          >
            <p className="font-medium text-white">{preset.label}</p>
            <p className="text-xs text-slate-300">{preset.description}</p>
          </button>
        ))}
      </div>
      <label className="block text-sm text-slate-200">
        Quality: <span className="font-semibold">{settings.quality}</span>
        <input
          className="mt-2 w-full"
          type="range"
          min={1}
          max={100}
          value={settings.quality}
          onChange={(event) => onChange({ ...settings, quality: Number(event.target.value) })}
        />
      </label>
      <label className="block text-sm text-slate-200">
        Format
        <select
          value={settings.format}
          onChange={(event) => onChange({ ...settings, format: event.target.value as CompressionSettings['format'] })}
          className="mt-2 w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={settings.stripMetadata}
          onChange={(event) => onChange({ ...settings, stripMetadata: event.target.checked })}
        />
        Strip metadata where possible
      </label>
    </section>
  );
}
