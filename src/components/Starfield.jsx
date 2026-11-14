import { useEffect, useRef } from "react";

/**
 * Full-screen canvas starfield. Three depth layers, gentle twinkle and drift.
 * When `warp` is true, stars stretch into streaks toward the viewer (travel effect).
 */
export default function Starfield({ warp = false, tint = "#ffffff" }) {
  const canvasRef = useRef(null);
  const warpRef = useRef(warp);
  warpRef.current = warp;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let speed = 0;
    let stars = [];

    const make = () => {
      const count = Math.round((w * h) / 4200);
      stars = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * w,
        layer: Math.random(),
        tw: Math.random() * Math.PI * 2,
        size: Math.random() < 0.06 ? 1.6 : Math.random() < 0.3 ? 1.1 : 0.7,
        warm: Math.random() < 0.18,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      make();
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = warpRef.current ? 1 : 0;
      speed += (target - speed) * Math.min(1, dt * 2.2);

      ctx.fillStyle = speed > 0.02 ? `rgba(4,5,10,${0.55 - speed * 0.35})` : "#04050a";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      for (const s of stars) {
        s.tw += dt * (0.6 + s.layer * 1.6);
        // ambient drift
        s.x -= dt * (2 + s.layer * 6);
        if (s.x < -w) s.x += w * 2;
        // warp forward motion
        const prevZ = s.z;
        s.z -= dt * speed * w * 1.6;
        if (s.z <= 1) {
          s.z = w;
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
          continue;
        }
        const k = 260 / Math.max(s.z, 1) + 0.35;
        const px = cx + s.x * k * 0.5;
        const py = cy + s.y * k * 0.5;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
        const twinkle = 0.55 + Math.sin(s.tw) * 0.35;
        const alpha = Math.min(1, (0.25 + s.layer * 0.75) * twinkle + speed * 0.4);
        ctx.fillStyle = s.warm ? `rgba(255,214,170,${alpha})` : `rgba(235,240,255,${alpha})`;

        if (speed > 0.05) {
          const kp = 260 / Math.max(prevZ, 1) + 0.35;
          const ppx = cx + s.x * kp * 0.5;
          const ppy = cy + s.y * kp * 0.5;
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = s.size * (1 + speed);
          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, s.size * (0.6 + s.layer * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        aria-hidden="true"
        style={{
          background: `radial-gradient(1200px 600px at 80% -10%, rgba(80,110,200,0.12), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(255,140,80,0.08), transparent 60%)`,
          mixBlendMode: "screen",
          color: tint,
        }}
      />
    </>
  );
}
