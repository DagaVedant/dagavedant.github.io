import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Settings,
  FileText,
  Braces,
  FileCode2,
  TerminalSquare,
  ChevronDown,
  ChevronRight,
  Minus,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotion, setMotion } from "@/hooks/useMotion";
import { SocialRail } from "@/components/portfolio/Layout";

/* ==================================================================== */
/* Model                                                                */
/* ==================================================================== */

/** The explorer tree, in document order. Order matters: index 0 is "top". */
const FILES = [
  { id: "hero", name: "README.md", ext: "md" },
  { id: "about", name: "about.md", ext: "md" },
  { id: "projects", name: "projects.tsx", ext: "tsx" },
  { id: "tech", name: "stack.json", ext: "json" },
  { id: "education", name: "education.md", ext: "md" },
  { id: "leadership", name: "leadership.md", ext: "md" },
  { id: "credentials", name: "credentials.md", ext: "md" },
  { id: "hobbies", name: "hobbies.md", ext: "md" },
  { id: "contact", name: "contact.sh", ext: "sh" },
];

const SECTION_IDS = FILES.map((f) => f.id);
const FILE_BY_ID = Object.fromEntries(FILES.map((f) => [f.id, f]));

/** Icon + colour per extension. Only --term-* and --muted-foreground. */
const EXT = {
  md: { Icon: FileText, tone: "text-muted-foreground", lang: "Markdown" },
  json: { Icon: Braces, tone: "term-warn", lang: "JSON" },
  tsx: { Icon: FileCode2, tone: "term-path", lang: "TypeScript JSX" },
  sh: { Icon: TerminalSquare, tone: "term-ok", lang: "Shell Script" },
};

/** Four "open" editor tabs. */
const TABS = ["hero", "about", "projects", "contact"].map((id) => FILE_BY_ID[id]);

/** Sections without a tab of their own fold into the nearest open tab. */
const TAB_FOR_SECTION = {
  hero: "hero",
  about: "about",
  projects: "projects",
  tech: "projects",
  education: "projects",
  leadership: "projects",
  credentials: "projects",
  hobbies: "projects",
  contact: "contact",
};

const ACTIVITY_ICONS = [Files, Search, GitBranch, Bug, Settings];

/** The global :focus-visible rule sits 2px outside; pull it inside the chrome. */
const chromeFocus = "focus-visible:[outline-offset:-2px]";

/* ==================================================================== */
/* Helpers                                                              */
/* ==================================================================== */

function readMetric(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ==================================================================== */
/* Active section — ONE IntersectionObserver, shared by tabs /          */
/* breadcrumb / explorer / status bar.                                  */
/* ==================================================================== */

function useActiveSection() {
  const [active, setActive] = useState(SECTION_IDS[0]);
  const activeRef = useRef(SECTION_IDS[0]);
  const visible = useRef(new Set());

  useEffect(() => {
    const top = readMetric("--ide-top", 98);
    let frame = 0;

    const commit = (id) => {
      if (activeRef.current === id) return;
      activeRef.current = id;
      setActive(id);
    };

    const measure = () => {
      frame = 0;

      // At the very top of the document the first section always wins,
      // even before it has crossed the observer band.
      if (window.scrollY < 8) {
        commit(SECTION_IDS[0]);
        return;
      }

      let best = null;
      let bestDistance = Infinity;
      visible.current.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const distance = Math.abs(el.getBoundingClientRect().top - top);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = id;
        }
      });

      // Nothing in the band (a gap between sections) — hold the last value.
      if (best) commit(best);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.current.add(entry.target.id);
          else visible.current.delete(entry.target.id);
        });
        schedule();
      },
      // A strip just below the chrome: the section nearest the top of the
      // content region is the one the reader is actually looking at.
      { rootMargin: `-${top}px 0px -45% 0px`, threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return active;
}

/* ==================================================================== */
/* Title bar                                                            */
/* ==================================================================== */

