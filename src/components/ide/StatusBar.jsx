import { GitBranch, CircleX, TriangleAlert, Bell, RefreshCw } from "lucide-react";
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


export default function StatusBar() {
  const { activeFile } = useWorkspace();
  const motion = useMotion();

  return (
    <footer className="flex h-full select-none items-stretch justify-between bg-vs-statusbar text-vs-statusbar-fg">
      <div className="flex items-stretch">
        <Item title={`${PROFILE_CONTRIBUTIONS.total} contributions in the last year`}>
          <GitBranch className="h-[13px] w-[13px]" strokeWidth={1.8} />
          main
          <RefreshCw className="ml-1 h-[11px] w-[11px] opacity-80" strokeWidth={1.8} />
        </Item>
        <Item title="No problems">
          <CircleX className="h-[13px] w-[13px]" strokeWidth={1.8} />0
          <TriangleAlert className="ml-1 h-[13px] w-[13px]" strokeWidth={1.8} />0
        </Item>
      </div>

      <div className="flex items-stretch">
        <Item>Ln 1, Col 1</Item>
        <Item>Spaces: 4</Item>
        <Item>UTF-8</Item>
        <Item>LF</Item>
        <Item>{languageLabel(activeFile)}</Item>

        <button
          type="button"
          onClick={() => setMotion(!motion)}
          aria-pressed={motion}
          title={
            motion
              ? "Animations are on. Click to turn them off."
              : "Animations are off. Click to turn them on."
          }
          className="flex h-full items-center gap-[5px] px-2 text-[12px] leading-none text-vs-statusbar-fg transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white"
        >
          motion: {motion ? "on" : "off"}
        </button>

        <span aria-hidden="true" className="flex h-full items-center px-2">
          <Bell className="h-[13px] w-[13px]" strokeWidth={1.8} />
        </span>
      </div>
    </footer>
  );
}
