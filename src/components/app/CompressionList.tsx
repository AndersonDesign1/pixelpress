import { formatBytes } from '../../lib/utils/format';
import type { CompressionJob } from '../../lib/utils/types';

interface CompressionListProps {
  jobs: CompressionJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CompressionList({ jobs, selectedId, onSelect }: CompressionListProps) {
  return (
    <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">Batch Queue</h2>
      {jobs.length === 0 ? <p className="text-sm text-slate-300">No files yet. Drop images to begin.</p> : null}
      {jobs.map((job) => {
        const ratio = job.output ? Math.round((1 - job.output.size / job.file.size) * 100) : null;
        return (
          <button
            key={job.id}
            type="button"
            className={`w-full rounded-lg border p-3 text-left ${selectedId === job.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-slate-900/70'}`}
            onClick={() => onSelect(job.id)}
          >
            <p className="truncate font-medium text-white">{job.file.name}</p>
            <p className="text-xs text-slate-300">{formatBytes(job.file.size)} · {job.status}</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${job.progress}%` }} />
            </div>
            {job.output ? <p className="text-xs text-emerald-300">{formatBytes(job.output.size)} ({ratio}% smaller)</p> : null}
            {job.error ? <p className="text-xs text-rose-300">{job.error}</p> : null}
          </button>
        );
      })}
    </section>
  );
}
