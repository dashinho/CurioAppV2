import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Box, ChevronLeft, ChevronRight, GripVertical, Maximize2, PanelLeftOpen, X } from "lucide-react";
import { destinations } from "../data/missionData";
import { useProfile } from "../context/ProfileContext";
import ModelPanel from "../components/ModelPanel";
import Book from "../components/Book";
import { buildPages, firstPageOfChapter } from "../components/BookPages";
import { TermProvider } from "../components/TermCard";
import HudButton from "../components/HudButton";
import Quiz from "../components/Quiz";
import StampSlam from "../components/StampSlam";
import { modelKeyFor } from "../lib/mission";
import { storage } from "../lib/storage";
import { sound } from "../audio/SoundEngine";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const MAX_SPLIT = 0.62; // the 3D panel can take at most 62% of the screen
const MIN_PANEL_PX = 300; // narrower than this and it snaps shut

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/**
 * Story screen: 3D inspection panel on the left, the book on the right.
 * Drag the divider to resize, or close the 3D panel to read the book full screen.
 */
export default function StoryView({ destination, onBack, onHub, onOpenPassport, onStamped }) {
  const device = destination.heroDevice;
  const reward = device.stampReward;
  const { profile, hasStamp, awardStamp, stampCount } = useProfile();
  const pages = useMemo(() => buildPages(device), [device]);
  const modelKey = useMemo(() => modelKeyFor(device), [device]);
  const stamped = hasStamp(destination.id);

  const [page, setPage] = useState(0);
  const [spread, setSpread] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [slam, setSlam] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  /* ---------- resizable 3D panel ---------- */
  const wide = useMediaQuery("(min-width: 1024px)");
  const [split, setSplit] = useState(() => {
    const v = Number(storage.get("curio.split", 0.42));
    return Number.isFinite(v) ? Math.min(MAX_SPLIT, Math.max(0.22, v)) : 0.42;
  });
  // phones start with the book full screen (the page would be too small to read under the 3D panel)
  const [panelOpen, setPanelOpen] = useState(() => {
    const saved = storage.get("curio.panelOpen", null);
    return typeof saved === "boolean" ? saved : window.innerWidth >= 1024;
  });
  const [live, setLive] = useState(null); // split while dragging
  const drag = useRef(null);

  useEffect(() => {
    storage.set("curio.split", split);
    storage.set("curio.panelOpen", panelOpen);
  }, [split, panelOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [destination.id]);

  const togglePanel = useCallback(() => {
    sound.click();
    setPanelOpen((o) => !o);
  }, []);

  const onHandleDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, moved: false };
  };
  const onHandleMove = (e) => {
    if (!drag.current) return;
    if (Math.abs(e.clientX - drag.current.x) > 4) drag.current.moved = true;
    if (drag.current.moved) setLive(Math.min(MAX_SPLIT, Math.max(0, e.clientX / window.innerWidth)));
  };
  const onHandleUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d.moved) return togglePanel();
    const px = (live ?? 0) * window.innerWidth;
    if (px < MIN_PANEL_PX) {
      setPanelOpen(false);
    } else {
      setSplit(live);
      setPanelOpen(true);
    }
    setLive(null);
  };
  const onHandleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePanel();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      setPanelOpen(true);
      setSplit((s) => Math.min(MAX_SPLIT, Math.max(0.22, s + (e.key === "ArrowRight" ? 0.04 : -0.04))));
    }
  };

  const dragging = live !== null;
  const panelFraction = dragging ? live : panelOpen ? split : 0;

  /* ---------- book ---------- */
  const chapterIndex = pages[Math.min(page, pages.length - 1)].chapter;
  const lastPage = pages.length - 1;
  const checkPage = lastPage - 1;
  const allDone = stampCount === destinations.length;

  const visible = useMemo(() => {
    if (!spread) return [page];
    const c = Math.ceil(page / 2);
    return [2 * c - 1, 2 * c].filter((i) => i >= 0 && i <= lastPage);
  }, [page, spread, lastPage]);
  const atStart = visible.includes(0);
  const atEnd = visible.includes(lastPage);

  const goPrev = () => setPage((p) => (spread ? Math.max(0, (Math.ceil(p / 2) - 1) * 2 - 1) : Math.max(0, p - 1)));
  const goNext = () => setPage((p) => (spread ? Math.min(lastPage, Math.ceil(p / 2) * 2 + 1) : Math.min(lastPage, p + 1)));

  const onLayout = useCallback(({ spread: s }) => setSpread(s), []);

  const startQuiz = useCallback(() => setQuizOpen(true), []);

  const ctx = useMemo(
    () => ({
      device,
      destination,
      reward,
      name: profile.name,
      passportNo: profile.passportNo,
      stamped,
      stampInfo: profile.stamps[destination.id],
      stampCount,
      allDone,
      justStamped,
      onStartQuiz: startQuiz,
      onOpenPassport,
      onHub,
    }),
    [device, destination, reward, profile, stamped, stampCount, allDone, justStamped, startQuiz, onOpenPassport, onHub]
  );

  const finishSlam = () => {
    awardStamp(destination.id, reward);
    setSlam(false);
    setJustStamped(true);
    setPage(lastPage);
    onStamped?.();
  };

  const bookmarks = [
    { label: "◆", title: "Title page", page: 0, active: page === 0 },
    ...device.chapters.map((c, i) => ({
      label: ROMAN[i],
      title: `Chapter ${c.number}: ${c.title}`,
      page: firstPageOfChapter(i),
      active: page > 0 && page < checkPage && chapterIndex === i,
    })),
    { label: stamped ? "★" : "?", title: "Memory check and stamp", page: checkPage, active: page >= checkPage },
  ];

  const counter =
    visible.length === 2 ? `PAGES ${visible[0]}–${visible[1]} OF ${lastPage}` : visible[0] === 0 ? `TITLE PAGE · ${lastPage} PAGES` : `PAGE ${visible[0]} OF ${lastPage}`;

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 flex flex-col lg:flex-row">
      {/* ---------- LEFT: 3D inspection (resizable, collapsible) ---------- */}
      <div
        className={`relative shrink-0 overflow-hidden border-white/10 ${dragging ? "" : "transition-[width,height] duration-500 ease-out"} ${
          panelFraction > 0 ? "border-b lg:border-b-0" : ""
        }`}
        style={wide ? { width: `${panelFraction * 100}%` } : { height: panelOpen ? "42vh" : 0 }}
        aria-hidden={panelFraction === 0 && wide}
      >
        <div className="h-full w-full" style={wide ? { minWidth: MIN_PANEL_PX } : undefined}>
          <ModelPanel device={device} modelKey={modelKey} chapterIndex={chapterIndex} destinationId={destination.id} />
        </div>
        {dragging && <div className="absolute inset-0" /* keeps the 3D viewer from stealing the drag */ />}
      </div>

      {/* ---------- divider ---------- */}
      {wide && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the 3D panel. Click to hide or show it."
          aria-valuenow={Math.round(panelFraction * 100)}
          tabIndex={0}
          title={panelOpen ? "Drag to resize · click to hide the 3D model" : "Click or drag to show the 3D model"}
          className={`split-handle group relative z-20 flex shrink-0 flex-col items-center justify-center border-x border-white/10 bg-obsidian/80 text-parchment/50 transition-colors hover:bg-white/5 hover:text-amber focus:outline-none focus-visible:text-amber ${
            panelFraction > 0 ? "w-3.5" : "w-7"
          } ${dragging ? "bg-white/10 text-amber" : ""}`}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          onKeyDown={onHandleKey}
          onMouseEnter={() => sound.hover()}
        >
          {panelFraction > 0 ? (
            <span className="flex flex-col items-center gap-2">
              <GripVertical size={14} />
              <span className={`h-12 w-[3px] rounded-full transition-colors ${dragging ? "bg-amber" : "bg-white/25 group-hover:bg-amber"}`} />
              <GripVertical size={14} />
            </span>
          ) : (
            <span className="flex flex-col items-center gap-3">
              <PanelLeftOpen size={15} />
              <span className="font-mono text-[9px] tracking-[0.3em]" style={{ writingMode: "vertical-rl" }}>
                3D MODEL
              </span>
            </span>
          )}
        </div>
      )}

      {/* ---------- RIGHT: the book ---------- */}
      <TermProvider>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-3 md:px-5">
            <HudButton onClick={onBack} className="!px-3 !py-2">
              <ArrowLeft size={13} /> <span className="hidden sm:inline">Back to surface</span>
            </HudButton>
            <p className="hidden truncate font-mono text-[10px] tracking-[0.25em] text-parchment/45 md:block">
              LOGBOOK · {device.shortName.toUpperCase()} · {destination.name.toUpperCase()}
            </p>
            <HudButton onClick={togglePanel} silent className={`!px-3 !py-2 ${panelOpen ? "" : "!border-amber/60 !text-amber"}`} aria-pressed={!panelOpen}>
              {panelOpen ? <Maximize2 size={13} /> : <Box size={13} />}
              {panelOpen ? "Full-screen story" : "Show 3D model"}
            </HudButton>
          </div>

          <Book pages={pages} page={page} onPage={setPage} ctx={ctx} disabled={quizOpen || slam} onLayout={onLayout} />

          <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 md:px-5">
            <HudButton onClick={goPrev} disabled={atStart} className="!px-3 !py-2" aria-label="Previous page">
              <ChevronLeft size={14} /> <span className="hidden sm:inline">Back</span>
            </HudButton>

            <div className="flex min-w-0 flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                {bookmarks.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    title={b.title}
                    aria-label={b.title}
                    aria-current={b.active ? "page" : undefined}
                    onMouseEnter={() => sound.hover()}
                    onClick={() => b.page !== page && setPage(b.page)}
                    className={`flex h-6 min-w-6 cursor-pointer items-center justify-center border px-1.5 font-serif text-sm leading-none transition ${
                      b.active ? "border-amber bg-amber text-obsidian" : "border-white/20 text-parchment/60 hover:border-white/50 hover:text-parchment"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[9px] tracking-[0.25em] text-parchment/45">{counter}</span>
            </div>

            <HudButton onClick={goNext} disabled={atEnd} variant={atEnd ? "ghost" : "primary"} className="!px-3 !py-2" aria-label="Next page">
              <span className="hidden sm:inline">Turn page</span> <ChevronRight size={14} />
            </HudButton>
          </div>
        </div>
      </TermProvider>

      {/* ---------- memory check ---------- */}
      <AnimatePresence>
        {quizOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 top-14 z-40 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Memory check"
          >
            <motion.div className="relative my-8 w-full max-w-2xl" initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }}>
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setQuizOpen(false);
                }}
                className="absolute -top-8 right-0 flex cursor-pointer items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-parchment/70 hover:text-parchment"
              >
                BACK TO THE BOOK <X size={15} />
              </button>
              <Quiz
                quiz={device.missionQuiz}
                name={profile.name}
                alreadyStamped={stamped}
                onPass={() => {
                  setQuizOpen(false);
                  setSlam(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{slam && <StampSlam reward={reward} destinationName={destination.name} onDone={finishSlam} />}</AnimatePresence>
    </div>
  );
}
