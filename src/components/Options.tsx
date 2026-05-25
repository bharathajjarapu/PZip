import { useState } from "react";
import type { ImageInfo } from "../types";

const FORMATS = ["jpeg", "png", "webp", "avif"] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function Options({
  imageInfo,
  onCompress,
}: {
  imageInfo: ImageInfo;
  onCompress: (format: string, quality: number, width: number, height: number) => void;
}) {
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const handleWidthChange = (value: number) => {
    setWidth(value);
    if (lockAspectRatio && value > 0) {
      setHeight(Math.round(value * (imageInfo.height / imageInfo.width)));
    }
  };

  const handleHeightChange = (value: number) => {
    setHeight(value);
    if (lockAspectRatio && value > 0) {
      setWidth(Math.round(value * (imageInfo.width / imageInfo.height)));
    }
  };

  return (
    <div className="options-container">
      <div className="options-title">
        <span className="file-name">{imageInfo.name}</span>
      </div>

      <div className="options-preview">
        <img src={`/api/img/${imageInfo.id}`} alt="preview" />
      </div>

      <div className="options-metadata">
        <span className="format-size">
          {imageInfo.width} × {imageInfo.height} · {imageInfo.format.toUpperCase()} · {formatBytes(imageInfo.size)}
        </span>
      </div>

      <div className="card control-panel">
        <div className="control-group">
          <span className="control-label">Format</span>
          <div className="format-group">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                className={`format-button ${format === f ? "active" : ""}`}
                onClick={() => setFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="dim-row">
          <div className="dim-field">
            <span className="control-label">Width</span>
            <input
              type="number"
              value={width || ""}
              onChange={(e) => handleWidthChange(+e.target.value)}
              placeholder={String(imageInfo.width)}
              min={1}
            />
          </div>
          <button
            className={`lock-button ${lockAspectRatio ? "on" : ""}`}
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            type="button"
          >
            {lockAspectRatio ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
          </button>
          <div className="dim-field">
            <span className="control-label">Height</span>
            <input
              type="number"
              value={height || ""}
              onChange={(e) => handleHeightChange(+e.target.value)}
              placeholder={String(imageInfo.height)}
              min={1}
            />
          </div>
        </div>

        <div className="control-group control-full">
          <span className="control-label">Quality: {quality}</span>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(+e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-go options-submit"
        onClick={() => onCompress(format, quality, width || 0, height || 0)}
      >
        Compress
        <span className="arrow">→</span>
      </button>
    </div>
  );
}

