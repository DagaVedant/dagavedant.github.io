import { useMemo } from "react";
import { useWorkspace } from "@/lib/workspace";

/**
 * Decorative minimap.
 *
 * Deliberately NOT a render of the open file — spec 8 calls for a strip. It is
 * seeded from the file id so each file keeps its own stable silhouette across
 * re-renders and tab switches, which is what sells it: a minimap that reshuffled
 * every render would read as noise.
 *
 * aria-hidden, pointer-events-none: it is scenery, not a control, and pretending
 * otherwise would put a dead scrollbar in the tab order.
 */
function seededLines(seed, count) {
  // xorshift — deterministic, and Math.random is unavailable at render time
  // anyway if this ever moves to SSR.
  let x = seed || 1;
  const rand = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return Math.abs(x % 1000) / 1000;
  };

  const lines = [];
  let indent = 0;
  for (let i = 0; i < count; i += 1) {
    const r = rand();
    if (r < 0.09) {
      lines.push(null); // blank line
      continue;
    }
    if (r < 0.2 && indent < 3) indent += 1;
    else if (r > 0.88 && indent > 0) indent -= 1;
    lines.push({ indent, width: 18 + rand() * 62 });
  }
  return lines;
}

const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};

export default function Minimap() {
  const { activeId } = useWorkspace();
  const lines = useMemo(() => (activeId ? seededLines(hash(activeId), 120) : []), [activeId]);

  if (!activeId) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 hidden h-full w-[68px] select-none overflow-hidden bg-vs-editor/60 xl:block"
    >
      <div className="flex flex-col gap-[2px] py-2 pl-[6px] pr-2">
        {lines.map((line, i) =>
          line ? (
            <span
              key={i}
              className="h-[2px] rounded-[1px] bg-vs-text"
              style={{
                opacity: 0.16,
                marginLeft: `${line.indent * 5}px`,
                width: `${line.width}%`,
              }}
            />
          ) : (
            <span key={i} className="h-[2px]" />
          )
        )}
      </div>
      {/* The viewport box the real minimap draws over the visible region. */}
      <span className="absolute inset-x-0 top-2 h-24 bg-white/[0.045]" />
    </div>
  );
}
