import { useSyncExternalStore } from "react";

/**
 * Shared motion preference for the whole site.
 *
 * Resolution order:
 *   1. localStorage "vd-motion" — "on" | "off" (the reader's explicit override)
 *   2. the OS setting, i.e. !prefers-reduced-motion
 *
 * Every ambient/decorative animation checks this, NOT a bare
 * prefers-reduced-motion media query, so a reader who turns motion back on
 * actually gets motion.
 *
 *   const animate = useMotion();   // boolean
 *   setMotion(false);              // every mounted component re-renders
 *
 * As a side effect the resolved value is mirrored onto
 * <html data-motion="on|off">, which drives the CSS kill-switch in index.css.
 */

const STORAGE_KEY = "vd-motion";
const EVENT_NAME = "vd-motion-change";
const QUERY = "(prefers-reduced-motion: reduce)";

const canUseDOM =
  typeof window !== "undefined" && typeof document !== "undefined";

const mediaQuery =
  canUseDOM && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY)
    : null;

/** localStorage throws in private mode / when storage is blocked. */
function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

function resolveMotion() {
  if (!canUseDOM) return true;
  const stored = readStored();
  if (stored) return stored === "on";
  return !(mediaQuery && mediaQuery.matches);
}

function syncAttribute() {
  if (!canUseDOM) return;
  try {
    document.documentElement.setAttribute(
      "data-motion",
      resolveMotion() ? "on" : "off"
    );
  } catch {
    /* no-op */
  }
}

const listeners = new Set();
let wired = false;

function notify() {
  syncAttribute();
  listeners.forEach((listener) => {
    listener();
  });
}

function wire() {
  if (wired || !canUseDOM) return;
  wired = true;

  window.addEventListener(EVENT_NAME, notify);
  // Another tab changed the preference.
  window.addEventListener("storage", (event) => {
    if (!event || event.key === null || event.key === STORAGE_KEY) notify();
  });

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", notify);
    } else if (typeof mediaQuery.addListener === "function") {
      // Safari < 14
      mediaQuery.addListener(notify);
    }
  }
}

function subscribe(onStoreChange) {
  wire();
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot() {
  return resolveMotion();
}

function getServerSnapshot() {
  return true;
}

/** @returns {boolean} true when animations should play. */
export function useMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Persist an explicit motion preference and broadcast it.
 * @param {boolean|"on"|"off"} next
 */
export function setMotion(next) {
  const on = next === "on" ? true : next === "off" ? false : Boolean(next);

  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* private mode — the in-memory broadcast below still works */
  }

  if (!canUseDOM) return;

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: on }));
  } catch {
    // Very old browsers without the CustomEvent constructor.
    notify();
  }
}

/** Clear the override and fall back to the OS setting. */
export function clearMotionOverride() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  if (canUseDOM) notify();
}

// Paint the attribute as early as the module is imported so the first frame
// is already correct.
syncAttribute();

export default useMotion;
