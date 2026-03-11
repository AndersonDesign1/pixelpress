export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export interface CompressionPreset {
  id: string;
  label: string;
  description: string;
  settings: CompressionSettings;
}

export interface CompressionSettings {
  format: OutputFormat;
  quality: number;
  stripMetadata: boolean;
}

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface CompressionJob {
  id: string;
  file: File;
  status: JobStatus;
  progress: number;
  error?: string;
  output?: Blob;
  outputName?: string;
}

export interface WorkerCompressRequest {
  id: string;
  file: File;
  settings: CompressionSettings;
}

export type WorkerProgressStage = 'decoding' | 'encoding';

export interface WorkerCompressProgress {
  id: string;
  kind: 'progress';
  progress: number;
  stage: WorkerProgressStage;
}

export interface WorkerCompressSuccess {
  id: string;
  kind: 'result';
  ok: true;
  output: Blob;
  outputName: string;
}

export interface WorkerCompressError {
  id: string;
  kind: 'result';
  ok: false;
  error: string;
}

export type WorkerCompressResponse = WorkerCompressProgress | WorkerCompressSuccess | WorkerCompressError;
