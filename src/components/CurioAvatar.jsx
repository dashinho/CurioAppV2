import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sound } from "../audio/SoundEngine";

/**
 * C.U.R.I.O.: a beige 1970s-style robot with a CRT face.
 * The mouth is a live oscilloscope fed by the voice bus analyser (typing clicks),
 * mixed with a synthetic carrier so it still moves when audio is muted.
 */
export default function CurioAvatar({ size = 220, speaking = false, mood = "idle", className = "" }) {
  const canvasRef = useRef(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;
  const [blink, setBlink] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let t;
    const loop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      t = setTimeout(loop, 2600 + Math.random() * 3200);
    };
    t = setTimeout(loop, 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 220;
    const H = 60;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);
    const data = new Uint8Array(1024);
    let raf;
    let phase = 0;
    const draw = () => {
      phase += 0.18;
      sound.voiceLevel *= speakingRef.current ? 0.9 : 0.82;
      const level = sound.voiceLevel;
      const hasData = sound.readWaveform(data);
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffb347";
      ctx.shadowColor = "rgba(255,179,71,0.9)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const N = 110;
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const env = Math.sin((i / N) * Math.PI);
        const real = hasData ? (data[Math.floor((i / N) * 1023)] - 128) / 128 : 0;
        const synth = Math.sin(i * 0.45 + phase) * 0.55 + Math.sin(i * 1.3 - phase * 1.7) * 0.3;
        const y = H / 2 + (real * 2.6 + synth * level) * env * (H * 0.42);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const eyeH = blink ? 2 : mood === "happy" ? 10 : 22;
  return (
    <motion.div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size * 1.1 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 242" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`curioShell-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efe2c4" />
            <stop offset="1" stopColor="#b9a47c" />
          </linearGradient>
          <radialGradient id={`curioScreen-${uid}`} cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#1b2218" />
            <stop offset="1" stopColor="#070907" />
          </radialGradient>
          <radialGradient id={`curioGlow-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(255,179,71,0.35)" />
            <stop offset="1" stopColor="rgba(255,179,71,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="110" cy="108" rx="125" ry="115" fill={`url(#curioGlow-${uid})`} opacity={speaking ? 1 : 0.45} />
        {/* antenna */}
        <line x1="110" y1="30" x2="110" y2="6" stroke="#cbb994" strokeWidth="4" />
        <motion.circle
          cx="110"
          cy="6"
          r="6"
          fill="#ff5a4e"
          animate={{ opacity: speaking ? [1, 0.2, 1] : [0.9, 0.35, 0.9] }}
          transition={{ duration: speaking ? 0.5 : 2.2, repeat: Infinity }}
        />
        {/* ears */}
        <rect x="6" y="80" width="18" height="52" rx="6" fill="#d36b3c" />
        <rect x="196" y="80" width="18" height="52" rx="6" fill="#d36b3c" />
        {/* head shell */}
        <rect x="18" y="28" width="184" height="160" rx="30" fill={`url(#curioShell-${uid})`} />
        <rect x="18" y="28" width="184" height="160" rx="30" fill="none" stroke="#8e7a57" strokeWidth="2" />
        {/* screws */}
        {[
          [34, 44],
          [186, 44],
          [34, 172],
          [186, 172],
        ].map(([x, y]) => (
          <g key={`${x}${y}`}>
            <circle cx={x} cy={y} r="4" fill="#a8946d" />
            <line x1={x - 2.5} y1={y} x2={x + 2.5} y2={y} stroke="#6f5f42" strokeWidth="1.2" />
          </g>
        ))}
        {/* CRT */}
        <rect x="36" y="48" width="148" height="122" rx="20" fill={`url(#curioScreen-${uid})`} stroke="#5d4f37" strokeWidth="3" />
        {/* eyes */}
        <rect x="70" y={92 - eyeH / 2} width="22" height={eyeH} rx="5" fill="#ffb347" style={{ filter: "drop-shadow(0 0 6px rgba(255,179,71,.9))" }} />
        <rect x="128" y={92 - eyeH / 2} width="22" height={eyeH} rx="5" fill="#ffb347" style={{ filter: "drop-shadow(0 0 6px rgba(255,179,71,.9))" }} />
        {/* label plate */}
        <rect x="74" y="194" width="72" height="16" rx="3" fill="#2a2418" />
        <text x="110" y="205.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#ffb347" letterSpacing="2">
          C.U.R.I.O.
        </text>
        {/* neck + shoulders */}
        <rect x="92" y="188" width="36" height="8" fill="#8e7a57" />
        <path d="M40 242 Q42 214 76 212 L144 212 Q178 214 180 242 Z" fill="#cbb994" stroke="#8e7a57" strokeWidth="2" />
        <circle cx="160" cy="228" r="4" fill="#6ee7a8" opacity={speaking ? 1 : 0.4} />
      </svg>
      {/* oscilloscope mouth over the CRT */}
      <div
        className="scanlines absolute overflow-hidden rounded-md"
        style={{ left: "23.5%", top: "51%", width: "53%", height: "14%" }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </motion.div>
  );
}
