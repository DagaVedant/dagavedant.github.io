import { useEffect } from "react";
import { useWorkspace } from "@/lib/workspace";
import QuickOpen from "./QuickOpen";
import TitleBar from "./TitleBar";
import ActivityBar from "./ActivityBar";
import Explorer from "./Explorer";
import TabStrip from "./TabStrip";
import Breadcrumb from "./Breadcrumb";
import Minimap from "./Minimap";
import Panel from "./Panel";
import StatusBar from "./StatusBar";

/**
 * Composes the chrome around the editor content.
 *
 * The layout is a viewport-locked grid (see .ide-* in index.css), not fixed
 * overlays: the window never scrolls, and `.ide-editor-scroll` is the single
 * scroller in the app. That is what makes the chrome stay put the way the real
 * editor's does.
 */
export default function IDEShell({ children }) {
  useGlobalKeys();

  return (
    // Always fully painted, even while the boot overlay is up.
    //
    // An earlier version faded this in on `booted`, which meant a stalled or
    // dropped transition left the ENTIRE UI at opacity 0 — a blank site as the
    // failure mode of a cosmetic fade. The overlay is opaque and covers the
    // viewport anyway, so the chrome is revealed by the terminal shrinking off
    // it rather than by fading in underneath. Same effect, and the failure mode
    // is now a lingering overlay rather than nothing at all.
    <div className="ide-root">
      <TitleBar />

      <div className="ide-middle">
        <ActivityBar />
        <Explorer />

        <div className="ide-main">
          <div className="ide-editor">
            <TabStrip />
            <Breadcrumb />

            {/* Relative wrapper so the minimap can overlay the scroller
                without scrolling along with the content. */}
            <div className="relative min-h-0 overflow-hidden">
              <div className="ide-editor-scroll h-full">{children}</div>
              <Minimap />
            </div>
          </div>

          <Panel />
        </div>
      </div>

      <StatusBar />
      <QuickOpen />
    </div>
  );
}

/**
 * Editor keybindings that are safe to take from the browser.
 *
 * Ctrl+P is the one worth claiming — it is the gesture people reach for, and
 * the browser's print dialog is a reasonable trade in an app that is visibly an
 * editor. Ctrl+W is deliberately NOT bound: browsers reserve it to close the
 * tab and will not yield it, so binding it would only look broken.
 */
function useGlobalKeys() {
  const { setPaletteOpen, cycle } = useWorkspace();

  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === "p" || e.key === "P") {
        // Ctrl+Shift+P is the command palette in the real app; we only ship the
        // file switcher, so let the browser keep the shifted combination.
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
