import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { consultationPhotos } from "../src/content/consultation-photos.mjs";
import { digitalLearning } from "../src/content/field-records.mjs";
import { photoVariants } from "../src/lib/photo-variants.mjs";

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || "sharp");
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/assets/activities");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const results = [];
for (const photo of [...consultationPhotos, ...digitalLearning.photos]) {
  const sourcePath = path.join(directory, photo.file);
  const source = await readFile(sourcePath);
  const originalHash = hash(source);
  const variants = [];
  for (const item of photoVariants(photo)) {
    const target = path.resolve(directory, item.file);
    if (!target.startsWith(directory + path.sep) || target === sourcePath || !target.endsWith(".webp")) throw new Error("Unsafe derivative path");
    const info = await sharp(source).resize({ width: item.width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(target);
    const metadata = await sharp(target).metadata();
    if (metadata.exif || metadata.xmp || metadata.orientation) throw new Error(`Unexpected source metadata: ${item.file}`);
    if (Math.abs(info.width / info.height - photo.width / photo.height) > 0.002) throw new Error(`Changed aspect ratio: ${item.file}`);
    variants.push({ file: item.file, width: info.width, height: info.height, bytes: info.size });
  }
  if (hash(await readFile(sourcePath)) !== originalHash) throw new Error(`Original changed: ${photo.file}`);
  results.push({ file: photo.file, originalBytes: source.length, originalHash, variants });
}
console.log(JSON.stringify({ method: "WebP derivatives only; no cropping, content editing or original overwrite; metadata stripped", results }, null, 2));
