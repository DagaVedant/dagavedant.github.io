import { useEffect, useRef } from "react";
import { Plus, ChevronDown, SplitSquareHorizontal, Trash2, MoreHorizontal, ChevronUp, X, TriangleAlert } from "lucide-react";
import { BOOT_LINES } from "./BootSequence";


const INERT_TABS = ["Problems", "Output", "Debug Console"];
const INERT_TABS_AFTER = ["Ports"];

function ToolbarIcon({ icon: Icon, className = "h-[15px] w-[15px]" }) {
  return <Icon aria-hidden="true" className={`${className} text-vs-descr`} strokeWidth={1.5} />;
}

export default function Panel({ children }) {
  return (
    <section
      aria-label="Panel"
      className="ide-panel"
    >
      <div className="flex h-[35px] flex-none items-center justify-between rounded-t-[7px] border-b border-vs-border/60 pl-5 pr-2">
        <div className="flex items-center gap-4 overflow-hidden">
          {INERT_TABS.map((label) => (
            <span
              key={label}
              aria-hidden="true"
              className="cursor-default whitespace-nowrap text-[11px] uppercase tracking-[0.04em] text-vs-descr"
            >
              {label}
            </span>
          ))}

          <span className="relative whitespace-nowrap py-[9px] text-[11px] uppercase tracking-[0.04em] text-vs-text">
            Terminal
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[1px] bg-vs-text"
            />
          </span>

          {INERT_TABS_AFTER.map((label) => (
            <span
              key={label}
              aria-hidden="true"
              className="cursor-default whitespace-nowrap text-[11px] uppercase tracking-[0.04em] text-vs-descr"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-none items-center gap-3 pl-3">
          <span aria-hidden="true" className="flex items-center gap-1 text-[12px] text-vs-descr">
            
            <span style={{ color: "#5391FE" }}>powershell</span>
            <TriangleAlert className="h-[13px] w-[13px]" style={{ color: "#CCA700" }} strokeWidth={1.6} />
          </span>
          <ToolbarIcon icon={Plus} />
          <ToolbarIcon icon={ChevronDown} className="h-[13px] w-[13px]" />
          <ToolbarIcon icon={SplitSquareHorizontal} />
          <ToolbarIcon icon={Trash2} />
          <ToolbarIcon icon={MoreHorizontal} />
          <ToolbarIcon icon={ChevronUp} />
          <ToolbarIcon icon={X} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {children ?? <TerminalScrollback />}
      </div>
    </section>
  );
}

const TONE_CLASS = {
  ok: "term-ok",
  warn: "term-warn",
  dim: "term-dim",
  path: "term-path",
  accent: "text-vs-accent",
  text: "text-vs-text",
};

function TerminalScrollback() {
  const ref = useRef(null);

  
  
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return (
    <div ref={ref} className="font-mono text-[12.5px] leading-[19px]">
      {BOOT_LINES.map((line, i) => {
        if (line.kind === "blank") return <div key={i} className="h-[19px]" />;
        if (line.kind === "cmd") {
          return (
            <div key={i} className="min-h-[19px]">
              <span className="term-dim">$ </span>
              <span className="text-vs-text">{line.text}</span>
            </div>
          );
        }
        return (
          <div key={i} className="min-h-[19px]">
            {line.parts.map((p, j) => (
              <span key={j} className={TONE_CLASS[p.tone] || "text-vs-text"}>
                {p.text}
              </span>
            ))}
          </div>
        );
      })}
      <div className="min-h-[19px]">
        <span className="term-dim">$ </span>
        <span className="caret-blink align-text-bottom" />
      </div>
    </div>
  );
}
