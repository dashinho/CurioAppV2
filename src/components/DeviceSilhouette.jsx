/**
 * Hand-drawn SVG silhouettes for every device on the surfaces.
 * Hero devices get full color; background (locked) devices render as faded "ghost" outlines.
 * viewBox 0 0 240 180, ground contact ≈ y 170.
 */

export const KIND_BY_ID = {
  "apollo11-eagle": "lm",
  "surveyor-3": "surveyor",
  "apollo15-lrv": "lrv",
  "mer-b-opportunity": "mer",
  "viking-1-lander": "viking",
  "mars-pathfinder-sojourner": "pathfinder",
  "pioneer-10": "pioneer",
  kepler: "kepler",
  "voyager-1": "voyager",
};

const GHOST = {
  f: "rgba(14,17,26,0.55)",
  f2: "rgba(14,17,26,0.4)",
  a: "rgba(200,210,230,0.25)",
  d: "rgba(8,10,16,0.6)",
  s: "rgba(232,238,250,0.78)",
  c: "rgba(30,36,52,0.55)",
};

const HERO = {
  lm: { f: "#c9a24a", f2: "#8f7330", a: "#efd98a", d: "#2c261c", s: "#f3e3a8", c: "#a8882f" },
  mer: { f: "#dcd5c6", f2: "#9aa1ad", a: "#c7a26a", d: "#20283a", s: "#f4f1e8", c: "#2c3a5c" },
  pioneer: { f: "#dfe3ea", f2: "#a9b0bd", a: "#e2b44b", d: "#3c4250", s: "#ffffff", c: "#8a93a3" },
};

const Pad = ({ x, y = 170, rx = 12, col }) => <ellipse cx={x} cy={y} rx={rx} ry="3" fill={col.f2} stroke={col.s} strokeWidth="1" />;

function Lm({ col }) {
  return (
    <g strokeLinejoin="round">
      {/* legs + struts */}
      <g stroke={col.s} strokeWidth="2.4" fill="none">
        <path d="M66 122 L26 168" />
        <path d="M174 122 L214 168" />
        <path d="M96 140 L90 169" />
        <path d="M144 140 L150 169" />
        <path d="M70 138 L40 152 M170 138 L200 152" strokeWidth="1.4" />
      </g>
      {/* ladder on front leg */}
      <g stroke={col.a} strokeWidth="1.2">
        <path d="M100 140 L95 168 M106 140 L101 168" />
        {[146, 152, 158, 164].map((y) => (
          <path key={y} d={`M${100 - (y - 140) * 0.18} ${y} L${106 - (y - 140) * 0.18} ${y}`} />
        ))}
      </g>
      <Pad x={26} col={col} />
      <Pad x={214} col={col} />
      <Pad x={90} rx={9} col={col} />
      <Pad x={150} rx={9} col={col} />
      {/* octagonal descent stage wrapped in foil */}
      <path d="M72 96 L168 96 L180 106 L180 130 L168 141 L72 141 L60 130 L60 106 Z" fill={col.f} stroke={col.s} strokeWidth="1.5" />
      <path d="M72 96 L72 141 M168 96 L168 141 M60 118 L180 118" stroke={col.f2} strokeWidth="1.2" />
      <path d="M80 104 l10 6 l-6 8 l12 4 M130 102 l8 9 l10 -3 l6 10 M150 124 l-8 8 l10 4" stroke={col.a} strokeWidth="0.9" fill="none" opacity="0.8" />
      {/* engine bell */}
      <path d="M108 141 L132 141 L128 153 L112 153 Z" fill={col.d} stroke={col.s} strokeWidth="1" />
      {/* empty top deck: the ascent stage has gone */}
      <path d="M86 96 L90 90 L150 90 L154 96" fill="none" stroke={col.s} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
      {/* plaque */}
      <rect x="99" y="132" width="9" height="6" fill={col.a} stroke={col.s} strokeWidth="0.6" />
    </g>
  );
}

function Surveyor({ col }) {
  return (
    <g strokeLinejoin="round">
      <g stroke={col.s} strokeWidth="2.2">
        <path d="M100 128 L48 167 M140 128 L192 167 M120 134 L120 169" />
      </g>
      <Pad x={48} col={col} />
      <Pad x={192} col={col} />
      <Pad x={120} rx={10} col={col} />
      <path d="M92 112 L148 112 L120 136 Z" fill={col.f} stroke={col.s} strokeWidth="1.5" />
      <path d="M120 112 L120 40" stroke={col.s} strokeWidth="2" />
      <rect x="94" y="28" width="52" height="18" fill={col.c} stroke={col.s} strokeWidth="1.2" transform="rotate(-8 120 37)" />
      <rect x="128" y="54" width="30" height="22" fill={col.f2} stroke={col.s} strokeWidth="1.2" />
      <rect x="100" y="90" width="12" height="22" rx="2" fill={col.d} stroke={col.s} strokeWidth="1" />
      <circle cx="106" cy="88" r="5" fill={col.a} stroke={col.s} strokeWidth="1" />
      <path d="M142 122 L168 134 L186 150" stroke={col.s} strokeWidth="1.6" fill="none" />
      <rect x="182" y="148" width="10" height="7" fill={col.f2} stroke={col.s} strokeWidth="1" />
    </g>
  );
}

