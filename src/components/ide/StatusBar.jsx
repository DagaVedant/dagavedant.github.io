import { GitBranch, CircleX, TriangleAlert, Bell, RefreshCw, TerminalSquare } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { languageLabel, PROFILE_CONTRIBUTIONS } from "@/lib/files";
import { useMotion, setMotion } from "@/hooks/useMotion";

const Item = ({ children, title }) => (
  <span
    title={title}
    className="flex h-full items-center gap-[5px] px-2 text-[12px] leading-none text-vs-statusbar-fg"
  >
    {children}
  </span>
);


export default function StatusBar({ panelOpen, onTogglePanel }) {
  const { activeFile } = useWorkspace();
  const motion = useMotion();

  return (
    <footer className="flex h-full select-none items-stretch justify-between bg-vs-statusbar text-vs-statusbar-fg">
      <div className="flex items-stretch">
        <Item title={`${PROFILE_CONTRIBUTIONS.total} contributions in the last year`}>
          <GitBranch className="h-[13px] w-[13px]" strokeWidth={1.8} />
          main
          <RefreshCw className="ml-1 hidden h-[11px] w-[11px] opacity-80 sm:inline" strokeWidth={1.8} />
        </Item>
        <Item title="No problems">
          <CircleX className="h-[13px] w-[13px]" strokeWidth={1.8} />0
          <TriangleAlert className="ml-1 h-[13px] w-[13px]" strokeWidth={1.8} />0
        </Item>
      </div>

      <div className="flex items-stretch">
        <span className="hidden items-stretch lg:flex">
          <Item>Ln 1, Col 1</Item>
          <Item>Spaces: 4</Item>
        </span>
        <span className="hidden items-stretch sm:flex">
          <Item>UTF-8</Item>
          <Item>LF</Item>
        </span>
        <Item>{languageLabel(activeFile)}</Item>

        <button
          type="button"
          onClick={onTogglePanel}
          aria-pressed={panelOpen}
          aria-label={panelOpen ? "Hide panel" : "Show panel"}
          className="flex h-full items-center gap-[5px] px-2 text-[12px] leading-none text-vs-statusbar-fg transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white"
        >
          <TerminalSquare className="h-[13px] w-[13px]" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={() => setMotion(!motion)}
          aria-pressed={motion}
          className="flex h-full items-center gap-[5px] px-2 text-[12px] leading-none text-vs-statusbar-fg transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white"
        >
          motion: {motion ? "on" : "off"}
        </button>

        <span aria-hidden="true" className="hidden h-full items-center px-2 sm:flex">
          <Bell className="h-[13px] w-[13px]" strokeWidth={1.8} />
        </span>
      </div>
    </footer>
  );
}
