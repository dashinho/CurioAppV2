import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { destinations } from "./data/missionData";
import { useProfile } from "./context/ProfileContext";
import { sound } from "./audio/SoundEngine";
import { formatCoords } from "./lib/mission";
import Starfield from "./components/Starfield";
import HudBar from "./components/HudBar";
import PassportModal from "./components/PassportModal";
import TravelOverlay from "./components/TravelOverlay";
import SplashView from "./views/SplashView";
import OnboardingView from "./views/OnboardingView";
import HubView from "./views/HubView";
import SurfaceView from "./views/SurfaceView";
import StoryView from "./views/StoryView";

const TRAVEL_MS = 2800;

function locationLabel(screen, dest) {
  if (screen === "hub") return "MISSION MAP · HIGH EARTH ORBIT";
  if (!dest) return "";
  const last = dest.heroDevice.chapters[dest.heroDevice.chapters.length - 1].metadata.location;
  const coords = formatCoords(last);
  const where = dest.surfaceName.split("(")[0].trim().toUpperCase();
  if (coords) return `LOC · ${where} · ${coords}`;
  if (last.distanceFromEarthKm) return `LOC · ${where} · ${(last.distanceFromEarthKm / 1e9).toFixed(2)} BILLION KM FROM EARTH`;
  return `LOC · ${where}`;
}

export default function App() {
  const { profile } = useProfile();
  const [screen, setScreen] = useState("splash"); // splash | onboarding | hub | surface | story
  const [destId, setDestId] = useState(null);
  const [travelTo, setTravelTo] = useState(null);
  const [passportOpen, setPassportOpen] = useState(false);
  const [stampPulse, setStampPulse] = useState(0);
  const returning = useRef(!!profile.name).current;
  const timers = useRef([]);

  const dest = useMemo(() => destinations.find((d) => d.id === destId) ?? null, [destId]);
  const travelDest = useMemo(() => destinations.find((d) => d.id === travelTo) ?? null, [travelTo]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const show = useCallback((next) => {
    setScreen(next);
    window.scrollTo({ top: 0 });
  }, []);

  const travel = useCallback(
    (id) => {
      if (travelTo) return;
      setTravelTo(id);
      sound.whoosh(TRAVEL_MS / 1000 + 0.4);
      timers.current.push(
        setTimeout(() => {
          setDestId(id);
          show("surface");
        }, TRAVEL_MS - 400),
        setTimeout(() => setTravelTo(null), TRAVEL_MS)
      );
    },
    [travelTo, show]
  );

  const toHub = useCallback(() => {
    sound.whoosh(1.4);
    show("hub");
  }, [show]);

  const openPassport = useCallback(() => setPassportOpen(true), []);

  const view = (() => {
    switch (screen) {
      case "splash":
        return <SplashView onEnter={() => show(profile.name ? "hub" : "onboarding")} />;
      case "onboarding":
        return <OnboardingView onComplete={() => show("hub")} />;
      case "hub":
        return <HubView onSelect={travel} returning={returning} />;
      case "surface":
        return dest && <SurfaceView destination={dest} onBack={toHub} onDiscover={() => { sound.whoosh(1.2); show("story"); }} />;
      case "story":
        return (
          dest && (
            <StoryView
              destination={dest}
              onBack={() => show("surface")}
              onHub={toHub}
              onOpenPassport={openPassport}
              onStamped={() => setStampPulse((n) => n + 1)}
            />
          )
        );
      default:
        return null;
    }
  })();

  return (
    <div className="relative min-h-screen bg-obsidian text-parchment">
      <Starfield warp={!!travelTo} />
      <HudBar onOpenPassport={openPassport} location={locationLabel(screen, dest)} stampPulse={stampPulse} />

      <div className="transition-opacity duration-700" style={{ opacity: travelTo ? 0 : 1 }}>
      <AnimatePresence mode="wait">
        <motion.main
          key={`${screen}-${destId ?? ""}`}
          className="relative z-10"
          // opacity only: a filter/transform here would break position:fixed children
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        >
          {view}
        </motion.main>
      </AnimatePresence>
      </div>

      <AnimatePresence>{travelDest && <TravelOverlay destination={travelDest} name={profile.name} duration={TRAVEL_MS / 1000} />}</AnimatePresence>
      <PassportModal open={passportOpen} onClose={() => setPassportOpen(false)} />

      <div className="film-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </div>
  );
}
