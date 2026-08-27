import { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Code2 } from "lucide-react";
import CodeFrame from "./CodeFrame";

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;

function InlineSource({ text }) {
  const parts = text.split(INLINE).filter((p) => p !== undefined && p !== "");

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <span key={i} className="tok-string">
              {part}
            </span>
          );
        }
        if (part.startsWith("**")) {
          return (
            <span key={i} className="tok-constant font-semibold">
              {part}
            </span>
          );
        }
        if (part.startsWith("[")) {
          const split = part.indexOf("](");
          return (
            <Fragment key={i}>
              <span className="tok-function">{part.slice(0, split + 1)}</span>
              <span className="tok-string">{part.slice(split + 1)}</span>
            </Fragment>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function SourceLine(line) {
  if (line.startsWith("#")) {
    const hashes = line.match(/^#+/)[0];
    return (
      <span className="tok-keyword font-semibold">
        {hashes}
        <span className="tok-function">{line.slice(hashes.length)}</span>
      </span>
    );
  }
  if (line.startsWith(">")) {
    return (
      <span className="tok-comment">
        <InlineSource text={line} />
      </span>
    );
  }
  if (/^\s*[-*]\s/.test(line)) {
    const marker = line.match(/^\s*[-*]\s/)[0];
    return (
      <>
        <span className="tok-keyword">{marker}</span>
        <InlineSource text={line.slice(marker.length)} />
      </>
    );
  }
  return <InlineSource text={line} />;
}

const components = {
  h1: ({ children }) => <h1 className="t-display mb-5 mt-2">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="t-h2 mb-3 mt-10 border-t border-vs-border pt-8 first:mt-0 first:border-0 first:pt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="t-h3 mb-2 mt-6">{children}</h3>,
  p: ({ children }) => <p className="t-body mb-4 max-w-[68ch]">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 flex list-none flex-col gap-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 flex list-none flex-col gap-2">{children}</ol>,
  li: ({ children }) => (
    <li className="t-body relative max-w-[68ch] pl-5 before:absolute before:left-0 before:text-vs-descr before:content-['-']">
      {children}
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="text-vs-accent underline decoration-vs-accent/40 underline-offset-2 hover:decoration-vs-accent"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-[3px] bg-vs-contrast px-[5px] py-[1px] font-mono text-[0.88em] text-vs-string">
      {children}
    </code>
  ),
  strong: ({ children }) => <strong className="font-semibold text-vs-text">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-vs-border pl-4 text-vs-descr [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-vs-border" />,
};

export default function MarkdownView({ source }) {
  const [mode, setMode] = useState("preview");
  const lines = source.split("\n");

  return (
    <div className="relative min-h-full">
      <ViewToggle mode={mode} onChange={setMode} />

      {mode === "preview" ? (
        <div className="doc">
          <ReactMarkdown components={components}>{source}</ReactMarkdown>
        </div>
      ) : (
        <CodeFrame lines={lines} renderLine={SourceLine} />
      )}
    </div>
  );
}

export function ViewToggle({ mode, onChange }) {
  return (
    <div className="pointer-events-none sticky top-0 z-10 flex justify-end px-4 pt-3">
      <div className="pointer-events-auto flex overflow-hidden rounded-[4px] border border-vs-border bg-vs-widget">
        {[
          { id: "preview", label: "Preview", icon: Eye },
          { id: "source", label: "Source", icon: Code2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={mode === id}
            className={`flex items-center gap-1.5 px-2.5 py-[5px] text-[12px] transition-colors ${
              mode === id
                ? "bg-vs-list-active text-vs-text"
                : "text-vs-descr hover:text-vs-text"
            }`}
          >
            <Icon className="h-[13px] w-[13px]" strokeWidth={1.6} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
