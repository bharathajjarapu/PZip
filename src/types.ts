export type OutputFormat = "jpeg" | "png" | "webp";

export interface Settings {
  format: OutputFormat;
  quality: number;
  width: number;
  height: number;
}

export interface CompressRequest {
  id: string;
  file: Blob;
  format: OutputFormat;
  quality: number;
  width: number;
  height: number;
  lockAspect: boolean;
}

export interface CompressSuccess {
  id: string;
  ok: true;
  blob: Blob;
  width: number;
  height: number;
}

export interface CompressFailure {
  id: string;
  ok: false;
  error: string;
}

export type CompressResponse = CompressSuccess | CompressFailure;

export interface ImageInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  format: string;
  size: number;
  file: File;
}

export interface CompressionResult {
  blob: Blob;
  size: number;
  url: string;
  width: number;
  height: number;
}
