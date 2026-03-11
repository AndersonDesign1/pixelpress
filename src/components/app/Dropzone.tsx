import { useRef, useState } from 'react';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section
      data-dragging={isDragging}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
      className="surface-panel dropzone-shell"
    >
      <p className="panel-kicker">Intake</p>
      <h2 className="panel-title">Add screenshots, exports, or production assets.</h2>
      <p className="support-copy mt-3">
        Drop a full batch or choose files manually. PixelPress filters the queue to image files only and keeps the
        compression work local to this browser session.
      </p>
      <ul className="dropzone-meta">
        <li>JPEG, PNG, WebP, AVIF</li>
        <li>Batch-friendly queue</li>
        <li>On-device processing</li>
      </ul>
      <div className="action-row mt-6">
        <button type="button" onClick={() => inputRef.current?.click()} className="button-primary">
          Select Files
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = '';
          setIsDragging(false);
        }}
      />
    </section>
  );
}
