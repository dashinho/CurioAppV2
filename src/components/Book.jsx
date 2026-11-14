import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { BlankPaper, BookPage, Endpaper } from "./BookPages";
import { useTerms } from "./TermCard";
import { sound } from "../audio/SoundEngine";

/**
 * A book whose pages really turn.
 *
 * Wide space  → two-page spread: each "leaf" has a front (right page) and a back (next left page)
 *               and swings over the spine.
 * Narrow space → one page at a time: the leaf swings away to the left and the next page is underneath.
 *
 * `page` is the canonical page index (in a spread: the LEFT page of the open spread, or 0 for the title).
 */

const WIDEST = 0.74; // page width / height, squarest allowed
const TALLEST = 0.6; // … and tallest allowed
const TURN_SECONDS = 1.05;

function useBookLayout(ref) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return useMemo(() => {
    const { w, h } = box;
    if (w < 40 || h < 40) return null;
    const spread = w >= 780 && w / h >= 1.22;
    const n = spread ? 2 : 1;
    const margin = 26; // room for the cover board and its shadow
    const pageW = Math.floor(Math.min((w - margin) / n, (h - margin) * WIDEST));
    const pageH = Math.floor(Math.min(h - margin, pageW / TALLEST));
    return { spread, pageW, pageH, fontSize: pageW / 26 };
  }, [box]);
}

