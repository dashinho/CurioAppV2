import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Atom, Building2, ExternalLink, MapPin, Rocket, User, X } from "lucide-react";
import { fetchWiki } from "../lib/wiki";
import { sound } from "../audio/SoundEngine";

/**
 * Clickable words, Wikipedia-style.
 *   <TermProvider> … <Term entry={glossaryEntry}>Neil Armstrong</Term> … </TermProvider>
 * Hover (mouse) previews the card; click or tap pins it open. Esc or a click outside closes it.
 * The card always shows the built-in blurb, then adds the photo and summary from Wikipedia
 * once they load.
 */

const TermCtx = createContext(null);
export const useTerms = () => useContext(TermCtx);

const ICONS = { person: User, place: MapPin, machine: Rocket, thing: Atom, org: Building2 };

function useWiki(entry) {
  const [state, setState] = useState({ status: entry.wiki ? "loading" : "none", data: null });
  useEffect(() => {
    let alive = true;
    if (!entry.wiki) return setState({ status: "none", data: null });
    setState({ status: "loading", data: null });
    fetchWiki(entry.wiki, 480).then((data) => alive && setState({ status: data ? "ready" : "offline", data }));
    return () => {
      alive = false;
    };
  }, [entry]);
  return state;
}

function Card({ entry, rect, pinned, onClose, onEnter, onLeave }) {
  const { status, data } = useWiki(entry);
  const [imgOk, setImgOk] = useState(true);
  const Icon = ICONS[entry.kind] ?? Atom;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sheet = vw < 560;

  const hasImage = status === "ready" && data.image && imgOk;
  const portrait = hasImage && data.imageHeight > data.imageWidth * 1.08;
  const W = Math.min(portrait ? 440 : 370, vw - 24);

  let style;
  if (sheet) {
    style = { left: 12, right: 12, bottom: 12, maxHeight: vh * 0.7 };
  } else {
    const left = Math.max(12, Math.min(rect.left + rect.width / 2 - W / 2, vw - W - 12));
    const below = vh - rect.bottom;
    const above = rect.top - 56; // keep clear of the top HUD bar
    const placeBelow = below >= 380 || below >= above;
    style = placeBelow
      ? { left, width: W, top: rect.bottom + 10, maxHeight: Math.max(200, below - 24) }
      : { left, width: W, bottom: vh - rect.top + 10, maxHeight: Math.max(200, above - 14) };
  }

  const text = (
    <div className="min-w-0 flex-1 p-4">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-amber">
        <Icon size={12} /> {entry.label.toUpperCase()}
      </p>
      <h4 className="mt-1 font-serif text-[28px] leading-[1.05] text-parchment">{entry.name}</h4>
      <p className="mt-2 text-[14px] leading-[1.5] text-parchment/90">{entry.blurb}</p>

      {status === "loading" && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3" aria-hidden="true">
          <div className="shimmer h-2.5 w-11/12 rounded" />
          <div className="shimmer h-2.5 w-10/12 rounded" />
          <div className="shimmer h-2.5 w-7/12 rounded" />
        </div>
      )}
      {status === "ready" && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="font-mono text-[9px] tracking-[0.22em] text-parchment/45">FROM WIKIPEDIA</p>
          {data.extract && <p className="mt-1 text-[12.5px] leading-[1.5] text-parchment/70">{data.extract}</p>}
          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-signal hover:underline"
          >
            READ MORE ON WIKIPEDIA <ExternalLink size={11} />
          </a>
        </div>
      )}
      {status === "offline" && (
        <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[10px] leading-4 tracking-[0.08em] text-parchment/45">
          Photo and more facts load from Wikipedia when you are online.{" "}
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(entry.wiki.replace(/ /g, "_"))}`}
            target="_blank"
            rel="noreferrer"
            className="text-signal hover:underline"
          >
            Open the article ↗
          </a>
        </p>
      )}
      {entry.source && status !== "ready" && (
        <a
          href={entry.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-signal hover:underline"
        >
          MORE AT {entry.source.label.toUpperCase()} <ExternalLink size={11} />
        </a>
      )}
    </div>
  );

  return (
    <motion.div
      role="dialog"
      aria-label={`About ${entry.name}`}
      data-term-card
      className="fixed z-[66] overflow-hidden rounded-md border border-white/20 bg-[#0b0e16]/95 text-left shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-md"
      style={style}
      initial={{ opacity: 0, y: sheet ? 24 : 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: sheet ? 24 : 4, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className="max-h-[inherit] overflow-y-auto" style={{ maxHeight: style.maxHeight }}>
        {(pinned || sheet) && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/55 text-parchment/80 hover:text-parchment"
          >
            <X size={14} />
          </button>
        )}
        {portrait ? (
          <div className="flex">
            <img
              src={data.image}
              alt={`${entry.name} (image from Wikipedia)`}
              referrerPolicy="no-referrer"
              onError={() => setImgOk(false)}
              className="w-[38%] shrink-0 self-stretch object-cover object-top"
              style={{ minHeight: 190 }}
            />
            {text}
          </div>
        ) : (
          <>
            {hasImage && (
              <img
                src={data.image}
                alt={`${entry.name} (image from Wikipedia)`}
                referrerPolicy="no-referrer"
                onError={() => setImgOk(false)}
                className="h-40 w-full object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            )}
            {status === "loading" && <div className="shimmer h-40 w-full" aria-hidden="true" />}
            {text}
          </>
        )}
      </div>
    </motion.div>
  );
}

export function TermProvider({ children }) {
  const [open, setOpen] = useState(null); // { entry, rect, pinned }
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const openRef = useRef(null);
  openRef.current = open;

  const clearTimers = () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  };

  const hide = useCallback(() => {
    clearTimers();
    setOpen(null);
  }, []);

  const show = useCallback((entry, el, pinned) => {
    clearTimers();
    if (!el) return;
    setOpen({ entry, rect: el.getBoundingClientRect(), pinned });
  }, []);

  const api = useMemo(
    () => ({
      activeId: open?.entry.id ?? null,
      hide,
      /** click / tap / Enter */
      toggle(entry, el) {
        const cur = openRef.current;
        if (cur && cur.entry.id === entry.id && cur.pinned) return hide();
        show(entry, el, true);
      },
      /** mouse hover */
      hoverIn(entry, el) {
        if (entry.wiki) fetchWiki(entry.wiki, 480); // warm the cache
        clearTimeout(hideTimer.current);
        if (openRef.current?.pinned) return;
        clearTimeout(showTimer.current);
        showTimer.current = setTimeout(() => show(entry, el, false), 320);
      },
      hoverOut() {
        clearTimeout(showTimer.current);
        if (openRef.current?.pinned) return;
        hideTimer.current = setTimeout(() => setOpen(null), 220);
      },
    }),
    [open, hide, show]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && hide();
    const onDown = (e) => {
      if (e.target.closest?.("[data-term-card]") || e.target.closest?.("[data-term]")) return;
      hide();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", hide);
    };
  }, [open, hide]);

  useEffect(() => clearTimers, []);

  return (
    <TermCtx.Provider value={api}>
      {children}
      {createPortal(
        <AnimatePresence>
          {open && (
            <Card
              key={open.entry.id}
              entry={open.entry}
              rect={open.rect}
              pinned={open.pinned}
              onClose={hide}
              onEnter={() => clearTimeout(hideTimer.current)}
              onLeave={() => api.hoverOut()}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </TermCtx.Provider>
  );
}

/** A clickable word. `chip` renders it as a small pill (used for "people in this chapter"). */
export function Term({ entry, children, chip = false }) {
  const api = useTerms();
  const ref = useRef(null);
  if (!api) return children;
  const active = api.activeId === entry.id;
  const Icon = ICONS[entry.kind] ?? Atom;
  return (
    <span
      ref={ref}
      data-term
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={active}
      className={`${chip ? "term-chip" : "term"} ${active ? "is-active" : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        sound.hover();
        api.hoverIn(entry, ref.current);
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && api.hoverOut()}
      onClick={(e) => {
        e.stopPropagation();
        sound.click();
        api.toggle(entry, ref.current);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          api.toggle(entry, ref.current);
        }
      }}
    >
      {chip && <Icon size="1em" aria-hidden="true" />}
      {children}
    </span>
  );
}
