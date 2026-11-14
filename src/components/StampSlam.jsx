import { useEffect, useMemo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Patch from "./Patch";
import { sound } from "../audio/SoundEngine";
import { useProfile } from "../context/ProfileContext";

const PATCH = 300;
const STAMP_INK = "#ff4d3d"; // classic red passport-control ink, readable on every patch

/**
 * Full-screen "STAMP SLAM":
 *   drop (patch falls from above, huge and blurred) → impact (thud + chord, screen shake, ink burst)
 *   → hold (show title + code) → fly (patch shrinks into the HUD passport button) → onDone
 */
export default function StampSlam({ reward, destinationName, onDone }) {
  const [phase, setPhase] = useState("drop");
  const shake = useAnimationControls();
  const { passportButtonRef } = useProfile();
  const [target, setTarget] = useState({ x: 0, y: -400 });

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + Math.random() * 0.2;
        const d = 170 + Math.random() * 140;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 3 + Math.random() * 6 };
      }),
    []
  );

  const onImpact = () => {
    if (phase !== "drop") return;
    setPhase("impact");
    sound.stampThud();
    shake.start({
      x: [0, -16, 13, -9, 6, -3, 0],
      y: [0, 10, -8, 6, -3, 1, 0],
      transition: { duration: 0.5, ease: "easeOut" },
    });
  };

  useEffect(() => {
    if (phase !== "impact") return;
    const t1 = setTimeout(() => {
      const el = passportButtonRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        setTarget({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 });
      }
      setPhase("fly");
      sound.whoosh(0.9);
    }, 2900);
    return () => clearTimeout(t1);
  }, [phase, passportButtonRef]);

  useEffect(() => {
    if (phase !== "fly") return;
    const t = setTimeout(() => onDone?.(), 950);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const flying = phase === "fly";
  const ink = reward.ink.color;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-live="assertive"
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        animate={{ opacity: flying ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: "radial-gradient(circle at center, rgba(20,16,10,0.75), rgba(0,0,0,0.92) 70%)" }}
      />
      <motion.div animate={shake} className="relative flex flex-col items-center">
        {/* ink shock ring */}
        {phase !== "drop" && !flying && (
          <>
            <motion.div
              className="absolute left-1/2 top-[150px] rounded-full border-2"
              style={{ width: PATCH, height: PATCH, marginLeft: -PATCH / 2, marginTop: -PATCH / 2, borderColor: ink }}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            {particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-[150px] rounded-full"
                style={{ width: p.s, height: p.s, background: i % 3 ? ink : "#f4f1e8" }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.8 + Math.random() * 0.4, ease: [0.1, 0.8, 0.3, 1] }}
              />
            ))}
          </>
        )}

        {/* the patch */}
        <motion.div
          initial={{ scale: 3.4, rotate: -28, y: -160, opacity: 0, filter: "blur(10px)" }}
          animate={
            flying
              ? { scale: 0.1, rotate: 0, x: target.x, y: target.y + 0, opacity: 0.4, filter: "blur(0px)" }
              : { scale: 1, rotate: reward.ink.rotationDeg, y: 0, opacity: 1, filter: "blur(0px)" }
          }
          transition={
            flying
              ? { duration: 0.85, ease: [0.6, 0, 0.2, 1] }
              : { duration: 0.42, ease: [0.75, 0, 0.9, 0.35] }
          }
          onAnimationComplete={onImpact}
          className="relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          style={{ width: PATCH, height: PATCH }}
        >
          <Patch svg={reward.patch.svg} size={PATCH} title={reward.title} />
          {/* ink stamp overlay */}
          {phase !== "drop" && (
            <motion.div
              className="absolute left-1/2 top-[74%] z-10 whitespace-nowrap border-[5px] border-double px-4 py-1.5 text-center font-mono font-bold"
              style={{ color: STAMP_INK, borderColor: STAMP_INK, filter: "url(#ink-rough)", background: "rgba(14,10,8,0.86)" }}
              initial={{ scale: 1.8, opacity: 0, x: "-50%", y: "-50%", rotate: -20 }}
              animate={{ scale: 1, opacity: 0.92, x: "-50%", y: "-50%", rotate: -14 }}
              transition={{ duration: 0.18, delay: 0.05 }}
            >
              <div className="text-xl tracking-[0.25em]">STAMPED</div>
              <div className="text-[10px] tracking-[0.4em]">VERIFIED · C.U.R.I.O.</div>
            </motion.div>
          )}
        </motion.div>

        {/* caption */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={phase === "impact" ? { opacity: 1, y: 0 } : { opacity: 0, y: flying ? -10 : 16 }}
          transition={{ duration: 0.5, delay: phase === "impact" ? 0.35 : 0 }}
        >
          <p className="font-mono text-[11px] tracking-[0.45em] text-amber">PASSPORT STAMP · {destinationName.toUpperCase()}</p>
          <h3 className="mt-2 font-serif text-5xl text-parchment md:text-6xl">{reward.title}</h3>
          <p className="mt-1 font-serif text-xl italic text-parchment/70">{reward.subtitle}</p>
          <p className="mt-4 font-mono text-xs tracking-[0.3em] text-parchment/60">
            UNLOCK CODE <span className="text-signal">{reward.unlockCode}</span> · {reward.stampText}
          </p>
        </motion.div>
      </motion.div>

      {/* rough-ink filter for the STAMPED mark */}
      <svg width="0" height="0" className="absolute">
        <filter id="ink-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </motion.div>
  );
}
