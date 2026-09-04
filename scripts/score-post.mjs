// Pre-publish quality scorer for BOTH blog engines: content depth, evidence discipline,
// local specificity, SEO basics, GEO (AI-citation) shape, and share-worthiness. The factories
// gate the floor (words, links, FAQs, em dashes, walls); this scores the ceiling and tells the
// writer exactly what to fix. The engines require 80+ on every NEW post before staging and
// record the score in the ledger so blog-retro.mjs can learn which components move search.
//
//   node scripts/score-post.mjs <slug|fragment path> [--site pmh|gc]   # one post, itemized
//   node scripts/score-post.mjs --all [--site pmh|gc]                  # table for every post
//   add --json for machine output, --gate [--min 80] to exit 1 below the bar
import { existsSync } from "node:fs";
import { ROOT, SITES, siteOf, parseFragment, listFragments, strip, words, sentences, tokens, overlap, PLACES, SOURCE_CUE, VINTAGE, QWORDS } from "./blog-lib.mjs";

const IMPERATIVE = /^(ask|get|check|shop|call|pull|verify|budget|compare|lock|price|confirm|know|run|order|request|schedule|review|start|set|have|keep|use|read|walk|treat|document|file|apply|negotiate|avoid|plan|expect|bring|book|measure|write|list|test|inspect|hire|talk|visit|drive|tour|photograph|save|skip|wait|watch|decide|pick|choose|add|remove|update|refresh|replace|install|fix|gather|prepare|submit|sign|close)\b/i;
const WORKED = /(for example|say you|take a|assume|suppose|on a \$?\d|worked example|run the numbers|the math|works out to|comes to|that is about|equals|per month|a month)/i;
const OWN_VOICE = /(we (have|see|saw|drove|showed|closed|priced|walk|tell|recommend|would|would not|did|found|ran|checked|counted)|our clients|a client of ours|in our experience|last (month|week|year) we|we wrote|we pulled|we measured)/i;

