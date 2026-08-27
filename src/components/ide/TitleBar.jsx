import { ChevronLeft, ChevronRight, Search, Minus, Square, X } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { WORKSPACE_NAME } from "@/lib/files";

const MENUS = ["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"];

/** VS Code's mark. Decorative; the command centre beside it carries the name. */
function VSCodeLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261a1 1 0 0 0-.001 1.479L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.94a1.5 1.5 0 0 0-.85-1.353Zm-5.146 14.861L10.826 12l7.178-5.448v10.896Z"
        fill="#0065A9"
      />
    </svg>
  );
}

/** Layout-toggle glyphs from the real title bar. Decorative. */
function LayoutGlyph({ side }) {
  const fills = {
    left: <rect x="1.5" y="2.5" width="4" height="11" fill="currentColor" opacity="0.85" />,
    panel: <rect x="1.5" y="9.5" width="13" height="4" fill="currentColor" opacity="0.85" />,
    right: <rect x="10.5" y="2.5" width="4" height="11" fill="currentColor" opacity="0.85" />,
  };
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      {fills[side]}
    </svg>
  );
}

/**
 * The single-row title bar: menu, navigation, command centre, layout toggles,
 * window controls.
 *
 * Everything here is chrome EXCEPT the command centre, which opens Ctrl+P. The
 * inert parts are rendered as spans with aria-hidden rather than disabled
 * buttons — a disabled button is still announced, and a control that looks
 * clickable but never responds is worse than one that never invites the click.
 */
export default function TitleBar() {
  const { setPaletteOpen } = useWorkspace();

  return (
    <header
      className="flex h-full select-none items-center gap-2 border-b border-vs-border bg-vs-chrome px-2 text-[13px] text-vs-text"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex flex-none items-center gap-2 pl-1">
        <VSCodeLogo />
        <nav aria-hidden="true" className="hidden items-center md:flex">
          {MENUS.map((m) => (
            <span
              key={m}
              className="cursor-default rounded-[3px] px-[7px] py-[3px] text-[13px] text-vs-text/90"
            >
              {m}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 px-2">
        <span aria-hidden="true" className="hidden items-center gap-1 text-vs-descr/60 sm:flex">
          <ChevronLeft className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </span>

        {/* The one live control up here. */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          title="Go to File (Ctrl+P)"
          className="flex h-[24px] w-full max-w-[560px] items-center justify-center gap-2 rounded-[6px] border border-vs-border bg-vs-editor/70 px-3 text-[12px] text-vs-descr transition-colors hover:bg-vs-editor focus-visible:outline focus-visible:outline-1 focus-visible:outline-vs-accent"
          style={{ WebkitAppRegion: "no-drag" }}
        >
          <Search className="h-[13px] w-[13px]" />
          <span className="truncate text-vs-text/85">{WORKSPACE_NAME}</span>
        </button>
      </div>

      <div className="flex flex-none items-center gap-1 pr-1 text-vs-descr/70">
        <span aria-hidden="true" className="hidden items-center gap-2 px-2 lg:flex">
          <LayoutGlyph side="left" />
          <LayoutGlyph side="panel" />
          <LayoutGlyph side="right" />
        </span>
        <span aria-hidden="true" className="flex items-center gap-3 pl-2 pr-1">
          <Minus className="h-[13px] w-[13px]" />
          <Square className="h-[11px] w-[11px]" />
          <X className="h-[15px] w-[15px]" />
        </span>
      </div>
    </header>
  );
}
