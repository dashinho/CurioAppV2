import { ASSETS } from "../data/missionData";

/* ---------- 3D models: prefer local copies (npm run fetch-models), else NASA ---------- */
let manifestPromise = null;
export function getModelManifest() {
  if (!manifestPromise) {
    // Opened by double-click (file://): browsers block local fetches, so go straight to NASA URLs.
    if (typeof location !== "undefined" && location.protocol === "file:") return (manifestPromise = Promise.resolve({}));
    manifestPromise = fetch(`${import.meta.env.BASE_URL}models/manifest.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return manifestPromise;
}

export async function resolveModelSrc(modelKey) {
  const model = ASSETS.models[modelKey];
  if (!model?.glb) return null;
  const manifest = await getModelManifest();
  if (manifest[modelKey]) return `${import.meta.env.BASE_URL}models/${manifest[modelKey]}`;
  return model.glb;
}

/** Find which ASSETS.models key a hero device uses. */
export function modelKeyFor(device) {
  return Object.keys(ASSETS.models).find((k) => ASSETS.models[k] && ASSETS.models[k] === device.model) ?? null;
}

/**
 * NASA models come in different units, so "9m" in the data could be far too close or too far.
 * Convert each chapter's radius into a % of model-viewer's auto framing, relative to that device's median.
 */
export function normalizedOrbits(chapters) {
  const parsed = chapters.map((c) => {
    const [theta = "0deg", phi = "75deg", r = "1m"] = (c.modelFocus?.cameraOrbit || "").split(/\s+/);
    return { theta, phi, r: parseFloat(r) || 1 };
  });
  const sorted = [...parsed.map((p) => p.r)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 1;
  return parsed.map((p) => {
    const pct = Math.round(Math.min(230, Math.max(125, (p.r / median) * 165)));
    return `${p.theta} ${p.phi} ${pct}%`;
  });
}

/* ---------- Formatting ---------- */
export function formatCoords(loc) {
  if (!loc || loc.lat == null || loc.lon == null) return null;
  const lat = `${Math.abs(loc.lat).toFixed(3)}°${loc.lat >= 0 ? "N" : "S"}`;
  if (loc.body === "Mars") return `${lat}  ${loc.lon.toFixed(2)}°E`;
  const lon = `${Math.abs(loc.lon).toFixed(3)}°${loc.lon >= 0 ? "E" : "W"}`;
  return `${lat}  ${lon}`;
}

export function formatSpecValue(v) {
  if (Array.isArray(v)) return v.join(" · ");
  if (typeof v === "number") return v.toLocaleString("en-US");
  if (v && typeof v === "object") return null;
  return String(v);
}

export const humanizeKey = (k) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Kg\b/, "(kg)")
    .replace(/Km\b/, "(km)")
    .replace(/\bG\b/, "(g)")
    .toUpperCase();

/** A big serif pull-quote: a direct quote from the chapter if there is one, else its closing line. */
export function pullQuoteFor(chapter) {
  const text = chapter.paragraphs.join(" ");
  const re = /(?:^|[\s:(])'([A-Z][\s\S]*?)'(?=[\s.,;:!?)]|$)/g;
  let best = null;
  for (const m of text.matchAll(re)) {
    const q = m[1].trim();
    if (q.length >= 20 && (!best || q.length > best.length)) best = q;
  }
  if (best) return { text: best, quoted: true };
  const last = chapter.paragraphs[chapter.paragraphs.length - 1];
  const sentences = last.match(/[^.!?]+[.!?]+/g) || [last];
  const tail = sentences.slice(-2).join(" ").trim();
  return { text: tail.length > 160 ? sentences.slice(-1)[0].trim() : tail, quoted: false };
}

/** For an image ID, ask the NASA asset manifest for a real file URL. */
export async function resolveFromManifest(manifestUrl) {
  try {
    const r = await fetch(manifestUrl);
    if (!r.ok) return null;
    const json = await r.json();
    const hrefs = (json?.collection?.items ?? []).map((i) => i.href);
    return (
      hrefs.find((h) => /~medium\.jpe?g$/i.test(h)) ||
      hrefs.find((h) => /~large\.jpe?g$/i.test(h)) ||
      hrefs.find((h) => /~small\.jpe?g$/i.test(h)) ||
      null
    )?.replace(/^http:/, "https:");
  } catch {
    return null;
  }
}

export function daysUntil(dateStr) {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}
