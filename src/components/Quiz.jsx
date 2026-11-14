import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, X } from "lucide-react";
import { fillTemplate } from "../data/missionData";
import { sound } from "../audio/SoundEngine";
import CurioAvatar from "./CurioAvatar";
import Dialogue from "./Dialogue";
import HudButton from "./HudButton";
import HudFrame from "./HudFrame";

const OPENER = "Before I can stamp your Explorer Passport for this world, let's see what you remember about this brave little machine!";

/** End-of-story memory check. Calls onPass() once every question is answered correctly. */
export default function Quiz({ quiz, name, onPass, alreadyStamped = false }) {
  const [started, setStarted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [qi, setQi] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);

  const q = quiz.questions[qi];
  const last = qi === quiz.questions.length - 1;

  const choose = (opt) => {
    if (correct || wrong.includes(opt.id)) return;
    if (opt.id === q.correctOptionId) {
      sound.chime();
      setCorrect(true);
      setFeedback({ kind: "ok", text: q.correctMessage });
      if (last) setTimeout(() => onPass(), 2200);
    } else {
      sound.error();
      setWrong((w) => [...w, opt.id]);
      setShakeKey((k) => k + 1);
      setFeedback({ kind: "hint", text: q.wrongHints[opt.id] ?? "Not quite. Think back to the story!" });
    }
  };

  const next = () => {
    setQi((i) => i + 1);
    setWrong([]);
    setCorrect(false);
    setFeedback(null);
  };

  return (
    <HudFrame className="hud-glass rounded-sm p-6 md:p-10" label="MEMORY CHECK">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <CurioAvatar size={120} speaking={speaking} mood={feedback?.kind === "ok" ? "happy" : "idle"} className="shrink-0" />
        <div className="flex-1">
          <Dialogue
            text={feedback ? feedback.text : started ? `${fillTemplate(quiz.intro, { name })}` : OPENER}
            onSpeakingChange={setSpeaking}
            textClassName="text-lg md:text-xl"
            channel={started ? `QUESTION ${qi + 1} / ${quiz.questions.length}` : "PASSPORT CONTROL"}
          >
            {!started && (
              <HudButton variant="primary" onClick={() => setStarted(true)}>
                {alreadyStamped ? "Replay the quiz" : "I'm ready"} <ChevronRight size={14} />
              </HudButton>
            )}
          </Dialogue>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {started && (
          <motion.div key={q.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8">
            <p className="font-mono text-[10px] tracking-[0.3em] text-amber">
              QUESTION {qi + 1} OF {quiz.questions.length}
            </p>
            <h4 className="mt-2 font-serif text-3xl leading-tight text-parchment md:text-4xl">{q.question}</h4>
            <motion.div
              key={shakeKey}
              animate={shakeKey ? { x: [0, -10, 9, -6, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="mt-6 grid gap-3"
            >
              {q.options.map((opt, i) => {
                const isWrong = wrong.includes(opt.id);
                const isRight = correct && opt.id === q.correctOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isWrong || correct}
                    onMouseEnter={() => !isWrong && !correct && sound.hover()}
                    onClick={() => choose(opt)}
                    className={`group flex items-center gap-4 border px-4 py-3.5 text-left transition-all duration-200 ${
                      isRight
                        ? "border-ok bg-ok/10 text-parchment"
                        : isWrong
                          ? "border-alert/50 bg-alert/5 text-parchment/40 line-through decoration-alert/50"
                          : correct
                            ? "border-white/10 text-parchment/40"
                            : "cursor-pointer border-white/15 text-parchment/85 hover:border-amber/70 hover:bg-amber/5"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[11px] ${
                        isRight ? "border-ok text-ok" : isWrong ? "border-alert/60 text-alert" : "border-white/25 text-parchment/60 group-hover:border-amber group-hover:text-amber"
                      }`}
                    >
                      {isRight ? <Check size={14} /> : isWrong ? <X size={14} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base md:text-[17px]">{opt.text}</span>
                  </button>
                );
              })}
            </motion.div>
            <AnimatePresence>
              {correct && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
                  {last ? (
                    <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-amber">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber" />
                      {alreadyStamped ? "RE-VERIFYING STAMP…" : "PRESSING YOUR STAMP…"}
                    </span>
                  ) : (
                    <HudButton variant="primary" onClick={next}>
                      Next question <ChevronRight size={14} />
                    </HudButton>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </HudFrame>
  );
}
