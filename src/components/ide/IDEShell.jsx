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

            {/* Relative wrapper so the minimap can overlay the scroller
                without scrolling along with the content. */}
            <div className="relative min-h-0 overflow-hidden">
              <div className="ide-editor-scroll h-full ide-indent-guides">{children}</div>
              <Minimap />
            </div>
          </div>

          <Panel />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
