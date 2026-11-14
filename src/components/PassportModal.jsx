import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Lock, RotateCcw, X } from "lucide-react";
import { destinations } from "../data/missionData";
import { useProfile } from "../context/ProfileContext";
import HudButton from "./HudButton";
import Patch from "./Patch";
import Certificate from "./Certificate";
import { sound } from "../audio/SoundEngine";

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "—";

function HelmetPortrait({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <svg viewBox="0 0 120 150" className="h-full w-full">
      <defs>
        <linearGradient id="visorPP" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="0.45" stopColor="#c47a2c" />
          <stop offset="1" stopColor="#3a1f0c" />
        </linearGradient>
      </defs>
      <rect width="120" height="150" fill="#0a0f1c" />
      {[...Array(18)].map((_, i) => (
        <circle key={i} cx={(i * 37) % 120} cy={(i * 53) % 90} r={i % 4 === 0 ? 1 : 0.6} fill="#fff" opacity="0.6" />
      ))}
      <path d="M14 150 Q16 112 60 108 Q104 112 106 150 Z" fill="#d9dde5" />
      <circle cx="60" cy="70" r="40" fill="#e6e9ef" />
      <rect x="30" y="50" width="60" height="42" rx="20" fill="url(#visorPP)" />
      <path d="M38 58 Q50 52 64 56" stroke="#fff" strokeWidth="3" opacity="0.6" fill="none" strokeLinecap="round" />
      <text x="60" y="84" textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif" fontSize="28" fill="#fff8e8" opacity="0.92">
        {initial}
      </text>
      <rect x="44" y="118" width="32" height="8" rx="2" fill="#ff5a4e" opacity="0.8" />
    </svg>
  );
}

function StampSlot({ dest, stamp }) {
  const reward = dest.heroDevice.stampReward;
  if (!stamp) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-dashed border-white/25 text-parchment/40 md:h-32 md:w-32">
          <Lock size={18} />
          <span className="mt-2 font-mono text-[9px] tracking-[0.2em]">AWAITING</span>
          <span className="font-mono text-[9px] tracking-[0.2em]">SIGNAL</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.22em] text-parchment/50">{dest.name.toUpperCase()}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 md:h-32 md:w-32">
        <Patch svg={reward.patch.svg} size="100%" title={reward.title} style={{ transform: `rotate(${reward.ink.rotationDeg}deg)` }} />
        <div
          className="pointer-events-none absolute left-1/2 top-[64%] whitespace-nowrap border-[3px] border-double px-1.5 py-0.5 text-center font-mono text-[9px] font-bold leading-tight tracking-[0.16em]"
          style={{ color: "#ff4d3d", borderColor: "#ff4d3d", background: "rgba(10,8,6,0.45)", transform: "translate(-50%,-50%) rotate(-14deg)", opacity: 0.92 }}
        >
          STAMPED
          <br />
          VERIFIED
        </div>
      </div>
      <span className="font-mono text-[10px] tracking-[0.22em] text-parchment/80">{reward.title.toUpperCase()}</span>
      <span className="font-mono text-[9px] tracking-[0.18em] text-amber/80">
        {reward.unlockCode} · {fmt(stamp.awardedAt)}
      </span>
    </div>
  );
}

