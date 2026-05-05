// Inject the Microsoft Clarity tracker into every prerendered HTML page
// in public/. Idempotent — pages that already contain the project ID
// (e.g. faq.html from the preview commit) are skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "wm7ddbciup";

const SNIPPET = `<!-- Microsoft Clarity (heatmaps + session recordings) -->
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${PROJECT_ID}");
</script>
`;

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

let added = 0, skipped = 0, missingHead = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(PROJECT_ID)) { skipped++; continue; }
  if (!html.includes("</head>")) {
    missingHead++;
    console.log(`  ${path} — no </head> found, skipped`);
    continue;
  }
  html = html.replace("</head>", `${SNIPPET}</head>`);
  writeFileSync(path, html, "utf8");
  added++;
}

console.log(`\n${added} pages updated. ${skipped} already had Clarity. ${missingHead} missing </head>.`);
