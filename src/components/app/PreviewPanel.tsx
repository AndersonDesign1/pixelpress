import { useEffect, useMemo } from 'react';
import { formatBytes } from '../../lib/utils/format';
import type { CompressionJob } from '../../lib/utils/types';

interface PreviewPanelProps {
  job?: CompressionJob;
}

export function PreviewPanel({ job }: PreviewPanelProps) {
  const originalUrl = useMemo(() => (job?.file ? URL.createObjectURL(job.file) : null), [job?.file]);
  const outputUrl = useMemo(() => (job?.output ? URL.createObjectURL(job.output) : null), [job?.output]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [originalUrl, outputUrl]);

  if (!job) {
    return (
      <section className="surface-panel preview-panel">
        <div>
          <p className="panel-kicker">Preview</p>
          <h2 className="panel-title">Inspect the original beside the compressed result.</h2>
        </div>
        <div className="empty-state">
          <p>Select a queued image to compare source and output in one place.</p>
          <ol>
            <li>Add images to the batch.</li>
            <li>Choose a preset or adjust format and quality.</li>
            <li>Run compression, then review the result here before export.</li>
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="surface-panel preview-panel">
      <div>
        <p className="panel-kicker">Preview</p>
        <h2 className="panel-title">Side-by-side review for the selected file.</h2>
      </div>
      <div className="preview-meta">
        <span>{job.file.name}</span>
        <span>{formatBytes(job.file.size)} original</span>
        {job.output ? <span>{formatBytes(job.output.size)} compressed</span> : null}
        <span>{job.status}</span>
      </div>
      <div className="preview-grid">
        <article className="preview-frame">
          <p className="preview-caption">Original</p>
          {originalUrl ? <img src={originalUrl} alt={`Original ${job.file.name}`} /> : null}
        </article>
        <article className="preview-frame">
          <p className="preview-caption">Compressed</p>
          {outputUrl ? (
            <img src={outputUrl} alt={`Compressed ${job.file.name}`} />
          ) : (
            <div className="empty-state">
              <p>Run compression to render the output preview here.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