export function scorePost(spec, body, siteKey) {
  const site = siteOf(siteKey);
  const text = strip(body);
  const total = words(body);
  const fails = [];
  const notes = [];
  const pct = (n, d) => (d ? n / d : 0);
  const clamp = (v, max) => Math.max(0, Math.min(max, v));

  // ---- structure (25) --------------------------------------------------------------------
  const h2s = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1])).filter((t) => !/^(sources|frequently|related|key takeaways|what to do)/i.test(t));
  const qH2 = h2s.filter((t) => QWORDS.test(t) || t.trim().endsWith("?")).length;
  const qRatio = pct(qH2, h2s.length);
  const sections = body.split(/<h2[^>]*>/).slice(1);
  let direct = 0, dense = 0;
  for (const sec of sections) {
    const firstP = (/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/.exec(sec) || [])[1] || "";
    const fw = words(firstP);
    if (fw >= 15 && fw <= 90 && (/\d/.test(strip(firstP)) || /\b(is|are|no|yes|not|means|because|the answer)\b/i.test(strip(firstP)))) direct++;
    const secWords = words(sec.split(/<h3[^>]*>/)[0]);
    if (secWords > 250 && !/<(ul|ol|table)\b/.test(sec.split(/<h3[^>]*>/)[0])) dense++;
  }
  const paras = [...body.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => words(m[1]));
  const walls = paras.filter((w) => w > 85).length;
  const aids = (body.match(/<(ul|ol|table|figure|details)\b/g) || []).length + (body.match(/class="facts"/g) || []).length;
  const aidsPer250 = pct(aids, total / 250);
  let structure = 0;
  structure += clamp(qRatio / 0.6, 1) * 9;
  structure += clamp(pct(direct, sections.length) / 0.7, 1) * 7;
  structure += walls === 0 ? 5 : walls <= 2 ? 2 : 0;
  structure += clamp(aidsPer250, 1) * 4;
  if (qRatio < 0.6) fails.push(`structure: only ${qH2}/${h2s.length} H2s are question-shaped (target 60%+): rewrite H2s as the question a searcher types`);
  if (pct(direct, sections.length) < 0.7) fails.push(`structure: ${direct}/${sections.length} sections open with a 15-90 word direct answer; put the answer sentence first under every H2`);
  if (walls) fails.push(`structure: ${walls} paragraph(s) over 85 words; split them or convert to a list`);
  if (dense) fails.push(`structure: ${dense} section(s) run 250+ words with no list or table; add one or a question-shaped h3`);
  if (aidsPer250 < 1) fails.push(`structure: ${aids} scan aids for ${total} words (target one list/table/figure per 250 words)`);

  // ---- evidence (20) ---------------------------------------------------------------------
  const sents = sentences(body);
  const numeric = sents.filter((s) => /\d/.test(s) && !/^https?:/.test(s));
  const sourced = numeric.filter((s) => SOURCE_CUE.test(s));
  const dated = numeric.filter((s) => VINTAGE.test(s));
  const quotable = sourced.filter((s) => s.split(" ").length <= 35 && VINTAGE.test(s));
  const distinctSources = new Set(sents.flatMap((s) => (s.match(SOURCE_CUE) || []).map((m) => m.toLowerCase().trim()))).size;
  const sourcesSection = /<h2[^>]*>\s*sources/i.test(body) || /\bSources:/i.test(text);
  let evidence = 0;
  evidence += clamp(pct(sourced.length, numeric.length) / 0.6, 1) * 8;
  evidence += clamp(pct(dated.length, numeric.length) / 0.5, 1) * 5;
  evidence += clamp(distinctSources / 4, 1) * 4;
  evidence += sourcesSection ? 3 : 0;
  if (numeric.length && pct(sourced.length, numeric.length) < 0.6) fails.push(`evidence: ${sourced.length}/${numeric.length} numeric sentences carry a named source cue (target 60%+): attribute every figure in the sentence itself`);
  if (numeric.length && pct(dated.length, numeric.length) < 0.5) fails.push(`evidence: ${dated.length}/${numeric.length} numeric sentences carry a vintage (month/year); date the perishable ones`);
  if (distinctSources < 4) fails.push(`evidence: ${distinctSources} distinct source cue(s); real depth cites 4+ named sources`);
  if (!sourcesSection) fails.push("evidence: no Sources section or Sources line");
  if (!numeric.length) fails.push("evidence: no numeric sentences at all; a post with no figures cannot be cited");

  // ---- local specificity (10) ------------------------------------------------------------
  const places = (text.match(PLACES) || []).length;
  const placesPerK = pct(places, total / 1000);
  const local = clamp(placesPerK / 8, 1) * 10;
  if (placesPerK < 8) fails.push(`local: ${places} Gulf Coast place/base mentions per ${total} words (target 8+ per 1,000): anchor examples to real places, ZIPs, bases`);

  // ---- SEO (20) --------------------------------------------------------------------------
  const kws = spec.targetKeywords && spec.targetKeywords.length ? spec.targetKeywords : String(spec.keywords || "").split(",").map((s) => s.trim()).filter(Boolean);
  const primary = kws[0] || "";
  const first100 = text.split(" ").slice(0, 100).join(" ");
  const inTitle = overlap(primary, spec.title), inH1 = overlap(primary, spec.h1), inLead = overlap(primary, first100 + " " + (spec.lead || "")), inSlug = overlap(primary, (spec.slug || "").replace(/-/g, " ")), inDesc = overlap(primary, spec.description);
  const links = (body.match(/href="\//g) || []).length + (body.match(/href="https:\/\/(pensacolamilitaryhousing|greggcostin)\.com/g) || []).length;
  const faqs = spec.faq || spec.faqs || [];
  const faqLens = faqs.map((f) => words(f.a));
  const faqOk = faqLens.filter((n) => n >= 40 && n <= 95).length;
  const faqQ = faqs.filter((f) => QWORDS.test(f.q) || f.q.trim().endsWith("?")).length;
  let seo = 0;
  if (!primary) fails.push("seo: no targetKeywords (the engine cannot measure a post without them)");
  seo += (inTitle >= 0.6 ? 3 : 0) + (inH1 >= 0.6 ? 2 : 0) + (inLead >= 0.6 ? 2 : 0) + (inSlug >= 0.5 ? 1 : 0) + (inDesc >= 0.5 ? 1 : 0);
  seo += spec.title && spec.title.length <= 65 ? 1 : 0;
  seo += spec.description && spec.description.length >= 120 && spec.description.length <= 165 ? 1 : 0;
  seo += clamp(links / Math.max(site.minLinks, 8), 1) * 4;
  seo += clamp(faqs.length / 6, 1) * 2;
  seo += clamp(pct(faqOk, faqs.length), 1) * 2;
  seo += clamp(pct(faqQ, faqs.length), 1) * 1;
  if (primary && inTitle < 0.6) fails.push(`seo: primary keyword "${primary}" not evident in the title`);
  if (primary && inH1 < 0.6) fails.push(`seo: primary keyword not evident in the H1`);
  if (primary && inLead < 0.6) fails.push(`seo: primary keyword not in the lead or first 100 words`);
  if (links < Math.max(site.minLinks, 8)) fails.push(`seo: ${links} internal links (target 8+; hubs, money pages, sibling posts)`);
  if (faqs.length < 6) fails.push(`seo: ${faqs.length} FAQs (target 6+ People-Also-Ask questions)`);
  if (faqs.length && faqOk < faqs.length) fails.push(`seo: ${faqs.length - faqOk} FAQ answer(s) outside 40-95 words`);

  // ---- GEO (15) --------------------------------------------------------------------------
  const qa = spec.quickAnswer || "";
  const qaSent = qa ? qa.split(/(?<=[.!?])\s+/).filter(Boolean).length : 0;
  const qaOk = qa && /\d/.test(qa) && qaSent >= 2 && qaSent <= 4;
  const takeaways = (spec.takeaways && spec.takeaways.length >= 3) || /key takeaways/i.test(text);
  let geo = 0;
  geo += qaOk ? 5 : 0;
  geo += takeaways ? 2 : 0;
  geo += clamp(quotable.length / 3, 1) * 4;
  geo += spec.shareHook ? 1 : 0;
  geo += clamp(pct(faqQ, faqs.length), 1) * 1;
  geo += spec.dateModified || spec.datePublished ? 1 : 0;
  geo += (spec.perishables && spec.perishables.length) || !numeric.some((s) => /\b(rate|median|average|inventory|premium|deadline|expires)\b/i.test(s)) ? 1 : 0;
  if (!qaOk) fails.push("geo: quickAnswer missing or not 2-4 dated sentences with a figure (AI engines quote the first quotable block)");
  if (!takeaways) fails.push("geo: no takeaways (3-5 one-line bullets the factory renders as Key takeaways)");
  if (quotable.length < 3) fails.push(`geo: ${quotable.length} quotable sentence(s) (a figure + a named source + a date in under 35 words); write 3+`);
  if (!spec.shareHook) fails.push("geo: no shareHook (the one sentence a reader pastes when sharing, and who it is for)");
  if (!(spec.perishables && spec.perishables.length) && numeric.some((s) => /\b(rate|median|average|inventory|premium|deadline|expires)\b/i.test(s))) fails.push("geo: post states perishable figures but declares no perishables [{claim, expires, source}] for the refresh loop");

  // ---- shareability (10) -----------------------------------------------------------------
  const table = /<table\b/.test(body);
  const olItems = [...body.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/g)].map((m) => (m[1].match(/<li/g) || []).length);
  const checklist = olItems.some((n) => n >= 4) || [...body.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)].some((m) => (m[1].match(/<li>\s*<strong>/g) || []).length >= 3);
  const actionItems = [...body.matchAll(/<li[^>]*>\s*(?:<strong>)?([^<]{3,60})/g)].filter((m) => IMPERATIVE.test(m[1].trim())).length;
  const worked = WORKED.test(text) && /\d/.test(text);
  const ownVoice = OWN_VOICE.test(text);
  let share = 0;
  share += table ? 3 : 0;
  share += checklist ? 2 : 0;
  share += actionItems >= 3 ? 2 : 0;
  share += worked ? 2 : 0;
  share += ownVoice ? 1 : 0;
  if (!table) fails.push("share: no table (a comparison or numbers table is the most shared, most cited unit)");
  if (!checklist) fails.push("share: no checklist (an ordered list of 4+ steps, or a bold-led bullet set)");
  if (actionItems < 3) fails.push(`share: ${actionItems} imperative action items (target 3+ concrete things to do)`);
  if (!worked) fails.push("share: no worked example with real numbers");
  if (!ownVoice) fails.push("share: nothing only this team can say (a scenario, a commute, a client outcome, what we would do)");

  const score = Math.round(structure + evidence + local + seo + geo + share);
  return {
    score, grade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D",
    components: { structure: +structure.toFixed(1), evidence: +evidence.toFixed(1), local: +local.toFixed(1), seo: +seo.toFixed(1), geo: +geo.toFixed(1), share: +share.toFixed(1) },
    facts: { words: total, h2s: h2s.length, questionH2s: qH2, directAnswers: direct, walls, scanAids: aids, numericSentences: numeric.length, sourcedSentences: sourced.length, datedSentences: dated.length, quotable: quotable.length, distinctSources, placesPerK: +placesPerK.toFixed(1), links, faqs: faqs.length, table, checklist, actionItems, workedExample: worked, ownVoice, quickAnswer: !!qaOk, takeaways: !!takeaways, shareHook: !!spec.shareHook, perishables: (spec.perishables || []).length },
    fails, notes,
  };
}

