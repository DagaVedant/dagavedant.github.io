import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { useMotion } from "@/hooks/useMotion";
import AmbientField from "./AmbientField";
import * as BootSequenceModule from "./BootSequence";

/**
 * SerialMonitor — the IDE's docked bottom panel.
 *
 * Three tabs, three independent live states:
 *   TERMINAL        the boot terminal's end state, kept verbatim so the dock
 *                   transition lands on an identical frame
 *   SERIAL MONITOR  the IoT thread: a sensor log that keeps appending, beside
 *                   a live trace plot. This is the default tab, because it is
 *                   the one that moves.
 *   OUTPUT          the audio-ML thread: a slower training log
 *
 * Every value drifts on summed sines rather than Math.random, so the traces
 * read as instrumentation and not as noise. All timers pause when the document
 * is hidden, and with motion off nothing schedules at all — the panel renders
 * one already-full static frame.
 */

/* ---- cadence + caps ------------------------------------------------------ */

const SERIAL_INTERVAL_MS = 700;
/* Beat between "the boot terminal finished docking" and the panel handing
   itself over to the live SERIAL MONITOR tab. Long enough that the reader
   registers the docked terminal as the same terminal they were watching. */
const HANDOFF_MS = 900;
const SESSION_KEY = "vd-booted";
const OUTPUT_INTERVAL_MS = 1600;
const MAX_ROWS = 40; // hard DOM cap for both logs; oldest rows drop from the head
const SEED_ROWS = 14; // enough to fill the panel on first paint
const EPOCHS = 40;

const TABS = [
  { id: "terminal", label: "TERMINAL" },
  { id: "serial", label: "SERIAL MONITOR" },
  { id: "output", label: "OUTPUT" },
];

/* ---- boot scrollback -----------------------------------------------------
   The boot agent owns BootSequence.jsx; read whatever shape it exports and
   fall back to a local transcript so this panel renders on its own. */

const FALLBACK_BOOT_LINES = [
  "$ git clone git@github.com:DagaVedant/vedant-portfolio.git",
  { text: "Cloning into 'vedant-portfolio'... done.", tone: "dim" },
  "$ npm ci",
  { text: "added 412 packages in 6.1s", tone: "dim" },
  "$ npm run dev",
  { text: "VITE v5.4.2  ready in 318 ms", tone: "ok" },
  { text: "➜  Local:   http://localhost:5173/", tone: "path" },
  "$ pio run -t upload -e esp32dev",
  { text: "Writing at 0x00010000... (100%)", tone: "dim" },
  { text: "esp32: hard resetting via RTS pin", tone: "warn" },
  { text: "[gardenbuddy] serial link established @ 115200 baud", tone: "ok" },
];

const BOOT_LINES = Array.isArray(BootSequenceModule.BOOT_LINES)
  ? BootSequenceModule.BOOT_LINES
  : Array.isArray(BootSequenceModule.default?.BOOT_LINES)
    ? BootSequenceModule.default.BOOT_LINES
    : FALLBACK_BOOT_LINES;

const BOOT_PROMPT =
  typeof BootSequenceModule.BOOT_PROMPT === "string"
    ? BootSequenceModule.BOOT_PROMPT
    : "$";

const BOOT_DONE_EVENT =
  typeof BootSequenceModule.BOOT_DONE_EVENT === "string"
    ? BootSequenceModule.BOOT_DONE_EVENT
    : "vd-boot-done";

/** True when the boot overlay is going to play on THIS load. Read in an
    effect that runs before BootSequence's own effect writes the flag. */
function bootPending() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

/** Tones that mean "the developer typed this", however the boot agent spells it. */
const COMMAND_TONES = new Set(["cmd", "command", "prompt", "input", "run"]);

const TONE_CLASS = {
  ok: "term-ok",
  success: "term-ok",
  warn: "term-warn",
  warning: "term-warn",
  dim: "term-dim",
  muted: "term-dim",
  path: "term-path",
  url: "term-path",
  tag: "text-primary",
  cmd: "text-foreground",
  command: "text-foreground",
};

/**
 * Boot lines may be plain strings, {text, tone} objects, or the boot agent's
 * richer {type, parts:[{text, tone}]} shape. Accept all three, and keep
 * `parts` when it is there: the dock hand-off only reads as one continuous
 * move if this panel repaints the terminal's LAST FRAME character for
 * character, colour for colour.
 */
function normalizeBootLine(line) {
  if (typeof line === "string") return { text: line, tone: null, parts: null };
  if (line && typeof line === "object") {
    return {
      text: line.text ?? line.line ?? line.content ?? line.value ?? "",
      tone: line.tone ?? line.kind ?? line.type ?? line.variant ?? null,
      parts: Array.isArray(line.parts) && line.parts.length ? line.parts : null,
    };
  }
  return { text: String(line ?? ""), tone: null, parts: null };
}

