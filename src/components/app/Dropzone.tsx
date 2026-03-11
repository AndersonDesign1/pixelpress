import { useRef } from 'react';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(Array.from(event.dataTransfer.files));
      }}
      className="rounded-xl border-2 border-dashed border-cyan-400/50 bg-cyan-400/5 p-8 text-center"
    >
      <p className="text-lg font-semibold text-white">Drag and drop images here</p>
      <p className="mt-1 text-sm text-slate-300">or choose files manually for batch compression</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-900"
      >
        Select Files
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = '';
        }}
      />
    </section>
  );
}
