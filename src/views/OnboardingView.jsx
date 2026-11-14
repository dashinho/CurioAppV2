import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Hand, Lock, MousePointerClick, MoveHorizontal } from "lucide-react";
import { onboarding, fillTemplate } from "../data/missionData";
import { useProfile } from "../context/ProfileContext";
import CurioAvatar from "../components/CurioAvatar";
import Dialogue from "../components/Dialogue";
import HudButton from "../components/HudButton";
import HudFrame from "../components/HudFrame";
import { sound } from "../audio/SoundEngine";

const STEPS = onboarding.steps.filter((s) => s.id !== "launch");

function MiniPassport({ name, passportNo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: -3, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative w-full max-w-sm overflow-hidden rounded-lg border border-[#c9a24a]/50 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
      style={{ background: "linear-gradient(135deg,#0d1424,#131c33 55%,#0a0e19)" }}
    >
      <p className="font-mono text-[9px] tracking-[0.35em] text-[#c9a24a]">{onboarding.passport.issuedBy.toUpperCase()}</p>
      <p className="font-serif text-2xl text-parchment">{onboarding.passport.title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</p>
      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
        <div>
          <p className="hud-label text-[8px]">Holder</p>
          <p className="font-serif text-3xl text-parchment">{fillTemplate(onboarding.passport.holderLabel, { name })}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-amber">{passportNo}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {onboarding.passport.slots.map((s, i) => (
          <motion.div
            key={s.slot}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.18 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex aspect-square w-full items-center justify-center rounded-full border border-dashed border-white/30 text-parchment/40">
              <Lock size={14} />
            </div>
            <span className="font-mono text-[8px] tracking-[0.2em] text-parchment/55">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ControlsHint() {
  const items = [
    [MoveHorizontal, "Drag or scroll sideways to scan the surface"],
    [Lock, "Faded machines: archive locked (hover for telemetry)"],
    [MousePointerClick, "The glowing one answers. Click Discover"],
    [Hand, "Read 4 chapters, pass the quiz, earn the stamp"],
  ];
  return (
    <motion.ul initial="h" animate="s" className="grid w-full max-w-sm gap-3">
      {items.map(([Icon, text], i) => (
        <motion.li
          key={text}
          variants={{ h: { opacity: 0, x: 20 }, s: { opacity: 1, x: 0, transition: { delay: i * 0.15 } } }}
          className="hud-glass flex items-center gap-3 rounded-sm px-4 py-3"
        >
          <Icon size={16} className="shrink-0 text-amber" />
          <span className="font-mono text-[11px] leading-5 tracking-[0.06em] text-parchment/80">{text}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export default function OnboardingView({ onComplete }) {
  const { profile, setName } = useProfile();
  const [i, setI] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [draft, setDraft] = useState(profile.name || "");
  const inputRef = useRef(null);
  const step = STEPS[i];
  const text = useMemo(() => fillTemplate(step.text, { name: profile.name || "Rookie" }), [step, profile.name]);

  const advance = () => {
    if (i >= STEPS.length - 1) return onComplete();
    setI((n) => n + 1);
  };

  const submitName = (e) => {
    e?.preventDefault();
    sound.click();
    setName(draft, step.input?.fallbackIfEmpty);
    advance();
  };

  const showPassport = ["passport", "whyMachines", "machinesGoFirst"].includes(step.id) || step.ui === "showPassport";

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 pb-16 pt-24 md:px-8">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(220px,300px)_1fr]">
        <div className="flex flex-col items-center gap-4">
          <CurioAvatar size={250} speaking={speaking} mood={step.id === "confirmName" ? "happy" : "idle"} />
          <p className="font-mono text-[10px] tracking-[0.3em] text-parchment/40">CARETAKER OF UNHEARD ROBOTS IN ORBIT</p>
        </div>

        <div className="flex flex-col gap-8">
          <HudFrame className="hud-glass rounded-sm p-6 md:p-8" label={`TRANSMISSION ${String(i + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}`}>
            <Dialogue key={step.id} text={text} onSpeakingChange={setSpeaking}>
              {step.input ? (
                <form onSubmit={submitName} className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[11px] tracking-[0.2em] text-amber">
                      ASTRONAUT
                    </span>
                    <input
                      ref={inputRef}
                      autoFocus
                      value={draft}
                      maxLength={step.input.maxLength}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        sound.typeTick(e.target.value.slice(-1) || "a");
                      }}
                      placeholder={step.input.placeholder}
                      aria-label="Your first name"
                      className="w-full border border-white/20 bg-black/40 py-3.5 pl-32 pr-4 font-mono text-base tracking-[0.12em] text-parchment outline-none placeholder:text-parchment/30 focus:border-amber"
                    />
                  </div>
                  <HudButton variant="primary" type="submit" onClick={undefined} silent>
                    {step.next} <ChevronRight size={14} />
                  </HudButton>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <HudButton variant="primary" onClick={advance}>
                    {step.next ?? "Continue"} <ChevronRight size={14} />
                  </HudButton>
                  {profile.name && i > 2 && i < STEPS.length - 1 && (
                    <HudButton onClick={onComplete} className="!text-parchment/50">
                      Skip intro
                    </HudButton>
                  )}
                </div>
              )}
            </Dialogue>
          </HudFrame>

          <div className="flex min-h-[220px] justify-center md:justify-start">
            <AnimatePresence mode="wait">
              {showPassport && profile.name && (
                <motion.div key="pp" exit={{ opacity: 0, y: -10 }} className="w-full">
                  <MiniPassport name={profile.name} passportNo={profile.passportNo} />
                </motion.div>
              )}
              {step.ui === "showControlsHint" && (
                <motion.div key="ctrl" exit={{ opacity: 0 }} className="w-full">
                  <ControlsHint />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {STEPS.map((s, n) => (
          <span key={s.id} className={`h-0.5 transition-all duration-500 ${n <= i ? "w-6 bg-amber" : "w-3 bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}
