import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotion } from "@/hooks/useMotion";

/* =========================================================================
   BootSequence — the opening move.

   A full-screen terminal streams real commands against Vedant's real repos,
   then DOCKS: the same element travels down into the editor's bottom-panel
   slot as one continuous move, so the terminal the reader was just watching
   becomes the TERMINAL tab. SerialMonitor then owns that rect and renders
   the same scrollback (it imports BOOT_LINES from here), which is what makes
   the hand-off invisible.

     <BootSequence onDone={() => setBooted(true)} />

   onDone fires EXACTLY once, whichever path was taken: finished, skipped,
   or motion-off.
   ========================================================================= */

/* ---------- tone -> class ------------------------------------------------
   Terminal semantics only. These classes live in index.css and must never
   be used in page content. `cmd` is the default editor foreground. */
export const TONE_CLASS = {
  dim: "term-dim",
  ok: "term-ok",
  warn: "term-warn",
  path: "term-path",
  tag: "text-primary",
  cmd: "",
};

const s = (text, tone = "cmd") => ({ text, tone });

/** A prompt line: `$ ` prints instantly, the command types out. */
function prompt(parts) {
  return build("prompt", [s("$ ", "dim"), ...parts]);
}

/** An output line: printed whole, after a short beat. */
function output(parts) {
  return build("output", parts);
}

function build(type, parts) {
  const text = parts.map((p) => p.text).join("");
  return {
    type,
    parts,
    text,
    length: text.length,
    // How many characters are visible the instant the line appears.
    typeStart: type === "prompt" ? 2 : text.length,
  };
}

/* ---------- the script ---------------------------------------------------
   Real commands. The platformio line is the deliberate bridge into the
   SERIAL MONITOR panel. */
export const BOOT_LINES = [
  prompt([
    s("git clone "),
    s("https://github.com/DagaVedant/vedant-portfolio.git", "path"),
  ]),
  output([s("Cloning into 'vedant-portfolio'...", "dim")]),
  output([s("remote: Enumerating objects: 1247, ", "dim"), s("done.", "ok")]),
  output([
    s("Receiving objects: ", "dim"),
    s("100%", "ok"),
    s(" (1247/1247), 4.21 MiB | 6.02 MiB/s, done.", "dim"),
  ]),
  prompt([s("cd vedant-portfolio && npm install")]),
  output([s("added 412 packages in 3.2s", "dim")]),
  prompt([s("git log --oneline -3")]),
  output([s("bc4eb33", "warn"), s(" reworked tennis ball", "dim")]),
  output([s("a71019c", "warn"), s(" update README", "dim")]),
  output([
    s("b29eeef", "warn"),
    s(" switch portfolio to a light blue theme", "dim"),
  ]),
  prompt([s("npm run dev")]),
  output([
    s("  ", "dim"),
    s("VITE v6.1.0", "ok"),
    s("  ready in ", "dim"),
    s("340 ms", "ok"),
  ]),
  output([s("  ->  Local:   ", "dim"), s("http://localhost:5173/", "path")]),
  prompt([s("pio device monitor --baud 115200")]),
  output([
    s("--- ", "dim"),
    s("Connected", "ok"),
    s(" to ", "dim"),
    s("/dev/ttyUSB0", "path"),
    s(" at 115200 baud", "dim"),
  ]),
  output([
    s("[gardenbuddy] ", "tag"),
    s("soil=", "dim"),
    s("41.2%"),
    s("  temp=", "dim"),
    s("22.8C"),
    s("  hum=", "dim"),
    s("57%"),
    s("  lux=", "dim"),
    s("812"),
  ]),
  output([
    s("[gardenbuddy] ", "tag"),
    s("lstm-classifier "),
    s("ready", "ok"),
    s(" (ollama: llama3.2)", "dim"),
  ]),
  prompt([s("code .")]),
];

/* ---------- timing -------------------------------------------------------
   ~4.9s of script + a 700ms dock. Long enough to read, short enough not to
   annoy. Every delay is scaled by SPEED_REPLAY on later loads in the same
   session. */
const CHAR_DELAY = 14; // per typed character
const PROMPT_LEAD = 80; // beat after `$ ` appears, before typing starts
const PROMPT_PAUSE = 170; // beat after a command finishes typing
const FINAL_PAUSE = 380; // beat after the very last line, before docking
const OUT_DELAY = 90; // beat between printed output lines
const DOCK_MS = 700;
const SPEED_REPLAY = 1 / 6; // "vd-booted" already set -> ~6x
const SESSION_KEY = "vd-booted";

/** Fired once, on every exit path, the instant the boot is over. */
export const BOOT_DONE_EVENT = "vd-boot-done";

/** The shell prompt the docked terminal rests on. Kept here so the panel
    that inherits the scrollback prints the same one. */
