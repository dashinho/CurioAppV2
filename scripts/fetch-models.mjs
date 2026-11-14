/**
 * Downloads the NASA .glb models used by the hero devices into public/models/
 * and writes public/models/manifest.json. The app prefers these local copies,
 * which avoids slow downloads and any cross-origin (CORS) blocking at demo time.
 *
 *   npm run fetch-models
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ASSETS, destinations } from "../src/data/missionData.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "public", "models");
await mkdir(outDir, { recursive: true });

const keys = destinations
  .map((d) => Object.keys(ASSETS.models).find((k) => ASSETS.models[k] === d.heroDevice.model))
  .filter(Boolean);

const manifest = {};
for (const key of keys) {
  const url = ASSETS.models[key].glb;
  process.stdout.write(`↓ ${key} … `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const file = `${key}.glb`;
    await writeFile(join(outDir, file), buf);
    manifest[key] = file;
    console.log(`${(buf.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.log(`failed (${err.message}). The app will fall back to the NASA URL.`);
  }
}
await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nWrote ${Object.keys(manifest).length}/${keys.length} models + manifest.json to public/models/`);
