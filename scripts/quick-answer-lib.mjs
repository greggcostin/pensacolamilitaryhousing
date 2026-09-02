// The .quick-answer block (audit 2026-09-02, geo-03): 2-4 dated declarative sentences with the
// page's key figure and an attribution, placed directly after the H1 lead so AI engines and
// skimmers meet the quotable statement before the CTA strip, author card or calculator.
// Shared by scripts/add-quick-answers.mjs (existing pages) and the page/blog factories (new pages).
export const QA_CSS = `.quick-answer{max-width:760px;margin:6px auto 22px;padding:16px 20px;border:1px solid var(--gold-line,rgba(201,168,76,.35));border-left:4px solid var(--gold,#c9a84c);border-radius:10px;background:var(--panel,rgba(255,255,255,.03))}.quick-answer .qa-label{margin:0 0 6px;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold,#c9a84c);font-weight:600}.quick-answer .qa-text{margin:0;font-size:16px;line-height:1.65;color:var(--text,#e8e6df)}.quick-answer .qa-by{margin:8px 0 0;font-size:13px;color:var(--muted,#9aa0aa);font-style:italic}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** @param {{text:string, date?:string, by?:string}} qa */
export function quickAnswerHtml(qa) {
  const date = qa.date || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const by = qa.by || "Gregg Costin, Realtor, Levin Rinke Realty";
  return `<div class="quick-answer" data-quick-answer><p class="qa-label">Quick answer, as of ${esc(date)}</p><p class="qa-text">${esc(qa.text)}</p><p class="qa-by">${esc(by)}</p></div>`;
}

/** Insert (or replace) the block in a page. PMH pages: first child of <main data-pagefind-body>.
 *  GC pages: right after the <p class="lead">; falls back to the first <main>. */
export function placeQuickAnswer(html, qa) {
  const block = quickAnswerHtml(qa);
  let h = html.replace(/<div class="quick-answer" data-quick-answer>[\s\S]*?<\/div>/, "__QA__");
  if (h.includes("__QA__")) h = h.replace("__QA__", block);
  else if (h.includes("<main data-pagefind-body>")) h = h.replace("<main data-pagefind-body>", `<main data-pagefind-body>\n${block}`);
  else if (/<p class="lead"[^>]*>[\s\S]*?<\/p>/.test(h)) h = h.replace(/(<p class="lead"[^>]*>[\s\S]*?<\/p>)/, (m) => `${m}\n${block}`);
  else if (/<main[^>]*>/.test(h)) h = h.replace(/(<main[^>]*>)/, (m) => `${m}\n${block}`);
  else return null;
  if (!h.includes(".quick-answer{")) h = h.replace(/<\/style>/, `${QA_CSS}</style>`);
  return h;
}
