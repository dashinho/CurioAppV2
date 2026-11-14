import { useMemo, useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import HudButton from "./HudButton";
import { uniquifySvg } from "./Patch";
import { destinations } from "../data/missionData";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

const CAPTIONS = {
  moon: ["EAGLE", "THE MOON · 1969"],
  mars: ["OPPORTUNITY", "MARS · 2004–2018"],
  deepSpace: ["PIONEER 10", "DEEP SPACE · 1972–2003"],
};

/** Builds the certificate as one standalone SVG string (used for screen, print and PNG). */
export function buildCertificateSvg({ name, passportNo, stamps }) {
  const W = 1600;
  const H = 1130;
  const ink = "#1b1d26";
  const gold = "#b8892f";
  const issued = fmtDate(new Date().toISOString());
  const certNo = `${passportNo || "CURIO-0000"}-RH`;

  const patches = destinations
    .map((d, i) => {
      const x = 380 + i * 320;
      const y = 694;
      const reward = d.heroDevice.stampReward;
      const svg = uniquifySvg(reward.patch.svg, `cert${i}`).replace(
        "<svg ",
        `<svg x="${x - 95}" y="${y - 95}" width="190" height="190" `
      );
      const [top, bottom] = CAPTIONS[d.id];
      const when = stamps[d.id]?.awardedAt ? `STAMPED ${fmtDate(stamps[d.id].awardedAt)}` : "";
      return `
      <g>
        <circle cx="${x}" cy="${y}" r="104" fill="none" stroke="${gold}" stroke-width="1.5" stroke-dasharray="2 5"/>
        ${svg}
        <text x="${x}" y="${y + 140}" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="19" font-weight="700" letter-spacing="4" fill="${ink}">${top}</text>
        <text x="${x}" y="${y + 166}" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="14" letter-spacing="3" fill="${ink}" opacity="0.7">${bottom}</text>
        <text x="${x}" y="${y + 188}" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="11" letter-spacing="2" fill="${gold}">${when}</text>
      </g>`;
    })
    .join("");

  const corner = (x, y, sx, sy) =>
    `<path d="M${x} ${y + 40 * sy} L${x} ${y} L${x + 40 * sx} ${y}" fill="none" stroke="${gold}" stroke-width="3"/>
     <circle cx="${x + 14 * sx}" cy="${y + 14 * sy}" r="3" fill="${gold}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="certPaper" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0" stop-color="#fbf7ec"/>
      <stop offset="1" stop-color="#ece3cc"/>
    </radialGradient>
    <pattern id="certGuilloche" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="12" fill="none" stroke="${gold}" stroke-width="0.4" opacity="0.25"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#certPaper)"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="url(#certGuilloche)" opacity="0.5"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${gold}" stroke-width="3"/>
  <rect x="58" y="58" width="${W - 116}" height="${H - 116}" fill="none" stroke="${ink}" stroke-width="1"/>
  ${corner(76, 76, 1, 1)}${corner(W - 76, 76, -1, 1)}${corner(76, H - 76, 1, -1)}${corner(W - 76, H - 76, -1, -1)}

  <text x="${W / 2}" y="132" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="15" letter-spacing="6" fill="${ink}" opacity="0.75">C.U.R.I.O. ARCHIVE  ·  CERTIFICATE NO. ${esc(certNo)}</text>
  <text x="${W / 2}" y="248" text-anchor="middle" font-family="'Instrument Serif', 'Playfair Display', Georgia, serif" font-size="112" fill="${ink}">Space Relic Historian</text>
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="17" letter-spacing="10" fill="${gold}">CERTIFICATE OF COMPLETION</text>

  <text x="${W / 2}" y="372" text-anchor="middle" font-family="'Instrument Serif', Georgia, serif" font-style="italic" font-size="34" fill="${ink}" opacity="0.8">This certifies that</text>
  <text x="${W / 2}" y="452" text-anchor="middle" font-family="'Instrument Serif', 'Playfair Display', Georgia, serif" font-size="84" fill="${ink}">Astronaut ${esc(name)}</text>
  <line x1="${W / 2 - 360}" y1="476" x2="${W / 2 + 360}" y2="476" stroke="${gold}" stroke-width="1.5"/>
  <text x="${W / 2}" y="526" text-anchor="middle" font-family="'Instrument Serif', Georgia, serif" font-size="29" fill="${ink}" opacity="0.85">recovered the stories of three brave machines humanity sent ahead and left behind,</text>
  <text x="${W / 2}" y="562" text-anchor="middle" font-family="'Instrument Serif', Georgia, serif" font-size="29" fill="${ink}" opacity="0.85">and made sure their names are remembered.</text>

  ${patches}

  <text x="150" y="${H - 132}" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" letter-spacing="3" fill="${ink}" opacity="0.6">ISSUED</text>
  <text x="150" y="${H - 100}" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="22" letter-spacing="3" fill="${ink}">${issued}</text>
  <text x="150" y="${H - 76}" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="12" letter-spacing="2" fill="${ink}" opacity="0.6">PASSPORT ${esc(passportNo || "")}</text>

  <text x="${W - 150}" y="${H - 112}" text-anchor="end" font-family="'Instrument Serif', Georgia, serif" font-style="italic" font-size="50" fill="${ink}">C.U.R.I.O.</text>
  <line x1="${W - 470}" y1="${H - 96}" x2="${W - 150}" y2="${H - 96}" stroke="${ink}" stroke-width="1"/>
  <text x="${W - 150}" y="${H - 74}" text-anchor="end" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="12" letter-spacing="2" fill="${ink}" opacity="0.7">CARETAKER OF UNHEARD ROBOTS IN ORBIT</text>

  <g transform="translate(${W / 2} ${H - 128})">
    <circle r="46" fill="none" stroke="${gold}" stroke-width="2"/>
    <circle r="38" fill="none" stroke="${gold}" stroke-width="0.8" stroke-dasharray="2 3"/>
    <path d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="${gold}"/>
    <text y="62" text-anchor="middle" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="10" letter-spacing="2" fill="${ink}" opacity="0.55">A NASA SPACE APPS CHALLENGE PROJECT · NOT AN OFFICIAL NASA DOCUMENT</text>
  </g>
</svg>`;
}

export default function Certificate({ profile, onBack }) {
  const svg = useMemo(() => buildCertificateSvg(profile), [profile]);
  const [busy, setBusy] = useState(false);

  const downloadPng = () => {
    setBusy(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 3200;
      canvas.height = 2260;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setBusy(false);
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `space-relic-historian-${profile.name.toLowerCase().replace(/\s+/g, "-")}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, "image/png");
    };
    img.onerror = () => setBusy(false);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <HudButton onClick={onBack}>
          <ArrowLeft size={14} /> Passport
        </HudButton>
        <div className="flex gap-2">
          <HudButton onClick={() => window.print()}>
            <Printer size={14} /> Print
          </HudButton>
          <HudButton variant="primary" onClick={downloadPng} disabled={busy}>
            <Download size={14} /> {busy ? "Rendering…" : "Download PNG"}
          </HudButton>
        </div>
      </div>
      <div
        id="certificate-print"
        className="w-full overflow-hidden rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.6)] [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
