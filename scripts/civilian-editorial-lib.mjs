// Publication safeguards validate evidence records, not the truth of a source.
// A real source-reading and editorial pass is still required before sealing a review.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { ROOT, strip, words } from './blog-lib.mjs';
import { calculate } from './article-evidence.mjs';

export const EDITORIAL_SINCE = '2026-09-08';
export const contentHash = (spec, body) => {
  const { body: ignoredBody, outDir: ignoredOutDir, ...content } = spec;
  return createHash('sha256').update(JSON.stringify(content) + '\n' + body.trim()).digest('hex');
};
export const evidenceHash = research => {
  const { review, ...evidence } = research;
  return createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
};
export const isModern = spec => spec.editorialVersion === 2 || (spec.dateModified || spec.datePublished || '') >= EDITORIAL_SINCE;
export const sentenceCount = text => [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(String(text))].filter(s => s.segment.trim()).length;
export function readResearch(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) return null;
  const path = `${ROOT}content/civilian-blog/research/${slug}.json`;
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}
const dateOK = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d;
const httpURL = u => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };
const normalize = s => strip(s).replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
export function voiceFindings(spec, body) {
  const text = JSON.stringify([spec.title, spec.description, spec.h1, spec.lead, spec.quickAnswer, spec.takeaways, spec.shareHook, spec.faqs, spec.figure?.alt, spec.figure?.caption]) + body;
  const decoded = text.replace(/&#x([a-f\d]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&(?:mdash|ndash);/gi, '\u2014');
  const errors = [];
  if (/[\u2013\u2014]/u.test(decoded)) errors.push('voice: em/en dash in reader-facing copy');
  if (/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[0-9#*]\uFE0F?\u20E3/u.test(decoded)) errors.push('voice: emoji or decorative pictograph in reader-facing copy');
  for (const phrase of ['in today\'s ever-changing', 'ever-evolving landscape', 'delve into', 'nestled in', 'look no further', 'game-changer', 'unlock the potential', 'in conclusion', 'whether you\'re a first-time buyer or a seasoned investor']) {
    if (decoded.toLowerCase().includes(phrase)) errors.push(`voice: replace stock phrase "${phrase}" with a concrete statement`);
  }
  if (/guaranteed (?:return|profit|appreciation|rental income)|risk[- ]free investment/i.test(decoded)) errors.push('evidence: unsupported investment guarantee');
  return errors;
}

export function validateEditorial(spec, body, research, { today = new Date().toISOString().slice(0, 10), requireReview = true } = {}) {
  const errors = voiceFindings(spec, body), warnings = [];
  const combined = normalize([spec.lead, spec.quickAnswer, ...(spec.takeaways || []), body, ...(spec.faqs || []).map(f => f.q + ' ' + f.a)].join(' '));
  if (!dateOK(spec.datePublished) || spec.datePublished > today) errors.push('date: invalid or future publication date');
  if (spec.dateModified && (!dateOK(spec.dateModified) || spec.dateModified < spec.datePublished || spec.dateModified > today)) errors.push('date: invalid modification date');
  const qa = spec.quickAnswer || '';
  if (sentenceCount(qa) < 2 || sentenceCount(qa) > 4 || words(qa) >= 85 || !/\d/.test(qa)) errors.push('quickAnswer: requires 2-4 sentences, a supported figure and fewer than 85 words');
  if (!Array.isArray(spec.targetKeywords) || spec.targetKeywords.length < 2 || spec.targetKeywords.length > 5) errors.push('SEO: requires 2-5 target queries');
  if ((spec.takeaways || []).length < 3 || spec.takeaways.length > 5) errors.push('takeaways: requires 3-5 useful points');
  if ((spec.faqs || []).length < 6) errors.push('FAQ: requires at least 6 distinct questions');
  if (new Set((spec.faqs || []).map(f => normalize(f.q).toLowerCase())).size !== (spec.faqs || []).length) errors.push('FAQ: repeated question');
  if ((spec.faqs || []).some(f => words(f.a) < 40 || words(f.a) > 95)) errors.push('FAQ: each answer must contain 40-95 useful words');
  const usefulLinks = new Set([...body.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1]).filter(u=>/^https:\/\//.test(u) || /^\/(?!\/)/.test(u)));
  if (usefulLinks.size < 8) errors.push('links: requires at least 8 unique source or useful guide links');
  if (!spec.shareHook?.trim()) errors.push('shareHook: a natural forwarding sentence is required');
  const checklist = [...body.matchAll(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi)].some(m=>(m[1].match(/<li\b/gi)||[]).length>=4) || [...body.matchAll(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi)].some(m=>(m[1].match(/<li\b[^>]*>\s*<strong>/gi)||[]).length>=3);
  if (!/<table\b/i.test(body) || !checklist) errors.push('utility: requires a comparison table and actionable checklist');
  if (!research || research.version !== 2 || research.slug !== spec.slug) return { errors: [...errors, 'research: missing matching version 2 research brief'], warnings, sources: 0, claims: 0, localApplications: 0 };
  const sources = research.sources || [], claims = research.claims || [];
  const sourceMap = new Map(sources.map(s => [s.id, s]));
  if (sourceMap.size !== sources.length) errors.push('research: duplicate source id');
  if (new Set(claims.map(c => c.id)).size !== claims.length) errors.push('research: duplicate claim id');
  for (const s of sources) {
    if (!s.id || !s.publisher || !s.title || !httpURL(s.url) || !dateOK(s.checkedAt) || s.checkedAt > today || !s.evidenceNote) errors.push(`source ${s.id}: needs publisher, title, HTTPS URL, actual check date and evidence note`);
    if (s.checkedAt < research.sessionDate) errors.push(`source ${s.id}: not checked during this research session`);
  }
  if (!dateOK(research.sessionDate) || research.sessionDate > today) errors.push('research: invalid sessionDate');
  for (const c of claims) {
    if (!c.id || !c.text || !combined.includes(normalize(c.text))) errors.push(`claim ${c.id}: supported passage does not occur in the article`);
    if (!['fact', 'calculation', 'scenario'].includes(c.kind)) errors.push(`claim ${c.id}: specify fact, calculation or scenario`);
    if (c.kind === 'fact') {
      if (!c.sourceIds?.length || c.sourceIds.some(id => !sourceMap.has(id))) errors.push(`claim ${c.id}: missing source references`);
      if (c.sourceIds?.length && !c.sourceIds.some(id => sourceMap.get(id)?.primary === true)) errors.push(`claim ${c.id}: needs a primary source`);
      if (!c.scope || !dateOK(c.asOf) || c.asOf > today) errors.push(`claim ${c.id}: missing scope or valid data vintage`);
      if (c.perishable && (!dateOK(c.expires) || c.expires <= today)) errors.push(`claim ${c.id}: perishable is expired or has no review deadline`);
      if (c.perishable && !(spec.perishables || []).some(p => p.claimId === c.id && p.expires === c.expires && c.sourceIds.some(id => p.source === sourceMap.get(id)?.url))) errors.push(`claim ${c.id}: no matching perishable in PAGE header`);
      const relevantLinks = c.sourceIds?.filter(id => body.includes(sourceMap.get(id)?.url || '\0')) || [];
      if (!relevantLinks.length) errors.push(`claim ${c.id}: no supporting source link in visible body`);
    } else if (!c.assumptions || !c.method) errors.push(`claim ${c.id}: declare assumptions and reproducible method`);
    if (c.kind === 'calculation') {
      for (const calculation of [c.calculation,...(c.additionalCalculations || [])]) {
        try {
          const result=calculate(calculation),tolerance=calculation.tolerance ?? 0.005;
          if (!Number.isFinite(calculation.result) || !Number.isFinite(tolerance) || tolerance<0 || tolerance>0.01 || Math.abs(result-calculation.result)>tolerance || !calculation.units || !calculation.inputSources?.length) throw new Error('result, units, tolerance or input provenance does not match');
        } catch (error) { errors.push(`claim ${c.id}: arithmetic check failed (${error.message})`); }
      }
    }
  }
  const loadBearing = claims.filter(c => c.loadBearing);
  if (loadBearing.length < 5 || loadBearing.some(c => !c.verification)) errors.push('research: independently check and explain at least five load-bearing claims/calculations');
  const landscape = research.searchLandscape;
  if (!landscape?.questions?.length || !landscape.informationGain || !landscape.results?.length) errors.push('research: search questions, reviewed results and information gain are required');
  if ((landscape?.questions || []).some(q => !q.question || !q.origin || (q.origin !== 'editorial' && !q.source))) errors.push('research: label question provenance; editorial suggestions are not observed demand');
  const local = (research.localApplications || []).filter(a => a.place && a.decision && a.passage && combined.includes(normalize(a.passage)));
  if (local.length < 2) errors.push('local: document two specific local decisions and their actual passages; town-name counts do not qualify');
  if (!research.reader || !research.decision || !research.pillar || !research.changeReason) errors.push('editorial: define reader, decision, pillar and reason for the change');
  if (requireReview) {
    const review = research.review;
    if (!review || review.contentHash !== contentHash(spec, body)) errors.push('review: absent or stale; review the exact final draft and seal its content hash');
    if (!review || review.evidenceHash !== evidenceHash(research)) errors.push('review: evidence changed since the final source review');
    for (const check of ['facts', 'calculations', 'voice', 'scope', 'sources', 'counterarguments']) if (review?.checks?.[check] !== true) errors.push(`review: ${check} pass missing`);
    if (!review?.provider || !review?.model || !dateOK(review?.checkedAt) || review.checkedAt > today || !review?.notes) errors.push('review: record actual reviewer provenance, date and findings');
  }
  warnings.push('Evidence records are editorial attestations. Automated checks do not verify source truth, professional review, indexing or rankings.');
  return { errors, warnings, sources: sourceMap.size, claims: claims.length, localApplications: local.length };
}

export function sectionLinks(body) {
  const used = new Set([...body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const links = [];
  const html = body.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_, attrs, title) => {
    let id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    if (!id) {
      const base = strip(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      id = base; let suffix = 2; while (used.has(id)) id = `${base}-${suffix++}`;
      attrs += ` id="${id}"`;
    }
    used.add(id); links.push({ id, title: strip(title) });
    return `<h2${attrs}>${title}</h2>`;
  });
  return { html, links };
}

export function updateBlogSitemap(xml, specs, origin) {
  const updates = new Map(specs.map(s => [`${origin}/blog/${s.slug}`, s.dateModified || s.datePublished]));
  const latest = [...updates.values()].sort().at(-1);
  if (latest) updates.set(`${origin}/blog`, latest);
  for (const [url, date] of updates) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<url>\\s*<loc>${escaped}</loc>[\\s\\S]*?</url>`);
    const entry = `<url><loc>${url}</loc><lastmod>${date}</lastmod></url>`;
    const match = pattern.exec(xml);
    if (match) {
      const currentDate = /<lastmod>([^<]+)<\/lastmod>/.exec(match[0])?.[1];
      if (currentDate === date) continue;
      // Preserve unrelated URL fields and never regress a real hub update date.
      if (url === `${origin}/blog` && currentDate > date) continue;
      xml = xml.replace(pattern, block => /<lastmod>/.test(block) ? block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${date}</lastmod>`) : block.replace('</url>', `<lastmod>${date}</lastmod></url>`));
    } else xml = xml.replace('</urlset>', `  ${entry}\n</urlset>`);
  }
  return xml;
}

// The blog already supplies navigation and a contextual closing action. Remove
// only the shared template's generated duplicates, leaving editorial copy intact.
export function finalizeArticleHtml(html) {
  if (!html.includes('class="blog-toc"')) return html;
  return html
    .replace(/<!-- COSTIN_TOC_START -->[\s\S]*?<!-- COSTIN_TOC_END -->/g,'')
    .replace(/<div class="gc-interior-hero-actions">[\s\S]*?<\/div>/g,'')
    .replace(/<aside class="gc-interior-aside" aria-label="Local help and next steps">[\s\S]*?<\/aside>/g,'')
    .replace('class="gc-interior-grid"','class="gc-interior-grid gc-interior-grid--wide"');
}

export function plainBlogActions(html) {
  return html.replace(/(<a\b[^>]*class="smc-(?:call|text|email)"[^>]*>)([\s\S]*?)(<\/a>)/g,
    (_,open,label,close)=>open+label.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').trim()+close);
}

export function updateBlogListing(text, block) {
  const start='## Blog Posts (auto-maintained)';
  if (!text.includes(start)) return text.trimEnd()+'\n\n'+block;
  // Other generators own HTML comment markers as well as Markdown headings.
  return text.replace(/## Blog Posts \(auto-maintained\)[\s\S]*?(?=\n## |\n<!--|$)/,()=>block);
}
