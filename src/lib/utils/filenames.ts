const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;

export function sanitizeFilename(name: string, fallback = 'image'): string {
  const trimmed = name.trim().replace(INVALID_FILENAME_CHARS, '-');
  const collapsed = trimmed.replace(/\s+/g, ' ');
  const safe = collapsed.replace(/^[.\s]+|[.\s]+$/g, '');
  return safe.length > 0 ? safe : fallback;
}

export function buildOutputName(originalName: string, extension: string): string {
  const safeOriginal = sanitizeFilename(originalName, 'image');
  const base = safeOriginal.replace(/\.[^.]+$/, '') || 'image';
  const safeExt = sanitizeFilename(extension.replace(/^\./, ''), 'jpg').toLowerCase();
  return `${base}.${safeExt}`;
}
