import { forwardRef } from "react";
import { sound } from "../audio/SoundEngine";

/**
 * Button that plays HUD radar pips on hover/click.
 * variant: "primary" (amber), "ghost" (thin border), "icon"
 */
const HudButton = forwardRef(function HudButton(
  { variant = "ghost", className = "", onClick, onMouseEnter, silent = false, children, ...rest },
  ref
) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.2em] text-[11px] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary:
      "px-5 py-3 bg-amber text-obsidian hover:bg-[#ffc874] shadow-[0_0_30px_rgba(255,179,71,0.25)] hover:shadow-[0_0_44px_rgba(255,179,71,0.45)]",
    ghost: "px-4 py-2.5 hud-border text-parchment/80 hover:text-parchment hover:border-white/40 hover:bg-white/5",
    icon: "h-9 w-9 hud-border text-parchment/80 hover:text-parchment hover:border-white/40 hover:bg-white/5",
  };
  return (
    <button
      ref={ref}
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      onMouseEnter={(e) => {
        if (!silent) sound.hover();
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        if (!silent) sound.click();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default HudButton;