function Lrv({ col }) {
  const Wheel = ({ x }) => (
    <g>
      <circle cx={x} cy="150" r="19" fill={col.f2} stroke={col.s} strokeWidth="1.8" />
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <line key={a} x1={x + 17 * Math.cos((a * Math.PI) / 180)} y1={150 + 17 * Math.sin((a * Math.PI) / 180)} x2={x - 17 * Math.cos((a * Math.PI) / 180)} y2={150 - 17 * Math.sin((a * Math.PI) / 180)} stroke={col.s} strokeWidth="0.5" opacity="0.6" />
      ))}
      <circle cx={x} cy="150" r="5" fill={col.d} stroke={col.s} strokeWidth="1" />
    </g>
  );
  return (
    <g strokeLinejoin="round">
      <Wheel x={60} />
      <Wheel x={182} />
      <path d="M38 140 Q60 112 84 138 M160 140 Q182 112 206 138" fill="none" stroke={col.s} strokeWidth="1.6" />
      <rect x="40" y="126" width="164" height="9" fill={col.f} stroke={col.s} strokeWidth="1.4" />
      {/* seats */}
      <path d="M100 126 L100 104 L108 104 L110 120 L128 120 L128 126 Z" fill={col.f2} stroke={col.s} strokeWidth="1.2" />
      <path d="M134 126 L134 104 L142 104 L144 120 L160 120 L160 126 Z" fill={col.f2} stroke={col.s} strokeWidth="1.2" />
      {/* console + TV camera */}
      <path d="M82 126 L82 98" stroke={col.s} strokeWidth="1.6" />
      <rect x="74" y="92" width="18" height="10" fill={col.d} stroke={col.s} strokeWidth="1" />
      {/* umbrella high-gain antenna */}
      <path d="M52 126 L52 70" stroke={col.s} strokeWidth="1.6" />
      <path d="M30 68 Q52 46 74 68 Z" fill={col.a} stroke={col.s} strokeWidth="1.2" />
      <path d="M52 50 L52 68" stroke={col.s} strokeWidth="1" />
    </g>
  );
}

function Mer({ col }) {
  return (
    <g strokeLinejoin="round">
      {/* rocker-bogie */}
      <path d="M60 154 L90 134 L120 154 M118 152 L150 134 L182 154 M90 134 L150 134" fill="none" stroke={col.s} strokeWidth="2" />
      {[60, 120, 182].map((x) => (
        <g key={x}>
          <circle cx={x} cy="158" r="11" fill={col.d} stroke={col.s} strokeWidth="1.6" />
          <circle cx={x} cy="158" r="3.5" fill={col.f2} />
        </g>
      ))}
      {/* body */}
      <rect x="82" y="116" width="78" height="20" fill={col.f} stroke={col.s} strokeWidth="1.4" />
      <rect x="86" y="120" width="70" height="3" fill={col.a} opacity="0.7" />
      {/* solar deck */}
      <path d="M26 108 L214 108 L204 117 L36 117 Z" fill={col.c} stroke={col.s} strokeWidth="1.4" />
      <path d="M50 108 L48 117 M74 108 L73 117 M98 108 L98 117 M122 108 L122 117 M146 108 L146 117 M170 108 L171 117 M194 108 L196 117" stroke={col.s} strokeWidth="0.5" opacity="0.6" />
      {/* mast + Pancam head */}
      <path d="M150 108 L150 46" stroke={col.s} strokeWidth="2.2" />
      <rect x="136" y="34" width="30" height="13" rx="2" fill={col.f} stroke={col.s} strokeWidth="1.3" />
      <circle cx="144" cy="40.5" r="2.8" fill={col.d} />
      <circle cx="158" cy="40.5" r="2.8" fill={col.d} />
      {/* high-gain dish */}
      <ellipse cx="186" cy="100" rx="11" ry="4" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <path d="M186 104 L186 108" stroke={col.s} strokeWidth="1.2" />
      {/* folded arm */}
      <path d="M82 128 L58 126 L50 138" fill="none" stroke={col.s} strokeWidth="2" />
      <circle cx="50" cy="141" r="5" fill={col.a} stroke={col.s} strokeWidth="1" />
    </g>
  );
}

