import { Suspense, lazy } from "react";
import { useWorkspace } from "@/lib/workspace";
import { DOCS } from "@/content/docs";
import Welcome from "@/components/ide/Welcome";

/**
 * Dispatches the active file to the renderer for its type.
 *
 * The rule (spec 4): anything under projects/ opens the repo view whatever its
 * extension — the .py / .ipynb / .tsx suffix is there to give the tree its icon.
 * Per-extension rendering applies to the top-level files only.
 *
 * Every renderer is lazy. react-markdown plus rehype-raw/-sanitize is ~120kB
 * gzipped, and the Welcome screen — which is what every visitor sees first —
 * needs none of it. Splitting here keeps the landing paint to chrome + Welcome
 * and loads a renderer only when a file that needs it is opened.
 */
const MarkdownView = lazy(() => import("@/components/docs/MarkdownView"));
const JsonView = lazy(() => import("@/components/docs/JsonView"));
const ShellView = lazy(() => import("@/components/docs/ShellView"));
const PdfView = lazy(() => import("@/components/docs/PdfView"));
const RepoView = lazy(() => import("@/components/repo/RepoView"));

export default function Editor() {
  const { activeFile } = useWorkspace();

  if (!activeFile) return <Welcome />;

  return (
    <Suspense fallback={<Loading />}>
      <FileRenderer file={activeFile} />
    </Suspense>
  );
}

function FileRenderer({ file }) {
  if (file.kind === "repo") {
    // Keyed so switching repos remounts rather than showing the previous repo's
    // content while the new chunk loads.
    return <RepoView key={file.repo} file={file} />;
  }

  if (file.kind === "pdf") return <PdfView />;

  const doc = DOCS[file.doc];
  if (!doc) return <Missing file={file} />;

  switch (doc.kind) {
    case "json":
      return <JsonView source={doc.source} />;
    case "sh":
      return <ShellView source={doc.source} />;
    case "md":
    default:
      return <MarkdownView key={file.id} source={doc.source} />;
  }
}

/**
 * Deliberately quiet: chunks are local and resolve in a frame or two, so a
 * spinner would flash more often than it would inform.
 */
function Loading() {
  return <div className="doc" aria-busy="true" />;
}

function Missing({ file }) {
  return (
    <div className="doc">
      <p className="t-mono mb-4 text-vs-descr">{file.name}</p>
      <p className="t-body">No renderer is registered for this file.</p>
    </div>
  );
}
