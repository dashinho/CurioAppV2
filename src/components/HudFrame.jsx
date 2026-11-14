/** Thin technical frame with corner brackets. */
export default function HudFrame({ className = "", children, label, corner = "rgba(255,255,255,0.55)", as: Tag = "div", ...rest }) {
  const c = { borderColor: corner };
  return (
    <Tag className={`relative hud-border ${className}`} {...rest}>
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t" style={c} />
      <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r border-t" style={c} />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l" style={c} />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r" style={c} />
      {label && (
        <span className="hud-label absolute -top-[7px] left-4 bg-obsidian px-2 text-[9px]">{label}</span>
      )}
      {children}
    </Tag>
  );
}