function Viking({ col }) {
  return (
    <g strokeLinejoin="round">
      <g stroke={col.s} strokeWidth="2.2">
        <path d="M76 134 L44 167 M164 134 L196 167 M120 140 L120 169" />
      </g>
      <Pad x={44} col={col} />
      <Pad x={196} col={col} />
      <Pad x={120} rx={10} col={col} />
      <path d="M82 110 L158 110 L170 125 L158 140 L82 140 L70 125 Z" fill={col.f} stroke={col.s} strokeWidth="1.5" />
      <rect x="56" y="110" width="14" height="20" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <rect x="170" y="110" width="14" height="20" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <path d="M96 110 L96 72" stroke={col.s} strokeWidth="1.8" />
      <ellipse cx="96" cy="64" rx="28" ry="9" fill={col.a} stroke={col.s} strokeWidth="1.2" transform="rotate(-12 96 64)" />
      <path d="M96 64 L102 52" stroke={col.s} strokeWidth="1" />
      <rect x="124" y="86" width="10" height="24" fill={col.d} stroke={col.s} strokeWidth="1" />
      <rect x="142" y="86" width="10" height="24" fill={col.d} stroke={col.s} strokeWidth="1" />
      <circle cx="129" cy="86" r="5" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <circle cx="147" cy="86" r="5" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <path d="M166 112 L198 86" stroke={col.s} strokeWidth="1.4" />
      <rect x="196" y="80" width="8" height="8" fill={col.f2} stroke={col.s} strokeWidth="1" />
      <path d="M78 130 L40 144" stroke={col.s} strokeWidth="1.6" />
    </g>
  );
}

function Pathfinder({ col }) {
  return (
    <g strokeLinejoin="round">
      {/* deflated airbags */}
      <path d="M58 158 q8 -16 22 -8 q10 -12 22 -2 q14 -10 26 0 q14 -12 26 0 q14 -8 22 8 L176 166 L58 166 Z" fill={col.f2} stroke={col.s} strokeWidth="1" opacity="0.9" />
      {/* open petals */}
      <path d="M88 152 L26 164 L70 140 Z" fill={col.c} stroke={col.s} strokeWidth="1.3" />
      <path d="M152 152 L214 164 L170 140 Z" fill={col.c} stroke={col.s} strokeWidth="1.3" />
      <path d="M98 156 L142 156 L120 172 Z" fill={col.c} stroke={col.s} strokeWidth="1.3" />
      <rect x="88" y="138" width="64" height="16" fill={col.f} stroke={col.s} strokeWidth="1.4" />
      {/* camera mast */}
      <path d="M120 138 L120 96" stroke={col.s} strokeWidth="1.8" />
      <rect x="108" y="84" width="24" height="13" rx="2" fill={col.f} stroke={col.s} strokeWidth="1.2" />
      <circle cx="115" cy="90.5" r="2.4" fill={col.d} />
      <circle cx="125" cy="90.5" r="2.4" fill={col.d} />
      {/* ramp + Sojourner */}
      <path d="M176 152 L198 166" stroke={col.s} strokeWidth="1.4" />
      <rect x="196" y="146" width="28" height="4" fill={col.c} stroke={col.s} strokeWidth="1" />
      <rect x="199" y="150" width="22" height="9" fill={col.f} stroke={col.s} strokeWidth="1" />
      {[201, 210, 219].map((x) => (
        <circle key={x} cx={x} cy="163" r="3.6" fill={col.d} stroke={col.s} strokeWidth="1" />
      ))}
    </g>
  );
}

