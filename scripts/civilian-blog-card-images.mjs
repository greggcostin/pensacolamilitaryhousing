// Add real article photography to the blog index without rewriting card copy.
// Each card remains one link; the linked article carries full image attribution.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('../civilian-site/', import.meta.url));
const ledgerFile = new URL('../content/blog/image-credits.json', import.meta.url);
const cardSizes = '(max-width: 640px) calc(100vw - 44px), (max-width: 1000px) calc((100vw - 84px) / 2), 370px';
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function attribute(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1', 'i'));
  return match?.[2];
}

function setAttribute(tag, name, value) {
  const expression = new RegExp('\\s+' + name + '\\s*=\\s*(?:"[^"]*"|\\\'[^\\\']*\\\'|[^\\s>]+)', 'gi');
  return tag.replace(expression, '').replace(/\s*\/?>$/, ` ${name}="${esc(value)}">`);
}

function firstEditorialFigure(article) {
  // Interior redesign moves the original opening figure into the hero.
  // A generic decorative backdrop or a sidebar portrait is not a card image.
  const header = article.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0];
  if (header && /\bgc-interior-hero-media\b/.test(header)) {
    const editorial = header.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/i)?.[0];
    if (editorial) return editorial;
  }
  const main = article.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  return main?.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/i)?.[0];
}

function imageForArticle(href, ledger) {
  const slug = href.match(/^\/blog\/([a-z0-9][a-z0-9-]*)(?:\.html)?\/?(?:[?#].*)?$/i)?.[1];
  if (!slug) return null;
  const articleFile = join(siteRoot, 'blog', slug + '.html');
  if (!existsSync(articleFile)) return null;
  const figure = firstEditorialFigure(readFileSync(articleFile, 'utf8'));
  const img = figure?.match(/<img\b[^>]*>/i)?.[0];
  if (!img) return null;
  const src = attribute(img, 'src');
  if (!/^\/images\/[a-z0-9][a-z0-9/_-]*\.(?:jpe?g|png)$/i.test(src || '')) return null;
  if (!existsSync(join(siteRoot, src.slice(1)))) return null;
  const entry = ledger['civilian-site' + src];
  if (!entry?.credit || !entry.license || (entry.creditRequired && !entry.pageUrl)) return null;
  if (!attribute(img, 'alt') || !Number(attribute(img, 'width')) || !Number(attribute(img, 'height'))) return null;

  let picture = figure.match(/<picture\b[^>]*>[\s\S]*?<\/picture>/i)?.[0] || `<picture>${img}</picture>`;
  picture = picture.replace(/<(?:source|img)\b[^>]*>/gi, tag => {
    tag = setAttribute(tag, 'sizes', cardSizes);
    if (/^<img\b/i.test(tag)) {
      tag = tag.replace(/\s+fetchpriority\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      tag = setAttribute(setAttribute(tag, 'loading', 'lazy'), 'decoding', 'async');
    }
    return tag;
  });
  // Plain text avoids invalid nested anchors inside the existing linked card.
  const credit = `<figcaption class="gc-blog-card-credit">Photo: ${esc(entry.credit)} &middot; ${esc(entry.license)}</figcaption>`;
  return `<figure class="gc-blog-card-media">${picture}${credit}</figure>`;
}

/**
 * Enrich existing a.blog-card elements with their linked article's first photo.
 * Original card text and destinations are kept byte-for-byte. Unsupported or
 * uncredited images are skipped. Existing data-gc-blog-image cards are untouched.
 * This function reads sources only; it never writes article or index files.
 */
export function withBlogCardImages(html) {
  if (!/\bblog-card\b/.test(html)) return html;
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0]).find(tag => attribute(tag, 'rel') === 'canonical');
  if (canonical) {
    try {
      const route = new URL(attribute(canonical, 'href'), 'https://greggcostin.com').pathname.replace(/\/$/, '');
      if (route !== '/blog' && route !== '/blog.html') return html;
    } catch { return html; }
  }
  const ledger = JSON.parse(readFileSync(ledgerFile, 'utf8')).images;
  const images = new Map();
  return html.replace(/(<a\b[^>]*>)([\s\S]*?)(<\/a>)/gi, (original, opening, body, closing) => {
    if (!(attribute(opening, 'class') || '').split(/\s+/).includes('blog-card')) return original;
    if (/\bdata-gc-blog-image\b/i.test(opening) || /\bgc-blog-card-media\b/.test(body)) return original;
    const href = attribute(opening, 'href') || '';
    if (!images.has(href)) images.set(href, imageForArticle(href, ledger));
    const media = images.get(href);
    if (!media) return original;
    return setAttribute(opening, 'data-gc-blog-image', '1') + '\n' + media + body + closing;
  });
}
