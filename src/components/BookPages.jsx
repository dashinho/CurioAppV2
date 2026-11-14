import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, IdCard, Map as MapIcon, MousePointerClick, ScanLine } from "lucide-react";
import { fillTemplate } from "../data/missionData";
import { entryForPerson, figuresFor, splitTerms } from "../data/storyExtras";
import { pullQuoteFor } from "../lib/mission";
import BookFigure from "./BookFigure";
import CurioAvatar from "./CurioAvatar";
import DeviceSilhouette from "./DeviceSilhouette";
import Patch from "./Patch";
import { Term } from "./TermCard";
import { sound } from "../audio/SoundEngine";

const ORDINALS = ["One", "Two", "Three", "Four", "Five", "Six"];
const STAMP_INK = "#d8382b";

/**
 * The book's page list.
 * 0 title · then 4 pages per chapter (opener + one page per paragraph) · memory check · stamp page.
 * In a two-page spread, chapter openers always land on the left.
 */
export function buildPages(device) {
  const pages = [{ type: "title", chapter: 0 }];
  device.chapters.forEach((_, c) => {
    pages.push({ type: "opener", chapter: c });
    pages.push({ type: "text", chapter: c, para: 0 });
    pages.push({ type: "text", chapter: c, para: 1 });
    pages.push({ type: "text", chapter: c, para: 2 });
  });
  const last = device.chapters.length - 1;
  pages.push({ type: "check", chapter: last });
  pages.push({ type: "stamp", chapter: last });
  return pages;
}

export const firstPageOfChapter = (c) => 1 + c * 4;

/* ------------------------------ helpers ------------------------------ */

function Linked({ text, scope }) {
  const parts = useMemo(() => splitTerms(text, scope), [text, scope]);
  return parts.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <Term key={`${part.entry.id}-${i}`} entry={part.entry}>
        {part.text}
      </Term>
    )
  );
}

function CurioFace({ size = "1.5em" }) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size }} aria-hidden="true">
      <line x1="20" y1="8" x2="20" y2="3" stroke="#8e7a57" strokeWidth="2" />
      <circle cx="20" cy="3" r="2.4" fill="#d8382b" />
      <rect x="4" y="8" width="32" height="27" rx="7" fill="#d8c9a6" stroke="#8e7a57" strokeWidth="1.5" />
      <rect x="8" y="12" width="24" height="19" rx="4" fill="#12150f" />
      <rect x="12.5" y="17" width="4.5" height="6" rx="1.4" fill="#ffb347" />
      <rect x="23" y="17" width="4.5" height="6" rx="1.4" fill="#ffb347" />
      <path d="M13 27 q3.5 -2 7 0 t7 0" stroke="#ffb347" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

function StickyNote({ children, label = "C.U.R.I.O. adds" }) {
  return (
    <div className="sticky-note">
      <p className="flex items-center gap-[0.5em] font-mono text-[0.46em] uppercase tracking-[0.2em] text-[#5b4a12]">
        <CurioFace size="2.4em" /> {label}
      </p>
      <p className="mt-[0.3em] text-[0.84em] italic leading-[1.35] text-[#2c2508]">{children}</p>
    </div>
  );
}

function Paper({ side, number, runningLeft, runningRight, children }) {
  return (
    <div className={`paper paper-${side}`}>
      <div className="paper-head">
        <span>{runningLeft}</span>
        <span className="truncate text-right">{runningRight}</span>
      </div>
      <div className="paper-body" data-scroll>
        {children}
      </div>
      <div className="paper-foot">{number != null ? `· ${number} ·` : " "}</div>
    </div>
  );
}

/* ------------------------------- pages ------------------------------- */