function Leaf({ index, total, flipped, delay, spread, reduced, front, back }) {
  const rot = useMotionValue(flipped ? -180 : 0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const controls = animate(rot, flipped ? -180 : 0, {
      duration: reduced ? 0.01 : TURN_SECONDS,
      delay: reduced ? 0 : delay,
      ease: [0.4, 0, 0.25, 1],
    });
    return () => controls.stop();
    // `delay` only matters at the moment the leaf starts turning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, reduced, rot]);

  // Right-hand stack: first leaf on top. Left-hand stack: last leaf on top. A leaf in flight is above both.
  const zIndex = useTransform(rot, (r) => (r < -0.5 && r > -179.5 ? total * 2 : 0) + (r > -90 ? total - index : index + 1));
  const frontShade = useTransform(rot, [0, -90], [0, 0.55]);
  const backShade = useTransform(rot, [-90, -180], [0.55, 0]);
  // one page at a time: the turned page swings off to the left and fades out as it goes
  const leaving = useTransform(rot, [-90, -168], [1, 0]);

  return (
    <motion.div
      className="leaf"
      style={{ rotateY: rot, zIndex, pointerEvents: !spread && flipped ? "none" : undefined }}
    >
      <div className="leaf-face" style={{ pointerEvents: flipped ? "none" : "auto" }} inert={flipped}>
        {front}
        <motion.div className="leaf-shade" style={{ opacity: frontShade }} />
      </div>
      {spread ? (
        <div className="leaf-face leaf-back" style={{ pointerEvents: flipped ? "auto" : "none" }} inert={!flipped}>
          {back}
          <motion.div className="leaf-shade" style={{ opacity: backShade, transform: "scaleX(-1)" }} />
        </div>
      ) : (
        <motion.div className="leaf-face leaf-back" style={{ opacity: leaving, pointerEvents: "none" }} aria-hidden="true">
          {back}
          <motion.div className="leaf-shade" style={{ opacity: backShade, transform: "scaleX(-1)" }} />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Book({ pages, page, onPage, ctx, disabled = false, onLayout }) {
  const areaRef = useRef(null);
  const layout = useBookLayout(areaRef);
  const reduced = useReducedMotion();
  const terms = useTerms();
  const spread = layout?.spread ?? false;
  const pageCtx = useMemo(() => ({ ...ctx, pageW: layout?.pageW ?? 420 }), [ctx, layout]);

  const leaves = useMemo(() => {
    if (!spread) return pages.map((p, i) => ({ front: i, back: null }));
    const out = [];
    for (let i = 0; i < pages.length; i += 2) out.push({ front: i, back: i + 1 < pages.length ? i + 1 : null });
    return out;
  }, [pages, spread]);

  const maxCount = leaves.length - 1;
  const count = Math.max(0, Math.min(maxCount, spread ? Math.ceil(page / 2) : page)); // leaves already turned
  const pageForCount = (c) => (spread ? (c === 0 ? 0 : 2 * c - 1) : c);

  // remember where we came from: used to stagger multi-page jumps and to keep the old pages drawn while they turn
  const lastRef = useRef({ count, spread });
  const fromRef = useRef(count);
  const [, bump] = useState(0);
  const modeChanged = lastRef.current.spread !== spread;
  if (modeChanged) {
    fromRef.current = count;
    lastRef.current = { count, spread };
  } else if (lastRef.current.count !== count) {
    fromRef.current = lastRef.current.count;
    lastRef.current = { count, spread };
  }
  const from = fromRef.current;

  useEffect(() => {
    terms?.hide(); // an open info card belongs to the page we are leaving
    if (fromRef.current === count) return;
    const n = Math.abs(count - fromRef.current);
    const timers = [];
    for (let k = 0; k < Math.min(n, 5); k++) timers.push(setTimeout(() => sound.pageTurn(k ? 0.7 : 1), k * 90));
    timers.push(
      setTimeout(() => {
        fromRef.current = count;
        bump((x) => x + 1);
      }, (TURN_SECONDS + 0.6) * 1000)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    onLayout?.({ spread });
  }, [spread, onLayout]);

  const turn = (dir) => {
    if (disabled) return;
    const next = Math.max(0, Math.min(maxCount, count + dir));
    if (next !== count) onPage(pageForCount(next));
  };
  const turnRef = useRef(turn);
  turnRef.current = turn;

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        turnRef.current(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        turnRef.current(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* mouse wheel / trackpad: one page per gesture */
  const wheel = useRef({ acc: 0, lockUntil: 0, last: 0 });
  const onWheel = (e) => {
    const now = performance.now();
    const w = wheel.current;
    if (now < w.lockUntil) return;
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    // let a page with its own scrollbar finish scrolling first
    for (let el = e.target; el && el !== areaRef.current; el = el.parentElement) {
      if (el.dataset?.scroll !== undefined && el.scrollHeight > el.clientHeight + 2) {
        const atEnd = d > 0 ? el.scrollTop + el.clientHeight >= el.scrollHeight - 2 : el.scrollTop <= 0;
        if (!atEnd) return;
      }
    }
    if (now - w.last > 250) w.acc = 0;
    w.last = now;
    w.acc += d;
    if (Math.abs(w.acc) > 70) {
      turn(w.acc > 0 ? 1 : -1);
      w.acc = 0;
      w.lockUntil = now + 950;
    }
  };

  /* touch swipe */
  const swipe = useRef(null);
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) turn(dx < 0 ? 1 : -1);
  };

  const near = (i, c) => i >= c - 2 && i <= c + 1;
  const step = Math.abs(count - from) > 4 ? 0.05 : 0.09;

  return (
    <div ref={areaRef} className="relative min-h-0 flex-1 select-none overflow-hidden" onWheel={onWheel} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {layout && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: layout.pageW * (spread ? 2 : 1),
            height: layout.pageH,
            transform: "translate(-50%, -50%)",
            fontSize: layout.fontSize,
          }}
        >
          <div className="book-cover" />

          {spread && (
            <div className="absolute left-0 top-0" style={{ width: layout.pageW, height: layout.pageH }}>
              <Endpaper ctx={pageCtx} />
            </div>
          )}

          <div className="leaf-stack" style={{ left: spread ? layout.pageW : 0, width: layout.pageW, height: layout.pageH }}>
            {leaves.map((leaf, i) => {
              const flipped = i < count;
              const show = near(i, count) || near(i, from);
              const delay = count > from ? Math.max(0, i - from) * step : Math.max(0, from - 1 - i) * step;
              const frontSide = spread ? "right" : "single";
              return (
                <Leaf
                  key={`${spread ? "s" : "p"}-${i}`}
                  index={i}
                  total={leaves.length}
                  flipped={flipped}
                  delay={delay}
                  spread={spread}
                  reduced={reduced}
                  front={show ? <BookPage page={pages[leaf.front]} index={leaf.front} side={frontSide} ctx={pageCtx} /> : <BlankPaper side={frontSide} />}
                  back={spread && show && leaf.back != null ? <BookPage page={pages[leaf.back]} index={leaf.back} side="left" ctx={pageCtx} /> : <BlankPaper side="left" />}
                />
              );
            })}
          </div>

          {spread && <div className="book-spine" />}

          <button type="button" className="page-corner prev" aria-label="Previous page" disabled={count === 0 || disabled} onMouseEnter={() => sound.hover()} onClick={() => turn(-1)} />
          <button type="button" className="page-corner next" aria-label="Next page" disabled={count === maxCount || disabled} onMouseEnter={() => sound.hover()} onClick={() => turn(1)} />
        </div>
      )}
    </div>
  );
}

/** Which page indexes are visible for a given canonical page. */
export function visiblePages(page, spread, total) {
  if (!spread) return [page];
  const c = Math.ceil(page / 2);
  return [2 * c - 1, 2 * c].filter((i) => i >= 0 && i < total);
}
