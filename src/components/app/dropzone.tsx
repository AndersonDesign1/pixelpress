import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

interface DropzoneProps {
  compact?: boolean;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles, compact = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length) {
        onFiles(files);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      const isEditable =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName));

      if (isEditable || !isModifierPressed) {
        return;
      }

      if (event.key.toLowerCase() === "o") {
        event.preventDefault();
        inputRef.current?.click();
      }
    }

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [onFiles]);

  if (compact) {
    return (
      <button
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-[0.6rem] border border-border bg-white/4 px-3 py-2 font-medium text-[0.82rem] text-muted-strong hover:border-border-strong hover:bg-white/8 data-[dragging=true]:border-text data-[dragging=true]:bg-accent-soft"
        data-dragging={isDragging}
        onClick={() => inputRef.current?.click()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (
            event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            return;
          }
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFiles(Array.from(event.dataTransfer.files));
        }}
        type="button"
      >
        <Icon icon="hugeicons:add-01" width={15} />
        Add files
        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />
      </button>
    );
  }

  return (
    <>
      <button
        aria-label="Drop images here or press Enter to select files"
        className="m-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-[1.2rem] border border-border border-dashed bg-transparent px-8 py-12 text-center data-[dragging=true]:border-text data-[dragging=true]:bg-white/3"
        data-dragging={isDragging}
        onClick={() => inputRef.current?.click()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (
            event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            return;
          }
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFiles(Array.from(event.dataTransfer.files));
        }}
        type="button"
      >
        <span className="mb-3 text-muted/55">
          <Icon icon="hugeicons:image-upload" width={56} />
        </span>

        <span className="m-0 font-medium text-[1.2rem] text-text tracking-[-0.01em]">
          Drop images here
        </span>
        <span className="m-0 text-[0.88rem] text-muted">
          or paste from clipboard
        </span>

        <span className="mt-4 inline-flex items-center gap-2 rounded-[0.75rem] border border-border-strong bg-white/6 px-4 py-2.5 font-medium text-[0.92rem] text-text hover:-translate-y-px hover:bg-white/10">
          <Icon icon="hugeicons:folder-open" width={16} />
          Select Files
          <span className="ml-1 inline-flex items-center gap-1.5 opacity-90">
            <Icon icon="hugeicons:command" width={15} />
            <kbd className="rounded-[0.35rem] border border-border bg-white/4 px-2 py-0.5 text-[0.82rem] text-muted leading-none">
              O
            </kbd>
          </span>
        </span>

        <span className="mt-2 text-[0.78rem] text-white/72">
          <span className="inline-flex items-center gap-1.5">
            <Icon icon="hugeicons:command" width={15} />
            <kbd className="rounded-[0.35rem] border border-border bg-white/4 px-2 py-0.5 text-[0.82rem] text-white/82 leading-none">
              V
            </kbd>
          </span>{" "}
          to paste
        </span>
      </button>

      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
          setIsDragging(false);
        }}
        ref={inputRef}
        type="file"
      />
    </>
  );
}
