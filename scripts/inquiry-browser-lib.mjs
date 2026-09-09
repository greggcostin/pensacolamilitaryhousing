// Used by both page factories, existing-page rollout, and complete-release staging.
export function withReceiptConversions(html) {
  html = html.replace(/document\.dispatchEvent\(new CustomEvent\(['"]costin:lead-success['"](?:,\{detail:\{form_id:form.id\}\})?\)\);/g, '');
  html = html.replace(/if\(res\.ok&&res\.j\.success(?:===true)?\)\{/g, "if(window.costinConversions?.accept(res.ok,res.j,form.id)){ /* costin:lead-success is emitted only for a validated receipt */");
  html = html.replace(/if\(window.gtag\)gtag\('event','inquiry_submit',\{event_category:'conversion'\}\);/g, '');
  html = html.replace(/doc\.addEventListener\("costin:lead-success", \(\) => emit\("blog_inquiry_success", \{ method: "accepted_form" \}, true\)\);/g, 'doc.addEventListener("costin:lead-success", event => { if (window.costinConversions?.isVerifiedEvent(event)) emit("blog_inquiry_success", { method: "accepted_form" }, true); });');
  if (!html.includes('src="/assets/costin-conversions.js"')) html = html.replace('</head>', '<script src="/assets/costin-conversions.js" defer></script>\n</head>');
  html = html.replace('<script src="/assets/costin-conversions.js">', '<script src="/assets/costin-conversions.js" defer>');
  return html;
}
