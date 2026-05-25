import { serve } from "bun";
import index from "./index.html";
import { tmpdir } from "os";
import { join } from "path";

const tempDir = tmpdir();
const uploadedImages = new Map<
  number,
  {
    path: string;
    name: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }
>();
let lastUploadId = 0;

const server = serve({
  routes: {
    "/api/upload": {
      POST: async (request) => {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File))
          return Response.json({ error: "No file uploaded" }, { status: 400 });
        
        const uploadId = ++lastUploadId;
        const buffer = await file.arrayBuffer();
        const tempFilePath = join(tempDir, `pz_${uploadId}`);
        await Bun.write(tempFilePath, buffer);
        
        const image = Bun.file(tempFilePath).image();
        const metadata = await image.metadata();
        
        uploadedImages.set(uploadId, {
          path: tempFilePath,
          name: file.name,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: buffer.byteLength,
        });
        
        setTimeout(() => uploadedImages.delete(uploadId), 600_000);
        
        return Response.json({
          id: uploadId,
          name: file.name,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: buffer.byteLength,
        });
      },
    },
    "/api/img/:id": {
      GET: (request) => {
        const uploadRecord = uploadedImages.get(+request.params.id);
        if (!uploadRecord) return new Response("Not found", { status: 404 });
        return new Response(Bun.file(uploadRecord.path));
      },
    },
    "/api/process": {
      POST: async (request) => {
        const { id, format, quality, width, height } = await request.json();
        const uploadRecord = uploadedImages.get(id);
        if (!uploadRecord) return Response.json({ error: "Not found" }, { status: 404 });
        
        const image = Bun.file(uploadRecord.path).image();
        if (width || height)
          image.resize(width || undefined, height || undefined, {
            fit: "inside",
            withoutEnlargement: true,
          });
        
        let mimeType: string;
        const qualityValue = quality ?? 80;
        switch (format) {
          case "webp":
            image.webp({ quality: qualityValue });
            mimeType = "image/webp";
            break;
          case "png":
            image.png({ compressionLevel: Math.round(qualityValue / 11) });
            mimeType = "image/png";
            break;
          case "avif":
            image.avif({ quality: qualityValue });
            mimeType = "image/avif";
            break;
          default:
            image.jpeg({ quality: qualityValue });
            mimeType = "image/jpeg";
        }
        const outputBytes = await image.bytes();
        uploadedImages.delete(id);
        return new Response(outputBytes as any, {
          headers: { "Content-Type": mimeType, "X-Size": String(outputBytes.byteLength) },
        });
      },
    },
    "/Hero.webp": Bun.file(join(process.cwd(), "public", "Hero.webp")),
    "/PZip.webp": Bun.file(join(process.cwd(), "public", "PZip.webp")),
    "/Social.png": Bun.file(join(process.cwd(), "public", "Social.png")),
    "/Favicon.png": Bun.file(join(process.cwd(), "public", "Favicon.png")),
    "/*": index,
  },
});

console.log(`Live at ${server.url}`);

