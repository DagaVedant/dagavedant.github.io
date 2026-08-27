import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The sash along the top of the panel, matching VS Code's.
 *
 * Drives the --ide-panel custom property directly rather than React state: the
 * whole shell is a CSS grid sized from that variable, so writing it on the root
 * resizes everything in one layout pass with no re-render per pointer move.
 *
 * Sits IN FLOW as the panel's first child rather than overlapping its edge —
 * both .ide-main and the panel clip their overflow, so an element positioned
 * outside the panel's box would simply be cut off.
 */

const STORAGE_KEY = "vd-panel-h";
const DEFAULT_H = 220;
/** Collapsed: the tab row and nothing else, as VS Code allows. */
const MIN_H = 35;
/** Leave the editor at least this much room, whatever the drag asks for. */
const MIN_EDITOR = 120;
/** Below this width the layout drops the panel entirely; don't fight it. */
const NARROW = 860;

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

const maxHeight = () => {
  const root = getComputedStyle(document.documentElement);
  const chrome =
    parseFloat(root.getPropertyValue("--ide-titlebar")) +
    parseFloat(root.getPropertyValue("--ide-statusbar"));
  return Math.max(MIN_H, window.innerHeight - chrome - MIN_EDITOR);
};

const readStored = () => {
  try {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
};

export default function PanelResizer() {
  // heightRef is the source of truth during a gesture; `height` state exists
  // only to keep aria-valuenow honest and is synced once, on release. Routing
  // every pointermove through state would add a render — and a frame of
  // latency — to the one interaction where latency is actually felt.
  const heightRef = useRef(readStored() ?? DEFAULT_H);
  const [height, setHeight] = useState(heightRef.current);

  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ y: 0, h: 0 });

  /**
   * Clamp and write --ide-panel synchronously. The shell is a CSS grid sized
   * from that variable, so this resizes everything in one layout pass.
   *
   * An inline custom property beats the stylesheet, including the narrow-screen
   * media query that zeroes the panel — so below NARROW the override is removed
   * rather than clamped, letting the stylesheet win.
   */
  const applyHeight = useCallback((px) => {
    const next = clamp(px, MIN_H, maxHeight());
    heightRef.current = next;

    const el = document.documentElement;
    if (window.innerWidth <= NARROW) el.style.removeProperty("--ide-panel");
    else el.style.setProperty("--ide-panel", `${next}px`);

    return next;
  }, []);

  /** Persist and sync aria — called on release, not per move. */
  const persist = useCallback(() => {
    setHeight(heightRef.current);
    try {
      localStorage.setItem(STORAGE_KEY, String(heightRef.current));
    } catch {
      /* private mode — the size just isn't remembered */
    }
  }, []);

  // Paint the stored height on mount.
  useEffect(() => {
    applyHeight(heightRef.current);
  }, [applyHeight]);

  // A height that was legal in a tall window can leave no room for the editor
  // in a short one, so re-clamp against the new viewport.
  useEffect(() => {
    const onResize = () => {
      applyHeight(heightRef.current);
      setHeight(heightRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyHeight]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported — the window listeners below still cover it */
    }
    start.current = { y: e.clientY, h: heightRef.current };
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    // Dragging UP grows the panel, so the delta is inverted.
    applyHeight(start.current.h + (start.current.y - e.clientY));
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    setDragging(false);
    persist();
  };

  const step = (delta) => {
    applyHeight(heightRef.current + delta);
    persist();
  };

  const toggleCollapse = () =>
    step((heightRef.current <= MIN_H + 4 ? DEFAULT_H : MIN_H) - heightRef.current);

  const onKeyDown = (e) => {
    const amount = e.shiftKey ? 60 : 20;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      step(amount);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      step(-amount);
    } else if (e.key === "Home") {
      e.preventDefault();
      step(maxHeight() - heightRef.current);
    } else if (e.key === "End") {
      e.preventDefault();
      step(MIN_H - heightRef.current);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCollapse();
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize panel"
      aria-valuenow={Math.round(height)}
      aria-valuemin={MIN_H}
      aria-valuemax={Math.round(typeof window === "undefined" ? 600 : maxHeight())}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={toggleCollapse}
      title="Drag to resize · double-click to collapse"
      className="group relative h-[5px] flex-none cursor-ns-resize touch-none select-none focus-visible:outline-none"
    >
      {/* The panel's top border lives here so the sash can tint it on hover and
          while dragging, the way VS Code's does. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[1px] transition-colors duration-150 ${
          dragging
            ? "bg-vs-accent"
            : "bg-vs-border group-hover:bg-vs-accent group-focus-visible:bg-vs-accent"
        }`}
      />
    </div>
  );
}

/** So the panel can render at the stored height on first paint. */
export function initialPanelHeight() {
  return readStored() ?? DEFAULT_H;
}
