import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { TREE, WORKSPACE_NAME } from "@/lib/files";
import FileIcon from "./FileIcon";

/** Depth-based indent, matching the reference screenshot's step. */
const indent = (depth) => ({ paddingLeft: `${8 + depth * 12}px` });

function FileRow({ file, depth, isActive, onOpen }) {
  return (
    <button
      type="button"
      className="vs-row"
      style={indent(depth)}
      data-active={isActive || undefined}
      onClick={() => onOpen(file.id)}
      title={file.name}
    >
      <FileIcon ext={file.ext} className="h-4 w-4 flex-none" />
      <span className="truncate">{file.name}</span>
    </button>
  );
}

function FolderRow({ node, depth, open, onToggle, children }) {
  return (
    <>
      <button
        type="button"
        className="vs-row"
        style={indent(depth)}
        onClick={onToggle}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 flex-none text-vs-descr" strokeWidth={1.6} />
        ) : (
          <ChevronRight className="h-4 w-4 flex-none text-vs-descr" strokeWidth={1.6} />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {open ? children : null}
    </>
  );
}

/** Outline and Timeline, collapsed — as in the screenshot. Decorative. */
function CollapsedPane({ label }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-[22px] flex-none cursor-default select-none items-center gap-1 border-t border-vs-border px-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-vs-text/85"
    >
      <ChevronRight className="h-4 w-4 text-vs-descr" strokeWidth={1.6} />
      {label}
    </div>
  );
}

export default function Explorer() {
  const { activeId, open } = useWorkspace();
  const [expanded, setExpanded] = useState(() => new Set(["projects"]));
  const [rootOpen, setRootOpen] = useState(true);

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <aside
      aria-label="Explorer"
      className="flex h-full min-h-0 flex-col overflow-hidden border-r border-vs-border bg-vs-chrome"
    >
      <div className="flex h-[35px] flex-none items-center justify-between pl-5 pr-2">
        <span className="t-chrome">Explorer</span>
        <MoreHorizontal aria-hidden="true" className="h-4 w-4 text-vs-descr" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2">
        <button
          type="button"
          className="vs-row font-semibold uppercase tracking-[0.02em]"
          style={{ paddingLeft: "8px", fontSize: "11px" }}
          onClick={() => setRootOpen((v) => !v)}
          aria-expanded={rootOpen}
        >
          {rootOpen ? (
            <ChevronDown className="h-4 w-4 flex-none text-vs-descr" strokeWidth={1.6} />
          ) : (
            <ChevronRight className="h-4 w-4 flex-none text-vs-descr" strokeWidth={1.6} />
          )}
          <span className="truncate">{WORKSPACE_NAME}</span>
        </button>

        {rootOpen
          ? TREE.map((node) =>
              node.kind === "folder" ? (
                <FolderRow
                  key={node.id}
                  node={node}
                  depth={1}
                  open={expanded.has(node.id)}
                  onToggle={() => toggle(node.id)}
                >
                  {node.children.map((child) => (
                    <FileRow
                      key={child.id}
                      file={child}
                      depth={2}
                      isActive={activeId === child.id}
                      onOpen={open}
                    />
                  ))}
                </FolderRow>
              ) : (
                <FileRow
                  key={node.id}
                  file={node}
                  depth={1}
                  isActive={activeId === node.id}
                  onOpen={open}
                />
              )
            )
          : null}
      </div>

      <CollapsedPane label="Outline" />
      <CollapsedPane label="Timeline" />
    </aside>
  );
}
