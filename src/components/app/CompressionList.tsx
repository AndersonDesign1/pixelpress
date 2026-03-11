import { formatBytes } from '../../lib/utils/format';
import type { CompressionJob } from '../../lib/utils/types';

interface CompressionListProps {
  jobs: CompressionJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CompressionList({ jobs, selectedId, onSelect }: CompressionListProps) {
  return (
    <section className="surface-panel queue-panel">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">Queue</p>
          <h2 className="panel-title">Review every file before export.</h2>
        </div>
        <span className="status-chip">{jobs.length} item{jobs.length === 1 ? '' : 's'}</span>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p className="queue-empty">Start in the intake area above. Each image will appear here with its progress, output size, and any errors that need attention.</p>
        </div>
      ) : null}

      <div className="queue-list">
        {jobs.map((job) => {
        const ratio = job.output ? Math.round((1 - job.output.size / job.file.size) * 100) : null;
        return (
          <button
            key={job.id}
            type="button"
            className={`queue-item ${selectedId === job.id ? 'is-active' : ''}`}
            onClick={() => onSelect(job.id)}
          >
            <div className="queue-top">
              <div>
                <p className="queue-name truncate">{job.file.name}</p>
                <div className="queue-meta">
                  <span>{formatBytes(job.file.size)}</span>
                  <span>{job.status}</span>
                  {job.output ? <span>{formatBytes(job.output.size)} output</span> : null}
                  {ratio !== null ? <span className="queue-savings">{ratio}% smaller</span> : null}
                </div>
              </div>
              <span className="queue-status">{selectedId === job.id ? 'Selected' : job.status}</span>
            </div>

            <div className="progress-rail mt-3">
              <div className="progress-value" style={{ width: `${job.progress}%` }} />
            </div>

            {job.error ? <p className="queue-error">{job.error}</p> : null}
          </button>
        );
      })}
      </div>
    </section>
  );
}
