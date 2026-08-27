import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { ALL_FILES } from "@/lib/files";
import { rankFiles } from "@/lib/fuzzy";
import FileIcon from "./FileIcon";

/** Bold the characters the query actually matched. */
function Highlighted({ text, indices }) {
  if (!indices?.length) return text;
  const set = new Set(indices);
  return (
    <>
      {[...text].map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="font-semibold text-vs-accent">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

/**
 * Ctrl+P — the fuzzy file switcher.
 *
 * Rendered only while open so the input never competes for focus, and closed on
 * Escape, blur-to-backdrop, or a pick. Keyboard is the point here: arrows move,
 * Enter opens, Escape cancels, and the list scrolls the active row into view.
 */
export default function QuickOpen() {
  const { paletteOpen, setPaletteOpen, open } = useWorkspace();

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => rankFiles(ALL_FILES, query).slice(0, 12), [query]);

  // Reset per opening, not per keystroke.
  useEffect(() => {
    if (!paletteOpen) return;
    setQuery("");
    setIndex(0);
    // Focus after paint, or the browser may hand focus back to the trigger.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [paletteOpen]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    if (!paletteOpen) return undefined;
    const el = listRef.current?.querySelector(`[data-i="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
    return undefined;
  }, [index, paletteOpen, results.length]);

  if (!paletteOpen) return null;

  const choose = (i) => {
    const hit = results[i];
    if (hit) open(hit.file.id);
    else setPaletteOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setPaletteOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || (e.key === "n" && e.ctrlKey)) {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (e.key === "ArrowUp" || (e.key === "p" && e.ctrlKey)) {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      choose(index);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setPaletteOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Go to File"
        className="mx-auto mt-[6px] w-[min(600px,92vw)] overflow-hidden rounded-[6px] border border-vs-border bg-vs-quickinput shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
        onKeyDown={onKeyDown}
      >
        <div className="p-[6px]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name"
            aria-label="Search files by name"
            spellCheck={false}
            className="h-[26px] w-full border border-vs-accent bg-vs-contrast px-2 text-[13px] text-vs-text outline-none placeholder:text-vs-descr"
          />
        </div>

        <ul ref={listRef} className="max-h-[42vh] overflow-y-auto pb-1" role="listbox">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-vs-descr">No matching files</li>
          ) : (
            results.map(({ file, indices }, i) => (
              <li key={file.id} data-i={i} role="option" aria-selected={i === index}>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => choose(i)}
                  className={`flex w-full items-center gap-2 px-3 py-[3px] text-left text-[13px] ${
                    i === index ? "bg-vs-list-active text-vs-text" : "text-vs-text/90"
                  }`}
                >
                  <FileIcon ext={file.ext} className="h-4 w-4 flex-none" />
                  <span className="truncate">
                    <Highlighted text={file.name} indices={indices} />
                  </span>
                  {file.parent ? (
                    <span className="ml-1 truncate text-[12px] text-vs-descr">{file.parent}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
