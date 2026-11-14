import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sound } from "../audio/SoundEngine";
import { storage } from "../lib/storage";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => storage.get("curio.muted", false));

  useEffect(() => {
    sound.setMuted(muted);
    storage.set("curio.muted", muted);
  }, [muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const value = useMemo(() => ({ sound, muted, toggleMute }), [muted, toggleMute]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useSound = () => useContext(SoundContext);