export default function PassportModal({ open, onClose }) {
  const { profile, stampCount, reset } = useProfile();
  const [view, setView] = useState("passport");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) {
      setView("passport");
      setConfirmReset(false);
      return;
    }
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const complete = stampCount === 3;
  const mrzName = (profile.name || "").toUpperCase().replace(/[^A-Z0-9]/g, "<");
  const mrz1 = `P<CURIO<${mrzName}<<${"<".repeat(Math.max(0, 34 - mrzName.length))}`.slice(0, 44);
  const mrz2 = `${(profile.passportNo || "CURIO0000").replace(/[^A-Z0-9]/g, "")}<EARTH<<STAMPS<${stampCount}<3<<<<<<<<<<<<<<`.slice(0, 44);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 p-4 pt-20 backdrop-blur-md md:items-center md:pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Explorer Passport"
        >
          <motion.div
            className={`relative w-full ${view === "certificate" ? "max-w-5xl" : "max-w-3xl"}`}
            initial={{ y: 40, rotateX: 14, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, rotateX: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            style={{ transformPerspective: 1200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                sound.click();
                onClose();
              }}
              className="absolute -top-11 right-0 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-parchment/70 hover:text-parchment"
              aria-label="Close passport"
            >
              CLOSE <X size={16} />
            </button>

            {view === "certificate" ? (
              <Certificate profile={profile} onBack={() => setView("passport")} />
            ) : (
              <div
                className="relative overflow-hidden rounded-xl border border-[#c9a24a]/50 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.7)] md:p-8"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 85% 20%, rgba(201,162,74,0.06) 0 1px, transparent 1px 9px), linear-gradient(135deg, #0d1424, #131c33 55%, #0a0e19)",
                }}
              >
                {/* holographic stripe */}
                <motion.div
                  className="pointer-events-none absolute -inset-y-10 w-40 rotate-12 opacity-[0.12]"
                  style={{ background: "linear-gradient(90deg, transparent, #7fe3ff, #ffb347, #c08cff, transparent)" }}
                  animate={{ x: ["-30%", "520%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />

                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#c9a24a]/30 pb-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.35em] text-[#c9a24a]">C.U.R.I.O. OFFICE OF UNHEARD ROBOTS</p>
                    <h2 className="font-serif text-3xl text-parchment md:text-4xl">Space Explorer Passport</h2>
                  </div>
                  <div className="text-right font-mono text-[10px] leading-5 tracking-[0.2em] text-parchment/60">
                    <div>TYPE · P</div>
                    <div>ORIGIN · EARTH</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[96px_1fr] gap-5 md:grid-cols-[120px_1fr] md:gap-7">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm border border-white/20">
                    <HelmetPortrait name={profile.name} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="col-span-2">
                      <p className="hud-label text-[9px]">Astronaut</p>
                      <p className="font-serif text-4xl leading-tight text-parchment md:text-5xl">{profile.name || "—"}</p>
                    </div>
                    <div>
                      <p className="hud-label text-[9px]">Passport No.</p>
                      <p className="font-mono text-sm text-parchment">{profile.passportNo || "—"}</p>
                    </div>
                    <div>
                      <p className="hud-label text-[9px]">Issued</p>
                      <p className="font-mono text-sm text-parchment">{fmt(profile.issuedAt)}</p>
                    </div>
                    <div>
                      <p className="hud-label text-[9px]">Clearance</p>
                      <p className="font-mono text-sm text-amber">{complete ? "RELIC HISTORIAN" : `LEVEL ${stampCount}`}</p>
                    </div>
                    <div>
                      <p className="hud-label text-[9px]">Stamps</p>
                      <p className="font-mono text-sm text-parchment">{stampCount} / 3</p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-5 md:gap-4">
                  {destinations.map((d) => (
                    <StampSlot key={d.id} dest={d} stamp={profile.stamps[d.id]} />
                  ))}
                </div>

                <div className="mt-5 select-all overflow-hidden font-mono text-[10px] leading-5 tracking-[0.28em] text-parchment/45 md:text-[11px]">
                  <div className="truncate">{mrz1}</div>
                  <div className="truncate">{mrz2}</div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {complete ? (
                    <HudButton variant="primary" onClick={() => setView("certificate")}>
                      <Award size={15} /> View Space Relic Historian Certificate
                    </HudButton>
                  ) : (
                    <p className="font-mono text-[11px] tracking-[0.12em] text-parchment/55">
                      Collect all 3 stamps to unlock your Space Relic Historian Certificate.
                    </p>
                  )}
                  <HudButton
                    onClick={() => {
                      if (!confirmReset) return setConfirmReset(true);
                      reset();
                      setConfirmReset(false);
                      onClose();
                      window.location.reload();
                    }}
                    onMouseLeave={() => setConfirmReset(false)}
                    className={confirmReset ? "!border-alert !text-alert" : "!text-parchment/50"}
                  >
                    <RotateCcw size={13} /> {confirmReset ? "Click again to erase" : "Reset mission"}
                  </HudButton>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
