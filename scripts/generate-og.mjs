/**
 * Renders the social-share card to src/app/opengraph-image.png with resvg,
 * using the bundled Instrument Serif + Inter files (no system fonts).
 * Next serves that file as og:image / twitter:image via the file convention.
 *
 *   node scripts/generate-og.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const og = (p) => join(root, "src/app/_og", p);

const W = 1200;
const H = 630;
const ink = "#2b2926";
const muted = "#6f6b63";
const green = "#31614a";
const paper = "#f8f5ef";
const hair = "#e3ddcf";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${paper}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${hair}" stroke-width="1"/>

  <g transform="translate(74,84)" stroke="${green}" stroke-width="2.4" stroke-linecap="round">
    <circle cx="15" cy="15" r="13" fill="none"/>
    <line x1="6" y1="15" x2="24" y2="15"/>
  </g>
  <text x="118" y="107" font-family="Instrument Serif" font-size="36" fill="${ink}">Fin<tspan font-style="italic">Track</tspan></text>

  <text x="74" y="316" font-family="Instrument Serif" font-size="78" letter-spacing="-0.5" fill="${ink}">Saiba para onde vai</text>
  <text x="74" y="404" font-family="Instrument Serif" font-style="italic" font-size="78" letter-spacing="-0.5" fill="${ink}">o seu dinheiro.</text>

  <text x="76" y="482" font-family="Inter" font-size="27" fill="${muted}">Importe o extrato do banco, deixe as regras categorizarem</text>
  <text x="76" y="520" font-family="Inter" font-size="27" fill="${muted}">e leia tudo num painel em dez segundos.</text>

  <line x1="74" y1="564" x2="${W - 74}" y2="564" stroke="${hair}" stroke-width="1"/>
  <text x="74" y="596" font-family="Inter" font-size="22" fill="${muted}">fintrack-ashen-two.vercel.app</text>
  <text x="${W - 74}" y="596" font-family="Inter" font-size="22" fill="${green}" text-anchor="end">Projeto de portfólio</text>
</svg>`;

const png = new Resvg(svg, {
  background: paper,
  fitTo: { mode: "original" },
  font: {
    loadSystemFonts: false,
    fontFiles: [og("Serif.ttf"), og("Serif-Italic.ttf"), og("Sans.ttf")],
    defaultFontFamily: "Inter",
  },
})
  .render()
  .asPng();

writeFileSync(join(root, "src/app/opengraph-image.png"), png);
console.log(`wrote src/app/opengraph-image.png (${png.length} bytes)`);
