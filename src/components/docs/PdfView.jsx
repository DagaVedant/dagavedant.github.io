import { Download, ExternalLink } from "lucide-react";

/**
 * resume.pdf in a tab, the way VS Code opens a PDF.
 *
 * <object> rather than <iframe>: it degrades to its own children when the
 * browser has no PDF viewer, which gives a real fallback instead of an empty
 * grey rectangle. Some mobile browsers never render inline PDFs at all, so the
 * download and open-in-new-tab controls are always present rather than being a
 * fallback-only affordance.
 */
export default function PdfView() {
  const src = `${import.meta.env.BASE_URL}resume.pdf`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#2a2a2a]">
      <div className="flex flex-none items-center justify-between border-b border-vs-border bg-vs-editor px-4 py-2">
        <span className="t-mono text-vs-descr">resume.pdf</span>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[4px] border border-vs-border px-2.5 py-[5px] text-[12px] text-vs-descr transition-colors hover:border-vs-accent hover:text-vs-text"
          >
            <ExternalLink className="h-[13px] w-[13px]" strokeWidth={1.6} />
            Open
          </a>
          <a
            href={src}
            download="vedant-daga-resume.pdf"
            className="flex items-center gap-1.5 rounded-[4px] bg-vs-accent px-2.5 py-[5px] text-[12px] text-white transition-opacity hover:opacity-90"
          >
            <Download className="h-[13px] w-[13px]" strokeWidth={1.8} />
            Download
          </a>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {/* <object>'s children ARE the fallback: the browser renders them when
            it cannot display the resource. That is why this is not an <iframe>,
            and why no onError state is needed. */}
        <object data={src} type="application/pdf" className="h-full w-full" aria-label="Resume, PDF">
          <Fallback src={src} />
        </object>
      </div>
    </div>
  );
}

function Fallback({ src }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-vs-editor px-6 text-center">
      <p className="t-body">This browser will not display PDFs inline.</p>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-vs-accent underline underline-offset-2"
      >
        Open resume.pdf in a new tab
      </a>
    </div>
  );
}
