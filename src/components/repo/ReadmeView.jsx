import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { BookOpen } from "lucide-react";

/**
 * A repo's real README, rendered the way GitHub renders it.
 *
 * READMEs are arbitrary third-party markup: badge rows, screenshots, HTML
 * blocks, tables. rehype-raw parses the embedded HTML so `<p align="center">
 * <img>` blocks survive, and rehype-sanitize runs AFTER it to strip anything
 * dangerous. Order matters — sanitising before raw parsing would leave the raw
 * HTML untouched.
 *
 * The schema below extends the default with just the attributes real READMEs
 * need: image sizing and alignment. It does not allow style or event handlers.
 */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img || []), "width", "height", "align", "loading"],
    p: [...(defaultSchema.attributes?.p || []), "align"],
    div: [...(defaultSchema.attributes?.div || []), "align"],
    h1: [...(defaultSchema.attributes?.h1 || []), "align"],
    a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
  },
};

const components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 border-b border-vs-border pb-2 text-[26px] font-semibold leading-tight text-vs-text first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 border-b border-vs-border pb-2 text-[20px] font-semibold text-vs-text">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-[16px] font-semibold text-vs-text">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4 text-[14.5px] leading-[1.7] text-vs-text/85">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-vs-accent hover:underline"
    >
      {children}
    </a>
  ),
  img: ({ src, alt, width }) => (
    <img
      src={src}
      alt={alt || ""}
      width={width}
      loading="lazy"
      className="my-3 inline-block max-w-full rounded-[4px]"
    />
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc pl-6 text-[14.5px] leading-[1.7] text-vs-text/85 marker:text-vs-descr">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal pl-6 text-[14.5px] leading-[1.7] text-vs-text/85 marker:text-vs-descr">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ inline, children, ...props }) =>
    inline ? (
      <code className="rounded-[4px] bg-vs-contrast px-[6px] py-[2px] font-mono text-[0.86em] text-vs-string">
        {children}
      </code>
    ) : (
      <code className="font-mono text-[12.5px] leading-[1.55]" {...props}>
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-[6px] border border-vs-border bg-vs-widget p-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-[3px] border-vs-border pl-4 text-vs-descr [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-[13.5px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-vs-border bg-vs-widget px-3 py-2 text-left font-semibold text-vs-text">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-vs-border px-3 py-2 text-vs-text/85">{children}</td>
  ),
  hr: () => <hr className="my-6 border-vs-border" />,
};

export default function ReadmeView({ markdown }) {
  if (!markdown) return null;

  return (
    <section aria-label="README" className="pb-10">
      <div className="mb-3 flex items-center gap-2 text-[12.5px] text-vs-descr">
        <BookOpen className="h-4 w-4" strokeWidth={1.6} />
        README.md
      </div>
      <div className="rounded-[6px] border border-vs-border px-6 py-5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
          components={components}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  );
}
