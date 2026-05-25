export type Phase = "idle" | "options" | "processing" | "done";

export interface ImageInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface CompressionResult {
  blob: Blob;
  size: number;
  url: string;
}
