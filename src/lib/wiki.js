/**
 * Live Wikipedia previews (photo + short summary) for the clickable words.
 * Uses Wikipedia's public API, which allows cross-site requests. Results are cached.
 * Returns null when offline or when the article can't be found; callers then show
 * the built-in blurb only.
 */
const cache = new Map();

const trimExtract = (text, max = 330) => {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return stop > 120 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

const pageUrl = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

async function viaActionApi(title, thumb) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&redirects=1" +
    "&prop=extracts%7Cpageimages%7Cdescription&exintro=1&explaintext=1&exsentences=3" +
    `&piprop=thumbnail&pithumbsize=${thumb}&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const page = json?.query?.pages?.[0];
  if (!page || page.missing || page.invalid) return null;
  return {
    title: page.title,
    description: page.description || "",
    extract: trimExtract(page.extract),
    image: page.thumbnail?.source || null,
    imageWidth: page.thumbnail?.width || 0,
    imageHeight: page.thumbnail?.height || 0,
    url: pageUrl(page.title),
  };
}

async function viaRestSummary(title) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  if (!res.ok) return null;
  const j = await res.json();
  if (!j || j.type === "disambiguation") return null;
  return {
    title: j.title,
    description: j.description || "",
    extract: trimExtract(j.extract),
    image: j.thumbnail?.source || null,
    imageWidth: j.thumbnail?.width || 0,
    imageHeight: j.thumbnail?.height || 0,
    url: j.content_urls?.desktop?.page || pageUrl(j.title),
  };
}

/** @returns {Promise<null | {title, description, extract, image, url}>} */
export function fetchWiki(title, thumb = 480) {
  if (!title) return Promise.resolve(null);
  const key = `${title}|${thumb}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      viaActionApi(title, thumb)
        .catch(() => null)
        .then((hit) => hit || viaRestSummary(title).catch(() => null))
    );
  }
  return cache.get(key);
}
