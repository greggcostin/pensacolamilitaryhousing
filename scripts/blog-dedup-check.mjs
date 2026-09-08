// Local ownership inventory across both page sources and unpublished fragments.
// Similarity is an editorial review cue, never proof of live indexing.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, SITES, strip, tokens } from './blog-lib.mjs';

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.isDirectory()) return /^(images|og|assets|pagefind|fonts|node_modules)$/.test(e.name) ? [] : walk(join(dir, e.name));
    return e.name.endsWith('.html') ? [join(dir, e.name)] : [];
  });
}
export function buildCorpus(root = ROOT) {
  const rows = new Map();
  for (const [site, config] of Object.entries(SITES)) {
    for (const file of walk(join(root, config.siteDir))) {
      const html = readFileSync(file, 'utf8');
      const path = '/' + file.slice(join(root, config.siteDir).length + 1).replace(/\\/g, '/').replace(/\.html$/, '').replace(/index$/, '');
      if (/^\/(?:404|search|privacy|accessibility|thanks|terms)$/.test(path)) continue;
      const title = strip(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '');
      const head = [title, /<meta name="keywords" content="([^"]*)"/.exec(html)?.[1] || '', ...[...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)].map(m => strip(m[1]))].join(' ');
      const url = config.origin + path;
      rows.set(url, { site, url, title, head: head.toLowerCase(), file });
    }
    const dir = join(root, config.contentDir);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.fragment.html'))) {
      const raw = readFileSync(join(dir, file), 'utf8');
      const match = /<!--PAGE\s*([\s\S]*?)\s*PAGE-->/.exec(raw);
      if (!match) continue;
      const spec = JSON.parse(match[1]);
      const slug = spec.slug || file.replace('.fragment.html', '');
      const url = config.origin + '/blog/' + slug;
      const head = [spec.title, spec.h1, ...(spec.targetKeywords || []), spec.keywords, ...[...raw.slice(match.index + match[0].length).matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m => strip(m[1]))].join(' ').toLowerCase();
      rows.set(url, { site, url, title: spec.title || spec.h1 || slug, head, file: join(dir, file), hasFragment: true });
    }
  }
  return [...rows.values()];
}
export function compareTopic(item, corpus, { excludeUrl } = {}) {
  const phrases = (item.targetKeywords || []).map(p => p.toLowerCase().trim()).filter(Boolean);
  const itemTokens = new Set(tokens([item.title || item.topic || item.slug, ...phrases].join(' ')));
  const hits = corpus.filter(p => p.url !== excludeUrl).map(page => {
    const pageTokens = new Set(tokens(page.head));
    const coverage = itemTokens.size ? [...itemTokens].filter(t => pageTokens.has(t)).length / itemTokens.size : 0;
    const exact = phrases.filter(p => page.head.includes(p)).length;
    const verdict = exact || coverage >= 0.82 ? 'INTENT-REVIEW' : coverage >= 0.55 ? 'overlap' : 'ok';
    return { ...page, coverage: +coverage.toFixed(2), exact, score: exact * 3 + coverage * 4, verdict };
  }).filter(p => p.coverage > 0.2 || p.exact).sort((a,b) => b.score - a.score).slice(0, 5);
  return { slug: item.slug, verdict: hits.some(h => h.verdict === 'INTENT-REVIEW') ? 'INTENT-REVIEW' : hits.some(h => h.verdict === 'overlap') ? 'overlap' : 'clear', hits };
}
export function intentReviewed(item, ownership) {
  const review=item.intentReview;
  return !!(review?.decision==='distinct-intent' && review.reviewedBy && review.readerTask && review.distinctValue && review.comparedTo?.length && ownership.hits.filter(h=>h.verdict==='INTENT-REVIEW').every(h=>review.comparedTo.includes(h.url)));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const arg = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
  const site = arg('--site') || 'pmh';
  if (!SITES[site]) throw new Error('site must be gc or pmh');
  const kws = args.flatMap((a,i) => a === '--kw' ? [args[i+1]] : []);
  const positional = args.filter((a,i) => !a.startsWith('--') && !['--site','--kw','--exclude-url'].includes(args[i-1]))[0];
  const queue = kws.length ? [{ slug: '(ad hoc)', targetKeywords: kws }] : JSON.parse(readFileSync(join(ROOT, SITES[site].queue), 'utf8')).queue;
  const items = positional && !kws.length ? queue.filter(t => t.slug === positional) : queue;
  if (!items.length) throw new Error('No matching queue item');
  const corpus = buildCorpus();
  const rows = items.map(item => {
    const ownership=compareTopic(item, corpus, { excludeUrl: item.refreshUrl || arg('--exclude-url') });
    return {...ownership,isRefresh:!!item.refreshUrl || !!item.isRefresh,intentReviewed:intentReviewed(item,ownership)};
  });
  if (args.includes('--json')) console.log(JSON.stringify(rows, null, 2));
  else for (const row of rows) {
    console.log(row.slug + ': ' + row.verdict + (row.isRefresh ? ' (refresh, review remaining overlap)' : ''));
    for (const hit of row.hits) console.log('  ' + hit.verdict + ': ' + hit.url + ' | ' + hit.title);
  }
  if (args.includes('--strict') && rows.some(r => r.verdict === 'INTENT-REVIEW' && !r.intentReviewed)) process.exitCode = 1;
}