function TitlePage({ ctx, side }) {
  const { device, destination, name } = ctx;
  return (
    <Paper side={side} runningLeft="The C.U.R.I.O. archive" runningRight={`Logbook 0${destination.order} of 03`}>
      <div className="flex min-h-0 flex-1 flex-col items-center text-center">
        <p className="rust font-mono text-[0.5em] uppercase tracking-[0.35em]">A true story from {destination.name}</p>
        <h1 className="mt-[0.25em] text-[2.5em] leading-[0.98] text-[#1b1813]">{device.name}</h1>
        {device.whatYouSee && <p className="mt-[0.5em] max-w-[90%] text-[0.8em] italic text-[#3a3329]">{device.whatYouSee}</p>}

        <div className="fig-slot my-[0.9em] w-full">
          <div
            className="plate relative h-full w-full"
            style={{ transform: "rotate(-0.6deg)" }}
          >
            <div className="absolute inset-[0.28em] overflow-hidden" style={{ background: "radial-gradient(circle at 50% 35%, #1f2638, #090b12 78%)" }}>
              {[...Array(26)].map((_, i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, width: i % 5 ? 1 : 2, height: i % 5 ? 1 : 2, opacity: 0.55 }}
                />
              ))}
              <DeviceSilhouette deviceId={device.id} variant="hero" className="absolute inset-0 m-auto h-[84%] w-[84%]" />
            </div>
          </div>
        </div>

        <StickyNote label="A note from C.U.R.I.O.">{fillTemplate(device.heroIntro, { name })}</StickyNote>

        <p className="mt-[1.1em] flex flex-wrap items-center justify-center gap-x-[1.4em] gap-y-[0.3em] font-mono text-[0.46em] uppercase tracking-[0.18em] text-[#211d17]/60">
          <span>Turn the page: corner, arrow keys or scroll</span>
          <span className="flex items-center gap-[0.4em]">
            <MousePointerClick size="1.2em" /> <span className="term" style={{ cursor: "default" }}>Dotted words</span> open a card
          </span>
        </p>
      </div>
    </Paper>
  );
}

function OpenerPage({ ctx, page, side, number }) {
  const { device, destination } = ctx;
  const chapter = device.chapters[page.chapter];
  const figs = figuresFor(destination.id, page.chapter);
  const quote = useMemo(() => pullQuoteFor(chapter), [chapter]);
  const people = chapter.metadata.people.map((p) => ({ ...p, entry: entryForPerson(p.name, destination.id) }));
  const clickable = people.filter((p) => p.entry);

  return (
    <Paper side={side} number={number} runningLeft={device.shortName} runningRight={`Chapter ${chapter.number} of ${device.chapters.length}`}>
      {figs.slots[0] && (
        <div className="fig-slot">
          <BookFigure spec={figs.slots[0]} spares={figs.spares} deviceId={device.id} />
        </div>
      )}
      <div className="flex-none">
        <p className="rust font-mono text-[0.5em] uppercase tracking-[0.35em]">Chapter {ORDINALS[page.chapter] ?? chapter.number}</p>
        <h2 className="mt-[0.1em] text-[2.05em] leading-[1] text-[#1b1813] text-balance">{chapter.title}</h2>
        <p className="mt-[0.7em] font-mono text-[0.46em] uppercase tracking-[0.16em] text-[#211d17]/60">{chapter.metadata.dateDisplay}</p>
      </div>
      <blockquote className="flex-none border-l-[0.14em] border-[#a4471f]/70 pl-[0.8em] text-[1.08em] italic leading-[1.22] text-[#3a2a1c]">
        {quote.quoted ? `“${quote.text}”` : quote.text}
      </blockquote>
      {clickable.length > 0 && (
        <div className="flex flex-none flex-wrap items-center gap-[0.35em]">
          <span className="mr-[0.4em] font-mono text-[0.44em] uppercase tracking-[0.2em] text-[#211d17]/55">Meet:</span>
          {clickable.map((p) => (
            <Term key={p.entry.id} entry={p.entry} chip>
              {p.entry.name}
            </Term>
          ))}
        </div>
      )}
    </Paper>
  );
}

