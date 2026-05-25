import { useState, useRef, useCallback, type ChangeEvent } from "react";
import type { ImageInfo } from "../types";

export function Upload({ onUploadComplete }: { onUploadComplete: (info: ImageInfo) => void }) {
  const [progress, setProgress] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback((file: File) => {
    setIsBusy(true);
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => 
      event.lengthComputable && setProgress(Math.round((event.loaded / event.total) * 100));
    
    xhr.onload = () => { 
      if (xhr.status === 200) {
        onUploadComplete(JSON.parse(xhr.responseText));
      }
      setIsBusy(false);
    };
    xhr.onerror = () => setIsBusy(false);
    xhr.send(formData);
  }, [onUploadComplete]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="upload-container">
      {isBusy ? (
        <div className="upload-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">Uploading {progress}%</span>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-go"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Image
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
    </div>
  );
}

