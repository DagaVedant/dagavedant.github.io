import { Star, GitFork, Eye, Scale, Link2, Folder, File as FileGlyph, GitCommitHorizontal } from "lucide-react";

/**
 * The pieces of a GitHub repository page, in the order GitHub stacks them.
 *
 * Colours for the language bar come from GitHub's linguist palette so the bar
 * reads correctly to anyone who has seen the real thing — Python blue, JS
 * yellow, TypeScript blue, and so on.
 */

const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Jupyter Notebook": "#DA5B0B",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  SCSS: "#c6538c",
  Vue: "#41b883",
};

export const langColor = (name) => LANG_COLORS[name] || "#8b949e";

/* ----------------------------------------------------------------- header */

export function RepoHeader({ repo }) {
  return (
    <header className="border-b border-vs-border pb-5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <a
          href={`https://github.com/${repo.owner}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[20px] text-vs-accent hover:underline"
        >
          {repo.owner}
        </a>
        <span className="text-[20px] text-vs-descr">/</span>
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[20px] font-semibold text-vs-accent hover:underline"
        >
          {repo.repo}
        </a>
        <span className="ml-1 rounded-full border border-vs-border px-2 py-[1px] text-[11px] text-vs-descr">
          Public
        </span>
      </div>

      {repo.description ? (
        <p className="t-body mt-3 max-w-[70ch] text-vs-text/80">{repo.description}</p>
      ) : null}

      {repo.topics?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {repo.topics.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#121d2f] px-[10px] py-[2px] text-[12px] text-vs-accent"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-vs-descr">
        <Stat icon={Star} value={repo.stars} label={repo.stars === 1 ? "star" : "stars"} />
        <Stat icon={GitFork} value={repo.forks} label={repo.forks === 1 ? "fork" : "forks"} />
        <Stat icon={Eye} value={repo.watchers} label="watching" />
        <Stat icon={GitCommitHorizontal} value={repo.commitCount} label="commits" />
        {repo.license ? (
          <span className="flex items-center gap-1.5">
            <Scale className="h-[15px] w-[15px]" strokeWidth={1.6} />
            {repo.license}
          </span>
        ) : null}
        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-vs-accent hover:underline"
          >
            <Link2 className="h-[15px] w-[15px]" strokeWidth={1.6} />
            {repo.homepage.replace(/^https?:\/\//, "")}
          </a>
        ) : null}
      </div>
    </header>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
      <span className="font-semibold text-vs-text">{value}</span> {label}
    </span>
  );
}

/* ----------------------------------------------------------- language bar */

export function LanguageBar({ languages }) {
  if (!languages?.length) return null;

  return (
    <section aria-label="Languages" className="py-5">
      <div className="flex h-[10px] w-full overflow-hidden rounded-full">
        {languages.map((l) => (
          <span
            key={l.name}
            title={`${l.name} ${l.percent}%`}
            style={{ width: `${l.percent}%`, backgroundColor: langColor(l.name) }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {languages.map((l) => (
          <li key={l.name} className="flex items-center gap-2 text-[12.5px] text-vs-descr">
            <span
              aria-hidden="true"
              className="block h-[10px] w-[10px] rounded-full"
              style={{ backgroundColor: langColor(l.name) }}
            />
            <span className="text-vs-text">{l.name}</span>
            <span>{l.percent}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------- file list */

export function FileListing({ repo, onOpenFile, activeFileName }) {
  if (!repo.files?.length) return null;

  const latest = repo.commits?.[0];

  return (
    <section aria-label="Files" className="pb-6">
      <div className="overflow-hidden rounded-[6px] border border-vs-border">
        <div className="flex items-center gap-2 border-b border-vs-border bg-vs-widget px-4 py-2 text-[12.5px] text-vs-descr">
          {latest ? (
            <>
              <span className="truncate text-vs-text">{latest.message}</span>
              <span className="ml-auto flex-none">
                {relativeTime(latest.date)} · {repo.commitCount} commits
              </span>
            </>
          ) : (
            <span className="ml-auto">{repo.files.length} entries</span>
          )}
        </div>

        <ul>
          {repo.files.map((f) => {
            const clickable = f.hasSource && onOpenFile;
            const Row = clickable ? "button" : "div";
            return (
              <li key={f.name} className="border-t border-vs-border/60 first:border-t-0">
                <Row
                  {...(clickable
                    ? { type: "button", onClick: () => onOpenFile(f.name) }
                    : {})}
                  data-active={activeFileName === f.name || undefined}
                  className={`flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] ${
                    clickable ? "hover:bg-vs-list-hover" : ""
                  } ${activeFileName === f.name ? "bg-vs-list-active" : ""}`}
                >
                  {f.type === "dir" ? (
                    <Folder className="h-4 w-4 flex-none text-[#54aeff]" strokeWidth={1.6} />
                  ) : (
                    <FileGlyph className="h-4 w-4 flex-none text-vs-descr" strokeWidth={1.6} />
                  )}
                  <span
                    className={`truncate ${
                      clickable ? "text-vs-accent hover:underline" : "text-vs-text"
                    }`}
                  >
                    {f.name}
                  </span>
                  {f.type === "file" && !f.hasSource ? (
                    <span className="ml-auto flex-none text-[11.5px] text-vs-descr">
                      {formatBytes(f.size)}
                    </span>
                  ) : null}
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- commit list */

export function CommitList({ commits, repo }) {
  if (!commits?.length) return null;

  return (
    <section aria-label="Recent commits" className="pb-8">
      <h2 className="t-h3 mb-3">Recent commits</h2>
      <ul className="overflow-hidden rounded-[6px] border border-vs-border">
        {commits.map((c) => (
          <li
            key={c.sha}
            className="flex items-center gap-3 border-b border-vs-border/60 px-4 py-[9px] last:border-b-0"
          >
            {c.avatar ? (
              <img
                src={c.avatar}
                alt=""
                loading="lazy"
                className="h-5 w-5 flex-none rounded-full"
              />
            ) : (
              <span className="h-5 w-5 flex-none rounded-full bg-vs-contrast" />
            )}
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-[13px] text-vs-text hover:text-vs-accent hover:underline"
            >
              {c.message}
            </a>
            <code className="flex-none rounded-[3px] bg-vs-contrast px-1.5 py-[1px] font-mono text-[11.5px] text-vs-descr">
              {c.sha}
            </code>
            <span className="flex-none text-[11.5px] text-vs-descr">{relativeTime(c.date)}</span>
          </li>
        ))}
      </ul>
      <a
        href={`${repo.htmlUrl}/commits`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[12.5px] text-vs-accent hover:underline"
      >
        View all {repo.commitCount} commits →
      </a>
    </section>
  );
}

/* ------------------------------------------------------------------ utils */

export function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, size] of units) {
    const n = Math.floor(secs / size);
    if (n >= 1) return `${n} ${name}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

export function formatBytes(n) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
