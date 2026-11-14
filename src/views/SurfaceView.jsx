import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { ArrowLeft, Lock, MoveHorizontal, Radar, ScanLine } from "lucide-react";
import { ASSETS, LOCKED_HUD, fillTemplate } from "../data/missionData";
import { useProfile } from "../context/ProfileContext";
import CurioAvatar from "../components/CurioAvatar";
import Dialogue from "../components/Dialogue";
import DeviceSilhouette from "../components/DeviceSilhouette";
import HudButton from "../components/HudButton";
import { daysUntil } from "../lib/mission";
import { sound } from "../audio/SoundEngine";

/* ---------- procedural terrain ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ridgePath(width, { seed, base, amp, jag = 0.2, step = 40 }) {
  const r = rng(seed);
  const phases = [r() * 6, r() * 6, r() * 6];
  let d = `M0 1000 L0 ${base}`;
  for (let x = 0; x <= width + step; x += step) {
    const y =
      base -
      amp * (0.55 * Math.sin(x / 520 + phases[0]) + 0.3 * Math.sin(x / 210 + phases[1]) + 0.15 * Math.sin(x / 90 + phases[2])) -
      (r() - 0.5) * amp * jag;
    d += ` L${x.toFixed(0)} ${y.toFixed(1)}`;
  }
  return `${d} L${width + step} 1000 Z`;
}

const LOOK = {
  moon: {
    sky: "linear-gradient(180deg, rgba(4,5,10,0) 0%, rgba(4,5,10,0) 55%, rgba(30,32,38,0.35) 100%)",
    far: "#24262c",
    mid: ["#3a3d44", "#2a2c31"],
    ground: ["#767a82", "#43464d", "#1f2125"],
    crater: "rgba(30,31,36,0.45)",
    rock: "#15161a",
    ridgeAmp: [90, 70, 26],
  },
  mars: {
    sky: "linear-gradient(180deg, rgba(32,14,8,0.0) 0%, rgba(120,60,30,0.35) 35%, rgba(214,150,96,0.55) 62%, rgba(214,150,96,0.0) 100%)",
    far: "#5e2a16",
    mid: ["#87391c", "#5f2410"],
    ground: ["#b65a2c", "#86391b", "#3f170a"],
    crater: "rgba(70,24,8,0.4)",
    rock: "#2a0f06",
    ridgeAmp: [120, 80, 30],
  },
};

/* ---------- locked-device badge ---------- */
function LockedBadge({ device }) {
  const st = LOCKED_HUD.statuses[device.hud.status];
  const live = device.hud.liveMilestone;
  const days = live ? daysUntil(live.dateUTC) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
      className="hud-glass pointer-events-none absolute bottom-[calc(100%+14px)] left-1/2 z-30 w-[300px] -translate-x-1/2 rounded-sm p-4 text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em]" style={{ color: st.color }}>
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: LOCKED_HUD.blinkRateMs / 1000, repeat: Infinity }} />
          {st.label}
        </span>
        <span className="font-mono text-[9px] tracking-[0.15em] text-parchment/50">{device.hud.code}</span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-warn">
        <Lock size={11} /> SIGNAL WEAK · ARCHIVE LOCKED
      </p>
      <p className="mt-1 font-serif text-xl leading-tight text-parchment">{device.name}</p>
      <ul className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
        {device.hud.readout.map((line) => (
          <li key={line} className="font-mono text-[10px] leading-4 text-parchment/70">
            {line}
          </li>
        ))}
        {live && (
          <li className="pt-1 font-mono text-[10px] leading-4 text-signal">
            {days > 0 ? `T-${days} DAYS · ${live.label}` : days === 0 ? `TODAY · ${live.label}` : `CROSSED ${live.label} · ${live.dateUTC}`}
          </li>
        )}
      </ul>
      <p className="mt-2 font-serif text-[15px] italic leading-snug text-parchment/80">&ldquo;{device.hud.curioWhisper}&rdquo;</p>
      <p className="mt-2 font-mono text-[9px] leading-4 tracking-[0.08em] text-parchment/35">{LOCKED_HUD.footer}</p>
    </motion.div>
  );
}

