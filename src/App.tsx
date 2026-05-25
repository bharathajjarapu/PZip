import { useState } from "react";
import "./index.css";
import type { Phase, ImageInfo, CompressionResult } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Upload } from "./components/Upload";
import { Options } from "./components/Options";
import { Result } from "./components/Result";

/* ====== APP ====== */
export function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [outputFormat, setOutputFormat] = useState("");

  const handleUploadComplete = (info: ImageInfo) => { 
    setImageInfo(info); 
    setPhase("options"); 
  };

  const handleCompress = async (format: string, quality: number, width: number, height: number) => {
    setOutputFormat(format);
    setPhase("processing");

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: imageInfo!.id, 
          format, 
          quality, 
          width: width || undefined, 
          height: height || undefined 
        }),
      });
      const blob = await response.blob();
      const compressedSize = +(response.headers.get("X-Size") || 0);
      setCompressionResult({ blob, url: URL.createObjectURL(blob), size: compressedSize || blob.size });
      setPhase("done");
    } catch (e) {
      console.error("Compression failed", e);
    }
  };

  const handleReset = () => { 
    setPhase("idle"); 
    setImageInfo(null); 
    setCompressionResult(null); 
  };

  return (
    <div className="prism-root">
      <Header />
      <main className={`main-content ${phase === "options" || phase === "done" ? "compact-phase" : ""}`}>
        {phase === "idle" && (
          <div className="hero-landing">
            <div className="hero-in">
              <h1>P<em>Zip.</em></h1>
              <div className="hero-powered-by">
                Powered By {" "}
                <a href="https://bun.sh/" target="_blank" rel="noopener noreferrer" className="bun-link">
                  <svg className="bun-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22.596c6.628 0 12-4.338 12-9.688 0-3.318-2.057-6.248-5.219-7.986-1.286-.715-2.297-1.357-3.139-1.89C14.058 2.025 13.08 1.404 12 1.404c-1.097 0-2.334.785-3.966 1.821a49.92 49.92 0 0 1-2.816 1.697C2.057 6.66 0 9.59 0 12.908c0 5.35 5.372 9.687 12 9.687v.001ZM10.599 4.715c.334-.759.503-1.58.498-2.409 0-.145.202-.187.23-.029.658 2.783-.902 4.162-2.057 4.624-.124.048-.199-.121-.103-.209a5.763 5.763 0 0 0 1.432-1.977Zm2.058-.102a5.82 5.82 0 0 0-.782-2.306v-.016c-.069-.123.086-.263.185-.172 1.962 2.111 1.307 4.067.556 5.051-.082.103-.23-.003-.189-.126a5.85 5.85 0 0 0 .23-2.431Zm1.776-.561a5.727 5.727 0 0 0-1.612-1.806v-.014c-.112-.085-.024-.274.114-.218 2.595 1.087 2.774 3.18 2.459 4.407a.116.116 0 0 1-.049.071.11.11 0 0 1-.153-.026.122.122 0 0 1-.022-.083 5.891 5.891 0 0 0-.737-2.331Zm-5.087.561c-.617.546-1.282.76-2.063 1-.117 0-.195-.078-.156-.181 1.752-.909 2.376-1.649 2.999-2.778 0 0 .155-.118.188.085 0 .304-.349 1.329-.968 1.874Zm4.945 11.237a2.957 2.957 0 0 1-.937 1.553c-.346.346-.8.565-1.286.62a2.178 2.178 0 0 1-1.327-.62 2.955 2.955 0 0 1-.925-1.553.244.244 0 0 1 .064-.198.234.234 0 0 1 .193-.069h3.965a.226.226 0 0 1 .19.07c.05.053.073.125.063.197Zm-5.458-2.176a1.862 1.862 0 0 1-2.384-.245 1.98 1.98 0 0 1-.233-2.447c.207-.319.503-.566.848-.713a1.84 1.84 0 0 1 1.092-.11c.366.075.703.261.967.531a1.98 1.98 0 0 1 .4 2.114 1.931 1.931 0 0 1-.698.869v.001Zm8.495.005a1.86 1.86 0 0 1-2.381-.253 1.964 1.964 0 0 1-.547-1.366c0-.384.11-.76.32-1.079.207-.319.503-.567.849-.713a1.844 1.844 0 0 1 1.093-.108c.367.076.704.262.968.534a1.98 1.98 0 0 1 .4 2.117 1.932 1.932 0 0 1-.702.868Z" />
                  </svg>
                  Bun
                </a>
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

            <Upload onUploadComplete={handleUploadComplete} />
          </div>
        )}
        {phase === "options" && imageInfo && <Options imageInfo={imageInfo} onCompress={handleCompress} />}
        {phase === "processing" && (
          <div className="processing-container">
            <div className="glyph-loader" />
          </div>
        )}
        {phase === "done" && imageInfo && compressionResult && (
          <Result imageInfo={imageInfo} result={compressionResult} format={outputFormat} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

