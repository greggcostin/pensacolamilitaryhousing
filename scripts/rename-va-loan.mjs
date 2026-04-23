// Rename /va-loan-pensacola → /va-loan-guide everywhere:
// 1. On the moved page itself: H1 text, title, meta og/twitter, schema URLs & labels, breadcrumb label
// 2. Site-wide: every internal link, sitemap entry, llms manifests, SPA, page-data.mjs
// 3. _redirects: add 301 redirects from legacy path to new canonical

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// ── 1. Patches that apply ONLY to the moved file ──
const page = "public/va-loan-guide.html";
let pageHtml = readFileSync(page, "utf8");

pageHtml = pageHtml
  // H1 visible text
  .replaceAll(
    "VA Loan Pensacola &mdash; A Field Guide from a Retired USAF Captain",
    "VA Loan Guide &mdash; A Field Guide from a Retired USAF Captain",
  )
  .replaceAll(
    "VA Loan Pensacola — A Field Guide from a Retired USAF Captain",
    "VA Loan Guide — A Field Guide from a Retired USAF Captain",
  )
  // Title + og/twitter titles (avoid "Guide | Guide" repetition)
  .replaceAll(
    "VA Loan Pensacola | Guide for Active Duty &amp; Veterans | Gregg Costin",
    "VA Loan Guide | Active Duty &amp; Veterans | Gregg Costin",
  )
  .replaceAll(
    "VA Loan Pensacola | Guide for Active Duty & Veterans | Gregg Costin",
    "VA Loan Guide | Active Duty & Veterans | Gregg Costin",
  )
  // Breadcrumb display label
  .replaceAll(
    'itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://pensacolamilitaryhousing.com/"},{"@type":"ListItem","position":2,"name":"Resources","item":"https://pensacolamilitaryhousing.com/#resources"},{"@type":"ListItem","position":3,"name":"VA Loan Pensacola"',
    'itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://pensacolamilitaryhousing.com/"},{"@type":"ListItem","position":2,"name":"Resources","item":"https://pensacolamilitaryhousing.com/#resources"},{"@type":"ListItem","position":3,"name":"VA Loan Guide"',
  )
  // Visible breadcrumb text
  .replaceAll("&rsaquo; VA Loan Pensacola</nav>", "&rsaquo; VA Loan Guide</nav>");

writeFileSync(page, pageHtml, "utf8");
console.log(`Patched on-page references in ${page}`);

// ── 2. Site-wide URL + label replacements ──
const PAIRS = [
  // Absolute URL references (canonical, og:url, schema IDs, author@id won't match these)
  ["https://pensacolamilitaryhousing.com/va-loan-pensacola.html", "https://pensacolamilitaryhousing.com/va-loan-guide"],
  ["https://pensacolamilitaryhousing.com/va-loan-pensacola", "https://pensacolamilitaryhousing.com/va-loan-guide"],
  // Relative href forms
  ['"/va-loan-pensacola.html"', '"/va-loan-guide"'],
  ["'/va-loan-pensacola.html'", "'/va-loan-guide'"],
  ['"/va-loan-pensacola"', '"/va-loan-guide"'],
  ["'/va-loan-pensacola'", "'/va-loan-guide'"],
  // Resources dropdown label and anywhere "VA Loan Pensacola" appears inline
  ["VA Loan Pensacola", "VA Loan Guide"],
];
// Longest first
PAIRS.sort((a, b) => b[0].length - a[0].length);

function walkFiles() {
  const out = [];
  function recurse(dir) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${f.name}`;
      if (f.isDirectory()) recurse(p);
      else if (f.isFile() && /\.(html|txt|xml|mjs|jsx|js|md)$/.test(f.name)) out.push(p);
    }
  }
  recurse("public");
  out.push("index.html", "src/App.jsx", "scripts/page-data.mjs", "scripts/page-template.mjs", "MARKETING_KIT.md");
  return out;
}

let touched = 0, subs = 0;
for (const path of walkFiles()) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;

  for (const [from, to] of PAIRS) {
    if (content.includes(from)) {
      const n = content.split(from).length - 1;
      content = content.split(from).join(to);
      subs += n;
    }
  }

  if (content !== before) {
    writeFileSync(path, content, "utf8");
    touched++;
  }
}

console.log(`Site-wide: ${subs} references updated across ${touched} files.`);

// ── 3. _redirects: add legacy path 301 to new canonical ──
const redirectsPath = "public/_redirects";
let redirects = readFileSync(redirectsPath, "utf8");
const NEW_REDIRECTS = `# VA Loan page slug rename (va-loan-pensacola -> va-loan-guide)
/va-loan-pensacola.html   /va-loan-guide   301
/va-loan-pensacola        /va-loan-guide   301
`;
if (!redirects.includes("va-loan-pensacola.html")) {
  // Insert the new redirect block just above the SPA fallback line
  redirects = redirects.replace("# ── SPA fallback", NEW_REDIRECTS + "\n# ── SPA fallback");
  writeFileSync(redirectsPath, redirects, "utf8");
  console.log("Added 301 redirects for legacy path to _redirects");
} else {
  console.log("_redirects already has legacy path redirect — skipping");
}
