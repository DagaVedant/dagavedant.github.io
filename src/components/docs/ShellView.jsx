import { ExternalLink } from "lucide-react";


export default function ShellView({ source }) {
  const { shebang, commands } = source;
  const gutterWidth = "62px";

  const lineNumbers = 2 + commands.length;

  return (
    <div className="flex min-h-full font-mono text-[13px] leading-[22px]">
      <div
        aria-hidden="true"
        className="flex-none select-none pl-5 pr-4 pt-3 text-right text-vs-linenum"
        style={{ minWidth: gutterWidth }}
      >
        {Array.from({ length: lineNumbers }, (_, i) => (
          <div key={i} className="tabular-nums">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1 pb-24 pl-2 pr-6 pt-3">
        <div className="tok-comment min-h-[22px]">{shebang}</div>
        <div className="min-h-[22px]" />

        {commands.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={`${c.label} ${c.arg}`}
            className="group -mx-2 flex min-h-[22px] items-center gap-2 rounded-[3px] px-2 hover:bg-vs-list-hover focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-vs-accent"
          >
            <span aria-hidden="true" className="tok-keyword">
              {c.cmd}
            </span>
            <span className="tok-string underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-vs-string">
              {c.arg}
            </span>
            {c.external ? (
              <ExternalLink
                aria-hidden="true"
                className="h-3 w-3 flex-none text-vs-descr opacity-0 transition-opacity group-hover:opacity-100"
              />
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}
