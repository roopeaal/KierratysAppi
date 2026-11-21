// Original category artwork. Run from anywhere: node mobile/app/assets/material-studies/generate.mjs
// Uses the project's Chromium QA tooling; ships no renderer or fonts to the app.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const palette = {
  mint: ["#bfe6dc", "#539a8a", "#f0fbf7"],
  ochre: ["#efd095", "#ba7b45", "#fff0ce"],
  leaf: ["#b7dbb8", "#5b9b72", "#e9f4d5"],
  steel: ["#c2d4db", "#6c8b9d", "#e9f2f5"],
  lilac: ["#d8cdef", "#9182bb", "#f4ecff"],
  coral: ["#f6c0ac", "#d5745e", "#fff0e6"],
};
const drawings = {
  "plastic-object": [
    "Muoviesineet",
    "mint",
    '<path fill="a" d="M12 19h40l-5 32q-15 8-30 0z"/><path fill="b" d="M16 27h32l-3 18q-13 5-26 0z"/><ellipse fill="c" cx="32" cy="19" rx="20" ry="7"/><path d="M17 19c-6-17 37-17 30 0M26 35l1 8m10-8-1 8"/>',
  ],
  paper: [
    "Paperi",
    "steel",
    '<path fill="b" d="m11 22 31-8 10 34-31 9z"/><path fill="c" d="m20 9 24-2 11 10-2 35-36-2z"/><path fill="a" d="m44 7-1 12 12-2z"/><path d="m24 25 22 1m-23 6 23 1m-23 6 16 1"/>',
  ],
  "private-paper": [
    "Salassa pidettävä paperi",
    "steel",
    '<path fill="c" d="M11 9h27l10 10v35H11z"/><path fill="a" d="M38 9v11h10z"/><path d="M18 26h13m-13 7h9m-9 7h8"/><path d="M34 39v-5a7 7 0 0 1 14 0v5"/><rect fill="b" x="30" y="37" width="22" height="17" rx="4"/><path stroke="c" d="M41 44v4"/>',
  ],
  "small-metal": [
    "Pienmetalli",
    "steel",
    '<g transform="rotate(23 32 32)"><path fill="a" d="M20 30v22a3 3 0 0 0 6 0V30c10-7 4-21-3-21s-13 14-3 21z"/><path fill="c" d="M42 54V33l-5-5V11h2v12h4V11h3v12h4V11h2v17l-4 5v21z"/><path d="M20 23q3 3 6 0"/></g>',
  ],
  "scrap-metal": [
    "Metalliromu",
    "steel",
    '<path fill="a" d="M54 12 43 22l-5-5L48 7c-9-3-18 3-16 14L11 42a7 7 0 0 0 10 10l21-21c11 2 17-10 12-19z"/><circle fill="c" cx="16" cy="47" r="3"/><path d="m25 39 12-12"/>',
  ],
  wood: [
    "Puu",
    "ochre",
    '<g transform="rotate(-18 32 32)"><path fill="a" d="M12 21h40v12H12zM12 36h40v12H12z"/><path fill="b" d="M12 21l6-5h38l-4 5zm40 0 4-5v12l-4 5zm0 15 4-5v12l-4 5z"/><path fill="c" d="m12 36 6-5h38l-4 5z"/><path d="M18 27h15m-14 15h22m-3-14h7"/></g>',
  ],
  "treated-wood": [
    "Painekyllästetty puu",
    "leaf",
    '<path fill="a" d="m12 22 32-9 8 7v25l-32 9-8-8z"/><path fill="b" d="m20 30 32-10v25l-32 9z"/><path fill="c" d="m12 22 32-9 8 7-32 10z"/><path d="m16 28 4 5m-4 8 4 4m6-7 18-5m-18 12 13-4"/><path fill="c" d="M45 26c2 4 7 8 7 12a7 7 0 0 1-14 0c0-4 5-8 7-12z"/>',
  ],
  composite: [
    "Yhdistelmämateriaali",
    "lilac",
    '<path fill="b" d="m10 38 23-10 21 10-23 12z"/><path fill="a" d="m10 30 23-10 21 10-23 12z"/><path fill="c" d="m10 22 23-10 21 10-23 12z"/><path d="m25 22 9-4m-4 7 9-4"/>',
  ],
  other: [
    "Muu materiaali",
    "steel",
    '<rect fill="a" x="10" y="16" width="44" height="32" rx="10"/><path stroke="c" stroke-width="3" d="M18 23h25"/><circle fill="b" cx="22" cy="33" r="2"/><circle fill="b" cx="32" cy="33" r="2"/><circle fill="b" cx="42" cy="33" r="2"/>',
  ],
  deposit: [
    "Panttipalautus",
    "leaf",
    '<path fill="a" d="M25 11h10v10l5 6v20H20V27l5-6z"/><path fill="b" d="M24 8h12v7H24z"/><path fill="c" d="M21 31h18v9H21z"/><circle fill="#efd095" cx="43" cy="43" r="12"/><path d="M43 36v14m-4-10 4-4 4 4m-8 6 4 4 4-4"/>',
  ],
  batteries: [
    "Paristot ja pienakut",
    "ochre",
    '<g transform="rotate(20 32 32)"><rect fill="c" x="25" y="8" width="14" height="9" rx="2"/><rect fill="a" x="21" y="15" width="22" height="39" rx="5"/><path fill="b" d="M21 39h22v10q0 5-5 5H26q-5 0-5-5z"/><path d="M32 21v11m-5-5h10m-9 20h8"/></g>',
  ],
  "vehicle-battery": [
    "Ajoneuvoakut",
    "ochre",
    '<path fill="a" d="M13 21h38v30H13z"/><path fill="b" d="M10 20h44v8H10z"/><path fill="c" d="M16 14h8v6h-8zm24 0h8v6h-8z"/><path d="M20 35v8m-4-4h8m16 0h8"/><path fill="c" d="m33 31-6 11h5l-1 5 6-10h-5z"/>',
  ],
  electronics: [
    "Sähkölaitteet",
    "lilac",
    '<rect fill="b" x="8" y="12" width="48" height="33" rx="5"/><rect fill="c" x="13" y="17" width="38" height="22" rx="2"/><path fill="a" d="M27 45h10v8h9v3H18v-3h9z"/><path d="m20 29 8-7m-1 10 7-7"/>',
  ],
  textiles: [
    "Tekstiilit ja vaatteet",
    "lilac",
    '<path fill="a" d="m23 11-13 8-3 13 11 4 4-8-1 25h22l-1-25 4 8 11-4-3-13-13-8a10 10 0 0 1-18 0z"/><path fill="b" d="m23 11-4 3a14 14 0 0 0 26 0l-4-3a10 10 0 0 1-18 0z"/><path fill="c" d="M29 34h8v8l-4 3-4-3z"/>',
  ],
  shoes: [
    "Kengät",
    "lilac",
    '<path fill="a" d="m12 18 14-3 7 13 15 5q10 4 8 14H8q-4-8 4-29z"/><path fill="c" d="M7 44q26 3 49-3v9q-20 6-46 2z"/><path d="m25 23-7 3m11 3-7 3m12-1-7 5"/>',
  ],
  food: [
    "Biojäte",
    "leaf",
    '<path fill="a" d="M31 21c-8-13-21-7-21 6 0 16 10 26 16 25l6-3 6 3c6 1 16-9 16-25 0-13-13-19-22-6z"/><path fill="b" d="M32 20c1-10 6-13 15-13-1 8-6 13-15 13z"/><path d="M32 21c-2-7-4-11-8-13"/><path stroke="c" stroke-width="3" d="M17 30q-1 7 4 12"/>',
  ],
  garden: [
    "Puutarhajäte",
    "leaf",
    '<path fill="a" d="M13 33c-4-17 7-24 34-25 1 24-10 39-25 34z"/><path fill="b" d="M31 45c4-11 13-15 24-15-1 16-10 23-24 22z"/><path d="M12 55 37 22m-9 25 15-7M20 38l-2-11m10 2 9 1"/>',
  ],
  branches: [
    "Risut ja oksat",
    "leaf",
    '<path fill="a" d="m13 52 16-21-6-14 4-3 7 12L48 9l4 4-14 18 14-2 1 5-20 4-15 18z"/><path d="m27 42 6-9"/><path fill="b" d="M15 20q0-13 13-11 1 11-13 11zm34 6q0-12 11-12 2 10-11 12z"/>',
  ],
  hazardous: [
    "Vaarallinen jäte",
    "coral",
    '<path fill="a" d="M13 24 22 12h24v8l7 7v23q0 5-5 5H17q-4 0-4-5z"/><path fill="c" d="M26 15h14v6H23z"/><path fill="b" d="M42 9h8v10h-8z"/><path fill="c" d="m33 25 12 12-12 12-12-12z"/><path stroke-width="3" d="M33 32v6m0 4h.01"/>',
  ],
  medicine: [
    "Lääkejäte",
    "coral",
    '<g transform="rotate(15 32 32)"><rect fill="c" x="15" y="8" width="34" height="48" rx="6"/><rect fill="a" x="21" y="15" width="9" height="15" rx="5"/><rect fill="a" x="34" y="15" width="9" height="15" rx="5"/><rect fill="a" x="21" y="34" width="9" height="15" rx="5"/><rect fill="b" x="34" y="34" width="9" height="15" rx="5"/><path d="M21 22h9m4 0h9m-22 19h9m4 0h9"/></g>',
  ],
  "special-waste": [
    "Erityiskäsiteltävä jäte",
    "coral",
    '<rect fill="a" x="12" y="20" width="40" height="32" rx="6"/><path fill="b" d="M23 20v-7h18v7H36v-3h-8v3z"/><path fill="c" d="M12 30h40v9H12z"/><path stroke-width="3" d="M32 28v11m0 5h.01"/>',
  ],
  bulb: [
    "Lamput",
    "ochre",
    '<path fill="c" d="M22 44c0-8-7-10-7-20a17 17 0 0 1 34 0c0 10-7 12-7 20z"/><path fill="a" d="M27 43v-8l-4-9 9 4 9-4-4 9v8z"/><path fill="b" d="M23 44h18v8l-5 5h-8l-5-5z"/><path d="M24 49h16m-23-30q2-4 6-6"/>',
  ],
  fluorescent: [
    "Loisteputket",
    "mint",
    '<g transform="rotate(32 32 32)"><rect fill="c" x="25" y="10" width="14" height="44" rx="4"/><path fill="b" d="M25 13h14v7H25zm0 31h14v7H25z"/><path d="M29 7v4m6-4v4m-6 42v4m6-4v4m-6-34v16"/></g>',
  ],
  tyres: [
    "Renkaat",
    "steel",
    '<circle fill="b" cx="32" cy="32" r="24"/><circle fill="a" cx="32" cy="32" r="15"/><circle fill="c" cx="32" cy="32" r="9"/><path stroke="c" d="m18 16 4 3m10-9v5m13 1-3 4m10 5-5 2m4 15-5-2m-4 11-2-4m-9 7v-5m-12 1 3-4m-9-6 5-1m-4-14 5 1"/>',
  ],
  vehicles: [
    "Romuajoneuvot",
    "steel",
    '<path fill="a" d="m15 29 7-13h20l7 13 7 6v13H8V35z"/><path fill="c" d="M23 20h18l5 10H18z"/><path fill="b" d="M8 38h48v10H8z"/><circle fill="c" cx="17" cy="48" r="6"/><circle fill="c" cx="47" cy="48" r="6"/><path d="M25 40h14m-27-4h6m28 0h6"/>',
  ],
  mixed: [
    "Sekajäte",
    "steel",
    '<path fill="a" d="M17 21h30l-3 32H20z"/><path fill="b" d="M14 16h36v7H14z"/><path fill="c" d="M27 11h10v5H27z"/><path d="m25 28 1 18m6-18v18m7-18-1 18"/>',
  ],
  bulky: [
    "Isot esineet",
    "lilac",
    '<path fill="b" d="M14 21q0-8 8-8h20q8 0 8 8v17H14z"/><path fill="a" d="M18 35h28v-6q0-6 6-6t6 6v19H6V29q0-6 6-6t6 6z"/><path fill="c" d="M18 35h28v6H18z"/><path d="M12 49v6m40-6v6m-20-35v10"/>',
  ],
  reuse: [
    "Uudelleenkäyttö",
    "leaf",
    '<path fill="a" d="M11 30h42l-4 24H15z"/><path fill="b" d="m11 30 7-14h28l7 14H41l-9-5-9 5z"/><path fill="c" d="M32 43c-8-4-10-10-5-12 3-1 5 2 5 2s2-3 5-2c5 2 3 8-5 12z"/>',
  ],
  construction: [
    "Rakennus- ja purkujäte",
    "ochre",
    '<path fill="a" d="M9 30h46v22H9z"/><path fill="b" d="M15 16h34v14H15z"/><path fill="c" d="M9 36h46v6H9z"/><path d="M30 16v14m-6 12v10m19-10v10"/>',
  ],
  plaster: [
    "Kipsijäte",
    "steel",
    '<path fill="b" d="m12 28 30-13 11 10v17L23 55 12 44z"/><path fill="a" d="m23 39 30-14v17L23 55z"/><path fill="c" d="m12 28 30-13 11 10-30 14z"/><path d="m17 33 6 6m5 8 18-8m-14-11 11-5"/>',
  ],
  "mineral-waste": [
    "Palamaton jäte ja kiviaines",
    "ochre",
    '<path fill="a" d="m8 47 7-18 12-4 11 8 8-11 10 8 3 17-11 7H17z"/><path fill="b" d="m15 29 10 13 13-9-11-8zm23 4 9 9 9-12-10-8z"/><path fill="c" d="m25 42 13-9 9 9 10 5-10 7H25z"/>',
  ],
  soil: [
    "Maa-aines",
    "ochre",
    '<path fill="a" d="M7 48 20 29l10-3 6 6 7-4 14 20-8 6H16z"/><path fill="b" d="M7 48q24 2 50 0l-8 6H16z"/><path d="m25 35 3 2m11 2 3 3m-25 1 3-1m11 4 2-1"/><path fill="#b7dbb8" d="M31 28c-6-2-9-7-8-13 5 1 9 5 8 13zm0 0c0-8 4-11 10-12 0 7-4 11-10 12z"/>',
  ],
  insulation: [
    "Eristevilla",
    "ochre",
    '<path fill="a" d="M12 31q0-10 10-14l18-7c9-4 17 0 17 9v15q0 10-9 13l-22 8c-9 3-14-2-14-10z"/><path fill="c" d="M12 31q0-9 8-12 10-3 10 8v17q0 7-6 10-12 5-12-9z"/><path d="M17 39q0-9 4-10 4-2 4 7t-4 11q-2 0-2-4m16-15 17-7m-17 15 17-7"/>',
  ],
  asbestos: [
    "Asbestijäte",
    "coral",
    '<path fill="c" d="M11 18h42v35H11z"/><path fill="a" d="M11 12h42v9H11zm0 31h42v10H11z"/><path fill="b" d="m32 23 10 16H22z"/><path stroke="c" stroke-width="2" d="M32 29v4m0 3h.01"/>',
  ],
};

