import { useRef, useState, type ChangeEvent } from "react";
import type { ImageInfo } from "../types";

const IMAGE_PREFIX = "image/";

function formatFromMime(mime: string): string {
  return mime.startsWith(IMAGE_PREFIX) ? mime.slice(IMAGE_PREFIX.length) : "unknown";
}

export function Upload({ onUploadComplete }: { onUploadComplete: (info: ImageInfo) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const info: ImageInfo = {
        name: file.name,
        width: bitmap.width,
        height: bitmap.height,
        format: formatFromMime(file.type),
        size: file.size,
        file,
      };
      bitmap.close();
      onUploadComplete(info);
    } catch {
      setError("Could not read this image");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="upload-container">
      {error ? (
        <span className="upload-error">{error}</span>
      ) : (
        <button
          type="button"
          className="btn btn-go"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Reading…" : "Upload Image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        hidden
      />
    </div>
  );
}
