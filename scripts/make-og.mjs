import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = path.join(ROOT, "scripts", "fonts");
const OUT = path.join(ROOT, "public", "og.png");

GlobalFonts.registerFromPath(path.join(FONTS, "Archivo-Bold.ttf"), "Archivo");
GlobalFonts.registerFromPath(path.join(FONTS, "Inter-Regular.ttf"), "Inter");
GlobalFonts.registerFromPath(path.join(FONTS, "JetBrainsMono-Regular.ttf"), "JetBrainsMono");

const W = 1200;
const H = 630;

const CHROME = "#181818";
const EDITOR = "#1F1F1F";
const BORDER = "#2B2B2B";
const TEXT = "#CCCCCC";
const MUTED = "#9D9D9D";
const ACCENT = "#0078D4";
const SELECT = "#04395E";

const TITLE = 64;
const ACT = 68;
const SIDE = 300;
const TABS = 56;
const STATUS = 44;

const NAME = "Vedant Daga";
const TAGLINE = "Building across AI/ML, full-stack, and IoT";
const DOMAIN = "dagavedant.github.io";
const FILES = [
  "about.md",
  "now.md",
  "projects",
  "stack.json",
  "uses.md",
  "education.md",
  "credentials.md",
  "contact.sh",
];

const canvas = createCanvas(W, H);
const x = canvas.getContext("2d");

x.fillStyle = EDITOR;
x.fillRect(0, 0, W, H);

x.fillStyle = CHROME;
x.fillRect(0, 0, W, TITLE);
["#FF5F57", "#FEBC2E", "#28C840"].forEach((col, i) => {
  x.beginPath();
  x.arc(28 + i * 22, TITLE / 2, 7, 0, Math.PI * 2);
  x.fillStyle = col;
  x.fill();
});
x.fillStyle = MUTED;
x.font = "20px Inter";
x.textAlign = "center";
x.fillText("vedant-daga", W / 2, TITLE / 2 + 7);
x.textAlign = "left";

x.fillStyle = CHROME;
x.fillRect(0, TITLE, ACT + SIDE, H - TITLE - STATUS);
x.strokeStyle = BORDER;
x.lineWidth = 1;
x.beginPath();
x.moveTo(ACT + SIDE + 0.5, TITLE);
x.lineTo(ACT + SIDE + 0.5, H - STATUS);
x.stroke();

x.fillStyle = "#FFFFFF";
x.fillRect(0, TITLE + 14, 3, 40);

x.fillStyle = MUTED;
x.font = "15px Inter";
x.fillText("EXPLORER", ACT + 22, TITLE + 34);

x.font = "18px Inter";
FILES.forEach((f, i) => {
  const y = TITLE + 80 + i * 38;
  if (i === 0) {
    x.fillStyle = SELECT;
    x.fillRect(ACT, y - 22, SIDE, 32);
  }
  x.fillStyle = i === 0 ? TEXT : MUTED;
  x.fillText(f, ACT + 40, y);
});

const EX = ACT + SIDE;
x.fillStyle = CHROME;
x.fillRect(EX, TITLE, W - EX, TABS);
x.fillStyle = EDITOR;
x.fillRect(EX, TITLE, 240, TABS);
x.fillStyle = ACCENT;
x.fillRect(EX, TITLE, 240, 2);
x.fillStyle = TEXT;
x.font = "18px Inter";
x.fillText("about.md", EX + 30, TITLE + 35);

const CX = EX + 56;
const CY = TITLE + TABS;

x.fillStyle = "#E8E8E8";
x.font = "92px Archivo";
x.fillText(NAME, CX, CY + 150);

x.fillStyle = MUTED;
x.font = "30px Inter";
x.fillText(TAGLINE, CX, CY + 205);

x.fillStyle = "#6E7681";
x.font = "20px JetBrainsMono";
x.fillText("$ code .", CX, CY + 290);

x.fillStyle = ACCENT;
x.fillRect(0, H - STATUS, W, STATUS);
x.fillStyle = "#FFFFFF";
x.font = "18px Inter";
x.fillText("main", 24, H - STATUS / 2 + 6);
x.textAlign = "right";
x.fillText(DOMAIN, W - 24, H - STATUS / 2 + 6);

const png = canvas.toBuffer("image/png");
writeFileSync(OUT, png);
console.log(`[make-og] ${OUT} ${W}x${H} ${Math.round(png.length / 1024)}kB`);
