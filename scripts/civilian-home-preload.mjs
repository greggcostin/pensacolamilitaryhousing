// Derive one early image hint from the actual homepage picture. Never preload
// every format: browsers supporting more than one would download extra images.
const marker = 'data-costin-home-hero-preload';
const attrs = tag => Object.fromEntries([...tag.matchAll(/\b([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));

export function preloadCivilianHomeHero(html) {
  let out = html.replace(/<link\b[^>]*\bdata-costin-home-hero-preload(?:="[^"]*")?[^>]*>\s*/g, '');
  const picture = out.match(/<div class="gc-hero-image">\s*<picture>([\s\S]*?)<\/picture>/)?.[1];
  if (!picture) return out;
  // Only the first, unconditional preferred format is eligible. Keep image
  // selection with the browser if a later design introduces art direction.
  const source = picture.match(/<source\b[^>]*>/)?.[0];
  if (!source) return out;
  const a = attrs(source);
  if (a.type !== 'image/avif' || a.media || !a.srcset || !a.sizes) return out;
  const headEnd = out.indexOf('</head>');
  const head = out.slice(0, headEnd);
  const viewports = [...head.matchAll(/<meta\b[^>]*\bname="viewport"[^>]*>/g)];
  const charset = head.match(/<meta\b[^>]*\bcharset=[^>]*>/)?.[0];
  if (headEnd < 0 || !charset || viewports.length !== 1) return out;
  // Responsive resource selection must see the real viewport before the hint.
  // This also places the hint ahead of the large, inline stylesheet bundle.
  const viewport = viewports[0][0];
  out = out.replace(/<meta\b[^>]*\bname="viewport"[^>]*>\s*/, '');
  const hint = `<link rel="preload" as="image" type="image/avif" imagesrcset="${a.srcset}" imagesizes="${a.sizes}" fetchpriority="high" ${marker}>`;
  return out.replace(/(<meta\b[^>]*\bcharset=[^>]*>)\s*/, `${charset}\n${viewport}\n${hint}\n`);
}