/* ---- signal generators ---------------------------------------------------- */

const CLOCK_BASE = 12 * 3600 + 4 * 60 + 3; // 12:04:03, then one second per row

function clockAt(index) {
  const total = (CLOCK_BASE + index) % 86400;
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** One sensor sample. Smooth, incommensurate drift — never per-row randomness. */
function serialRow(index) {
  const soil =
    41.2 + 3.9 * Math.sin(index * 0.045) + 1.4 * Math.sin(index * 0.017 + 1.2);
  const temp =
    22.8 + 1.7 * Math.sin(index * 0.031 + 0.4) + 0.6 * Math.sin(index * 0.011);
  const hum =
    57 + 6.2 * Math.sin(index * 0.023 + 2.1) + 2.1 * Math.sin(index * 0.009 + 0.7);
  const lux =
    812 + 196 * Math.sin(index * 0.019 + 0.9) + 74 * Math.sin(index * 0.007);

  return {
    id: index,
    time: clockAt(index),
    soil: soil.toFixed(1),
    temp: temp.toFixed(1),
    hum: Math.round(hum),
    lux: Math.round(lux),
    dry: soil < 38.5,
  };
}

/** One training-log line, plus a header whenever a run wraps. */
function outputRow(index) {
  const run = Math.floor(index / EPOCHS) + 1;
  const epoch = (index % EPOCHS) + 1;

  if (epoch === 1) {
    return {
      id: index,
      kind: "header",
      text: `-- run ${run} · fold ${((run - 1) % 5) + 1}/5 · lr 3.0e-4 · batch 32 --`,
    };
  }

  const phase = run * 0.7;
  const loss =
    0.28 * Math.exp(-epoch * 0.165) + 0.004 + 0.0035 * Math.sin(epoch * 1.7 + phase);
  const acc =
    0.985 - 0.42 * Math.exp(-epoch * 0.19) + 0.004 * Math.sin(epoch * 2.1 + phase);

  return {
    id: index,
    kind: "epoch",
    epoch,
    loss: loss.toFixed(4),
    acc: acc.toFixed(3),
  };
}

/** Prefill so the panel is never an empty box, in either motion mode. */
function seed(builder, count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) rows.push(builder(i));
  return rows;
}

function appendCapped(rows, row) {
  const next = rows.length >= MAX_ROWS ? rows.slice(rows.length - MAX_ROWS + 1) : rows.slice();
  next.push(row);
  return next;
}

/* ---- panel --------------------------------------------------------------- */