function TextPage({ ctx, page, side, number }) {
  const { device, destination } = ctx;
  const chapter = device.chapters[page.chapter];
  const figs = figuresFor(destination.id, page.chapter);
  const spec = figs.slots[page.para + 1];
  // rotate the spares so two failing slots do not pick the same replacement
  const spares = figs.spares.length ? [...figs.spares.slice(page.para % figs.spares.length), ...figs.spares.slice(0, page.para % figs.spares.length)] : [];
  const figure = spec && (
    <div className="fig-slot">
      <BookFigure spec={spec} spares={spares} deviceId={device.id} />
    </div>
  );
  const text = (
    <p className={`story ${page.para === 0 ? "dropcap" : ""}`}>
      <Linked text={chapter.paragraphs[page.para]} scope={destination.id} />
    </p>
  );
  const lastPara = page.para === chapter.paragraphs.length - 1;

  return (
    <Paper side={side} number={number} runningLeft={device.shortName} runningRight={chapter.title}>
      {page.para === 1 ? (
        <>
          {figure}
          {text}
        </>
      ) : (
        <>
          {text}
          {lastPara && <StickyNote>{chapter.curioAside}</StickyNote>}
          {figure}
        </>
      )}
    </Paper>
  );
}

function CheckPage({ ctx, side, number }) {
  const { device, stamped, onStartQuiz, pageW } = ctx;
  return (
    <Paper side={side} number={number} runningLeft={device.shortName} runningRight="Memory check">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[0.9em] text-center">
        <p className="rust font-mono text-[0.5em] uppercase tracking-[0.35em]">The end … almost</p>
        <CurioAvatar size={Math.max(90, pageW * 0.3)} />
        <p className="max-w-[92%] text-[1.35em] leading-[1.2] text-[#1b1813] text-balance">
          “Before I can stamp your Explorer Passport for this world, let&apos;s see what you remember about this brave little machine!”
        </p>
        <p className="max-w-[88%] text-[0.8em] italic text-[#3a3329]">
          Two questions about {device.shortName}&apos;s story. Wrong answers get a hint, so you can always try again.
        </p>
        <button
          type="button"
          className="ink-btn"
          onMouseEnter={() => sound.hover()}
          onClick={(e) => {
            e.stopPropagation();
            sound.click();
            onStartQuiz();
          }}
        >
          <ScanLine size="1.3em" /> {stamped ? "Replay the memory check" : "Start the memory check"}
        </button>
      </div>
    </Paper>
  );
}

