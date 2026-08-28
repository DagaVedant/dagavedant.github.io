import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { repoFor, loadRepoChunk } from "@/lib/files";
import { RepoTabs, RepoHeader, BranchBar, FileTable, AboutPanel, formatBytes } from "./RepoParts";
import ReadmeView from "./ReadmeView";


export default function RepoView({ file }) {
  const repo = repoFor(file);

  const [chunk, setChunk] = useState(null);
  const [state, setState] = useState("loading");
  const [openFile, setOpenFile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setOpenFile(null);

    loadRepoChunk(repo.repo)
      .then((data) => {
        if (cancelled) return;
        setChunk(data);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [repo.repo]);

  if (openFile) {
    return (
      <div className="min-h-full bg-gh-canvas text-gh-fg">
        <SourceView
          repo={repo}
          name={openFile}
          source={chunk?.sources?.[openFile]}
          onBack={() => setOpenFile(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gh-canvas text-gh-fg">
      <RepoHeader repo={repo} inProgress={file.inProgress} />
      <RepoTabs />

      <div className="mx-auto grid max-w-[1280px] gap-8 px-3 py-5 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_296px]">
        <main className="min-w-0">
          <BranchBar repo={repo} />
          <FileTable repo={repo} onOpenFile={chunk?.sources ? setOpenFile : null} />

          {state === "loading" ? (
            <p className="text-[13px] text-gh-muted">Loading README…</p>
          ) : state === "error" ? (
            <p className="text-[13px] text-gh-muted">
              README unavailable offline.{" "}
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gh-accent hover:underline"
              >
                Read it on GitHub
              </a>
            </p>
          ) : (
            <ReadmeView markdown={chunk?.readme} />
          )}
        </main>

        <AboutPanel repo={repo} />
      </div>
    </div>
  );
}


function SourceView({ repo, name, source, onBack }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-5">
      <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-gh-border pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[14px] text-gh-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          {repo.repo}
        </button>
        <span className="text-gh-muted">/</span>
        <span className="text-[14px] font-semibold text-gh-fg">{name}</span>
        {source ? (
          <span className="text-[12px] text-gh-muted">
            {source.lines} lines · {formatBytes(source.bytes)}
          </span>
        ) : null}
        <a
          href={`${repo.htmlUrl}/blob/${repo.defaultBranch}/${name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-[13px] text-gh-muted hover:text-gh-accent"
        >
          <ExternalLink className="h-[14px] w-[14px]" strokeWidth={1.8} />
          View on GitHub
        </a>
      </div>

      {source ? (
        <div
          className="overflow-hidden rounded-[6px] border border-gh-border bg-gh-canvas py-3"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: source.html }}
        />
      ) : (
        <p className="text-[13px] text-gh-muted">
          Source for this file was not included in the build.
        </p>
      )}
    </div>
  );
}
