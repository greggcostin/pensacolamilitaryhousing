// Bring every static page up to the current performance/robustness baseline.
// Idempotent — run after creating any new page from a template clone.
// Applies: (1) FUB Widget Tracker deferral (keeps ~525KB JS off the critical
// path), (2) pages.dev -> apex redirect snippet, (3) Pagefind lazy-init (loads
// the ES2020 pagefind-ui.js only when search opens), (4) logo-08 -> 480px -sm
// asset set, (5) un-lazy the LCP topic hero when it sits above the first H2.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}
const files = [...walk("public"), "index.html"];
const stats = { fub: 0, pagesdev: 0, pagefind: 0, hero: 0, logo: 0 };

const FUB_RE = /<!-- FollowUpBoss Widget Tracker -->[\s\S]*?<!-- end FollowUpBoss Widget Tracker -->/;
const FUB_NEW = `<!-- FollowUpBoss Widget Tracker (deferred: keeps the ~525KB widget JS off the critical path) -->
<script>
(function(){
  function loadFUB(){
    if(window.__fubLoaded){return;} window.__fubLoaded=true;
    (function(w,i,d,g,e,t){w["WidgetTrackerObject"]=g;(w[g]=w[g]||function() {(w[g].q=w[g].q||[]).push(arguments);}),(w[g].ds=1*new Date());(e="script"), (t=d.createElement(e)),(e=d.getElementsByTagName(e)[0]);t.async=1;t.src=i; e.parentNode.insertBefore(t,e);}) (window,"https://widgetbe.com/agent",document,"widgetTracker");
    window.widgetTracker("create", "WT-ZZMZHBMI");
    window.widgetTracker("send", "pageview");
  }
  if ('requestIdleCallback' in window) { requestIdleCallback(loadFUB, {timeout: 5000}); } else { setTimeout(loadFUB, 4000); }
})();
</script>
<!-- end FollowUpBoss Widget Tracker -->`;

const PAGESDEV = `<script>if(location.hostname.indexOf('.pages.dev')>-1)location.replace('https://pensacolamilitaryhousing.com'+location.pathname+location.search);</script>`;

const PF_INIT_RE = /if\s*\(\s*!inited\s*\)\s*\{\s*try\s*\{\s*new PagefindUI\(\{ element: '#search', showSubResults: true, autofocus: true, resetStyles: false \}\); inited = true; \}\s*catch\s*\(e\)\s*\{\s*console\.error\('Pagefind UI failed to init', e\); \}\s*\}/;
const PF_INIT_NEW = `if(!inited){
      var initPagefind = function(){
        try { new PagefindUI({ element: '#search', showSubResults: true, autofocus: true, resetStyles: false }); inited = true; }
        catch(e){ console.error('Pagefind UI failed to init', e); }
      };
      if (typeof PagefindUI === 'undefined') {
        var pfs = document.createElement('script');
        pfs.src = '/pagefind/pagefind-ui.js';
        pfs.onload = initPagefind;
        document.head.appendChild(pfs);
      } else { initPagefind(); }
    }`;

for (const f of files) {
  let s = readFileSync(f, "utf8");
  const orig = s;

  if (FUB_RE.test(s) && !s.includes("__fubLoaded")) { s = s.replace(FUB_RE, FUB_NEW); stats.fub++; }
  if (!s.includes(".pages.dev")) { s = s.replace(/<head>/, "<head>\n" + PAGESDEV); stats.pagesdev++; }
  if (s.includes('src="/pagefind/pagefind-ui.js"></script>')) {
    s = s.replace(/<script src="\/pagefind\/pagefind-ui\.js"><\/script>\r?\n?/, "");
  }
  if (PF_INIT_RE.test(s) && !s.includes("initPagefind")) { s = s.replace(PF_INIT_RE, PF_INIT_NEW); stats.pagefind++; }

  const mainIdx = s.indexOf("<main");
  if (mainIdx > -1) {
    const h2Idx = s.indexOf("<h2", mainIdx);
    const fbIdx = s.indexOf('<figure class="figure-band"', mainIdx);
    if (fbIdx > -1 && h2Idx > -1 && fbIdx < h2Idx) {
      const figEnd = s.indexOf("</figure>", fbIdx);
      const fig = s.slice(fbIdx, figEnd);
      if (fig.includes('loading="lazy"')) {
        s = s.slice(0, fbIdx) + fig.replace('loading="lazy"', 'fetchpriority="high"') + s.slice(figEnd);
        stats.hero++;
      }
    }
  }

  if (s.includes("/images/logo-08.avif")) {
    s = s.replaceAll("/images/logo-08.avif", "/images/logo-08-sm.avif")
         .replaceAll("/images/logo-08.webp", "/images/logo-08-sm.webp")
         .replaceAll("/images/logo-08.png", "/images/logo-08-sm.png");
    stats.logo++;
  }

  if (s !== orig) writeFileSync(f, s);
}
console.log("apply-page-fixes:", JSON.stringify(stats));
