import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock, Radar } from "lucide-react";
import { destinations, fillTemplate } from "../data/missionData";
import { useProfile } from "../context/ProfileContext";
import CurioAvatar from "../components/CurioAvatar";
import Dialogue from "../components/Dialogue";
import HudFrame from "../components/HudFrame";
import PlanetOrb from "../components/PlanetOrb";
import Patch from "../components/Patch";
import { sound } from "../audio/SoundEngine";

function hubLine(name, count, returning) {
  if (count === 3) return `Your passport is full, Astronaut ${name}! Open it from the top right. Something's waiting for you in there.`;
  if (returning && count === 0) return `Welcome back, Astronaut ${name}. The machines are still out there, waiting. Pick a world. I'd start with the Moon. It's closest.`;
  if (count === 0) return `Here's the map, Astronaut ${name}. Three worlds, three machines with a story to tell. I'd start with the Moon. It's closest.`;
  return `${count} stamp${count > 1 ? "s" : ""} down, ${3 - count} to go, Astronaut ${name}. Where to next?`;
}

function DestinationCard({ dest, index, stamped, onSelect }) {
  const [hover, setHover] = useState(false);
  const reward = dest.heroDevice.stampReward;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => {
        setHover(true);
        sound.hover();
      }}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        sound.click();
        onSelect(dest.id);
      }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden border border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-left transition-colors hover:border-white/40"
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] tracking-[0.3em] text-parchment/50">0{dest.order} // DESTINATION</span>
        <span
          className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] tracking-[0.2em] ${
            stamped ? "border-ok/50 text-ok" : "border-white/20 text-parchment/55"
          }`}
        >
          {stamped ? <Check size={11} /> : <Lock size={11} />} STAMP · {stamped ? "COMPLETED" : "LOCKED"}
        </span>
      </div>

      <div className="relative my-6 flex flex-1 items-center justify-center">
        <PlanetOrb id={dest.id} size={190} active={hover} />
        {stamped && (
          <motion.div initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute bottom-0 right-2">
            <Patch svg={reward.patch.svg} size={78} title={reward.title} style={{ transform: `rotate(${reward.ink.rotationDeg}deg)` }} />
          </motion.div>
        )}
      </div>

      <h3 className="font-serif text-5xl leading-none text-parchment">{dest.name}</h3>
      <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-parchment/50">{dest.surfaceName.toUpperCase()}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-signal">
          <Radar size={13} className="animate-pulse" /> 1 SIGNAL · {dest.backgroundDevices.length} LOCKED
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.2em] text-amber opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100">
          SET COURSE <ChevronRight size={13} />
        </span>
      </div>
    </motion.button>
  );
}

export default function HubView({ onSelect, returning }) {
  const { profile, stampCount, hasStamp } = useProfile();
  const [speaking, setSpeaking] = useState(false);

  return (
    <div className="relative mx-auto min-h-screen max-w-7xl px-5 pb-16 pt-24 md:px-8">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <CurioAvatar size={120} speaking={speaking} />
        <div className="max-w-2xl flex-1">
          <p className="hud-label">Mission map · Select a world</p>
          <Dialogue text={fillTemplate(hubLine(profile.name, stampCount, returning), {})} onSpeakingChange={setSpeaking} textClassName="text-lg md:text-xl" />
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {destinations.map((d, i) => (
          <DestinationCard key={d.id} dest={d} index={i} stamped={hasStamp(d.id)} onSelect={onSelect} />
        ))}
      </div>

      <HudFrame className="mt-10 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <p className="font-mono text-[10px] leading-5 tracking-[0.18em] text-parchment/45">
          ALL DEVICES, DATES AND COORDINATES FROM NASA NSSDCA AND NASA SCIENCE MISSION ARCHIVES · 3D MODELS: NASA 3D RESOURCES
        </p>
        <p className="font-mono text-[10px] tracking-[0.18em] text-parchment/45">STAMPS {stampCount}/3</p>
      </HudFrame>
    </div>
  );
}
