import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Countdown + destination title shown during the warp transition. */
export default function TravelOverlay({ destination, name, duration = 2.8 }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    const step = (duration * 1000) / 4;
    const ids = [1, 2, 3].map((i) => setTimeout(() => setN(3 - i), step * i));
    return () => ids.forEach(clearTimeout);
  }, [duration]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 20%, rgba(4,5,10,0.85) 75%)" }} />
      <motion.p
        className="relative font-mono text-[11px] tracking-[0.5em] text-amber"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        SEATBELT ON, ASTRONAUT {name?.toUpperCase()} · NEXT STOP
      </motion.p>
      <motion.h2
        className="relative mt-4 font-serif text-6xl text-parchment md:text-8xl"
        initial={{ opacity: 0, scale: 1.25, filter: "blur(12px)", letterSpacing: "0.2em" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", letterSpacing: "0em" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {destination.name}
      </motion.h2>
      <p className="relative mt-3 font-mono text-xs tracking-[0.3em] text-parchment/50">{destination.surfaceName.toUpperCase()}</p>
      <motion.div
        key={n}
        className="relative mt-10 font-mono text-5xl text-signal"
        initial={{ opacity: 0, scale: 1.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        {n > 0 ? `T-${n}` : "ARRIVING"}
      </motion.div>
    </motion.div>
  );
}
