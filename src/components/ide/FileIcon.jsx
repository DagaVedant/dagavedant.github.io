import { metaForExt } from "@/lib/files";

/**
 * Seti-style file glyphs. Each extension gets a distinct silhouette AND colour,
 * because the tree's job here is to show at a glance that the work spans
 * Python, notebooks, TypeScript, JavaScript and hardware.
 *
 * Drawn rather than imported so every icon shares one grid and one stroke
 * weight; lucide's set has no notebook or Arduino glyph.
 */
export default function FileIcon({ ext, className = "h-4 w-4" }) {
  const { color } = metaForExt(ext);
  const common = { className, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true };

  switch (ext) {
    case "py":
      // Two interlocking lobes, the Python silhouette.
      return (
        <svg {...common}>
          <path
            d="M7.9 1.5c-1.9 0-3.4.6-3.4 2v1.8h3.5v.5H3.3c-1.4 0-2.3 1-2.3 2.9s.8 3 2.2 3h1.2V9.6c0-1.4 1.2-2.6 2.6-2.6h3.4c1.2 0 2.2-1 2.2-2.2V3.5c0-1.2-1-2-2.3-2H7.9Z"
            fill={color}
          />
          <path
            d="M8.1 14.5c1.9 0 3.4-.6 3.4-2v-1.8H8v-.5h4.7c1.4 0 2.3-1 2.3-2.9s-.8-3-2.2-3h-1.2v2.1c0 1.4-1.2 2.6-2.6 2.6H5.6c-1.2 0-2.2 1-2.2 2.2v1.3c0 1.2 1 2 2.3 2h2.4Z"
            fill={color}
            opacity="0.62"
          />
        </svg>
      );

    case "ipynb":
      // Jupyter: three stacked cells with a run marker.
      return (
        <svg {...common}>
          <rect x="1.5" y="2.5" width="13" height="3.2" rx="0.6" stroke={color} strokeWidth="1.1" />
          <rect x="1.5" y="6.9" width="13" height="3.2" rx="0.6" stroke={color} strokeWidth="1.1" opacity="0.6" />
          <rect x="1.5" y="11.3" width="13" height="2.4" rx="0.6" stroke={color} strokeWidth="1.1" opacity="0.35" />
          <path d="M3.4 3.6v1" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );

    case "tsx":
    case "ts":
      // React orbit for tsx, plain badge for ts.
      return (
        <svg {...common}>
          <ellipse cx="8" cy="8" rx="6.6" ry="2.7" stroke={color} strokeWidth="1.1" />
          <ellipse cx="8" cy="8" rx="6.6" ry="2.7" stroke={color} strokeWidth="1.1" transform="rotate(60 8 8)" />
          <ellipse cx="8" cy="8" rx="6.6" ry="2.7" stroke={color} strokeWidth="1.1" transform="rotate(120 8 8)" />
          <circle cx="8" cy="8" r="1.5" fill={color} />
        </svg>
      );

    case "js":
      return (
        <svg {...common}>
          <rect x="1.5" y="1.5" width="13" height="13" rx="1.4" fill={color} opacity="0.16" stroke={color} strokeWidth="1.1" />
          <path d="M6.4 5.6v4.1c0 .9-.5 1.4-1.3 1.4-.5 0-.9-.2-1.2-.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 6.3c-.3-.5-.8-.8-1.5-.8-.9 0-1.5.5-1.5 1.2 0 1.7 3.2.9 3.2 2.7 0 .8-.7 1.4-1.7 1.4-.8 0-1.4-.3-1.8-.9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "html":
      return (
        <svg {...common}>
          <path d="M2 2h12l-1 11-5 1.6L3 13 2 2Z" stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M11.2 5.2H5.4l.25 2.4h5.3l-.35 3.2L8 11.6l-2.6-.8-.12-1.3" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "ino":
      // Arduino: the infinity mark.
      return (
        <svg {...common}>
          <path
            d="M4.2 4.6a3.4 3.4 0 1 0 0 6.8c2.6 0 4-6.8 7.6-6.8a3.4 3.4 0 1 1 0 6.8c-2.6 0-4-6.8-7.6-6.8Z"
            stroke={color}
            strokeWidth="1.2"
          />
          <path d="M2.9 8h2.2M10.9 8h2.2M12 6.9v2.2" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );

    case "json":
      return (
        <svg {...common}>
          <path d="M6.2 2.2c-2 0-2 2.4-2 3.4 0 1.3-.6 2-1.7 2.4 1.1.4 1.7 1.1 1.7 2.4 0 1 0 3.4 2 3.4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.8 2.2c2 0 2 2.4 2 3.4 0 1.3.6 2 1.7 2.4-1.1.4-1.7 1.1-1.7 2.4 0 1 0 3.4-2 3.4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "sh":
      return (
        <svg {...common}>
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.2" stroke={color} strokeWidth="1.1" />
          <path d="M4.2 6.2 6.4 8l-2.2 1.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.8 10.2h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "pdf":
      return (
        <svg {...common}>
          <path d="M3.5 1.5h6L13 5v9.5H3.5V1.5Z" stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M9.3 1.7V5H12.8" stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M5.4 11.6c1.9-.6 3-3.1 2.6-4.2-.5-1.2-1.6-.3-1.2 1.4.5 1.9 1.8 3 3.5 3.2" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "md":
    default:
      return (
        <svg {...common}>
          <rect x="1.2" y="3.4" width="13.6" height="9.2" rx="1.2" stroke={color} strokeWidth="1.1" />
          <path d="M3.6 10.6V5.4l2.2 2.7 2.2-2.7v5.2" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.6 5.4v5.2M10.6 10.6l1.6-1.9M10.6 10.6 9 8.7" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
