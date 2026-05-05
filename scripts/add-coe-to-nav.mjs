// Add /va-coe-guide as a link in two places site-wide:
//   1. The "VA Loan Guide ▾" dropdown in the top nav (right after the
//      VA Loan Guide entry)
//   2. The EXPLORE_V2 footer's "VA Loans" column (right after the
//      VA Loan Guide entry)
//
// Idempotent — pages that already have the va-coe-guide link are
// skipped on a per-pattern basis.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Pattern 1 — top nav dropdown (compact, no newlines).
// Anchor on the adjacent BAH link to make the match unique.
const NAV_FROM = '<a href="/va-loan-guide">VA Loan Guide</a><a href="/bah-to-mortgage-guide">';
const NAV_TO = '<a href="/va-loan-guide">VA Loan Guide</a><a href="/va-coe-guide">VA Certificate of Eligibility</a><a href="/bah-to-mortgage-guide">';

// Pattern 2 — EXPLORE_V2 footer (each link on its own line).
// Files use CRLF line endings, so anchor with the literal \r\n sequence.
const FOOTER_FROM = '<a href="/va-loan-guide">VA Loan Guide</a>\r\n<a href="/va-irrrl-guide">VA IRRRL Refi Guide</a>';
const FOOTER_TO = '<a href="/va-loan-guide">VA Loan Guide</a>\r\n<a href="/va-coe-guide">VA Certificate of Eligibility</a>\r\n<a href="/va-irrrl-guide">VA IRRRL Refi Guide</a>';

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
}
walk("public");

let navUpdated = 0, footerUpdated = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  let changed = false;

  if (html.includes(NAV_FROM) && !html.includes('/va-coe-guide">VA Certificate of Eligibility</a><a href="/bah-to-mortgage-guide"')) {
    html = html.replace(NAV_FROM, NAV_TO);
    changed = true;
    navUpdated++;
  }

  if (html.includes(FOOTER_FROM) && !html.includes('<a href="/va-coe-guide">VA Certificate of Eligibility</a>\r\n<a href="/va-irrrl-guide">')) {
    html = html.replace(FOOTER_FROM, FOOTER_TO);
    changed = true;
    footerUpdated++;
  }

  if (changed) writeFileSync(path, html, "utf8");
}

console.log(`Nav dropdown updated on ${navUpdated} pages.`);
console.log(`EXPLORE_V2 footer updated on ${footerUpdated} pages.`);