export const BOOT_PROMPT = "$";

/* The whole sequence flattened into publishable frames. Precomputed once so
   the runtime is a single timer chain with nothing to reason about: publish
   STEPS[k], wait STEPS[k].delay, k++. The pause after a command lands
   BETWEEN frames, so the next line does not appear early. */
const STEPS = (() => {
  const out = [];
  BOOT_LINES.forEach((ln, i) => {
    if (ln.type === "output") {
      out.push({ line: i, chars: ln.length, delay: OUT_DELAY, typing: false });
      return;
    }
    out.push({ line: i, chars: ln.typeStart, delay: PROMPT_LEAD, typing: false });
    for (let c = ln.typeStart + 1; c <= ln.length; c += 1) {
      out.push({ line: i, chars: c, delay: CHAR_DELAY, typing: true });
    }
    const last = out[out.length - 1];
    last.delay = PROMPT_PAUSE;
    last.typing = false; // caret resumes blinking once the line is idle
  });
  if (out.length) out[out.length - 1].delay = FINAL_PAUSE;
  return out;
})();

const LAST_FRAME = STEPS.length
  ? { line: BOOT_LINES.length - 1, chars: BOOT_LINES[BOOT_LINES.length - 1].length, typing: false }
  : { line: 0, chars: 0, typing: false };

/** Storage throws in private mode. */
function alreadyBooted() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markBooted() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* no-op */
  }
}

/* ---------- rendering ---------------------------------------------------- */

/** Renders the first `chars` characters of a line, across its coloured parts. */
function Line({ line, chars, caret, typing }) {
  const nodes = [];
  let budget = chars;

  for (let i = 0; i < line.parts.length && budget > 0; i += 1) {
    const part = line.parts[i];
    const slice = part.text.slice(0, budget);
    budget -= slice.length;
    const cls = TONE_CLASS[part.tone] || "";
    nodes.push(
      <span key={i} className={cls}>
        {slice}
      </span>
    );
  }

  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        minHeight: "1.55em",
      }}
    >
      {nodes}
      {caret ? (
        <span
          className="caret-blink"
          style={typing ? { animation: "none", opacity: 1 } : undefined}
        />
      ) : null}
    </div>
  );
}

