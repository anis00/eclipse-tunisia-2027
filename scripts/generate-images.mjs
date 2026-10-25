/**
 * Generates the favicon, app icons and social-sharing images (Open Graph).
 *
 *   node scripts/generate-images.mjs
 *
 * Uses playwright-core with the locally installed Google Chrome (channel "chrome").
 * Outputs: public/favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png,
 * icon-512.png, site.webmanifest, og/og-{en,fr,ar}.jpg
 */
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const mark = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs><radialGradient id="c" cx="50%" cy="50%" r="50%">
    <stop offset="52%" stop-color="#fff6dc" stop-opacity="0.95"/>
    <stop offset="62%" stop-color="#f7b73b" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="#5fd4d9" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="64" height="64" rx="14" fill="#0a1028"/>
  <circle cx="32" cy="32" r="30" fill="url(#c)"/>
  <circle cx="32" cy="32" r="18.5" fill="#05060d" stroke="#fff6dc" stroke-width="1.2"/>
  <circle cx="44.6" cy="19.4" r="3.4" fill="#fffbe9"/>
</svg>`;

mkdirSync('public/og', { recursive: true });
writeFileSync('public/favicon.svg', mark(64));

const og = {
  en: { title: 'Total Solar Eclipse', sub: 'Tunisia · Monday 2 August 2027', line: 'Interactive map · Local times · Safety guide', dir: 'ltr' },
  fr: { title: 'Éclipse totale de Soleil', sub: 'Tunisie · Lundi 2 août 2027', line: 'Carte interactive · Horaires locaux · Guide de sécurité', dir: 'ltr' },
  ar: { title: 'الكسوف الكلي للشمس', sub: 'تونس · الاثنين 2 أوت 2027', line: 'خريطة تفاعلية · المواقيت المحلية · دليل السلامة', dir: 'rtl' },
};

const ogHtml = (l) => `<!doctype html><html lang="${l}" dir="${og[l].dir}"><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;font-family:'Noto Sans','Noto Sans Arabic',system-ui,sans-serif;color:#f5f2ea;
    background:radial-gradient(ellipse at 78% 50%,rgba(247,183,59,.16),transparent 45%),radial-gradient(ellipse at 10% 0%,rgba(165,151,255,.25),transparent 55%),linear-gradient(160deg,#05060d,#0a1028 60%,#101a3c)}
  .wrap{position:absolute;inset:0;padding:70px 80px;display:flex;flex-direction:column;justify-content:center;gap:18px;max-width:760px}
  [dir=rtl] .wrap{inset-inline-start:0;right:0;left:auto}
  .brand{font-weight:800;letter-spacing:.18em;font-size:26px;color:#5fd4d9;direction:ltr;unicode-bidi:isolate}
  h1{font-size:${l === 'ar' ? 72 : 70}px;line-height:1.1;font-weight:800}
  .sub{font-size:36px;color:#ffd68a;font-weight:700}
  .line{font-size:26px;color:#b3bad1;margin-top:10px}
  .ecl{position:absolute;top:115px;${og[l].dir === 'rtl' ? 'left' : 'right'}:70px;width:400px;height:400px}
  .ecl .c{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(255,246,220,.95) 38%,rgba(247,183,59,.45) 46%,rgba(165,151,255,.2) 60%,transparent 71%);filter:blur(2px)}
  .ecl .m{position:absolute;inset:24%;border-radius:50%;background:#03040a;box-shadow:0 0 0 2px rgba(255,246,220,.9),0 0 70px rgba(255,246,220,.55)}
  .stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 12% 20%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 40% 85%,#fff 50%,transparent 51%),radial-gradient(1.5px 1.5px at 62% 12%,#cfd8ff 50%,transparent 51%),radial-gradient(1px 1px at 90% 90%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 30% 50%,#fff 50%,transparent 51%);opacity:.8}
</style><body><div class="stars"></div><div class="ecl"><div class="c"></div><div class="m"></div></div>
<div class="wrap"><div class="brand">ECLIPSE 2027 — TUNISIA</div><h1>${og[l].title}</h1><div class="sub">${og[l].sub}</div><div class="line">${og[l].line}</div></div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();

for (const [file, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${mark(size)}</body></html>`);
  await page.screenshot({ path: `public/${file}`, omitBackground: true });
}

await page.setViewportSize({ width: 1200, height: 630 });
for (const l of Object.keys(og)) {
  await page.setContent(ogHtml(l), { waitUntil: 'load' });
  await page.screenshot({ path: `public/og/og-${l}.jpg`, type: 'jpeg', quality: 86 });
}
await browser.close();

writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Eclipse 2027 — Tunisia',
      short_name: 'Eclipse 2027',
      start_url: './',
      display: 'standalone',
      background_color: '#0a1028',
      theme_color: '#0a1028',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ),
);
console.log('Images generated.');
