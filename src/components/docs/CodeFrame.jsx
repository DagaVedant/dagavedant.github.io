
export default function CodeFrame({ lines, renderLine }) {
  return (
    <div className="flex min-h-full font-mono text-[13px] leading-[20px]">
      <div
        aria-hidden="true"
        className="flex-none select-none pl-5 pr-4 pt-3 text-right text-vs-linenum"
        style={{ minWidth: "62px" }}
      >
        {lines.map((_, i) => (
          <div key={i} className="tabular-nums">
            {i + 1}
          </div>
        ))}
      </div>

      <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre px-2 pb-24 pt-3 text-vs-text">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="min-h-[20px]">
              {renderLine(line, i)}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
