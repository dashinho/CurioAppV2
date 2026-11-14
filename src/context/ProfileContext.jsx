import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { storage } from "../lib/storage";

const KEY = "curio.profile.v1";
const EMPTY = { name: "", passportNo: "", issuedAt: null, stamps: {} };

const ProfileContext = createContext(null);

const cleanName = (raw) =>
  String(raw || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N} \-']/gu, "")
    .trim()
    .slice(0, 16);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => ({ ...EMPTY, ...storage.get(KEY, EMPTY) }));
  const passportButtonRef = useRef(null);

  const save = useCallback((next) => {
    setProfile(next);
    storage.set(KEY, next);
  }, []);

  const setName = useCallback(
    (raw, fallback = "Rookie") => {
      const name = cleanName(raw) || fallback;
      save({
        ...profile,
        name,
        passportNo: profile.passportNo || `CURIO-${String(Math.floor(1000 + Math.random() * 9000))}`,
        issuedAt: profile.issuedAt || new Date().toISOString(),
      });
      return name;
    },
    [profile, save]
  );

  const awardStamp = useCallback(
    (destinationId, reward) => {
      setProfile((prev) => {
        if (prev.stamps[destinationId]) return prev;
        const next = {
          ...prev,
          stamps: {
            ...prev.stamps,
            [destinationId]: { awardedAt: new Date().toISOString(), unlockCode: reward.unlockCode },
          },
        };
        storage.set(KEY, next);
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => save(EMPTY), [save]);

  const value = useMemo(
    () => ({
      profile,
      setName,
      awardStamp,
      reset,
      stampCount: Object.keys(profile.stamps).length,
      hasStamp: (id) => !!profile.stamps[id],
      passportButtonRef,
    }),
    [profile, setName, awardStamp, reset]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);
