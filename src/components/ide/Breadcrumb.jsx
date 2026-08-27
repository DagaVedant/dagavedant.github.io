import { ChevronRight } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { breadcrumbFor } from "@/lib/files";
import FileIcon from "./FileIcon";

export default function Breadcrumb() {
  const { activeFile } = useWorkspace();
  if (!activeFile) return <div className="h-full bg-vs-editor" />;

  const segments = breadcrumbFor(activeFile);

  return (
    <div
      aria-hidden="true"
      className="flex h-full select-none items-center gap-1 overflow-hidden bg-vs-editor px-5 text-[12px] text-vs-breadcrumb"
    >
      {segments.map((seg, i) => {
        const isFile = i === segments.length - 1;
        return (
          <span key={`${seg}-${i}`} className="flex flex-none items-center gap-1">
            {i > 0 ? <ChevronRight className="h-[13px] w-[13px] opacity-70" /> : null}
            {isFile ? <FileIcon ext={activeFile.ext} className="h-[13px] w-[13px]" /> : null}
            <span className="truncate">{seg}</span>
          </span>
        );
      })}
      <span className="flex flex-none items-center gap-1">
        <ChevronRight className="h-[13px] w-[13px] opacity-70" />
        <span className="opacity-70">…</span>
      </span>
    </div>
  );
}
