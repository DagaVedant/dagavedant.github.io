import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, SplitSquareHorizontal, MoreHorizontal, Play } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { getFile } from "@/lib/files";
import FileIcon from "./FileIcon";

/**
 * The editor tab strip.
 *
 * Dark Modern marks the active tab with a 1px accent along its TOP edge. Here
 * that line is a single positioned element that slides between tabs rather than
 * a border toggled per tab, so switching files animates instead of blinking —
 * one of the required visible motions.
 */
export default function TabStrip() {
  const { tabs, activeId, setActiveId, close } = useWorkspace();

  const listRef = useRef(null);
  const tabRefs = useRef(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const el = activeId ? tabRefs.current.get(activeId) : null;
    const list = listRef.current;
    if (!el || !list) {
      setIndicator((i) => ({ ...i, width: 0 }));
      return;
    }
    setIndicator({ left: el.offsetLeft - list.scrollLeft, width: el.offsetWidth, ready: true });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure, tabs]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const onScroll = () => measure();
    list.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => {
      list.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure]);

  // Keep the active tab in view when it is opened from the tree or Ctrl+P.
  useEffect(() => {
    const el = activeId ? tabRefs.current.get(activeId) : null;
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);

  const onKeyDown = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (!next) return;
    setActiveId(next);
    tabRefs.current.get(next)?.focus();
  };

  return (
    <div className="relative flex h-full min-w-0 items-stretch border-b border-vs-border bg-vs-chrome">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Open editors"
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((id, index) => {
          const file = getFile(id);
          if (!file) return null;
          const isActive = id === activeId;
          return (
            <div
              key={id}
              ref={(node) => {
                if (node) tabRefs.current.set(id, node);
                else tabRefs.current.delete(id);
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              onKeyDown={(e) => onKeyDown(e, index)}
              onClick={() => setActiveId(id)}
              onAuxClick={(e) => {
                if (e.button === 1) close(id); // middle-click closes, as in the app
              }}
              className={`group flex h-full min-w-0 max-w-[220px] flex-none cursor-pointer items-center gap-2 border-r border-vs-border pl-3 pr-2 text-[13px] ${
                isActive
                  ? "bg-vs-editor text-vs-text"
                  : "bg-vs-chrome text-vs-descr hover:text-vs-text"
              }`}
              title={file.name}
            >
              <FileIcon ext={file.ext} className="h-4 w-4 flex-none" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Close ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  close(id);
                }}
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-[3px] text-vs-descr transition-opacity hover:bg-white/10 hover:text-vs-text ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <X className="h-[13px] w-[13px]" />
              </button>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="flex flex-none items-center gap-3 border-l border-vs-border px-3 text-vs-descr/70"
      >
        <Play className="h-4 w-4" strokeWidth={1.4} />
        <SplitSquareHorizontal className="h-4 w-4" strokeWidth={1.4} />
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.4} />
      </div>

      {/* The sliding active-tab accent. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[1px] bg-vs-accent"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
          opacity: indicator.width ? 1 : 0,
          transition: indicator.ready
            ? "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), width 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms"
            : "none",
        }}
      />
    </div>
  );
}
