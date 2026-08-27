import { Plus, ChevronDown, SplitSquareHorizontal, Trash2, MoreHorizontal, ChevronUp, X, TriangleAlert } from "lucide-react";

/**
 * The bottom panel.
 *
 * Six tabs, as the reference screenshot shows. TERMINAL is the only live one;
 * the other five are chrome, rendered as aria-hidden spans rather than disabled
 * buttons so they do not sit in the tab order advertising behaviour they do not
 * have.
 *
 * Boot scrollback arrives in step 11; until then this shows the settled prompt.
 */
const INERT_TABS = ["Problems", "Output", "Debug Console"];
const INERT_TABS_AFTER = ["Ports", "Playwright"];

function ToolbarIcon({ icon: Icon, className = "h-[15px] w-[15px]" }) {
  return <Icon aria-hidden="true" className={`${className} text-vs-descr`} strokeWidth={1.5} />;
}

export default function Panel({ children }) {
  return (
    <section
      aria-label="Panel"
      className="flex min-h-0 flex-col overflow-hidden border-t border-vs-border bg-vs-editor"
    >
      <div className="flex h-[35px] flex-none items-center justify-between border-b border-vs-border/60 pl-5 pr-2">
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
            <span className="text-term-path">powershell</span>
            <TriangleAlert className="h-[13px] w-[13px] text-term-warn" strokeWidth={1.6} />
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
        {children ?? <TerminalPrompt />}
      </div>
    </section>
  );
}

export function TerminalPrompt() {
  return (
    <p className="t-mono text-[12.5px] leading-[1.5] text-vs-text">
      <span className="text-term-ok">(.venv)</span>{" "}
      <span className="text-vs-text">PS</span>{" "}
      <span className="text-term-path">C:\Users\DagaV\Desktop\vedant-portfolio</span>
      <span className="text-vs-text">{">"}</span>{" "}
      <span className="caret-blink align-text-bottom" />
    </p>
  );
}
