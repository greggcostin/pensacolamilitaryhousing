// Sitewide scannability audit. Measures how "fast-browsable" each content page
// is: wall-of-text paragraphs, section length between headings, and use of
// scan aids (lists, tables, facts boxes, figures). Writes a ranked report to
// docs/formatting-audit.md for the blog engine's refresh queue.
//
// Heuristics (long-form web reading):
//   - paragraph over ~85 words = wall of text
//   - section (h2/h3 to next heading) over ~250 words with no list/table = dense
//   - a good page has a scan aid every ~200-300 words
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const pages = [];
// Both sites: the civilian blog engine's L004 gate (90+ before staging) reads the same table.
// civilian-site/schools is 82 templated FLDOE pages and is left out so it cannot swamp the ranking.
for (const dir of ["public", "public/bases", "public/communities", "public/blog", "civilian-site", "civilian-site/resources", "civilian-site/neighborhoods", "civilian-site/blog"]) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".html")) continue;
    if (["404.html", "search.html", "thanks.html", "blog.html", "book-pcs-call.html"].includes(f) && (dir === "public" || dir === "civilian-site")) continue;
    pages.push(`${dir}/${f}`);
  }
}

const rows = [];
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html);
  if (!mainMatch) continue;
  const main = mainMatch[1];

  const text = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = (s) => (text(s) ? text(s).split(" ").length : 0);

  const paras = [...main.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => words(m[1]));
  const totalWords = words(main);
  const headings = (main.match(/<h[23][^>]*>/g) || []).length;
  const lists = (main.match(/<[uo]l[^>]*>/g) || []).length;
  const tables = (main.match(/<table[^>]*>/g) || []).length;
  const facts = (main.match(/class="facts"/g) || []).length;
  const details = (main.match(/<details[^>]*>/g) || []).length;
  const figures = (main.match(/<figure[^>]*>/g) || []).length;

  const walls = paras.filter((w) => w > 85).length;
  const maxPara = paras.length ? Math.max(...paras) : 0;
  const scanAids = lists + tables + facts + details + figures;
  const wordsPerHeading = headings ? Math.round(totalWords / headings) : totalWords;
  const wordsPerAid = scanAids ? Math.round(totalWords / scanAids) : totalWords;

  // score: lower = harder to scan. Penalize walls, sparse headings, sparse aids.
  const score = Math.round(
    100 -
    Math.min(30, walls * 6) -
    Math.min(35, Math.max(0, wordsPerHeading - 220) / 12) -
    Math.min(35, Math.max(0, wordsPerAid - 280) / 14)
  );

  rows.push({ file: file.replace("civilian-site/", "gc:/").replace("public/", "/").replace(".html", ""), totalWords, paras: paras.length, walls, maxPara, headings, wordsPerHeading, scanAids, wordsPerAid, score });
}

rows.sort((a, b) => a.score - b.score);

const fmt = (r) => `| ${r.file} | ${r.score} | ${r.totalWords} | ${r.walls} (max ${r.maxPara}w) | ${r.headings} (${r.wordsPerHeading}w/ea) | ${r.scanAids} (${r.wordsPerAid}w/ea) |`;

const report = `# Sitewide formatting / scannability audit

Generated ${new Date().toISOString().slice(0, 10)} by scripts/analyze-formatting.mjs.
Score 100 = highly scannable. Penalties: wall-of-text paragraphs (>85 words),
sparse headings (>220 words/section), sparse scan aids (>280 words per
list/table/facts box/figure/FAQ). Rows are sorted worst score first, so the
blog engine's DECIDE step should treat the top of this table as refresh
candidates: break up walls, add questions-as-headings, insert lists/tables
where data hides in prose.

| Page | Score | Words | Wall paragraphs | Headings | Scan aids |
|---|---|---|---|---|---|
${rows.map(fmt).join("\n")}

## Reading the numbers
- **Wall paragraphs**: paragraphs over 85 words; "max" is the single longest.
- **Headings**: h2+h3 count and average words per section. Over ~250 means
  readers scroll without a signpost.
- **Scan aids**: lists + tables + facts boxes + FAQ items + figures, and the
  average words between them.
`;

writeFileSync("docs/formatting-audit.md", report);
console.log(`analyzed ${rows.length} pages -> docs/formatting-audit.md`);
console.log("\nWorst 10:");
rows.slice(0, 10).forEach((r) => console.log(`  ${r.score}  ${r.file}  (${r.walls} walls, ${r.wordsPerHeading}w/heading, ${r.wordsPerAid}w/aid)`));
console.log("\nBest 5:");
rows.slice(-5).forEach((r) => console.log(`  ${r.score}  ${r.file}`));
