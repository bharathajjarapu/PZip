import { useCallback, useRef, useState } from "react";
import "./index.css";
import type { ImageInfo, CompressionResult, OutputFormat, Settings } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Upload } from "./components/Upload";
import { Options } from "./components/Options";
import { Result } from "./components/Result";
import { compress } from "./workers/client";

type Phase = "idle" | "options" | "processing" | "done";

export function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSettings, setLastSettings] = useState<Settings | null>(null);
  const objectUrls = useRef<string[]>([]);

  const trackUrl = useCallback((url: string) => {
    objectUrls.current.push(url);
    return url;
  }, []);

  const revokeAll = useCallback(() => {
    for (const url of objectUrls.current) URL.revokeObjectURL(url);
    objectUrls.current = [];
  }, []);

  const handleUpload = useCallback(
    (info: ImageInfo) => {
      revokeAll();
      setResult(null);
      setError(null);
      setImageInfo(info);
      setPhase("options");
    },
    [revokeAll]
  );

  const handleCompress = useCallback(
    async (format: OutputFormat, quality: number, width: number, height: number) => {
      if (!imageInfo) return;
      setError(null);
      setPhase("processing");

      const res = await compress({
        file: imageInfo.file,
        format,
        quality,
        width,
        height,
        lockAspect: true,
      });

      if (!res.ok) {
        setError(res.error);
        setPhase("options");
        return;
      }

      setLastSettings({ format, quality, width, height });
      const url = trackUrl(URL.createObjectURL(res.blob));
      setResult({ blob: res.blob, size: res.blob.size, url, width: res.width, height: res.height });
      setPhase("done");
    },
    [imageInfo, trackUrl]
  );

  const handleTryAgain = useCallback(() => {
    revokeAll();
    setResult(null);
    setError(null);
    setPhase("options");
  }, [revokeAll]);

  const handleReset = useCallback(() => {
    revokeAll();
    setImageInfo(null);
    setResult(null);
    setError(null);
    setLastSettings(null);
    setPhase("idle");
  }, [revokeAll]);

  return (
    <div className="prism-root">
      <Header />
      <main className={`main-content ${phase === "options" || phase === "done" ? "compact-phase" : ""}`}>
        {phase === "idle" && (
          <div className="hero-landing">
            <div className="hero-in">
              <h1>
                P<em>Zip.</em>
              </h1>
              <div className="hero-powered-by">
                Powered by{" "}
                <span className="powered-tag">
                  <svg className="powered-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm-1-13h2v6h-2Zm0 8h2v2h-2Z" />
                  </svg>
                  Your Browser
                </span>
              </div>
              <p>Local, Fast Image Compression Tool For Modern Web</p>
            </div>

            <div className="hero-preview-container">
              <div className="hero-preview-wrapper original-wrapper">
                <div className="hero-format-label">JPG</div>
                <img src="/Hero.webp" alt="Original" className="hero-img original-img" />
                <div className="hero-size-label original-size">5.0 MB</div>
              </div>

              <div className="hero-arrow-connector">
                <svg width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h56" />
                  <path d="m52 5 7 7-7 7" />
                </svg>
              </div>

              <div className="hero-preview-wrapper converted-wrapper">
                <div className="hero-format-label optimized">WEBP</div>
                <img src="/Hero.webp" alt="Converted" className="hero-img converted-img" />
                <div className="hero-size-label optimized">50 KB</div>
              </div>
            </div>

            <Upload onUploadComplete={handleUpload} />
          </div>
        )}

        {phase === "options" && imageInfo && (
          <Options imageInfo={imageInfo} onCompress={handleCompress} error={error} initialSettings={lastSettings} />
        )}

        {phase === "processing" && (
          <div className="processing-container">
            <div className="glyph-loader" />
          </div>
        )}

        {phase === "done" && imageInfo && result && (
          <Result
            imageInfo={imageInfo}
            result={result}
            format={result.blob.type.replace("image/", "")}
            onReset={handleReset}
            onTryAgain={handleTryAgain}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
