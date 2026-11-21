// Original miniatures for the Home history tiles. Render with existing Chrome QA tooling.
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const drawings = {
  bottle:
    '<g transform="rotate(17 32 32)"><path fill="#c5e5ed" stroke="#6a9eb6" d="M27 13h10v8l7 9v22q0 4-4 4H24q-4 0-4-4V30l7-9z"/><path fill="#88b8cf" stroke="none" d="M37 23l6 8v20l-4 4h-6l4-12-1-11z"/><path fill="#ecf8fc" stroke="none" d="m27 26 4-4-1 9-4 3-2 16h-2V35z"/><path fill="#f1faf9" stroke="#a0c4cc" d="M20 34q12 2 24 0v9q-12 2-24 0z"/><rect x="26" y="8" width="12" height="7" rx="2" fill="#297caf" stroke="#276488"/><path d="m23 48 19-2m-18 6 18-2" stroke="#78a6b9"/></g>',
  can: '<g transform="rotate(-12 32 32)"><path fill="#cbdfe1" stroke="#5c8391" d="M17 16h30v33c0 8-30 8-30 0z"/><path fill="#88acb8" stroke="none" d="M40 20h6v29l-6 4z"/><path fill="#db8072" stroke="#b75d54" d="M17 26q15 5 30 0v17q-15 5-30 0z"/><path stroke="#faecdb" d="m23 38 9-7m-5 10 9-7"/><ellipse fill="#eaf2ee" stroke="#5c8391" cx="32" cy="16" rx="15" ry="6"/><ellipse fill="#a6bdc0" stroke="none" cx="32" cy="15" rx="6" ry="2"/></g>',
  jar: '<path fill="#e2e8d3" stroke="#809b90" d="M20 19h24v7q5 2 5 8v14q0 6-6 6H21q-6 0-6-6V34q0-6 5-8z"/><path fill="#a6b5a0" stroke="none" d="M40 22h4v7l4 5v14l-4 5h-5l3-6V33l-2-6z"/><rect x="18" y="12" width="28" height="9" rx="2" fill="#95a883" stroke="#637c64"/><path d="M22 15v4m5-4v4m6-4v4m6-4v4" stroke="#cfdbc2"/><path fill="#f4e6ba" stroke="#d8c799" d="M15 35q17 2 34 0v11q-17 2-34 0z"/><path d="M22 30q-3 2-3 5v12" stroke="#f5faf0"/>',
  box: '<path fill="#e6bb81" stroke="#946d4a" d="m10 24 21-10 23 10v23L33 57 10 46z"/><path fill="#ba875a" stroke="#946d4a" d="m33 34 21-10v23L33 57z"/><path fill="#f2d6ab" stroke="#946d4a" d="m10 24 21-10 23 10-21 10z"/><path fill="#f8e9c5" stroke="none" d="m18 20 5-3 24 10v9l-5 3V29z"/><path d="m16 40 8 4m-8 0 5 2" stroke="#ae7853"/>',
  carton:
    '<path fill="#a7cdd9" stroke="#5e859d" d="m18 20 10-11h15v9l6 9v24l-16 5-15-7z"/><path fill="#729caf" stroke="#5e859d" d="m33 31 16-4v24l-16 5z"/><path fill="#ebf4ee" stroke="#5e859d" d="m18 20 15 5 10-7 6 9-16 4-15-6z"/><path fill="#f5f6da" stroke="none" d="m19 34 13 4v10l-13-4z"/><path d="m28 9 5 16m0 6v24" stroke="#5e859d"/><path stroke="#d0e7ef" d="m37 39 8-2m-8 6 8-2"/>',
  bag: '<path fill="#ac734c" stroke="#875738" d="m18 13 24-5 7 6 6 36-10 7-30-5 2-28z"/><path fill="#d9a674" stroke="#875738" d="m18 15 24-5 3 47-30-5 3-28z"/><path fill="#edc799" stroke="none" d="m19 17 6-2-2 33-5-1z"/><path fill="#f0d8ad" stroke="none" d="m23 31 15-3 2 16-17 2z"/><path fill="#885941" stroke="none" d="M35 34c4 4 0 10-5 8-5-3-1-9 5-8z"/><path d="m30 41 5-7" stroke="#f0d8ad"/><path d="m18 20 25-5m-25 8 25-5m2 33 8-4" stroke="#a66f49"/>',
  wrap: '<g transform="rotate(-17 32 32)"><path fill="#dcc9e8" stroke="#8c77a3" d="m9 24 11 4 7-5h13l7 5 8-4-2 9 2 9-8-4-7 4H27l-7-4-11 4 2-9z"/><rect fill="#ebe0f2" stroke="#8c77a3" x="20" y="27" width="27" height="11" rx="5"/><path d="m27 35 7-5m-3 5 7-5" stroke="#a58bbd"/></g>',
  tray: '<path fill="#6a8e87" stroke="#536e68" d="m9 26 10 20 13 7 22-13 3-13-26-9z"/><path fill="#b2cebd" stroke="#536e68" d="m8 25 21-11 28 10-25 17z"/><path fill="#dbe9d7" stroke="#7a9c8e" d="m16 26 14-8 19 7-17 11z"/><path d="m23 29 11-6m-5 9 11-7" stroke="#89aa9b"/>',
  cup: '<path fill="#ecc7a5" stroke="#a6775c" d="M16 20h32l-6 31q-10 7-20 0z"/><path fill="#cc9278" stroke="none" d="M42 25h5l-5 26-6 3z"/><path fill="#d48778" stroke="none" d="M19 34q13 4 26 0l-2 9q-11 3-22 0z"/><ellipse fill="#faeed9" stroke="#a6775c" cx="32" cy="20" rx="16" ry="5"/><ellipse fill="#b18872" stroke="none" cx="32" cy="21" rx="12" ry="2"/><path d="m22 28 3 19" stroke="#f7dfbd"/>',
  tube: '<g transform="rotate(19 32 32)"><path fill="#c8d4e8" stroke="#667f9d" d="M17 10h30l-5 32-6 5h-8l-6-5z"/><path fill="#9aaecf" stroke="none" d="M40 16h6l-4 26-6 5h-5l6-10z"/><path fill="#edf1f6" stroke="#a0b1cd" d="M20 22h24l-2 9H22z"/><rect fill="#728bad" stroke="#546c8d" x="27" y="45" width="10" height="10" rx="2"/><path d="M18 14h28m-22 20 1 7" stroke="#849cbf"/></g>',
  neutral:
    '<path fill="#ebf2ed" stroke="#799d92" d="M16 11h26l8 8v32l-5 4-5-3-5 3-5-3-5 3-5-3-4 3z"/><path fill="#bfdbd0" stroke="#799d92" d="M42 11v8h8z"/><path d="M22 21h12m-12 5h20" stroke="#aac4b8"/><path d="M22 32v13m4-13v13m4-13v13m6-13v13m4-13v13m4-13v13" stroke="#4e756b"/><path d="M48 48v-8m0 8h-8" stroke="#89ada2"/>',
};

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 144, height: 144 } });
  for (const [id, art] of Object.entries(drawings)) {
    await page.setContent(`<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 64 64">
      <ellipse cx="32" cy="57" rx="20" ry="3" fill="#43635a" opacity=".13"/>
      <g stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" fill="none">${art}</g></svg></body>`);
    await writeFile(
      new URL(`${id}.png`, import.meta.url),
      await page.screenshot({ omitBackground: true }),
    );
  }
} finally {
  await browser.close();
}
