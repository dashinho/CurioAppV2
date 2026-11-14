import { useCallback, useEffect, useRef, useState } from "react";
import { sound } from "../audio/SoundEngine";

/**
 * Types `text` out character by character, firing a robot "tick" per character.
 * Pauses longer on punctuation so C.U.R.I.O. sounds like it's thinking.
 */
export function useTypewriter(text, { speed = 24, enabled = true, onDone } = {}) {
  const [count, setCount] = useState(0);
  const timer = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    clearTimeout(timer.current);
    setCount(0);
    if (!enabled || !text) return;
    let i = 0;
    const step = () => {
      i += 1;
      setCount(i);
      const ch = text[i - 1];
      if (ch && ch !== " ") sound.typeTick(ch);
      if (i >= text.length) {
        doneRef.current?.();
        return;
      }
      const delay = /[.!?]/.test(ch) ? speed * 9 : /[,;:]/.test(ch) ? speed * 4 : ch === "." ? speed * 3 : speed;
      timer.current = setTimeout(step, delay);
    };
    timer.current = setTimeout(step, 260);
    return () => clearTimeout(timer.current);
  }, [text, speed, enabled]);

  const skip = useCallback(() => {
    if (!text || count >= text.length) return;
    clearTimeout(timer.current);
    setCount(text.length);
    doneRef.current?.();
  }, [text, count]);

  return { shown: text ? text.slice(0, count) : "", done: !!text && count >= text.length, skip };
}
