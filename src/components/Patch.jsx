import { useId, useMemo } from "react";

/** Make SVG ids unique per instance so repeated patches never share clipPaths. */
export function uniquifySvg(svg, suffix) {
  const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  let out = svg;
  ids.forEach((id) => {
    out = out
      .replaceAll(`id="${id}"`, `id="${id}-${suffix}"`)
      .replaceAll(`url(#${id})`, `url(#${id}-${suffix})`)
      .replaceAll(`href="#${id}"`, `href="#${id}-${suffix}"`);
  });
  return out;
}

export default function Patch({ svg, size = 120, className = "", style, title }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(() => uniquifySvg(svg, raw), [svg, raw]);
  return (
    <div
      className={`patch-svg ${className}`}
      style={{ width: size, height: size, ...style }}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
