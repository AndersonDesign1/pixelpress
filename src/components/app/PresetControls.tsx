import { presets } from '../../lib/utils/presets';
import type { CompressionSettings } from '../../lib/utils/types';

interface PresetControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

export function PresetControls({ settings, onChange }: PresetControlsProps) {
  return (
    <section className="surface-panel settings-panel">
      <div>
        <p className="panel-kicker">Settings</p>
        <h2 className="panel-title">Tune quality and format once.</h2>
      </div>

      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.settings)}
            className="preset-card"
            data-active={
              preset.settings.format === settings.format &&
              preset.settings.quality === settings.quality
            }
          >
            <p className="preset-card-title">{preset.label}</p>
            <p className="preset-card-copy">{preset.description}</p>
          </button>
        ))}
      </div>

      <div className="control-stack">
        <div className="form-field">
          <div className="field-head">
            <label htmlFor="compression-quality">Quality</label>
            <strong>{settings.quality}</strong>
          </div>
          <input
            id="compression-quality"
            className="range-input"
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            onChange={(event) => onChange({ ...settings, quality: Number(event.target.value) })}
          />
          <p className="field-note">Higher values preserve detail. Lower values push harder on file size reduction.</p>
        </div>

        <div className="form-field">
          <div className="field-head">
            <label htmlFor="compression-format">Format</label>
            <strong>{settings.format.toUpperCase()}</strong>
          </div>
          <select
            id="compression-format"
            value={settings.format}
            onChange={(event) => onChange({ ...settings, format: event.target.value as CompressionSettings['format'] })}
            className="field-select"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
      </div>
    </section>
  );
}
