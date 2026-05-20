import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const PIXEL_MARKER = 'WT-ZZMZHBMI';

const PIXEL_BLOCK = `<!-- FollowUpBoss Widget Tracker -->
<script>
(function(w,i,d,g,e,t){w["WidgetTrackerObject"]=g;(w[g]=w[g]||function() {(w[g].q=w[g].q||[]).push(arguments);}),(w[g].ds=1*new Date());(e="script"), (t=d.createElement(e)),(e=d.getElementsByTagName(e)[0]);t.async=1;t.src=i; e.parentNode.insertBefore(t,e);}) (window,"https://widgetbe.com/agent",document,"widgetTracker"); window.widgetTracker("create", "WT-ZZMZHBMI"); window.widgetTracker("send", "pageview");
</script>
<!-- end FollowUpBoss Widget Tracker -->
</head>`;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

const targets = [
  join(ROOT, 'index.html'),
  ...walk(join(ROOT, 'public')),
];

let added = 0, skipped = 0, missing = 0;
for (const file of targets) {
  const src = readFileSync(file, 'utf8');
  if (src.includes(PIXEL_MARKER)) { skipped++; continue; }
  if (!src.includes('</head>')) { missing++; console.warn('  ! no </head>:', file); continue; }
  const out = src.replace('</head>', PIXEL_BLOCK);
  writeFileSync(file, out);
  added++;
  console.log('  + added:', file.replace(ROOT, ''));
}

console.log(`\nDone. added=${added}  skipped(already had pixel)=${skipped}  missing-head=${missing}  total-files=${targets.length}`);
