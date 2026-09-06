// Download the site's three Latin variable fonts from Google's official font service.
// Run once after checkout if the committed files are missing. Existing files stay pinned.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
const root = 'civilian-site/fonts';
const manifestPath = root + '/sources.json';
mkdirSync(root, { recursive: true });
const cssUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=optional';
const fonts = [
  { family: 'Inter', style: 'normal', weight: '300 800', file: 'inter-latin-variable.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: '400 700', file: 'playfair-latin-variable.woff2' },
  { family: 'Playfair Display', style: 'italic', weight: '400 700', file: 'playfair-italic-latin-variable.woff2' },
];
const licenses = [
  { file: 'Inter-OFL.txt', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt' },
  { file: 'PlayfairDisplay-OFL.txt', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/OFL.txt' },
];
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error(`Font download HTTP ${response.status}: ${url}`);
  return response;
}
let manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath,'utf8')) : { downloadedAt: new Date().toISOString(), stylesheet: cssUrl, fonts: [], licenses };
if (fonts.some(font => !existsSync(root + '/' + font.file))) {
  const stylesheet = await (await get(cssUrl)).text();
  const latin = [...stylesheet.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(match => match[1]);
  for (const font of fonts) {
    if (existsSync(root + '/' + font.file)) continue;
    const block = latin.find(block => block.includes(`font-family: '${font.family}'`) && block.includes(`font-style: ${font.style}`));
    const source = block?.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1];
    if (!source) throw new Error(`No official Latin WOFF2 found for ${font.family} ${font.style}`);
    const bytes = Buffer.from(await (await get(source)).arrayBuffer());
    if (bytes.subarray(0,4).toString() !== 'wOF2' || bytes.length > 200000) throw new Error('Unexpected font payload');
    writeFileSync(root + '/' + font.file, bytes);
    manifest.fonts = manifest.fonts.filter(f => f.file !== font.file);
    manifest.fonts.push({ ...font, source, bytes: bytes.length });
    writeFileSync(manifestPath, JSON.stringify(manifest,null,2) + '\n');
    console.log(`${font.file}: ${bytes.length} bytes`);
  }
}
for (const license of licenses) if (!existsSync(root + '/' + license.file)) {
  const text = await (await get(license.url)).text();
  if (!text.includes('SIL OPEN FONT LICENSE')) throw new Error('Unexpected font license');
  writeFileSync(root + '/' + license.file, text);
}
const css = '/* Licensed under the SIL Open Font License. Sources and licenses: /fonts/.\n   Optional display prevents a late font swap from shifting a page already being read. */\n' + fonts.map(font => `@font-face{font-family:'${font.family}';font-style:${font.style};font-weight:${font.weight};font-display:optional;src:url('/fonts/${font.file}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}`).join('\n') + '\n';
writeFileSync('civilian-site/assets/costin-fonts.css', css);
console.log('Civilian fonts ready. Run the shared experience rollout to install the local preload links.');