const dir = new URL("./", import.meta.url);
const gallery = process.argv[2] ? resolve(process.argv[2]) : undefined;
const original = [
  ["plastic", "Muovipakkaukset"],
  ["carton", "Kartonki ja pahvi"],
  ["glass", "Lasipakkaukset"],
  ["metal", "Metallipakkaukset"],
];
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 192, height: 192 } });
  for (const [id, [label, hue, picture]] of Object.entries(drawings)) {
    const [base, shadow, highlight] = palette[hue];
    const colors = { a: base, b: shadow, c: highlight };
    const colored = picture.replace(
      /(fill|stroke)="([abc])"/gu,
      (_, attr, color) => `${attr}="${colors[color]}"`,
    );
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 64 64"><title>${label}</title><g stroke="#243d35" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none">${colored}</g></svg>`;
    await page.setContent(`<body style="margin:0">${svg}</body>`);
    await writeFile(new URL(`${id}.png`, dir), await page.screenshot({ omitBackground: true }));
  }
  if (gallery) {
    await mkdir(resolve(gallery, ".."), { recursive: true });
    const entries = [...original, ...Object.entries(drawings).map(([id, [title]]) => [id, title])];
    const tiles = await Promise.all(
      entries.map(async ([id, title]) => {
        const png = await readFile(new URL(`${id}.png`, dir));
        return `<figure><img src="data:image/png;base64,${png.toString("base64")}" alt=""><figcaption>${title}</figcaption></figure>`;
      }),
    );
    await page.setViewportSize({ width: 850, height: 950 });
    await page.setContent(`<!DOCTYPE html><html lang="fi"><meta charset="utf-8"><style>
      body{margin:0;padding:35px;background:#edf5ee;color:#243d35;font:15px system-ui}
      h1{font-size:34px;margin:0 0 6px;letter-spacing:-1px}p{margin:0 0 24px;color:#426353}
      main{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
      figure{box-sizing:border-box;margin:0;min-height:107px;background:#fffdf7;border:1px solid #d3e4d8;border-radius:13px;padding:8px 5px;text-align:center}
      img{width:54px;height:54px}figcaption{font-size:13px;font-weight:600;line-height:1.18}
      </style><h1>KierrätysApin lajittelukuvakkeet</h1><p>${entries.length} kuvaketta · omaa viivapiirrostyyliä, ei virallisia astiamerkintöjä</p><main>${tiles.join("")}</main></html>`);
    await page.screenshot({ path: gallery, fullPage: true });
  }
} finally {
  await browser.close();
}
