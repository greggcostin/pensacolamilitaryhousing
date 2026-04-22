// Replace the solid-gold CTA bubble with the subtle dark base-page style
// across 23 resource / homes / comparison / on-base pages.
// Also fix the hard-coded color:#fff on the email anchor (it was styled
// for the gold background; now with dark background it should inherit gold).

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

const OLD_CTA_CSS = ".cta{background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:var(--ink);padding:1.75rem;border-radius:10px;margin:2rem auto;text-align:center;font-weight:500}";
const NEW_CTA_CSS = ".cta{background:linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02));border:1px solid var(--gold-line);border-radius:10px;padding:1.75rem;margin:2.5rem 0;text-align:center}";

const OLD_CTA_LINK_CSS = ".cta a{color:var(--ink);font-weight:700;text-decoration:underline}";
const NEW_CTA_LINK_CSS = ".cta a{color:var(--gold);font-weight:700;text-decoration:none}";

// Also fix inline style on email anchor that was white-on-gold
const OLD_EMAIL_INLINE = '<a href="mailto:Gregg.Costin@gmail.com" style="color:#fff">Gregg.Costin@gmail.com</a>';
const NEW_EMAIL_INLINE = '<a href="mailto:Gregg.Costin@gmail.com">Gregg.Costin@gmail.com</a>';

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let count = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  if (html.includes(OLD_CTA_CSS)) html = html.replace(OLD_CTA_CSS, NEW_CTA_CSS);
  if (html.includes(OLD_CTA_LINK_CSS)) html = html.replace(OLD_CTA_LINK_CSS, NEW_CTA_LINK_CSS);
  if (html.includes(OLD_EMAIL_INLINE)) html = html.replace(OLD_EMAIL_INLINE, NEW_EMAIL_INLINE);

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    count++;
  }
}

console.log(`CTA style unified on ${count} pages.`);
