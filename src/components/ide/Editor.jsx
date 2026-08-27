import { Suspense, lazy } from "react";
import { useWorkspace } from "@/lib/workspace";
import { DOCS } from "@/content/docs";
import Welcome from "@/components/ide/Welcome";


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
