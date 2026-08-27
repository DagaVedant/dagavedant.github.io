import { useCallback, useEffect, useRef, useState } from "react";



const STORAGE_KEY = "vd-panel-h";
const DEFAULT_H = 220;

const MIN_H = 35;

const MIN_EDITOR = 120;

const NARROW = 860;

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

const maxHeight = () => {
  const root = getComputedStyle(document.documentElement);
  const px = (name) => parseFloat(root.getPropertyValue(name)) || 0;
  
  
  const chrome =
    px("--ide-titlebar") + px("--ide-statusbar") + px("--ide-sash") + px("--ide-gap");
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
  
  
  
  
  const heightRef = useRef(readStored() ?? DEFAULT_H);
  const [height, setHeight] = useState(heightRef.current);

  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ y: 0, h: 0 });

  
  const applyHeight = useCallback((px) => {
    const next = clamp(px, MIN_H, maxHeight());
    heightRef.current = next;

    const el = document.documentElement;
    if (window.innerWidth <= NARROW) el.style.removeProperty("--ide-panel");
    else el.style.setProperty("--ide-panel", `${next}px`);

    return next;
  }, []);

  
  const persist = useCallback(() => {
    setHeight(heightRef.current);
    try {
      localStorage.setItem(STORAGE_KEY, String(heightRef.current));
    } catch {}
  }, []);

  
  useEffect(() => {
    applyHeight(heightRef.current);
  }, [applyHeight]);

  
  
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
    } catch {}
    start.current = { y: e.clientY, h: heightRef.current };
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    
    applyHeight(start.current.h + (start.current.y - e.clientY));
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
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
      className="group relative flex cursor-ns-resize touch-none select-none items-center focus-visible:outline-none"
    >
      
      <span
        aria-hidden="true"
        className={`h-[2px] w-full transition-opacity duration-150 ${
          dragging
            ? "bg-vs-accent opacity-100"
            : "bg-vs-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      />
    </div>
  );
}


export function initialPanelHeight() {
  return readStored() ?? DEFAULT_H;
}
