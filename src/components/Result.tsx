import { useState } from "react";
import type { ImageInfo, CompressionResult } from "../types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileExtension(format: string) {
  if (format === "jpeg") return "jpg";
  if (format === "heif") return "heic";
  return format;
}

export function Result({
  imageInfo,
  result,
  format,
  onReset,
}: {
  imageInfo: ImageInfo;
  result: CompressionResult;
  format: string;
  onReset: () => void;
}) {
  const percentageSaved = 100 - Math.round((result.size / imageInfo.size) * 100);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = result.url;
    downloadLink.download = `${imageInfo.name.split(".")[0]}_compressed.${getFileExtension(format)}`;
    downloadLink.click();
  };

  return (
    <div className="result-container">
      <div className="gradient-pct">
        {percentageSaved >= 0 ? `-${percentageSaved}%` : `+${Math.abs(percentageSaved)}%`}
      </div>

      <div className="pct-label">
        {percentageSaved >= 0 ? "smaller" : "larger"}
      </div>

      <div className="size-transition">
        <span>{formatBytes(imageInfo.size)}</span>
        <span className="arrow">→</span>
        <span className="compressed-val">{formatBytes(result.size)}</span>
      </div>

      <div className="result-preview">
        <img
          src={result.url}
          alt="result"
          onLoad={(e) => {
            setDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      </div>

      <div className="result-metadata">
        <div className="format-size">
          {dimensions ? `${dimensions.width} × ${dimensions.height}` : `${imageInfo.width} × ${imageInfo.height}`} · {format.toUpperCase()} · {formatBytes(result.size)}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-go" onClick={handleDownload}>Download</button>
        <button className="btn btn-go" onClick={onReset}>New Image</button>
      </div>
    </div>
  );
}

