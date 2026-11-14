import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Crosshair, Grid3x3, Pause, Play, RotateCcw } from "lucide-react";
import HudButton from "./HudButton";
import DeviceSilhouette from "./DeviceSilhouette";
import { formatCoords, formatSpecValue, humanizeKey, normalizedOrbits, resolveModelSrc } from "../lib/mission";

/**
 * Sticky 3D inspection panel built on Google's <model-viewer>.
 * - Camera glides to each chapter's focus as you scroll.
 * - "Blueprint" mode recolors every material cyan, strips textures and adds a drafting grid.
 * - Telemetry readout comes from the active chapter's metadata.
 */
export default function ModelPanel({ device, modelKey, chapterIndex, destinationId }) {
  const mvRef = useRef(null);
  const originals = useRef(null);
  const [lib, setLib] = useState(false);
  const [src, setSrc] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [blueprint, setBlueprint] = useState(false);
  const [spin, setSpin] = useState(true);

  const chapter = device.chapters[chapterIndex] ?? device.chapters[0];
  const orbits = useMemo(() => normalizedOrbits(device.chapters), [device]);
  const orbit = orbits[chapterIndex] ?? orbits[0];

  useEffect(() => {
    let alive = true;
    import("@google/model-viewer").then(() => alive && setLib(true));
    resolveModelSrc(modelKey).then((s) => alive && setSrc(s));
    return () => {
      alive = false;
    };
  }, [modelKey]);

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv || !lib) return;
    const onProgress = (e) => {
      const v = e.detail.totalProgress ?? 0;
      setProgress(v);
      if (v >= 1) setTimeout(() => mv.loaded && setStatus((st) => (st === "loading" ? "ready" : st)), 120);
    };
    const onLoad = () => {
      setStatus("ready");
      try {
        originals.current = mv.model.materials.map((m) => ({
          base: [...m.pbrMetallicRoughness.baseColorFactor],
          metal: m.pbrMetallicRoughness.metallicFactor,
          rough: m.pbrMetallicRoughness.roughnessFactor,
          emissive: [...m.emissiveFactor],
          tex: m.pbrMetallicRoughness.baseColorTexture?.texture ?? null,
        }));
      } catch {
        originals.current = null;
      }
    };
    const onError = () => setStatus("error");
    mv.addEventListener("progress", onProgress);
    mv.addEventListener("load", onLoad);
    mv.addEventListener("error", onError);
    if (mv.loaded) onLoad();
    return () => {
      mv.removeEventListener("progress", onProgress);
      mv.removeEventListener("load", onLoad);
      mv.removeEventListener("error", onError);
    };
  }, [lib, src]);

  // Blueprint material swap
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv?.model || status !== "ready" || !originals.current) return;
    try {
      mv.model.materials.forEach((m, i) => {
        const o = originals.current[i];
        const pbr = m.pbrMetallicRoughness;
        if (blueprint) {
          pbr.setBaseColorFactor([0.42, 0.85, 1, 1]);
          pbr.setMetallicFactor(0);
          pbr.setRoughnessFactor(1);
          m.setEmissiveFactor([0.05, 0.28, 0.5]);
          pbr.baseColorTexture?.setTexture?.(null);
        } else if (o) {
          pbr.setBaseColorFactor(o.base);
          pbr.setMetallicFactor(o.metal);
          pbr.setRoughnessFactor(o.rough);
          m.setEmissiveFactor(o.emissive);
          if (o.tex) pbr.baseColorTexture?.setTexture?.(o.tex);
        }
      });
    } catch {
      /* some models expose read-only materials; the CSS layer still applies */
    }
  }, [blueprint, status]);

  const loc = chapter.metadata.location;
  const coords = formatCoords(loc);
  const specs = Object.entries(chapter.metadata.missionSpecs)
    .map(([k, v]) => [humanizeKey(k), formatSpecValue(v)])
    .filter(([, v]) => v)
    .slice(0, 5);

  const mvProps = {
    ref: mvRef,
    src: src ?? undefined,
    alt: `NASA 3D model: ${device.model.label}`,
    "camera-controls": "",
    "camera-orbit": orbit,
    "min-camera-orbit": "auto auto 40%",
    "max-camera-orbit": "auto auto 400%",
    "interpolation-decay": "120",
    "shadow-intensity": blueprint ? "0" : "1",
    exposure: blueprint ? "1.4" : "1.05",
    "environment-image": "neutral",
    "interaction-prompt": "none",
    "touch-action": "pan-y",
    ...(spin ? { "auto-rotate": "", "rotation-per-second": "12deg", "auto-rotate-delay": "800" } : {}),
  };

  return (
    <div className={`@container relative h-full w-full overflow-hidden ${blueprint ? "blueprint-grid" : ""}`}>
      {/* atmosphere */}
      {!blueprint && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              destinationId === "mars"
                ? "radial-gradient(circle at 50% 70%, rgba(181,83,42,0.28), transparent 65%)"
                : destinationId === "moon"
                  ? "radial-gradient(circle at 50% 70%, rgba(200,205,215,0.14), transparent 65%)"
                  : "radial-gradient(circle at 50% 45%, rgba(80,110,200,0.18), transparent 65%)",
          }}
        />
      )}

      {lib && src && <model-viewer {...mvProps} className={blueprint ? "contrast-125" : ""} />}

      {/* loading / error states */}
      <AnimatePresence>
        {status !== "ready" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 pb-36 text-center sm:pb-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DeviceSilhouette deviceId={device.id} variant="hero" className="w-44 opacity-80 sm:w-64" />
            {status === "loading" ? (
              <>
                <p className="font-mono text-[11px] tracking-[0.3em] text-signal">DOWNLINKING NASA 3D MODEL · {Math.round(progress * 100)}%</p>
                <div className="h-px w-56 bg-white/10">
                  <motion.div className="h-px bg-signal" animate={{ width: `${Math.max(4, progress * 100)}%` }} />
                </div>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] tracking-[0.3em] text-warn">MODEL FEED OFFLINE</p>
                <p className="max-w-xs text-xs text-parchment/60">
                  The NASA server didn&apos;t allow this browser to fetch the model. Run <code className="text-amber">npm run fetch-models</code> to serve local copies.
                </p>
                <a href={device.model.pageUrl} target="_blank" rel="noreferrer" className="font-mono text-[10px] tracking-[0.2em] text-signal underline-offset-4 hover:underline">
                  VIEW ON NASA 3D RESOURCES ↗
                </a>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* crosshair + corners */}
      <div className="pointer-events-none absolute inset-6 border border-white/10" />
      <Crosshair className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10" size={56} strokeWidth={0.6} />

      {/* top-left: identity */}
      <div className="pointer-events-none absolute left-8 top-8 max-w-[calc(100%-13.5rem)]">
        <p className="hud-label truncate text-[9px]">3D INSPECTION · {device.nssdcId ? `NSSDCA ${device.nssdcId}` : "NASA"}</p>
        <p className="mt-1 font-serif text-2xl leading-tight text-parchment md:text-3xl">{device.shortName}</p>
        <p className="truncate font-mono text-[10px] tracking-[0.18em] text-parchment/50">MODEL · {device.model.credit?.toUpperCase()}</p>
      </div>

      {/* top-right: toggles */}
      <div className="absolute right-8 top-8 flex flex-col items-end gap-2">
        <HudButton onClick={() => setBlueprint((b) => !b)} className={`!px-3 !py-2 ${blueprint ? "!border-signal !text-signal" : ""}`} aria-pressed={blueprint}>
          {blueprint ? <Box size={13} /> : <Grid3x3 size={13} />} {blueprint ? "Render" : "Blueprint"}
        </HudButton>
        <HudButton onClick={() => setSpin((s) => !s)} className="!px-3 !py-2" aria-pressed={spin}>
          {spin ? <Pause size={13} /> : <Play size={13} />} Orbit
        </HudButton>
        <HudButton
          onClick={() => {
            const mv = mvRef.current;
            if (mv) {
              mv.cameraOrbit = orbit;
              mv.cameraTarget = "auto auto auto";
              mv.fieldOfView = "auto";
              mv.jumpCameraToGoal?.();
            }
          }}
          className="!px-3 !py-2"
        >
          <RotateCcw size={13} /> Reset
        </HudButton>
      </div>

      {/* chapter ticks */}
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col gap-3 @[400px]:flex">
        {device.chapters.map((c, i) => (
          <div key={c.number} className="flex items-center justify-end gap-2">
            <span className={`font-mono text-[9px] tracking-[0.2em] transition-opacity ${i === chapterIndex ? "text-amber opacity-100" : "opacity-30"}`}>
              0{c.number}
            </span>
            <span className={`h-px transition-all duration-500 ${i === chapterIndex ? "w-8 bg-amber" : "w-3 bg-white/40"}`} />
          </div>
        ))}
      </div>

      {/* telemetry */}
      <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapterIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="hud-glass rounded-sm p-4"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.25em] text-amber">TELEMETRY · CH 0{chapter.number}</span>
              <span className="font-mono text-[10px] tracking-[0.15em] text-parchment/60">{chapter.metadata.dateUTC} UTC</span>
            </div>
            <p className="font-mono text-[11px] leading-5 text-parchment/85">
              <span className="text-parchment/45">LOC </span>
              {loc.name}
            </p>
            {coords && (
              <p className="font-mono text-[11px] leading-5 text-signal">
                <span className="text-parchment/45">POS </span>
                {coords}
                {loc.approximate ? " (approx.)" : ""} · {loc.body?.toUpperCase()}
              </p>
            )}
            {!coords && loc.distanceFromEarthKm && (
              <p className="font-mono text-[11px] leading-5 text-signal">
                <span className="text-parchment/45">RANGE </span>
                {(loc.distanceFromEarthKm / 1e9).toFixed(2)} BILLION KM · {loc.distanceAU} AU
              </p>
            )}
            {!coords && loc.closestApproachKm && (
              <p className="font-mono text-[11px] leading-5 text-signal">
                <span className="text-parchment/45">CLOSEST </span>
                {loc.closestApproachKm.toLocaleString("en-US")} KM · {loc.body?.toUpperCase()}
              </p>
            )}
            <div className="mt-2 hidden max-h-28 grid-cols-1 gap-x-6 gap-y-1 overflow-hidden border-t border-white/10 pt-2 @[440px]:grid @[660px]:grid-cols-2">
              {specs.map(([k, v]) => (
                <p key={k} className="truncate font-mono text-[10px] leading-5 text-parchment/75" title={`${k}: ${v}`}>
                  <span className="text-parchment/40">{k} </span>
                  {v}
                </p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
