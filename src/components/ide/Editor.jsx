import { useWorkspace } from "@/lib/workspace";
import { repoFor } from "@/lib/files";

/**
 * Dispatches the active file to its renderer.
 *
 * Steps 8-10 replace these placeholders with the real per-extension renderers,
 * the repo view and the Welcome screen. Kept deliberately thin so that swap is
 * a one-line change per kind.
 */
export default function Editor() {
  const { activeFile } = useWorkspace();

  if (!activeFile) return <WelcomePlaceholder />;

  const repo = repoFor(activeFile);

  return (
    <div className="doc">
      <p className="t-mono mb-6 text-vs-descr">{activeFile.name}</p>
      <h1 className="t-h2 mb-3">{activeFile.title}</h1>
      <p className="t-body">
        {repo
          ? `${repo.description || "No description."} — ${repo.language}, ${repo.stars} stars, ${repo.commitCount} commits.`
          : `Renderer for .${activeFile.ext} arrives in a later step.`}
      </p>
    </div>
  );
}

function WelcomePlaceholder() {
  return (
    <div className="doc">
      <h1 className="t-display mb-4">Vedant Daga</h1>
      <p className="t-lead">Open a file from the Explorer.</p>
    </div>
  );
}
