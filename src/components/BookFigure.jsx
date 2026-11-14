import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X, ZoomIn } from "lucide-react";
import DeviceSilhouette from "./DeviceSilhouette";
import { knownGood, rememberGood, resolveFigure } from "../lib/figures";
import { sound } from "../audio/SoundEngine";

/** Full-screen view of one picture. */
function Lightbox({ fig, src, onClose }) {
  const [big, setBig] = useState(fig.large || src);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[67] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={fig.caption}
    >
      <button type="button" onClick={onClose} className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-parchment/80 hover:text-parchment">
        CLOSE <X size={16} />
      </button>
      <motion.img
        src={big}
        alt={fig.caption}
        referrerPolicy="no-referrer"
        onError={() => big !== src && setBig(src)}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="max-h-[76vh] max-w-full border border-white/15 object-contain shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
      />
      <div className="mt-5 max-w-3xl text-center" onClick={(e) => e.stopPropagation()}>
        <p className="font-serif text-2xl leading-snug text-parchment">{fig.caption}</p>
        <a
          href={fig.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-signal hover:underline"
        >
          {fig.credit.toUpperCase()} · {fig.tag} · OPEN THE ORIGINAL <ExternalLink size={11} />
        </a>
      </div>
    </motion.div>,
    document.body
  );
}

/**
 * One picture on a book page. Fills the height it is given.
 * Tries the main picture, then each spare; if nothing loads (no internet),
 * it shows a drawing of the machine instead, so a page is never empty.
 */
export default function BookFigure({ spec, spares = [], deviceId }) {
  const candidates = useRef([spec, ...spares]).current;
  const [ci, setCi] = useState(0);
  const [fig, setFig] = useState(null);
  const [si, setSi] = useState(0);
  const [src, setSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [dead, setDead] = useState(false);
  const [zoom, setZoom] = useState(false);
  const triedLate = useRef(false);

  // resolve the current candidate
  useEffect(() => {
    let alive = true;
    const cand = candidates[ci];
    if (!cand) {
      setDead(true);
      return;
    }
    triedLate.current = false;
    setLoaded(false);
    resolveFigure(cand).then((f) => {
      if (!alive) return;
      if (!f) return setCi((n) => n + 1);
      setFig(f);
      const good = knownGood(f.key);
      setSi(0);
      setSrc(good || f.sources[0]);
    });
    return () => {
      alive = false;
    };
  }, [ci, candidates]);

  const onError = async () => {
    if (!fig) return;
    const next = si + 1;
    if (next < fig.sources.length) {
      setSi(next);
      setSrc(fig.sources[next]);
      return;
    }
    if (fig.lateSource && !triedLate.current) {
      triedLate.current = true;
      const late = await fig.lateSource();
      if (late && !fig.sources.includes(late)) return setSrc(late);
    }
    setFig(null);
    setSrc(null);
    setCi((n) => n + 1);
  };

  if (dead) {
    return (
      <figure className="flex h-full min-h-0 flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: "radial-gradient(circle at 50% 40%, #1d2333, #0b0d14 75%)" }}>
          <DeviceSilhouette deviceId={deviceId} variant="hero" className="absolute inset-0 m-auto h-[82%] w-[82%]" />
        </div>
        <figcaption className="flex-none pt-[0.45em] text-[0.7em] italic leading-snug text-[#3a3329]">
          {spec.caption} <span className="font-mono text-[0.66em] not-italic tracking-[0.12em] text-[#211d17]/50">· PHOTO LOADS WHEN ONLINE</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        className="plate group relative block min-h-0 w-full flex-1 cursor-zoom-in"
        onClick={(e) => {
          e.stopPropagation();
          if (!loaded) return;
          sound.click();
          setZoom(true);
        }}
        aria-label={fig ? `Enlarge picture: ${fig.caption}` : "Loading picture"}
      >
        <span className={`absolute inset-[0.28em] overflow-hidden bg-[#14161d] ${loaded ? "" : "plate-shimmer"}`}>
          {src && (
            <img
              key={src}
              src={src}
              alt={fig?.caption ?? ""}
              referrerPolicy="no-referrer"
              draggable={false}
              onLoad={() => {
                setLoaded(true);
                if (fig) rememberGood(fig.key, src);
              }}
              onError={onError}
              className={`h-full w-full object-cover transition duration-700 ${loaded ? "opacity-100" : "opacity-0"} group-hover:scale-[1.03]`}
            />
          )}
          {loaded && fig && (
            <>
              <span className="absolute bottom-[0.5em] left-[0.5em] bg-black/60 px-[0.5em] py-[0.15em] font-mono text-[0.42em] tracking-[0.14em] text-parchment/85">
                {fig.tag}
              </span>
              <span className="absolute right-[0.5em] top-[0.5em] flex h-[1.5em] w-[1.5em] items-center justify-center rounded-full bg-black/55 text-parchment opacity-0 transition group-hover:opacity-100">
                <ZoomIn size="0.8em" />
              </span>
            </>
          )}
        </span>
      </button>
      <figcaption className="flex-none pt-[0.45em] text-[0.72em] italic leading-snug text-[#3a3329]">
        {(fig ?? spec).caption}
        {fig && <span className="font-mono text-[0.62em] not-italic tracking-[0.12em] text-[#211d17]/50"> · {fig.credit.toUpperCase()}</span>}
      </figcaption>
      <AnimatePresence>{zoom && fig && <Lightbox fig={fig} src={src} onClose={() => setZoom(false)} />}</AnimatePresence>
    </figure>
  );
}