function Pioneer({ col }) {
  return (
    <g strokeLinejoin="round">
      {/* RTG booms */}
      <path d="M94 92 L36 128 M146 92 L204 128" stroke={col.s} strokeWidth="1.6" />
      <rect x="40" y="116" width="18" height="9" rx="2" fill={col.f2} stroke={col.s} strokeWidth="1" transform="rotate(-32 49 120)" />
      <rect x="54" y="107" width="18" height="9" rx="2" fill={col.f2} stroke={col.s} strokeWidth="1" transform="rotate(-32 63 111)" />
      <rect x="182" y="116" width="18" height="9" rx="2" fill={col.f2} stroke={col.s} strokeWidth="1" transform="rotate(32 191 120)" />
      <rect x="168" y="107" width="18" height="9" rx="2" fill={col.f2} stroke={col.s} strokeWidth="1" transform="rotate(32 177 111)" />
      {/* magnetometer boom */}
      <path d="M120 104 L120 172" stroke={col.s} strokeWidth="1" />
      <circle cx="120" cy="174" r="3" fill={col.f2} stroke={col.s} strokeWidth="1" />
      {/* hexagonal body */}
      <path d="M100 80 L140 80 L150 92 L140 104 L100 104 L90 92 Z" fill={col.f2} stroke={col.s} strokeWidth="1.4" />
      {/* plaque on struts */}
      <rect x="113" y="74" width="14" height="8" fill={col.a} stroke={col.s} strokeWidth="0.6" />
      {/* high-gain dish */}
      <ellipse cx="120" cy="58" rx="64" ry="22" fill={col.f} stroke={col.s} strokeWidth="1.6" />
      <ellipse cx="120" cy="58" rx="40" ry="13" fill="none" stroke={col.c} strokeWidth="1" />
      <ellipse cx="120" cy="58" rx="16" ry="5" fill="none" stroke={col.c} strokeWidth="1" />
      <path d="M120 58 L120 26 M104 52 L120 28 M136 52 L120 28" stroke={col.s} strokeWidth="1" />
      <circle cx="120" cy="25" r="3" fill={col.a} />
    </g>
  );
}

function Kepler({ col }) {
  return (
    <g strokeLinejoin="round" transform="rotate(-16 120 100)">
      <path d="M52 64 L86 44 L86 156 L52 170 Z" fill={col.c} stroke={col.s} strokeWidth="1.3" />
      <path d="M60 60 L60 166 M70 54 L70 162 M78 50 L78 158" stroke={col.s} strokeWidth="0.5" opacity="0.5" />
      <rect x="92" y="54" width="56" height="96" rx="6" fill={col.f} stroke={col.s} strokeWidth="1.5" />
      <path d="M92 54 L148 54 L160 28 L104 34 Z" fill={col.f2} stroke={col.s} strokeWidth="1.3" />
      <path d="M96 150 L144 150 L150 166 L90 166 Z" fill={col.d} stroke={col.s} strokeWidth="1.2" />
      <path d="M92 90 L148 90 M92 120 L148 120" stroke={col.s} strokeWidth="0.6" opacity="0.6" />
    </g>
  );
}

function Voyager({ col }) {
  return (
    <g strokeLinejoin="round">
      <path d="M140 86 L236 34" stroke={col.s} strokeWidth="0.9" />
      <rect x="226" y="34" width="10" height="6" fill={col.f2} stroke={col.s} strokeWidth="0.8" transform="rotate(-28 231 37)" />
      <path d="M100 90 L36 122" stroke={col.s} strokeWidth="1.5" />
      {[44, 58, 72].map((x, i) => (
        <rect key={x} x={x} y={110 - i * 7} width="12" height="8" rx="2" fill={col.f2} stroke={col.s} strokeWidth="1" transform={`rotate(-26 ${x + 6} ${114 - i * 7})`} />
      ))}
      <path d="M140 94 L188 130" stroke={col.s} strokeWidth="1.5" />
      <rect x="182" y="126" width="20" height="12" fill={col.f} stroke={col.s} strokeWidth="1" />
      <rect x="98" y="76" width="44" height="20" fill={col.f2} stroke={col.s} strokeWidth="1.4" />
      <circle cx="132" cy="86" r="5" fill={col.a} stroke={col.s} strokeWidth="0.8" />
      <ellipse cx="120" cy="56" rx="66" ry="21" fill={col.f} stroke={col.s} strokeWidth="1.6" />
      <ellipse cx="120" cy="56" rx="42" ry="13" fill="none" stroke={col.c} strokeWidth="1" />
      <path d="M120 56 L120 28 M100 50 L120 30 M140 50 L120 30" stroke={col.s} strokeWidth="1" />
    </g>
  );
}

const SHAPES = { lm: Lm, surveyor: Surveyor, lrv: Lrv, mer: Mer, viking: Viking, pathfinder: Pathfinder, pioneer: Pioneer, kepler: Kepler, voyager: Voyager };

export default function DeviceSilhouette({ deviceId, variant = "ghost", className = "", style }) {
  const kind = KIND_BY_ID[deviceId] ?? "lm";
  const Shape = SHAPES[kind];
  const col = variant === "hero" ? HERO[kind] ?? HERO.lm : GHOST;
  return (
    <svg viewBox="0 0 240 180" className={className} style={style} aria-hidden="true">
      {variant === "hero" && !["pioneer", "kepler", "voyager"].includes(kind) && <ellipse cx="120" cy="172" rx="96" ry="6" fill="rgba(0,0,0,0.45)" />}
      <Shape col={col} />
    </svg>
  );
}
