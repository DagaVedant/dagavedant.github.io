import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * stack.json as the editor renders JSON: line numbers, Dark Modern token
 * colours, and folding chevrons on the lines that open a block.
 *
 * Folding is computed from the pretty-printed text rather than from the object,
 * because what folds is a *range of lines* — deriving it from the source keeps
 * the numbering honest when a region is collapsed.
 */

/** Colour one line of pretty-printed JSON. */
function JsonLine({ text }) {
  // "key": value   |   "string",   |   123   |   true   |   { } [ ] ,
  const keyMatch = text.match(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:\s*)(.*)$/);

  if (keyMatch) {
    const [, indent, key, colon, rest] = keyMatch;
    return (
      <>
        {indent}
        <span className="tok-variable">{key}</span>
        <span className="tok-punct">{colon}</span>
        <JsonValue text={rest} />
      </>
    );
  }

  const valueMatch = text.match(/^(\s*)(.*)$/);
  return (
    <>
      {valueMatch[1]}
      <JsonValue text={valueMatch[2]} />
    </>
  );
}

function JsonValue({ text }) {
  if (!text) return null;

  const trailing = text.match(/,$/) ? "," : "";
  const body = trailing ? text.slice(0, -1) : text;

  let cls = "tok-punct";
  if (/^"/.test(body)) cls = "tok-string";
  else if (/^-?\d/.test(body)) cls = "tok-number";
  else if (/^(true|false|null)$/.test(body)) cls = "tok-constant";

  return (
    <>
      <span className={cls}>{body}</span>
      {trailing ? <span className="tok-punct">{trailing}</span> : null}
    </>
  );
}

/** Map each opening line to the line that closes it. */
function computeFolds(lines) {
  const folds = new Map();
  const stack = [];

  lines.forEach((line, i) => {
    const opens = (line.match(/[{[]/g) || []).length;
    const closes = (line.match(/[}\]]/g) || []).length;
    if (opens > closes) stack.push(i);
    else if (closes > opens) {
      const start = stack.pop();
      if (start !== undefined && i > start + 1) folds.set(start, i);
    }
  });

  return folds;
}

export default function JsonView({ source }) {
  const lines = useMemo(() => source.split("\n"), [source]);
  const folds = useMemo(() => computeFolds(lines), [lines]);
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggle = (i) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // Lines swallowed by a collapsed region.
  const hidden = useMemo(() => {
    const set = new Set();
    for (const start of collapsed) {
      const end = folds.get(start);
      if (end === undefined) continue;
      for (let i = start + 1; i <= end; i += 1) set.add(i);
    }
    return set;
  }, [collapsed, folds]);

  return (
    <div className="flex min-h-full font-mono text-[13px] leading-[20px]">
      <div aria-hidden="true" className="flex-none select-none pt-3 text-right text-vs-linenum">
        {lines.map((_, i) =>
          hidden.has(i) ? null : (
            <div key={i} className="flex items-center justify-end gap-1 pr-1 tabular-nums">
              <span className="min-w-[34px] pl-4">{i + 1}</span>
              <span className="flex h-5 w-4 items-center justify-center">
                {folds.has(i) ? (
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-label={collapsed.has(i) ? "Expand region" : "Collapse region"}
                    aria-expanded={!collapsed.has(i)}
                    className="text-vs-descr hover:text-vs-text"
                  >
                    {collapsed.has(i) ? (
                      <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.8} />
                    ) : (
                      <ChevronDown className="h-[14px] w-[14px]" strokeWidth={1.8} />
                    )}
                  </button>
                ) : null}
              </span>
            </div>
          )
        )}
      </div>

      <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre pb-24 pl-2 pt-3 text-vs-text">
        <code>
          {lines.map((line, i) =>
            hidden.has(i) ? null : (
              <div key={i} className="min-h-[20px]">
                <JsonLine text={line} />
                {collapsed.has(i) ? (
                  <span className="ml-2 rounded-[3px] bg-vs-contrast px-1.5 text-[11px] text-vs-descr">
                    ⋯ {folds.get(i) - i} lines
                  </span>
                ) : null}
              </div>
            )
          )}
        </code>
      </pre>
    </div>
  );
}
