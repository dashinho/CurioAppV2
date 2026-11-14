import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";

/**
 * C.U.R.I.O.'s speech panel. Click the text to skip typing.
 * `children` (actions) appear once typing is finished.
 */
export default function Dialogue({
  text,
  onDone,
  onSpeakingChange,
  children,
  speaker = "C.U.R.I.O.",
  channel = "CH-07 // ARCHIVE UPLINK",
  className = "",
  textClassName = "text-lg md:text-xl",
  speed = 24,
}) {
  const { shown, done, skip } = useTypewriter(text, { speed, onDone });

  useEffect(() => {
    onSpeakingChange?.(!done && !!text);
  }, [done, text, onSpeakingChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-amber">
          <span className={`h-1.5 w-1.5 rounded-full bg-amber ${done ? "" : "animate-pulse"}`} />
          {speaker}
        </span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="hud-label text-[9px]">{channel}</span>
      </div>
      <p
        className={`min-h-[4.5em] cursor-text leading-relaxed text-parchment/90 ${textClassName}`}
        onClick={skip}
        aria-live="polite"
      >
        {shown}
        {!done && <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[3px] animate-pulse bg-amber/80" />}
      </p>
      <AnimatePresence>
        {done && children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