function BackgroundDevice({ device, trackW, floating, draggingRef, unit }) {
  const [hover, setHover] = useState(false);
  const [denied, setDenied] = useState(0);
  const pos = device.panoramaPosition;
  const w = unit * 1.15 * pos.scale;
  return (
    <div
      className="absolute"
      style={{ left: pos.x * trackW, top: `${pos.y * 100}%`, width: w, transform: `translate(-50%, ${floating ? "-50%" : "-92%"})` }}
      onMouseEnter={() => {
        setHover(true);
        sound.staticBurst(0.28);
      }}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (draggingRef.current) return;
        sound.denied();
        setHover(true);
        setDenied((d) => d + 1);
      }}
    >
      <AnimatePresence>{hover && <LockedBadge device={device} />}</AnimatePresence>
      <motion.div
        key={denied}
        animate={
          floating
            ? { y: [0, -12, 0], x: denied ? [0, -6, 5, -3, 0] : 0 }
            : { x: denied ? [0, -6, 5, -3, 0] : 0 }
        }
        transition={floating ? { y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, x: { duration: 0.35 } } : { duration: 0.35 }}
        className="cursor-help"
        style={{ filter: hover ? "grayscale(1) drop-shadow(0 0 2px rgba(0,0,0,.9))" : "grayscale(1) blur(0.5px) drop-shadow(0 0 2px rgba(0,0,0,.9))", opacity: hover ? 0.9 : 0.55, transition: "opacity .3s, filter .3s" }}
      >
        <DeviceSilhouette deviceId={device.id} variant="ghost" className="w-full" />
      </motion.div>
      <p className="mt-1 text-center font-mono text-[9px] tracking-[0.25em] text-parchment/35">
        {device.hud.status === "TELEMETRY_LOST" ? "NO CARRIER" : "ENCRYPTED"}
      </p>
    </div>
  );
}

function HeroDevice({ device, trackW, floating, onDiscover, onHover, draggingRef, unit }) {
  const pos = device.panoramaPosition;
  const w = unit * 1.05 * pos.scale;
  return (
    <div
      className="absolute z-20"
      style={{ left: pos.x * trackW, top: `${pos.y * 100}%`, width: w, transform: `translate(-50%, ${floating ? "-50%" : "-92%"})` }}
      onMouseEnter={onHover}
    >
      {/* radar rings */}
      <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-amber/70"
            style={{ width: w * 0.9, height: w * 0.9, marginLeft: -w * 0.45, marginTop: -w * 0.45 }}
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i, ease: "easeOut" }}
          />
        ))}
        <span className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/15 blur-2xl" style={{ width: w, height: w * 0.7 }} />
      </div>

      <motion.p
        className="mb-2 flex items-center justify-center gap-2 text-center font-mono text-[10px] tracking-[0.3em] text-amber"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <Radar size={12} /> {device.hotspotLabel}
      </motion.p>
      <motion.div
        animate={floating ? { y: [0, -14, 0], rotate: [0, 2, 0] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative drop-shadow-[0_0_24px_rgba(255,179,71,0.35)]"
      >
        <DeviceSilhouette deviceId={device.id} variant="hero" className="w-full" />
      </motion.div>
      <div className="mt-3 flex justify-center">
        <HudButton
          variant="primary"
          onClick={() => {
            if (draggingRef.current) return;
            onDiscover();
          }}
        >
          <ScanLine size={14} /> Discover Device
        </HudButton>
      </div>
    </div>
  );
}

