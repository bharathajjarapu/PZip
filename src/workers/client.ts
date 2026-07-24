import type { CompressRequest, CompressResponse } from "../types";

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<string, (res: CompressResponse) => void>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./compress.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<CompressResponse>) => {
    const resolve = pending.get(e.data.id);
    if (resolve) {
      pending.delete(e.data.id);
      resolve(e.data);
    }
  };
  worker.onerror = (e) => {
    for (const resolve of pending.values()) {
      resolve({ id: "", ok: false, error: e.message || "Worker error" });
    }
    pending.clear();
  };
  return worker;
}

export function compress(req: Omit<CompressRequest, "id">): Promise<CompressResponse> {
  const id = String(++nextId);
  return new Promise((resolve) => {
    pending.set(id, resolve);
    getWorker().postMessage({ ...req, id });
  });
}