export default function SerialMonitor({ bootLines }) {
  const animate = useMotion();
  // TERMINAL first, always: the boot overlay docks onto this exact rect, and
  // the illusion only holds if what it lands on is the same scrollback it was
  // just showing. The hand-off effect below then moves to SERIAL MONITOR --
  // the tab that actually moves -- a beat after the dock settles.
  const [active, setActive] = useState("terminal");
  // Set the moment the reader picks a tab themselves; the scripted hand-off
  // must never yank a tab out from under them.
  const touchedRef = useRef(false);

  const selectTab = useCallback((id) => {
    touchedRef.current = true;
    setActive(id);
  }, []);

  const staticFill = !animate;
  const [serial, setSerial] = useState(() =>
    seed(serialRow, staticFill ? MAX_ROWS : SEED_ROWS)
  );
  const [output, setOutput] = useState(() =>
    seed(outputRow, staticFill ? MAX_ROWS : 9)
  );

  const serialIndex = useRef(serial.length);
  const outputIndex = useRef(output.length);
  const tabRefs = useRef([]);

  /* -- timers: paused while hidden, absent entirely when motion is off ----- */

  useEffect(() => {
    if (!animate) return undefined;

    let serialTimer = 0;
    let outputTimer = 0;

    const start = () => {
      if (!serialTimer) {
        serialTimer = window.setInterval(() => {
          const next = serialRow(serialIndex.current);
          serialIndex.current += 1;
          setSerial((rows) => appendCapped(rows, next));
        }, SERIAL_INTERVAL_MS);
      }
      if (!outputTimer) {
        outputTimer = window.setInterval(() => {
          const next = outputRow(outputIndex.current);
          outputIndex.current += 1;
          setOutput((rows) => appendCapped(rows, next));
        }, OUTPUT_INTERVAL_MS);
      }
    };

    const stop = () => {
      window.clearInterval(serialTimer);
      window.clearInterval(outputTimer);
      serialTimer = 0;
      outputTimer = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [animate]);

  /* -- TERMINAL -> SERIAL MONITOR hand-off --------------------------------
     One timer, armed by exactly one of two mutually exclusive triggers:
       - the boot overlay finished (any exit path: streamed, skipped, or
         motion-off), or
       - there is no boot overlay this load, because it already played
         earlier in this session.
     With motion off nothing is armed at all: the panel stays on TERMINAL and
     both live logs are already rendered full and still. */

  useEffect(() => {
    if (!animate) return undefined;

    let timer = 0;
    const arm = () => {
      if (timer || touchedRef.current) return;
      timer = window.setTimeout(() => {
        timer = 0;
        if (!touchedRef.current) setActive("serial");
      }, HANDOFF_MS);
    };

    window.addEventListener(BOOT_DONE_EVENT, arm);
    if (!bootPending()) arm();

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(BOOT_DONE_EVENT, arm);
    };
  }, [animate]);

  /* -- tablist keyboard nav ------------------------------------------------ */

  const focusTab = useCallback(
    (index) => {
      const tab = TABS[index];
      if (!tab) return;
      selectTab(tab.id);
      const node = tabRefs.current[index];
      if (node) node.focus();
    },
    [selectTab]
  );

  const onTabKeyDown = useCallback(
    (event) => {
      const current = TABS.findIndex((tab) => tab.id === active);
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusTab((current + 1) % TABS.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusTab((current - 1 + TABS.length) % TABS.length);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusTab(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusTab(TABS.length - 1);
      }
    },
    [active, focusTab]
  );

  const latest = serial[serial.length - 1];

  return (
    <section
      aria-label="Editor panel"
      className="fixed z-30 hidden flex-col overflow-hidden border-t md:flex"
      style={{
        left: "var(--ide-left)",
        right: 0,
        bottom: "var(--ide-statusbar)",
        height: "var(--ide-panelh)",
        backgroundColor: "hsl(var(--ide-panel))",
        borderTopColor: "hsl(var(--ide-line))",
      }}
    >
      {/* ---- tab row ---- */}
      <div
        className="flex flex-none items-stretch gap-1 border-b pr-2"
        style={{ borderBottomColor: "hsl(var(--ide-line))" }}
      >
        <div
          role="tablist"
          aria-label="Panel views"
          aria-orientation="horizontal"
          className="flex flex-1 items-stretch"
          onKeyDown={onTabKeyDown}
        >
          {TABS.map((tab, index) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`panel-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-view-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                className="relative px-3 py-[7px] font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors"
                style={{
                  color: selected
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--term-dim))",
                }}
              >
                {tab.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                  style={{
                    backgroundColor: selected
                      ? "hsl(var(--primary))"
                      : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
        <span
          aria-hidden="true"
          className="flex items-center pl-2"
          style={{ color: "hsl(var(--term-dim))" }}
        >
          <Trash2 size={13} strokeWidth={1.6} />
        </span>
      </div>

      {/* ---- views ---- */}
      {active === "terminal" ? (
        <TerminalView lines={bootLines} />
      ) : active === "serial" ? (
        <SerialView rows={serial} latest={latest} />
      ) : (
        <OutputView rows={output} />
      )}
    </section>
  );
}

/* ---- TERMINAL ------------------------------------------------------------ */

function TerminalView({ lines }) {
  const scrollRef = useRef(null);
  const source = Array.isArray(lines) && lines.length ? lines : BOOT_LINES;

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [source]);

  return (
    <div
      role="tabpanel"
      id="panel-view-terminal"
      aria-labelledby="panel-tab-terminal"
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[12px] leading-[1.65]"
    >
      {source.map((line, index) => {
        const { text, tone, parts } = normalizeBootLine(line);

        // Rich shape: replay the boot terminal's own coloured runs verbatim.
        if (parts) {
          return (
            <div key={`${index}-${text}`} className="whitespace-pre-wrap">
              {parts.map((part, i) => (
                <span key={i} className={TONE_CLASS[part.tone] || ""}>
                  {part.text}
                </span>
              ))}
            </div>
          );
        }

        // A command is either tagged as one, or written with the shell's own
        // "$ " prefix. Everything else is machine output and keeps its tone.
        const isCommand = COMMAND_TONES.has(tone) || text.startsWith("$ ");
        const body = text.startsWith("$ ") ? text.slice(2) : text;
        return (
          <div key={`${index}-${text}`} className="whitespace-pre-wrap">
            {isCommand ? (
              <>
                <span className="term-dim">$</span>{" "}
                <span style={{ color: "hsl(var(--foreground))" }}>{body}</span>
              </>
            ) : (
              <span className={TONE_CLASS[tone] || "term-dim"}>{text}</span>
            )}
          </div>
        );
      })}
      <div className="whitespace-pre-wrap">
        <span className="term-dim">{BOOT_PROMPT}</span>{" "}
        <span className="caret-blink" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ---- SERIAL MONITOR ------------------------------------------------------ */

const CHANNELS = ["SOIL", "TEMP", "HUM", "LUX"];

function SerialView({ rows, latest }) {
  return (
    <div
      role="tabpanel"
      id="panel-view-serial"
      aria-labelledby="panel-tab-serial"
      className="flex min-h-0 flex-1"
    >
      {/* log */}
      <div className="flex min-w-0 basis-[55%] flex-col">
        <p className="sr-only">
          A simulated serial feed from the GardenBuddy sensor node, printing soil
          moisture, temperature, humidity and light level about once a second.
          {latest
            ? ` The most recent sample reads soil ${latest.soil} percent, temperature ${latest.temp} degrees Celsius, humidity ${latest.hum} percent, light ${latest.lux} lux.`
            : ""}
        </p>
        <div
          aria-hidden="true"
          className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 py-2 font-mono text-[11.5px] leading-[1.62]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, #000 14%)",
          }}
        >
          {rows.map((row) => (
            <div key={row.id} className="flex-none whitespace-pre">
              <span className="term-dim">[{row.time}]</span>{" "}
              <span style={{ color: "hsl(var(--primary))" }}>[gardenbuddy]</span>{" "}
              <Reading
                label="soil"
                value={row.soil}
                unit="%"
                warn={row.dry}
              />{" "}
              <Reading label="temp" value={row.temp} unit="C" />{" "}
              <Reading label="hum" value={row.hum} unit="%" />{" "}
              <Reading label="lux" value={row.lux} unit="" />
            </div>
          ))}
        </div>
      </div>

      {/* trace plot */}
      <div
        aria-hidden="true"
        className="relative min-w-0 basis-[45%] overflow-hidden border-l"
        style={{ borderLeftColor: "hsl(var(--ide-line))" }}
      >
        {CHANNELS.map((channel, index) => (
          <div
            key={channel}
            className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
            style={{ top: `${16 + index * 21}%` }}
          >
            <span
              className="term-dim flex-none pl-3 pr-2 font-mono text-[9.5px] tracking-[0.16em]"
              style={{ transform: "translateY(-0.5px)" }}
            >
              {channel}
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "hsl(var(--ide-gutter) / 0.28)" }}
            />
          </div>
        ))}
        <AmbientField variant="plot" />
      </div>
    </div>
  );
}

function Reading({ label, value, unit, warn }) {
  return (
    <>
      <span className="term-dim">{label}=</span>
      <span
        className={warn ? "term-warn" : ""}
        style={warn ? undefined : { color: "hsl(var(--foreground))" }}
      >
        {value}
      </span>
      {unit ? <span className="term-dim">{unit}</span> : null}
    </>
  );
}

/* ---- OUTPUT -------------------------------------------------------------- */

function OutputView({ rows }) {
  const last = [...rows].reverse().find((row) => row.kind === "epoch");

  return (
    <div
      role="tabpanel"
      id="panel-view-output"
      aria-labelledby="panel-tab-output"
      className="flex min-h-0 flex-1 flex-col"
    >
      <p className="sr-only">
        Training output from the spectrogram CNN, printing one line per epoch.
        {last
          ? ` The most recent line reads epoch ${last.epoch} of ${EPOCHS}, loss ${last.loss}, validation accuracy ${last.acc}.`
          : ""}
      </p>
      <div
        aria-hidden="true"
        className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 py-2 font-mono text-[11.5px] leading-[1.62]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
        }}
      >
        {rows.map((row) =>
          row.kind === "header" ? (
            <div key={row.id} className="term-dim flex-none whitespace-pre">
              {row.text}
            </div>
          ) : (
            <div key={row.id} className="flex-none whitespace-pre">
              <span className="term-dim">epoch </span>
              <span style={{ color: "hsl(var(--foreground))" }}>
                {String(row.epoch).padStart(2, " ")}
              </span>
              <span className="term-dim">/{EPOCHS}</span>
              <span className="term-dim">{"  loss "}</span>
              <span style={{ color: "hsl(var(--foreground))" }}>{row.loss}</span>
              <span className="term-dim">{"  val_acc "}</span>
              <span className="term-ok">{row.acc}</span>
              <span>{"  "}</span>
              <span style={{ color: "hsl(var(--primary))" }}>
                [spectrogram-cnn]
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
