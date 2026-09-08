import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
export async function blogOg(outDir, slug, lines, subtitle) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (lines.length > 2 || lines.some(l => l.length > 35)) throw new Error('OG title needs at most two short lines');
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#101B24"/><rect width="1200" height="7" fill="#C9A84C"/><text x="80" y="145" fill="#C9A84C" font-family="Verdana" font-size="25" letter-spacing="3">THE COSTIN TEAM</text>${lines.map((line,i) => `<text x="80" y="${270+i*88}" fill="#F5F1E9" font-family="Georgia" font-size="${line.length > 27 ? 56 : 68}">${esc(line)}</text>`).join('')}<rect x="80" y="417" width="125" height="3" fill="#C9A84C"/><text x="80" y="477" fill="#D2D6D9" font-family="Verdana" font-size="25">${esc(subtitle)}</text><text x="80" y="558" fill="#C9A84C" font-family="Verdana" font-size="22">GreggCostin.com | Florida Panhandle and coastal Alabama</text></svg>`;
  mkdirSync(join(outDir, 'og'), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(outDir, 'og', `${slug}.png`));
}