function StampPage({ ctx, side, number }) {
  const { device, destination, reward, stamped, stampInfo, stampCount, allDone, name, onOpenPassport, onHub, pageW, justStamped } = ctx;
  const size = Math.round(pageW * 0.52);
  const date = stampInfo?.awardedAt
    ? new Date(stampInfo.awardedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : null;
  return (
    <Paper side={side} number={number} runningLeft="Passport control" runningRight={destination.name}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[0.8em] text-center">
        <p className="rust font-mono text-[0.5em] uppercase tracking-[0.35em]">
          Stamp {destination.order} of 3 · {destination.name}
        </p>
        {stamped ? (
          <>
            <motion.div
              className="relative"
              style={{ width: size, height: size }}
              initial={justStamped ? { scale: 1.5, opacity: 0, rotate: -16 } : false}
              animate={{ scale: 1, opacity: 1, rotate: reward.ink.rotationDeg }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <Patch svg={reward.patch.svg} size={size} title={reward.title} />
              <div
                className="pointer-events-none absolute left-1/2 top-[72%] whitespace-nowrap border-[0.2em] border-double px-[0.6em] py-[0.15em] text-center font-mono font-bold leading-tight"
                style={{ color: STAMP_INK, borderColor: STAMP_INK, background: "rgba(239,232,214,0.82)", transform: "translate(-50%,-50%) rotate(-13deg)", fontSize: "0.62em", letterSpacing: "0.2em" }}
              >
                STAMPED
                <br />
                <span style={{ fontSize: "0.62em", letterSpacing: "0.3em" }}>VERIFIED · C.U.R.I.O.</span>
              </div>
            </motion.div>
            <h3 className="text-[1.9em] leading-none text-[#1b1813]">{reward.title}</h3>
            <p className="font-mono text-[0.48em] uppercase tracking-[0.2em] text-[#211d17]/65">
              Unlock code <span className="rust">{reward.unlockCode}</span>
              {date ? ` · ${date}` : ""}
            </p>
            <p className="max-w-[90%] text-[0.86em] italic text-[#3a3329]">
              {allDone
                ? `That's all three, Astronaut ${name}. Your Space Relic Historian certificate is waiting in your passport.`
                : `${device.shortName}'s story is safe with you now, Astronaut ${name}. ${3 - stampCount} world${3 - stampCount > 1 ? "s" : ""} left to visit.`}
            </p>
            <div className="flex flex-wrap justify-center gap-[0.5em]">
              <button type="button" className="ink-btn" onMouseEnter={() => sound.hover()} onClick={(e) => { e.stopPropagation(); sound.click(); onOpenPassport(); }}>
                {allDone ? <Award size="1.3em" /> : <IdCard size="1.3em" />} {allDone ? "Claim certificate" : "Open passport"}
              </button>
              <button type="button" className="ink-btn ghost" onMouseEnter={() => sound.hover()} onClick={(e) => { e.stopPropagation(); sound.click(); onHub(); }}>
                <MapIcon size="1.3em" /> Mission map
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex flex-col items-center justify-center rounded-full border-[0.12em] border-dashed border-[#211d17]/35 text-[#211d17]/45"
              style={{ width: size, height: size }}
            >
              <span className="font-mono text-[0.5em] uppercase tracking-[0.3em]">Place stamp here</span>
              <span className="mt-[0.4em] text-[1.3em] italic">{reward.title}</span>
            </div>
            <p className="max-w-[86%] text-[0.9em] italic text-[#3a3329]">Pass the memory check on the page before this one and C.U.R.I.O. will stamp it right here.</p>
          </>
        )}
      </div>
    </Paper>
  );
}

/** Inside of the front cover: only seen in two-page view, before the first page is turned. */
export function Endpaper({ ctx }) {
  const { name, passportNo, device } = ctx;
  return (
    <div className="endpaper flex items-center justify-center p-[2.2em]">
      <div className="w-full max-w-[82%] border border-[#e9dcb8]/50 bg-[#efe8d6] p-[1.3em] text-center text-[#211d17] shadow-[0_0.6em_1.6em_rgba(0,0,0,0.5)]" style={{ transform: "rotate(-1.4deg)" }}>
        <p className="font-mono text-[0.46em] uppercase tracking-[0.35em] text-[#a4471f]">Ex libris</p>
        <p className="mt-[0.1em] font-serif text-[1.5em] leading-none">The C.U.R.I.O. Archive</p>
        <div className="mx-auto my-[0.8em] flex justify-center">
          <CurioFace size="3.2em" />
        </div>
        <p className="font-serif text-[0.86em] italic">This logbook is on loan to</p>
        <p className="font-serif text-[1.7em] leading-tight">Astronaut {name || "Rookie"}</p>
        <p className="mt-[0.2em] font-mono text-[0.46em] uppercase tracking-[0.25em] text-[#211d17]/60">
          {passportNo || "CURIO-0000"} · {device.shortName}
        </p>
        <p className="mt-[1em] border-t border-[#211d17]/20 pt-[0.8em] font-serif text-[0.78em] italic text-[#3a3329]">
          Please return it with all its stories remembered.
        </p>
      </div>
    </div>
  );
}

export function BlankPaper({ side }) {
  return <div className={`paper paper-${side}`} />;
}

/** Render one page by descriptor. `side`: left | right | single. */
export function BookPage({ page, index, side, ctx }) {
  if (!page) return <BlankPaper side={side} />;
  const number = index; // the title page is unnumbered (page 0)
  switch (page.type) {
    case "title":
      return <TitlePage ctx={ctx} side={side} />;
    case "opener":
      return <OpenerPage ctx={ctx} page={page} side={side} number={number} />;
    case "text":
      return <TextPage ctx={ctx} page={page} side={side} number={number} />;
    case "check":
      return <CheckPage ctx={ctx} side={side} number={number} />;
    case "stamp":
      return <StampPage ctx={ctx} side={side} number={number} />;
    default:
      return <BlankPaper side={side} />;
  }
}
