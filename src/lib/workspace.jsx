

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FILES, getFile } from "@/lib/files";

const STORAGE_KEY = "vd-workspace";

const WorkspaceContext = createContext(null);


function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tabs)) return null;
    
    const tabs = parsed.tabs.filter((id) => FILES.has(id));
    if (tabs.length === 0) return null;
    const activeId = tabs.includes(parsed.activeId) ? parsed.activeId : tabs[tabs.length - 1];
    return { tabs, activeId };
  } catch {
    return null;
  }
}

function writeStored(tabs, activeId) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeId }));
  } catch {}
}

export function WorkspaceProvider({ children }) {
  const restored = useRef(readStored()).current;

  const [tabs, setTabs] = useState(() => restored?.tabs ?? []);
  const [activeId, setActiveId] = useState(() => restored?.activeId ?? null);

  
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    writeStored(tabs, activeId);
  }, [tabs, activeId]);

  const open = useCallback((id) => {
    if (!FILES.has(id)) return;
    setTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveId(id);
    setPaletteOpen(false);
  }, []);

  const close = useCallback((id) => {
    setTabs((prev) => {
      const index = prev.indexOf(id);
      if (index === -1) return prev;
      const next = prev.filter((t) => t !== id);

      setActiveId((current) => {
        if (current !== id) return current;
        if (next.length === 0) return null;
        
        return next[Math.min(index, next.length - 1)];
      });

      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setTabs([]);
    setActiveId(null);
  }, []);

  const closeOthers = useCallback((id) => {
    setTabs((prev) => (prev.includes(id) ? [id] : prev));
    setActiveId(id);
  }, []);

  
  const cycle = useCallback(
    (delta) => {
      if (tabs.length < 2) return;
      const i = tabs.indexOf(activeId);
      const next = (i + delta + tabs.length) % tabs.length;
      setActiveId(tabs[next]);
    },
    [tabs, activeId]
  );

  const activeFile = useMemo(() => (activeId ? getFile(activeId) : null), [activeId]);

  const value = useMemo(
    () => ({
      tabs,
      activeId,
      activeFile,
      open,
      close,
      closeAll,
      closeOthers,
      cycle,
      setActiveId,
      paletteOpen,
      setPaletteOpen,
    }),
    [tabs, activeId, activeFile, open, close, closeAll, closeOthers, cycle, paletteOpen]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
