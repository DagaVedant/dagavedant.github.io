import { useWorkspace } from "@/lib/workspace";
import { DOCS } from "@/content/docs";
import MarkdownView from "@/components/docs/MarkdownView";
import JsonView from "@/components/docs/JsonView";
import ShellView from "@/components/docs/ShellView";
import PdfView from "@/components/docs/PdfView";
import RepoView from "@/components/repo/RepoView";
import Welcome from "@/components/ide/Welcome";

/**
 * Dispatches the active file to the renderer for its type.
 *
 * The rule (spec 4): anything under projects/ opens the repo view whatever its
 * extension — the .py / .ipynb / .tsx suffix is there to give the tree its icon.
 * Per-extension rendering applies to the top-level files only.
 */
export default function Editor() {
  const { activeFile } = useWorkspace();

  if (!activeFile) return <Welcome />;

  if (activeFile.kind === "repo") {
    // Keyed so switching repos remounts rather than showing the previous repo's
    // content while the new chunk loads.
    return <RepoView key={activeFile.repo} file={activeFile} />;
  }

  if (activeFile.kind === "pdf") return <PdfView />;

  const doc = DOCS[activeFile.doc];
  if (!doc) return <Missing file={activeFile} />;

  switch (doc.kind) {
    case "json":
      return <JsonView source={doc.source} />;
    case "sh":
      return <ShellView source={doc.source} />;
    case "md":
    default:
      return <MarkdownView key={activeFile.id} source={doc.source} />;
  }
}

function Missing({ file }) {
  return (
    <div className="doc">
      <p className="t-mono mb-4 text-vs-descr">{file.name}</p>
      <p className="t-body">No renderer is registered for this file.</p>
    </div>
  );
}
