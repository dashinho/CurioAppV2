import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import HudButton from "../components/HudButton";
import HudFrame from "../components/HudFrame";
import { sound } from "../audio/SoundEngine";

const CHECKS = [
  ["COMMS LINK", "OK"],
  ["AUDIO CHANNEL", "OK"],
  ["CABIN PRESSURE", "101.3 kPa"],
  ["ARCHIVE INDEX", "3 WORLDS · 9 MACHINES"],
  ["AIRLOCK SEAL", "READY"],
];

/** Phase 1: "Initialize Comms" (unlocks audio). Phase 2: the airlock door. */
export default function SplashView({ onEnter }) {
  const [phase, setPhase] = useState("comms");
  const [checks, setChecks] = useState(0);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (phase !== "airlock") return;
    if (checks >= CHECKS.length) return;
    const t = setTimeout(() => {
      setChecks((c) => c + 1);
      sound.typeTick("o");
    }, checks === 0 ? 500 : 340);
    return () => clearTimeout(t);
  }, [phase, checks]);

  const initComms = () => {
    sound.init();
    sound.click();
    setTimeout(() => sound.staticBurst(0.6), 120);
    setPhase("airlock");
  };

  const enter = () => {
    sound.startAmbient();
    sound.whoosh(1.6);
    setOpening(true);
    setTimeout(onEnter, 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <AnimatePresence mode="wait">
        {phase === "comms" ? (
          <motion.div
            key="comms"
            className="relative z-10 flex max-w-3xl flex-col items-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.6 } }}
          >
            <motion.p
              className="font-mono text-[10px] tracking-[0.5em] text-parchment/50 md:text-[11px]"
              initial={{ opacity: 0, letterSpacing: "1em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 2 }}
            >
              INCOMING TRANSMISSION · NASA SPACE APPS · STORYTELLING
            </motion.p>
            <motion.h1
              className="mt-8 font-serif text-6xl leading-[0.95] text-parchment text-balance md:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              The Machines <em className="text-amber">We Left</em> Behind
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl font-serif text-xl italic text-parchment/65 md:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 1 }}
            >
              Three worlds. Three brave robots. One very old caretaker who still remembers their names.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-12">
              <HudButton variant="primary" onClick={initComms} silent className="!px-8 !py-4 text-xs">
                <Radio size={16} className="animate-pulse" /> Click to Initialize Comms
              </HudButton>
              <p className="mt-4 font-mono text-[10px] tracking-[0.25em] text-parchment/35">BEST WITH HEADPHONES · SOUND ON</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="airlock"
            className="relative z-10 flex w-full max-w-4xl flex-col items-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Airlock doors */}
            <div className="relative h-[46vh] w-full max-w-2xl overflow-hidden border border-white/15 bg-void">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,179,71,0.35),transparent_65%)] blur-xl" />
              </div>
              {["left", "right"].map((side) => (
                <motion.div
                  key={side}
                  className={`absolute top-0 h-full w-1/2 ${side === "left" ? "left-0 border-r" : "right-0 border-l"} border-white/20`}
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 12px), linear-gradient(180deg,#141823,#0b0e15)",
                  }}
                  animate={opening ? { x: side === "left" ? "-102%" : "102%" } : { x: 0 }}
                  transition={{ duration: 1.3, ease: [0.7, 0, 0.2, 1] }}
                >
                  <div className={`absolute top-1/2 h-24 w-3 -translate-y-1/2 ${side === "left" ? "right-4" : "left-4"} rounded-sm bg-amber/70 shadow-[0_0_20px_rgba(255,179,71,0.6)]`} />
                  <div
                    className={`absolute inset-x-6 bottom-6 h-6 ${side === "left" ? "" : ""}`}
                    style={{ background: "repeating-linear-gradient(45deg,#f5b83d 0 10px,#111 10px 20px)", opacity: 0.55 }}
                  />
                  <p className={`absolute top-6 font-mono text-[10px] tracking-[0.3em] text-parchment/40 ${side === "left" ? "left-6" : "right-6"}`}>
                    {side === "left" ? "AIRLOCK 07" : "C.U.R.I.O."}
                  </p>
                </motion.div>
              ))}
            </div>

            <HudFrame className="mt-6 w-full max-w-2xl bg-black/30 p-5" label="PRE-ENTRY CHECKLIST">
              <ul className="space-y-1.5 font-mono text-[11px] tracking-[0.18em]">
                {CHECKS.slice(0, checks).map(([k, v]) => (
                  <motion.li key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                    <span className="text-parchment/60">{k}</span>
                    <span className="flex-1 overflow-hidden whitespace-nowrap text-parchment/20">{"·".repeat(80)}</span>
                    <span className="text-ok">{v}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-5 flex justify-center">
                <HudButton variant="primary" onClick={enter} disabled={checks < CHECKS.length || opening} className="!px-8 !py-4 text-xs">
                  {opening ? "Cycling airlock…" : "Enter Airlock"}
                </HudButton>
              </div>
            </HudFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
