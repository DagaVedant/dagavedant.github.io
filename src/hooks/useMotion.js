import { useSyncExternalStore } from "react";



const STORAGE_KEY = "vd-motion";
const EVENT_NAME = "vd-motion-change";
const QUERY = "(prefers-reduced-motion: reduce)";

const canUseDOM =
  typeof window !== "undefined" && typeof document !== "undefined";

const mediaQuery =
  canUseDOM && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY)
    : null;


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
  } catch {}
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
  
  window.addEventListener("storage", (event) => {
    if (!event || event.key === null || event.key === STORAGE_KEY) notify();
  });

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", notify);
    } else if (typeof mediaQuery.addListener === "function") {
      
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


export function useMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}


export function setMotion(next) {
  const on = next === "on" ? true : next === "off" ? false : Boolean(next);

  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}

  if (!canUseDOM) return;

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: on }));
  } catch {
    
    notify();
  }
}


export function clearMotionOverride() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
  if (canUseDOM) notify();
}



syncAttribute();

export default useMotion;
