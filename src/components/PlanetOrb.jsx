import { motion } from "framer-motion";

/** Cinematic CSS-rendered worlds for the destination cards. */
const LOOKS = {
  moon: {
    glow: "rgba(200,210,230,0.35)",
    body: "radial-gradient(circle at 34% 30%, #f2f2ee 0%, #b9bcc2 30%, #7c8089 58%, #2b2d33 82%, #0d0e11 100%)",
    craters: [
      [28, 38, 16],
      [58, 30, 9],
      [62, 62, 20],
      [36, 70, 8],
      [76, 48, 6],
      [46, 52, 5],
    ],
    craterColor: "rgba(60,62,70,0.35)",
  },
  mars: {
    glow: "rgba(255,120,60,0.35)",
    body: "radial-gradient(circle at 34% 30%, #ffd2a6 0%, #e08a52 26%, #b5532a 52%, #5a200e 80%, #1a0904 100%)",
    craters: [
      [30, 44, 12],
      [62, 36, 7],
      [58, 66, 15],
      [40, 74, 6],
    ],
    craterColor: "rgba(90,30,12,0.35)",
    band: "linear-gradient(170deg, transparent 38%, rgba(120,40,15,0.35) 46%, transparent 55%)",
  },
  deepSpace: {
    glow: "rgba(232,116,59,0.4)",
    body: "radial-gradient(circle at 50% 50%, #fff3e0 0%, #ffb27a 18%, #e8743b 34%, rgba(232,116,59,0.25) 52%, rgba(10,19,48,0) 70%)",
    craters: [],
  },
};

export default function PlanetOrb({ id, size = 220, active = false }) {
  const look = LOOKS[id] ?? LOOKS.moon;
  if (id === "deepSpace") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: look.body, filter: "blur(1px)" }}
          animate={{ scale: active ? [1, 1.08, 1] : [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* diffraction spikes */}
        <div className="absolute left-1/2 top-1/2 h-[140%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#ffd4b0]/70 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#ffd4b0]/70 to-transparent" />
        {/* a tiny probe drifting toward it */}
        <motion.div
          className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
          initial={{ left: "8%", top: "86%" }}
          animate={{ left: ["8%", "30%"], top: ["86%", "66%"], opacity: [0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M8 86 L50 50" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" strokeDasharray="1 2" />
        </svg>
      </div>
    );
  }
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute -inset-[18%] rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${look.glow}, transparent 65%)` }} />
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full shadow-[inset_-30px_-24px_60px_rgba(0,0,0,0.85)]"
        style={{ background: look.body }}
        animate={{ rotate: active ? 8 : 0 }}
        transition={{ duration: 1.2 }}
      >
        {look.band && <div className="absolute inset-0" style={{ background: look.band }} />}
        {look.craters.map(([x, y, r], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${r}%`,
              height: `${r}%`,
              background: look.craterColor,
              boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(255,255,255,0.12)",
            }}
          />
        ))}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 75% 78%, rgba(0,0,0,0.75), transparent 55%)" }} />
      </motion.div>
    </div>
  );
}