/* ---------- view ---------- */
export default function SurfaceView({ destination, onBack, onDiscover }) {
  const { profile } = useProfile();
  const wrapRef = useRef(null);
  const draggingRef = useRef(false);
  const targetRef = useRef(0);
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1280, h: 800 });
  const [dragged, setDragged] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [line, setLine] = useState("arrival");
  const [scan, setScan] = useState(0);
  const [panoOk, setPanoOk] = useState(true);

  const isSpace = destination.id === "deepSpace";
  const look = LOOK[destination.id];
  const trackW = Math.max(size.w * 3, 2600);
  const maxScroll = trackW - size.w;
  const unit = Math.max(220, Math.min(380, size.h * 0.4));

  const x = useMotionValue(0);
  const farX = useTransform(x, (v) => v * 0.12);
  const midX = useTransform(x, (v) => v * 0.42);
  const foreX = useTransform(x, (v) => v * 1.35);
  const viewLeft = useTransform(x, (v) => `${(-v / trackW) * 100}%`);
  useMotionValueEvent(x, "change", (v) => setScan(Math.round((-v / maxScroll) * 100)));

  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollTo = useCallback(
    (target) => {
      const t = Math.max(-maxScroll, Math.min(0, target));
      targetRef.current = t;
      animate(x, t, { type: "spring", stiffness: 120, damping: 26 });
      setDragged(true);
    },
    [maxScroll, x]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") scrollTo(x.get() - size.w * 0.4);
      if (e.key === "ArrowLeft") scrollTo(x.get() + size.w * 0.4);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollTo, size.w, x]);

  const onWheel = (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    scrollTo(targetRef.current - delta);
  };

  const all = [destination.heroDevice, ...destination.backgroundDevices];
  const centerOn = (device) => scrollTo(-(device.panoramaPosition.x * trackW - size.w / 2));

  const paths = useMemo(() => {
    if (isSpace) return null;
    const farW = size.w + maxScroll * 0.12 + 200;
    const midW = size.w + maxScroll * 0.42 + 200;
    return {
      farW,
      midW,
      far: ridgePath(farW, { seed: 11, base: 560, amp: look.ridgeAmp[0], jag: 0.25 }),
      mid: ridgePath(midW, { seed: 23, base: 640, amp: look.ridgeAmp[1], jag: 0.35, step: 30 }),
      ground: ridgePath(trackW + 200, { seed: 37, base: 700, amp: look.ridgeAmp[2], jag: 0.5, step: 26 }),
      craters: (() => {
        const r = rng(99);
        return Array.from({ length: 34 }, () => ({ cx: r() * trackW, cy: 760 + r() * 220, rx: 20 + r() * 90, k: 0.18 + r() * 0.1 }));
      })(),
      rocks: (() => {
        const r = rng(7);
        const foreW = size.w + maxScroll * 1.35 + 200;
        return {
          foreW,
          list: Array.from({ length: 26 }, () => {
            const cx = r() * foreW;
            const s = 16 + r() * 60;
            return `M${cx - s} 1000 L${cx - s * 0.7} ${1000 - s * 0.9} L${cx - s * 0.1} ${1000 - s * 1.2} L${cx + s * 0.6} ${1000 - s * 0.7} L${cx + s} 1000 Z`;
          }),
        };
      })(),
    };
  }, [isSpace, size.w, maxScroll, trackW, look]);

  const dialogueText =
    line === "hero" ? fillTemplate(destination.heroDevice.heroIntro, { name: profile.name }) : fillTemplate(destination.arrival, { name: profile.name });

  return (
    <div ref={wrapRef} className="fixed inset-0 overflow-hidden" onWheel={onWheel}>
      {/* sky tint */}
      <div className="pointer-events-none absolute inset-0" style={{ background: isSpace ? "transparent" : look.sky }} />

      {/* FAR layer */}
      <motion.div className="pointer-events-none absolute inset-y-0 left-0" style={{ x: farX, width: paths ? paths.farW : size.w * 1.5 }}>
        {destination.id === "moon" && (
          <div className="absolute left-[38%] top-[13%] h-24 w-24 rounded-full md:h-32 md:w-32" style={{ background: "radial-gradient(circle at 35% 35%, #9fd0ff, #3b7bd4 45%, #0d2b5c 75%)", boxShadow: "0 0 60px rgba(80,140,255,0.35)" }}>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 80% 70%, rgba(4,5,10,0.95) 30%, transparent 62%)" }} />
          </div>
        )}
        {destination.id === "mars" && <div className="absolute left-[30%] top-[18%] h-10 w-10 rounded-full bg-[#f4ecd8] opacity-70 shadow-[0_0_60px_30px_rgba(220,235,255,0.25)]" />}
        {isSpace && (
          <>
            <div className="absolute left-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, rgba(120,80,200,0.55), transparent 65%)" }} />
            <div className="absolute left-[55%] top-[35%] h-[70vh] w-[90vh] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, rgba(40,110,200,0.6), transparent 65%)" }} />
            <div className="absolute left-[85%] top-[22%] h-4 w-4 rounded-full bg-[#ffb27a] shadow-[0_0_40px_14px_rgba(232,116,59,0.55)]" title="Aldebaran" />
            <span className="absolute left-[85%] top-[22%] ml-6 font-mono text-[9px] tracking-[0.3em] text-[#ffb27a]/70">ALDEBARAN · α TAU</span>
          </>
        )}
        {paths && (
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${paths.farW} 1000`} preserveAspectRatio="none">
            <path d={paths.far} fill={look.far} />
          </svg>
        )}
      </motion.div>

      {/* MID layer */}
      <motion.div className="pointer-events-none absolute inset-y-0 left-0" style={{ x: midX, width: paths ? paths.midW : size.w * 2 }}>
        {destination.id === "mars" && panoOk && (
          <img
            src={ASSETS.panoramas.mars.image.url}
            alt=""
            onError={() => setPanoOk(false)}
            referrerPolicy="no-referrer"
            className="absolute left-0 top-[40%] h-[30%] w-full object-cover opacity-45 mix-blend-luminosity"
            style={{ maskImage: "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)" }}
          />
        )}
        {paths && (
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${paths.midW} 1000`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`mid-${destination.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.55" stopColor={look.mid[0]} />
                <stop offset="1" stopColor={look.mid[1]} />
              </linearGradient>
            </defs>
            <path d={paths.mid} fill={`url(#mid-${destination.id})`} />
          </svg>
        )}
        {isSpace &&
          Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: `${(i * 137) % 100}%`, top: `${(i * 61) % 90}%`, width: i % 7 ? 1.5 : 2.5, height: i % 7 ? 1.5 : 2.5, opacity: 0.5 }}
            />
          ))}
      </motion.div>

      {/* GROUND layer (draggable; devices live here) */}
      <motion.div
        className="absolute inset-y-0 left-0 cursor-grab active:cursor-grabbing"
        style={{ x, width: trackW }}
        drag="x"
        dragConstraints={{ left: -maxScroll, right: 0 }}
        dragElastic={0.06}
        dragTransition={{ power: 0.25, timeConstant: 260 }}
        onDragStart={() => {
          draggingRef.current = true;
          setDragged(true);
        }}
        onDragEnd={() => {
          targetRef.current = x.get();
          setTimeout(() => (draggingRef.current = false), 60);
        }}
      >
        {paths && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${trackW + 200} 1000`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gnd-${destination.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.68" stopColor={look.ground[0]} />
                <stop offset="0.82" stopColor={look.ground[1]} />
                <stop offset="1" stopColor={look.ground[2]} />
              </linearGradient>
            </defs>
            <path d={paths.ground} fill={`url(#gnd-${destination.id})`} />
            {paths.craters.map((c, i) => (
              <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.rx * c.k} fill={look.crater} />
            ))}
          </svg>
        )}

        {destination.backgroundDevices.map((d) => (
          <BackgroundDevice key={d.id} device={d} trackW={trackW} floating={isSpace} draggingRef={draggingRef} unit={unit} />
        ))}
        <HeroDevice
          device={destination.heroDevice}
          trackW={trackW}
          floating={isSpace}
          draggingRef={draggingRef}
          unit={unit}
          onDiscover={onDiscover}
          onHover={() => line !== "hero" && setLine("hero")}
        />
      </motion.div>

      {/* FOREGROUND layer */}
      {paths && (
        <motion.div className="pointer-events-none absolute inset-y-0 left-0" style={{ x: foreX, width: paths.rocks.foreW }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${paths.rocks.foreW} 1000`} preserveAspectRatio="none">
            {paths.rocks.list.map((d, i) => (
              <path key={i} d={d} fill={look.rock} opacity="0.92" />
            ))}
          </svg>
        </motion.div>
      )}
      {isSpace && (
        <motion.div className="pointer-events-none absolute inset-y-0 left-0" style={{ x: foreX, width: size.w + maxScroll * 1.35 }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#cfd8ff]"
              style={{ left: `${(i * 89) % 100}%`, top: `${(i * 47) % 100}%`, width: 2 + (i % 3), height: 2 + (i % 3), opacity: 0.18, filter: "blur(1px)" }}
            />
          ))}
        </motion.div>
      )}

      {/* ---------- HUD overlays ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-14 flex items-start justify-between p-5 md:p-8">
        <div className="pointer-events-auto">
          <HudButton onClick={onBack} className="mb-4">
            <ArrowLeft size={14} /> Return to orbit
          </HudButton>
          <p className="hud-label">Surface scan · {String(destination.order).padStart(2, "0")}</p>
          <h1 className="font-serif text-5xl leading-none text-parchment drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] md:text-7xl">{destination.name}</h1>
          <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-parchment/60">{destination.surfaceName.toUpperCase()}</p>
        </div>
        <div className="hidden text-right md:block">
          <p className="hud-label">Scan coverage</p>
          <p className="font-mono text-3xl text-signal">{String(Math.max(0, Math.min(100, scan))).padStart(3, "0")}%</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-parchment/50">SIGNALS 1 · LOCKED {destination.backgroundDevices.length}</p>
        </div>
      </div>

      {/* C.U.R.I.O. dialogue */}
      <div className="absolute left-4 right-4 top-[216px] z-30 md:bottom-8 md:left-8 md:right-auto md:top-auto md:w-[460px]">
        <div className="hud-glass flex gap-4 rounded-sm p-4">
          <CurioAvatar size={74} speaking={speaking} className="hidden shrink-0 sm:block" />
          <Dialogue key={line} text={dialogueText} onSpeakingChange={setSpeaking} textClassName="text-[15px]" channel="SURFACE COMMS">
            {line === "hero" && (
              <HudButton variant="primary" onClick={onDiscover} className="!py-2">
                <ScanLine size={13} /> Discover {destination.heroDevice.shortName}
              </HudButton>
            )}
          </Dialogue>
        </div>
      </div>

      {/* minimap */}
      <div className="absolute bottom-6 left-1/2 z-30 w-[min(420px,80vw)] -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0">
        <AnimatePresence>
          {!dragged && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-2 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.3em] text-parchment/70"
            >
              <MoveHorizontal size={13} /> DRAG OR SCROLL TO SCAN THE SURFACE
            </motion.p>
          )}
        </AnimatePresence>
        <div className="hud-glass relative h-9 rounded-sm">
          <motion.div className="absolute inset-y-1 rounded-[2px] border border-signal/60 bg-signal/10" style={{ left: viewLeft, width: `${(size.w / trackW) * 100}%` }} />
          {all.map((d) => {
            const hero = d === destination.heroDevice;
            return (
              <button
                key={d.id}
                type="button"
                title={hero ? d.shortName : `${d.name} (locked)`}
                onMouseEnter={() => sound.hover()}
                onClick={() => {
                  sound.click();
                  centerOn(d);
                }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1.5"
                style={{ left: `${d.panoramaPosition.x * 100}%` }}
              >
                <span className={`block rounded-full ${hero ? "h-2.5 w-2.5 bg-amber shadow-[0_0_10px_#ffb347]" : "h-1.5 w-1.5 bg-white/40"}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