function TitleBar() {
  return (
    <div
      className="pointer-events-auto absolute inset-x-0 top-0 flex items-center border-b border-[hsl(var(--ide-line))] bg-[hsl(var(--ide-chrome))] px-3"
      style={{ height: "var(--ide-titlebar)" }}
    >
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-[11px] w-[11px] rounded-full bg-[hsl(var(--ide-gutter)/0.85)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[hsl(var(--ide-gutter)/0.6)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[hsl(var(--ide-gutter)/0.4)]" />
      </div>

      <span className="pointer-events-none absolute inset-x-0 text-center font-mono text-[11.5px] tracking-tight text-muted-foreground">
        vedant-daga — Visual Studio Code
      </span>

      <div
        className="ml-auto flex items-center gap-4 text-[hsl(var(--ide-gutter))]"
        aria-hidden="true"
      >
        <Minus className="h-3 w-3" />
        <Square className="h-[10px] w-[10px]" />
        <X className="h-3 w-3" />
      </div>
    </div>
  );
}

/* ==================================================================== */
/* Activity bar — decorative icon stack + the real social links         */
/* ==================================================================== */

function ActivityBar() {
  return (
    <div
      className="pointer-events-auto absolute left-0 z-10 hidden flex-col items-center border-r border-[hsl(var(--ide-line))] bg-[hsl(var(--ide-chrome))] py-2 md:flex"
      style={{
        top: "var(--ide-titlebar)",
        bottom: "var(--ide-statusbar)",
        width: "var(--ide-activity)",
      }}
    >
      {/* Purely ornamental: not focusable, not announced, no hover affordance. */}
      <div className="flex flex-col items-center" aria-hidden="true">
        {ACTIVITY_ICONS.map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "relative flex h-11 w-full items-center justify-center",
              i === 0 ? "text-foreground/85" : "text-[hsl(var(--ide-gutter))]"
            )}
          >
            {i === 0 && (
              <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 bg-primary" />
            )}
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center">
        <SocialRail />
      </div>
    </div>
  );
}

/* ==================================================================== */
/* Explorer                                                             */
/* ==================================================================== */

function Explorer({ activeId, onOpen }) {
  const [open, setOpen] = useState(true);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div
      className="pointer-events-auto absolute hidden flex-col overflow-hidden border-r border-[hsl(var(--ide-line))] bg-[hsl(var(--ide-chrome))] lg:flex"
      style={{
        top: "var(--ide-titlebar)",
        bottom: "var(--ide-statusbar)",
        left: "var(--ide-activity)",
        width: "var(--ide-sidebar)",
      }}
    >
      <div className="flex h-8 shrink-0 items-center px-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        Explorer
      </div>

      <nav aria-label="File explorer" className="flex-1 overflow-y-auto pb-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "flex w-full items-center gap-1 px-2 py-1 font-mono text-[11.5px] font-medium uppercase tracking-[0.09em] text-foreground/80 transition-colors hover:text-foreground",
            chromeFocus
          )}
        >
          <Chevron className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          vedant-daga
        </button>

        {open && (
          <ul className="mt-0.5">
            {FILES.map((file) => {
              const meta = EXT[file.ext];
              const Icon = meta.Icon;
              const isActive = activeId === file.id;
              return (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(file.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 py-[3px] pl-7 pr-3 text-left font-mono text-[12.5px] leading-5 transition-colors duration-150",
                      isActive
                        ? "bg-[hsl(var(--accent))] text-foreground"
                        : "text-muted-foreground hover:bg-[hsl(var(--accent)/0.5)] hover:text-foreground",
                      chromeFocus
                    )}
                  >
                    <Icon
                      className={cn("h-3.5 w-3.5 shrink-0", meta.tone)}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="truncate">{file.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}

/* ==================================================================== */
/* Tab strip — one underline element that SLIDES                        */
/* ==================================================================== */

function TabStrip({ activeTabId, onOpen, animate }) {
  const tabRefs = useRef({});
  const [bar, setBar] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    let cancelled = false;

    const sync = () => {
      const el = tabRefs.current[activeTabId];
      if (cancelled || !el) return;
      setBar({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };

    sync();
    window.addEventListener("resize", sync);
    // Web fonts land after first paint and change the tab widths.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(sync).catch(() => {});
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", sync);
    };
  }, [activeTabId]);

  const onKeyDown = (event, index) => {
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const id = TABS[next].id;
    tabRefs.current[id]?.focus();
    onOpen(id);
  };

  return (
    <div
      role="tablist"
      aria-label="Open files"
      aria-orientation="horizontal"
      className="pointer-events-auto absolute flex items-stretch overflow-x-auto border-b border-[hsl(var(--ide-line))] bg-[hsl(var(--card))]"
      style={{
        top: "var(--ide-titlebar)",
        left: "var(--ide-left)",
        right: 0,
        height: "var(--ide-tabstrip)",
      }}
    >
      {TABS.map((file, index) => {
        const meta = EXT[file.ext];
        const Icon = meta.Icon;
        const isActive = activeTabId === file.id;
        return (
          <button
            key={file.id}
            ref={(node) => {
              tabRefs.current[file.id] = node;
            }}
            type="button"
            role="tab"
            id={`ide-tab-${file.id}`}
            aria-selected={isActive}
            aria-controls={file.id}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onOpen(file.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-r border-[hsl(var(--ide-line))] px-4 font-mono text-[12.5px] transition-colors duration-150",
              isActive
                ? "bg-[hsl(var(--background))] text-foreground"
                : "text-muted-foreground hover:text-foreground",
              chromeFocus
            )}
          >
            <Icon
              className={cn("h-3.5 w-3.5 shrink-0", meta.tone)}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            {file.name}
          </button>
        );
      })}

      {/* The single sliding indicator. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-primary"
        style={{
          width: `${bar.width}px`,
          transform: `translateX(${bar.left}px)`,
          opacity: bar.ready ? 1 : 0,
          transition: animate
            ? "transform 340ms cubic-bezier(.22,1,.36,1), width 340ms cubic-bezier(.22,1,.36,1), opacity 180ms ease"
            : "none",
        }}
      />
    </div>
  );
}

/* ==================================================================== */
/* Breadcrumb                                                           */
/* ==================================================================== */

function Breadcrumb({ file }) {
  const meta = EXT[file.ext];
  const Icon = meta.Icon;

  return (
    <div
      className="pointer-events-auto absolute flex items-center gap-1.5 overflow-hidden whitespace-nowrap border-b border-[hsl(var(--ide-line))] bg-[hsl(var(--background))] px-4 font-mono text-[11.5px] text-muted-foreground"
      style={{
        top: "calc(var(--ide-titlebar) + var(--ide-tabstrip))",
        left: "var(--ide-left)",
        right: 0,
        height: "var(--ide-breadcrumb)",
      }}
    >
      <span>vedant-daga</span>
      <ChevronRight
        className="h-3 w-3 text-[hsl(var(--ide-gutter))]"
        aria-hidden="true"
      />
      <span>src</span>
      <ChevronRight
        className="h-3 w-3 text-[hsl(var(--ide-gutter))]"
        aria-hidden="true"
      />
      <Icon
        className={cn("h-3 w-3 shrink-0", meta.tone)}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="text-foreground/80">{file.name}</span>
    </div>
  );
}

/* ==================================================================== */
/* Status bar                                                           */
/* ==================================================================== */

/** Sensor drift, isolated in its own component so it never re-renders the page. */
function Telemetry({ animate }) {
  const [reading, setReading] = useState({ soil: 41.2, temp: 22.8 });

  useEffect(() => {
    if (!animate) return undefined;
    const id = window.setInterval(() => {
      setReading((prev) => ({
        soil: clamp(prev.soil + (Math.random() - 0.5) * 0.7, 38.4, 44.8),
        temp: clamp(prev.temp + (Math.random() - 0.5) * 0.26, 21.4, 24.6),
      }));
    }, 2400);
    return () => window.clearInterval(id);
  }, [animate]);

  return (
    <>
      <span className="tabular-nums">soil {reading.soil.toFixed(1)}%</span>
      <span className="tabular-nums">{reading.temp.toFixed(1)}C</span>
    </>
  );
}

function StatusBar({ language }) {
  const animate = useMotion();

  return (
    <div
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex items-center gap-4 border-t border-[hsl(var(--ide-line))] bg-[hsl(var(--ide-chrome))] px-3 font-mono text-[11px] text-muted-foreground"
      style={{ height: "var(--ide-statusbar)" }}
    >
      <span className="flex items-center gap-1.5">
        <GitBranch className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
        main
      </span>
      <span className="hidden sm:inline">0 errors, 0 warnings</span>

      <div className="ml-auto flex items-center gap-4">
        <span className="hidden items-center gap-4 md:flex">
          <Telemetry animate={animate} />
        </span>
        <span className="hidden lg:inline">UTF-8</span>
        <span className="hidden lg:inline">LF</span>
        <span className="hidden sm:inline">{language}</span>
        <button
          type="button"
          onClick={() => setMotion(!animate)}
          aria-pressed={animate}
          className={cn(
            "px-1 text-muted-foreground transition-colors duration-150 hover:text-foreground",
            chromeFocus
          )}
        >
          motion: {animate ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}

/* ==================================================================== */
/* Line-number gutter (§5a)                                             */
/* Own component: it updates on scroll and must not touch the page tree. */
/* ==================================================================== */

const GUTTER_ROWS = Array.from({ length: 150 }, (_, i) => i);
const GUTTER_ROW_H = 21; // 11px * 1.9 line-height

function GutterColumn() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setOffset(Math.floor(window.scrollY / GUTTER_ROW_H));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="ide-gutter ide-gutter--auto"
      aria-hidden="true"
      style={{ counterReset: `ide-ln ${offset}` }}
    >
      {GUTTER_ROWS.map((i) => (
        <span key={i} />
      ))}
    </div>
  );
}

/* ==================================================================== */
/* IDEChrome                                                            */
/* ==================================================================== */

export default function IDEChrome({ children, booted }) {
  const animate = useMotion();
  const activeId = useActiveSection();
  const activeFile = FILE_BY_ID[activeId] ?? FILES[0];
  const activeTabId = TAB_FOR_SECTION[activeId] ?? TABS[0].id;

  const openSection = useCallback(
    (id) => {
      const behavior = animate ? "smooth" : "auto";
      if (id === SECTION_IDS[0]) {
        window.scrollTo({ top: 0, behavior });
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      const top = readMetric("--ide-top", 98);
      const y = el.getBoundingClientRect().top + window.scrollY - top - 8;
      window.scrollTo({ top: Math.max(0, y), behavior });
    },
    [animate]
  );

  return (
    <>
      {/*
        One fixed, viewport-sized shell holds every piece of chrome, so the
        boot hand-off is a single opacity target and nothing reflows.
        Children are `absolute` inside it, which resolves against the
        viewport exactly as `fixed` would.
      */}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        aria-hidden={booted ? undefined : "true"}
        style={{
          opacity: booted ? 1 : 0,
          // visibility keeps the chrome out of the tab order pre-boot.
          visibility: booted ? "visible" : "hidden",
          transition: animate
            ? `opacity 480ms ease, visibility 0ms linear ${booted ? "0ms" : "480ms"}`
            : "none",
        }}
      >
        <TitleBar />
        <ActivityBar />
        <Explorer activeId={activeId} onOpen={openSection} />
        <TabStrip
          activeTabId={activeTabId}
          onOpen={openSection}
          animate={animate}
        />
        <Breadcrumb file={activeFile} />
        <StatusBar language={EXT[activeFile.ext].lang} />
      </div>

      {/*
        §3 scroll model — the WINDOW scrolls. This is a normal in-flow
        element that merely clears the fixed chrome. Never add overflow here:
        the projects rail depends on window scroll + sticky.
      */}
      <div
        className="ide-indent-guides"
        style={{
          marginLeft: "var(--ide-left)",
          paddingTop: "var(--ide-top)",
          paddingBottom: "var(--ide-bottom)",
        }}
      >
        <GutterColumn />
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}
