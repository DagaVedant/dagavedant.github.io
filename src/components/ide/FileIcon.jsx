import python from "@/assets/languages/python.svg";
import javascript from "@/assets/languages/javascript.svg";
import typescript from "@/assets/languages/typescript.svg";
import react from "@/assets/languages/react.svg";
import html5 from "@/assets/languages/html5.svg";
import css3 from "@/assets/languages/css3.svg";
import jupyter from "@/assets/languages/jupyter.svg";
import bash from "@/assets/languages/bash.svg";
import markdown from "@/assets/languages/markdown.svg";
import arduino from "@/assets/languages/arduino.svg";
import json from "@/assets/languages/json.svg";


const LOGO = {
  py: python,
  js: javascript,
  jsx: javascript,
  mjs: javascript,
  ts: typescript,
  tsx: react,
  html: html5,
  css: css3,
  scss: css3,
  ipynb: jupyter,
  sh: bash,
  bash: bash,
  zsh: bash,
  md: markdown,
  markdown: markdown,
  ino: arduino,
  json: json,
};


function GenericFile({ className, color }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M3.6 1.5h5.6L12.6 5v9.5H3.6V1.5Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.1 1.7V5h3.4" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function PdfFile({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path d="M3.4 1.4h6L13 5v9.6H3.4V1.4Z" fill="#E74C3C" />
      <path d="M9.3 1.5V5h3.6" fill="#B33F31" />
      <path
        d="M5.2 11.7c1.9-.6 3-3.1 2.6-4.2-.5-1.2-1.6-.3-1.2 1.4.5 1.9 1.8 3 3.5 3.2"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FileIcon({ ext, className = "h-4 w-4" }) {
  const src = LOGO[ext];

  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`${className} select-none object-contain`}
      />
    );
  }

  if (ext === "pdf") return <PdfFile className={className} />;
  return <GenericFile className={className} color="#9D9D9D" />;
}
