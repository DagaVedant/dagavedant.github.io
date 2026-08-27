import { useEffect } from "react";
import { useWorkspace } from "@/lib/workspace";
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

  return (
    
    
    
    
    
    
    
    
    <div className="ide-root">
      <TitleBar />

      <div className="ide-middle">
        <ActivityBar />
        <Explorer />

        <div className="ide-main">
          <div className="ide-editor">
            <TabStrip />
            <Breadcrumb />

            
            <div className="relative min-h-0 overflow-hidden">
              <div className="ide-editor-scroll h-full">{children}</div>
              <Minimap />
            </div>
          </div>

          <PanelResizer />
          <Panel />
        </div>
      </div>

      <StatusBar />
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
