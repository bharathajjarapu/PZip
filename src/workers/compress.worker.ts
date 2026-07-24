/// <reference lib="webworker" />

import type { CompressRequest, CompressResponse, OutputFormat } from "../types";

const MAX_PIXELS = 50_000_000;

const MIME: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function fail(id: string, error: string): CompressResponse {
  return { id, ok: false, error };
}

self.onmessage = async (event: MessageEvent<CompressRequest>) => {
  const { id, file, format, quality, width, height, lockAspect } = event.data;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (e) {
    return self.postMessage(fail(id, "Unsupported image format"));
  }

  try {
    if (bitmap.width * bitmap.height > MAX_PIXELS) {
      return self.postMessage(fail(id, "Image is too large to process"));
    }

    const srcW = bitmap.width;
    const srcH = bitmap.height;
    const aspect = srcW / srcH;

    let targetW = width > 0 ? width : srcW;
    let targetH = height > 0 ? height : srcH;

    if (lockAspect) {
      if (width > 0 && height <= 0) targetH = Math.round(targetW / aspect);
      else if (height > 0 && width <= 0) targetW = Math.round(targetH * aspect);
    }

    if (targetW > srcW || targetH > srcH) {
      targetW = srcW;
      targetH = srcH;
    }

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d");
    if (!ctx) return self.postMessage(fail(id, "Canvas not available"));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const options: ImageEncodeOptions =
      format === "png" ? { type: MIME.png } : { type: MIME[format], quality: quality / 100 };

    const blob = await canvas.convertToBlob(options);
    const response: CompressResponse = {
      id,
      ok: true,
      blob,
      width: targetW,
      height: targetH,
    };
    self.postMessage(response);
  } catch (e) {
    self.postMessage(fail(id, e instanceof Error ? e.message : "Compression failed"));
  }
};

export {};
