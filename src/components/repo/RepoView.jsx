// Placeholder — the real repo view is step 9.
import { repoFor } from "@/lib/files";

export default function RepoView({ file }) {
  const repo = repoFor(file);
  return (
    <div className="doc">
      <h1 className="t-h2 mb-2">{repo?.repo}</h1>
      <p className="t-body">{repo?.description}</p>
    </div>
  );
}
