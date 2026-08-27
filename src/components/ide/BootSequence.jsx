import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion, setMotion } from "@/hooks/useMotion";

const SESSION_KEY = "vd-booted";

const PROMPT_SECONDS = 5;

const FADE_MS = 420;

const t = (text, tone) => ({ text, tone });

export const BOOT_SCRIPT = [
  { kind: "cmd", text: "git clone https://github.com/DagaVedant/dagavedant.github.io.git" },
  { kind: "out", parts: [t("Cloning into 'dagavedant.github.io'...", "dim")] },
  { kind: "out", parts: [t("remote: Enumerating objects: 1247, done.", "dim")] },
  {
    kind: "out",
    parts: [
      t("Receiving objects: ", "dim"),
      t("100% (1247/1247)", "ok"),
      t(", 4.21 MiB | 6.02 MiB/s, done.", "dim"),
    ],
  },
  { kind: "blank" },
  { kind: "cmd", text: "cd dagavedant.github.io && npm install" },
  { kind: "out", parts: [t("added 412 packages in 3.2s", "dim")] },
  { kind: "blank" },
  { kind: "prompt" },
];

export const BOOT_LINES = BOOT_SCRIPT.filter((l) => l.kind !== "prompt");

const TONE_CLASS = {
  ok: "term-ok",
  warn: "term-warn",
  dim: "term-dim",
  path: "term-path",
  accent: "text-vs-accent",
  text: "text-vs-text",
};

function Line({ line, typed }) {
  if (line.kind === "blank") return <div className="h-[19px]" />;

  if (line.kind === "cmd") {
    return (
      <div className="min-h-[19px]">
        <span className="term-dim">$ </span>
        <span className="text-vs-text">{typed ?? line.text}</span>
      </div>
    );
  }

  return (
    <div className="min-h-[19px]">
      {line.parts.map((p, i) => (
        <span key={i} className={TONE_CLASS[p.tone] || "text-vs-text"}>
          {p.text}
        </span>
      ))}
    </div>
  );
}

export default function BootSequence({ onDone }) {
  const motion = useMotion();

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [answer, setAnswer] = useState(null);
  const [countdown, setCountdown] = useState(PROMPT_SECONDS);
  const [fading, setFading] = useState(false);

  const doneRef = useRef(false);
  const timers = useRef([]);
  const finishTimer = useRef(0);
  const scrollRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    clearTimeout(finishTimer.current);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    onDone?.();
  }, [onDone]);

  const dismiss = useCallback(() => {
    if (doneRef.current || fading) return;
    setFading(true);
    if (!motion) {
      finish();
      return;
    }

    clearTimeout(finishTimer.current);
    finishTimer.current = setTimeout(finish, FADE_MS);
  }, [fading, finish, motion]);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    clearTimers();
    setIndex(BOOT_SCRIPT.length);
    setTyped("");
    dismiss();
  }, [dismiss]);

  useEffect(() => {
    if (motion) return undefined;
    const id = setTimeout(finish, 0);
    return () => clearTimeout(id);
  }, [motion, finish]);

  useEffect(() => {
    if (!motion || doneRef.current) return undefined;
    if (index >= BOOT_SCRIPT.length) {
      later(dismiss, 420);
      return clearTimers;
    }

    const line = BOOT_SCRIPT[index];

    let replay = false;
    try {
      replay = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    const speed = replay ? 6 : 1;

    if (line.kind === "prompt") return undefined;

    if (line.kind === "cmd") {
      if (typed.length < line.text.length) {
        later(() => setTyped(line.text.slice(0, typed.length + 1)), 26 / speed);
      } else {
        later(() => {
          setTyped("");
          setIndex((i) => i + 1);
        }, 240 / speed);
      }
      return clearTimers;
    }

    later(() => setIndex((i) => i + 1), (line.kind === "blank" ? 60 : 110) / speed);
    return clearTimers;
  }, [index, typed, motion, dismiss]);

  const atPrompt = motion && BOOT_SCRIPT[index]?.kind === "prompt" && answer === null;

  useEffect(() => {
    if (!atPrompt) return undefined;

    if (countdown <= 0) {
      setAnswer("Y");
      later(() => setIndex((i) => i + 1), 320);
      return clearTimers;
    }
    later(() => setCountdown((c) => c - 1), 1000);
    return clearTimers;
  }, [atPrompt, countdown]);

  const answerPrompt = useCallback(
    (value) => {
      setAnswer(value);
      if (value === "n") setMotion(false);
      later(() => setIndex((i) => i + 1), 320);
    },
    []
  );

  useEffect(() => {
    if (!motion) return undefined;

    const onKey = (e) => {
      if (atPrompt) {
        if (e.key === "y" || e.key === "Y" || e.key === "Enter") {
          e.preventDefault();
          answerPrompt("Y");
          return;
        }
        if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          answerPrompt("n");
          return;
        }
      }
      if (e.key === "Escape" || !atPrompt) skip();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [atPrompt, answerPrompt, skip, motion]);

  useEffect(
    () => () => {
      clearTimers();
      clearTimeout(finishTimer.current);
    },
    []
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [index, typed, answer]);

  if (!motion) return null;

  const visible = BOOT_SCRIPT.slice(0, Math.min(index + 1, BOOT_SCRIPT.length));

  return (
    <div
      aria-hidden="true"
      onClick={skip}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-vs-editor"
      style={{
        opacity: fading ? 0 : 1,

        pointerEvents: fading ? "none" : "auto",
        transition: fading ? `opacity ${FADE_MS}ms ease` : "none",
      }}
    >
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-hidden px-5 py-3 font-mono text-[12.5px] leading-[19px]"
      >
        {visible.map((line, i) => {
          if (line.kind === "prompt") {
            return (
              <PromptLine
                key={i}
                answer={answer}
                countdown={countdown}
                active={atPrompt}
                onAnswer={answerPrompt}
              />
            );
          }
          const isCurrent = i === index && line.kind === "cmd";
          return (
            <div key={i} className="flex">
              <Line line={line} typed={isCurrent ? typed : undefined} />
              {isCurrent ? <span className="caret-blink caret-solid ml-[1px]" /> : null}
            </div>
          );
        })}
      </div>

      {!fading ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          className="absolute bottom-4 right-5 rounded-[3px] border border-vs-border px-2 py-1 font-mono text-[11px] text-vs-descr transition-colors hover:border-vs-accent hover:text-vs-text"
        >
          skip
        </button>
      ) : null}
    </div>
  );
}

function PromptLine({ answer, countdown, active, onAnswer }) {
  return (
    <div className="min-h-[19px]">
      <div>
        <span className="term-dim">$ </span>
        <span className="text-vs-text">enable motion? </span>
        <span className="term-dim">(Y/n) </span>
        {answer ? (
          <span className="term-ok">{answer}</span>
        ) : (
          <span className="caret-blink caret-solid" />
        )}
      </div>
      {active ? (
        <div className="term-dim">
          {"  → defaulting to Y in "}
          {countdown}
        </div>
      ) : null}
    </div>
  );
}