function resolve(arg, siteKey) {
  if (existsSync(arg)) return { path: arg, site: siteKey || (arg.includes("civilian-blog") ? "gc" : "pmh") };
  for (const k of siteKey ? [siteKey] : ["pmh", "gc"]) {
    const p = `${ROOT}${SITES[k].contentDir}/${arg}.fragment.html`;
    if (existsSync(p)) return { path: p, site: k };
  }
  throw new Error(`no fragment for "${arg}"`);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1].endsWith("score-post.mjs")) {
  const args = process.argv.slice(2);
  const siteArg = args.includes("--site") ? args[args.indexOf("--site") + 1] : null;
  const min = args.includes("--min") ? +args[args.indexOf("--min") + 1] : 80;
  const json = args.includes("--json"), gate = args.includes("--gate");
  if (args.includes("--all")) {
    const rows = [];
    for (const k of siteArg ? [siteArg] : ["pmh", "gc"]) for (const f of listFragments(k)) rows.push({ site: k, slug: f.slug, ...scorePost(f.spec, f.body, k) });
    rows.sort((a, b) => a.score - b.score);
    if (json) console.log(JSON.stringify(rows.map((r) => ({ site: r.site, slug: r.slug, score: r.score, grade: r.grade, components: r.components, fails: r.fails })), null, 1));
    else {
      console.log("site  score  str  evi  loc  seo  geo  shr  words  slug");
      for (const r of rows) console.log(`${r.site.padEnd(5)} ${String(r.score).padStart(3)} ${r.grade}  ${String(r.components.structure).padStart(4)} ${String(r.components.evidence).padStart(4)} ${String(r.components.local).padStart(4)} ${String(r.components.seo).padStart(4)} ${String(r.components.geo).padStart(4)} ${String(r.components.share).padStart(4)}  ${String(r.facts.words).padStart(5)}  ${r.slug}`);
      const avg = (rows.reduce((a, r) => a + r.score, 0) / rows.length).toFixed(1);
      console.log(`\n${rows.length} posts, average ${avg}; below ${min}: ${rows.filter((r) => r.score < min).map((r) => r.slug).join(", ") || "none"}`);
    }
  } else {
    const target = args.find((a) => !a.startsWith("--") && a !== siteArg && !/^\d+$/.test(a));
    if (!target) { console.error("usage: node scripts/score-post.mjs <slug|path> [--site pmh|gc] | --all"); process.exit(2); }
    const { path, site } = resolve(target, siteArg);
    const { spec, body } = parseFragment(path);
    const r = scorePost(spec, body, site);
    if (json) console.log(JSON.stringify(r, null, 1));
    else {
      console.log(`${spec.slug} (${SITES[site].name}): ${r.score}/100 ${r.grade}`);
      console.log("components:", Object.entries(r.components).map(([k, v]) => `${k} ${v}`).join(" | "));
      console.log("facts:", JSON.stringify(r.facts));
      console.log(r.fails.length ? `\nfix list (${r.fails.length}):\n  - ` + r.fails.join("\n  - ") : "\nno fails");
    }
    if (gate && r.score < min) { console.error(`\nGATE: ${r.score} < ${min}`); process.exit(1); }
  }
}
