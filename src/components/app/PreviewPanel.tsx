import { useEffect, useMemo } from 'react';
import type { CompressionJob } from '../../lib/utils/types';

interface PreviewPanelProps {
  job?: CompressionJob;
}

export function PreviewPanel({ job }: PreviewPanelProps) {
  const originalUrl = useMemo(() => (job ? URL.createObjectURL(job.file) : null), [job]);
  const outputUrl = useMemo(() => (job?.output ? URL.createObjectURL(job.output) : null), [job?.output]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [originalUrl, outputUrl]);

  if (!job) {
    return <section className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Select a file to preview original and compressed output.</section>;
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">Side-by-side Preview</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-300">Original</p>
          {originalUrl ? <img src={originalUrl} alt={`Original ${job.file.name}`} className="max-h-72 w-full rounded-lg object-contain" /> : null}
        </article>
        <article>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-300">Compressed</p>
          {outputUrl ? <img src={outputUrl} alt={`Compressed ${job.file.name}`} className="max-h-72 w-full rounded-lg object-contain" /> : <p className="text-sm text-slate-400">Run compression to preview result.</p>}
        </article>
      </div>
    </section>
  );
}
