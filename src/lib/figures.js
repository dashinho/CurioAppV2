/**
 * Turns a figure spec from storyExtras.js into something an <img> can show.
 * Every spec resolves to a list of URLs to try in order, so one dead link
 * never leaves an empty frame.
 */
import { fetchWiki } from "./wiki";
import { resolveFromManifest } from "./mission";

const nasaFile = (id, size) => `https://images-assets.nasa.gov/image/${encodeURIComponent(id)}/${encodeURIComponent(id)}~${size}.jpg`;

const cache = new Map();

export const figureKey = (spec) => spec.nasa || spec.wiki || spec.url;

async function resolve(spec) {
  if (spec.nasa) {
    const id = spec.nasa;
    return {
      key: id,
      sources: [nasaFile(id, "medium"), nasaFile(id, "small"), nasaFile(id, "thumb")],
      // last resort: ask NASA's asset list which files really exist
      lateSource: () => resolveFromManifest(`https://images-api.nasa.gov/asset/${encodeURIComponent(id)}`),
      large: nasaFile(id, "large"),
      caption: spec.caption,
      credit: spec.credit || "NASA",
      tag: id.toUpperCase(),
      link: `https://images.nasa.gov/details/${encodeURIComponent(id)}`,
    };
  }
  if (spec.wiki) {
    const hit = await fetchWiki(spec.wiki, 960);
    if (!hit?.image) return null;
    return {
      key: `wiki:${spec.wiki}`,
      sources: [hit.image],
      large: hit.image,
      caption: spec.caption,
      credit: "via Wikipedia",
      tag: "WIKIMEDIA",
      link: hit.url,
    };
  }
  if (spec.url) {
    return {
      key: spec.url,
      sources: [spec.url],
      large: spec.url,
      caption: spec.caption,
      credit: spec.credit || "NASA",
      tag: "NASA ARCHIVE",
      link: spec.link || spec.url,
    };
  }
  return null;
}

export function resolveFigure(spec) {
  const key = figureKey(spec);
  if (!cache.has(key)) cache.set(key, resolve(spec).catch(() => null));
  return cache.get(key);
}

/** Remember which URL finally worked so a page that re-opens shows its picture at once. */
const good = new Map();
export const rememberGood = (key, src) => good.set(key, src);
export const knownGood = (key) => good.get(key) || null;