export default function BootSequence({ onDone }) {
  const motion = useMotion();

  // "boot" -> streaming full-screen | "dock" -> travelling | "done"
  const [phase, setPhase] = useState("boot");
  const [frame, setFrame] = useState(() => ({ line: 0, chars: 0, typing: false }));

  const scrollRef = useRef(null);
  const timerRef = useRef(0);
  const rafRef = useRef(0);
  const aliveRef = useRef(true);
  const doneRef = useRef(false); // the onDone latch
  const skipRef = useRef(() => {});
  // Read once and remembered, so StrictMode's double-invoked effect in dev
  // doesn't see the flag its own first pass just wrote and run at 6x.
  const replayRef = useRef(null);

  // Refs so the driver effect can run once with an empty dep list and never
  // restart mid-sequence.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const motionRef = useRef(motion);
  motionRef.current = motion;

  /* ---- timers ---- */
  const clearTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  };

  /* ---- the single exit ---- */
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();

    // The one guaranteed "boot is over" signal, whichever path got here:
    // finished, skipped, or motion-off. SerialMonitor uses it to hand the
    // panel from TERMINAL over to the live SERIAL MONITOR tab.
    try {
      window.dispatchEvent(new CustomEvent(BOOT_DONE_EVENT));
    } catch {
      /* no-op */
    }

    const fn = onDoneRef.current;
    if (typeof fn === "function") fn();
  };

  /* ---- driver ---- */
  useEffect(() => {
    aliveRef.current = true;
    if (replayRef.current === null) replayRef.current = alreadyBooted();
    const replay = replayRef.current;
    markBooted();

    // Motion off: the completed final frame, already docked, then out.
    if (!motionRef.current) {
      setFrame(LAST_FRAME);
      setPhase("done");
      timerRef.current = window.setTimeout(() => {
        if (aliveRef.current) finish();
      }, 0);
      return () => {
        aliveRef.current = false;
        clearTimers();
      };
    }

    const speed = replay ? SPEED_REPLAY : 1;

    /** Jump to the docked end state without animating. */
    const skip = () => {
      if (doneRef.current) return;
      clearTimers();
      setFrame(LAST_FRAME);
      setPhase("done");
      // Next tick so the docked frame paints before the parent unmounts us.
      timerRef.current = window.setTimeout(() => {
        if (aliveRef.current) finish();
      }, 0);
    };
    skipRef.current = skip;

    /** The dock: one continuous 700ms move into the panel rect. */
    const dock = () => {
      if (!aliveRef.current || doneRef.current) return;
      setPhase("dock");

      // Let anyone listening (the IDE chrome) start fading in during the
      // second half of the move — onDone only fires at the end.
      try {
        window.dispatchEvent(
          new CustomEvent("vd-boot-dock", { detail: { duration: DOCK_MS } })
        );
      } catch {
        /* no-op */
      }

      // Keep the scrollback pinned to the bottom while the box shrinks, so
      // the terminal settles onto its last few lines instead of clipping.
      const started = performance.now();
      const pin = () => {
        if (!aliveRef.current) return;
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
        if (performance.now() - started < DOCK_MS + 60) {
          rafRef.current = window.requestAnimationFrame(pin);
        }
      };
      rafRef.current = window.requestAnimationFrame(pin);

      timerRef.current = window.setTimeout(() => {
        if (!aliveRef.current) return;
        setPhase("done");
        finish();
      }, DOCK_MS);
    };

    let k = 0;
    const tick = () => {
      if (!aliveRef.current || doneRef.current) return;
      if (k >= STEPS.length) {
        dock();
        return;
      }
      const step = STEPS[k];
      k += 1;
      setFrame({ line: step.line, chars: step.chars, typing: step.typing });

      // A touch of jitter on keystrokes so it reads as a person typing.
      const jitter = step.typing ? 0.7 + Math.random() * 0.7 : 1;
      timerRef.current = window.setTimeout(tick, step.delay * jitter * speed);
    };

    tick();

    return () => {
      aliveRef.current = false;
      clearTimers();
    };
  }, []);

  /* ---- skip: click anywhere, any key, or the visible control ---- */
  useEffect(() => {
    if (!motionRef.current) return undefined;

    const onSkip = () => skipRef.current();
    window.addEventListener("keydown", onSkip);
    window.addEventListener("pointerdown", onSkip);
    return () => {
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("pointerdown", onSkip);
    };
  }, []);

  /* ---- keep the newest line in view while streaming ---- */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [frame]);

  const docked = phase !== "boot";
  const visible = BOOT_LINES.slice(0, frame.line + 1);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: docked ? "var(--ide-left)" : 0,
        right: 0,
        bottom: docked ? "var(--ide-statusbar)" : 0,
        top: "auto",
        height: docked ? "var(--ide-panelh)" : "100vh",
        zIndex: 100,
        // The ground morphs from the editor background to the panel ground,
        // so the overlay settles into the panel rather than sitting on it.
        backgroundColor: docked
          ? "hsl(var(--ide-panel))"
          : "hsl(var(--background))",
        borderTop: `1px solid ${docked ? "hsl(var(--ide-line))" : "transparent"}`,
        overflow: "hidden",
        // Once the dock starts the page beneath is live again.
        pointerEvents: phase === "boot" ? "auto" : "none",
        transition:
          phase === "dock"
            ? [
                `height ${DOCK_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                `bottom ${DOCK_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                `left ${DOCK_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                `padding ${DOCK_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                `font-size ${DOCK_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                `background-color ${DOCK_MS}ms ease-in-out`,
                `border-color ${DOCK_MS}ms ease-in-out`,
              ].join(", ")
            : "none",
      }}
    >
      <div
        ref={scrollRef}
        style={{
          height: "100%",
          overflow: "hidden",
          padding: docked
            ? "10px 16px 12px"
            : "clamp(28px, 7vh, 72px) clamp(20px, 6vw, 72px)",
          fontFamily: "var(--font-mono)",
          fontWeight: 400,
          fontSize: docked ? "12px" : "clamp(11.5px, 2.5vw, 13.5px)",
          lineHeight: 1.55,
          color: "hsl(var(--foreground))",
          fontVariantLigatures: "none",
          transition: "inherit",
        }}
      >
        {visible.map((ln, i) => (
          <Line
            key={i}
            line={ln}
            chars={i < frame.line ? ln.length : frame.chars}
            caret={i === frame.line && phase !== "done"}
            typing={i === frame.line && frame.typing}
          />
        ))}
      </div>

      {/* Visible skip affordance. Deliberately NOT a <button>: the overlay is
          aria-hidden, so nothing inside it may be focusable. Keyboard users
          are already served — any keypress skips. */}
      {phase === "boot" ? (
        <div
          tabIndex={-1}
          onPointerDown={() => skipRef.current()}
          style={{
            position: "absolute",
            right: "clamp(16px, 4vw, 28px)",
            bottom: "clamp(14px, 3vh, 24px)",
            fontFamily: "var(--font-mono)",
            fontSize: "11.5px",
            letterSpacing: "0.04em",
            color: "hsl(var(--term-dim))",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          press any key to skip
        </div>
      ) : null}
    </div>
  );
}
