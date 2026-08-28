import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { useIsMobile, useIsNarrow } from "@/hooks/useMediaQuery";
import QuickOpen from "./QuickOpen";
import PanelResizer from "./PanelResizer";
import TitleBar from "./TitleBar";
import ActivityBar from "./ActivityBar";
import Explorer from "./Explorer";
import TabStrip from "./TabStrip";
import Breadcrumb from "./Breadcrumb";
import Minimap from "./Minimap";
import Panel from "./Panel";
import StatusBar from "./StatusBar";

export default function IDEShell({ children }) {
  useGlobalKeys();

  const { activeId } = useWorkspace();
  const isNarrow = useIsNarrow();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    setPanelOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!isNarrow) setSidebarOpen(false);
  }, [isNarrow]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSidebarOpen(false);
  }, [activeId]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);

  return (
    <div
      className="ide-root"
      data-sidebar={sidebarOpen ? "open" : "closed"}
      data-panel={panelOpen ? "open" : "closed"}
    >
      <TitleBar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="ide-middle">
        <ActivityBar
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          isNarrow={isNarrow}
        />

        <div className="ide-sidebar-host">
          <Explorer />
        </div>

        <div className="ide-main">
          <div className="ide-editor">
            <TabStrip />
            <Breadcrumb />

            <div className="relative min-h-0 overflow-hidden">
              <div className="ide-editor-scroll h-full">{children}</div>
              <Minimap />
            </div>
          </div>

          {panelOpen && !isMobile ? <PanelResizer /> : null}
          {panelOpen ? <Panel /> : null}
        </div>
      </div>

      <div
        className="ide-scrim"
        role="presentation"
        onClick={() => setSidebarOpen(false)}
      />

      <StatusBar panelOpen={panelOpen} onTogglePanel={togglePanel} />
      <QuickOpen />
    </div>
  );
}

function useGlobalKeys() {
  const { setPaletteOpen, cycle } = useWorkspace();

  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === "p" || e.key === "P") {
        if (e.shiftKey) return;
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (e.key === "PageDown") {
        e.preventDefault();
        cycle(1);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        cycle(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen, cycle]);
}
