// Roll out the site-search UI (Pagefind magnifying-glass + modal) to
// every prerendered HTML page. Mirrors the preview already shipped on
// /faq.html. Idempotent — pages that already have the data-search-trigger
// marker are skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const TRIGGER_MARKER = "data-search-trigger";

// Button injected into the .banner-tabs row, immediately after the
// Contact link. Matches the existing tab-button styling vocabulary.
const NAV_BUTTON = `<button type="button" class="banner-search" aria-label="Search the site" data-search-trigger>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
<span class="banner-search-label">Search</span>
</button>`;

// Modal block + Pagefind loader + theme overrides + open/close JS.
// Goes between </footer> and </body>.
const MODAL_BLOCK = `

<!-- Site search modal (Pagefind) -->
<dialog id="search-modal" class="search-modal" aria-label="Search Pensacola Military Housing">
  <button type="button" class="search-close" aria-label="Close search" data-search-close>&times;</button>
  <div class="search-modal-header">
    <p class="search-eyebrow">Search</p>
    <h2 class="search-title">Find what you need</h2>
    <p class="search-sub">Bases, communities, BAH rates, VA loan guides, FAQ — all 60+ pages.</p>
  </div>
  <div id="search"></div>
</dialog>
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<style>
.banner-search{background:transparent;border:1px solid rgba(201,168,76,0.4);color:#C9A84C;cursor:pointer;padding:5px 10px;font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;font-family:inherit;border-radius:4px;display:inline-flex;align-items:center;gap:6px;transition:background .2s,border-color .2s;margin-left:4px}
.banner-search:hover,.banner-search:focus{background:rgba(201,168,76,0.15);border-color:#C9A84C;outline:none}
.banner-search svg{display:block}
@media(max-width:480px){.banner-search-label{display:none}.banner-search{padding:5px 8px}}

.search-modal{border:1px solid rgba(201,168,76,0.35);background:#0A0F1A;color:#E8E6DF;padding:0;max-width:720px;width:92vw;max-height:88vh;border-radius:12px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;font-family:'Inter',system-ui,sans-serif}
.search-modal::backdrop{background:rgba(0,0,0,0.78);backdrop-filter:blur(4px)}
.search-modal[open]{display:flex;flex-direction:column}
.search-close{position:absolute;top:10px;right:14px;background:transparent;border:none;color:#A5A496;font-size:32px;cursor:pointer;padding:0;width:36px;height:36px;line-height:1;font-family:inherit;z-index:2}
.search-close:hover{color:#C9A84C}
.search-modal-header{padding:28px 28px 0}
.search-eyebrow{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#C9A84C;margin:0 0 8px;font-weight:600}
.search-title{font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:500;color:#fff;margin:0 0 8px;letter-spacing:-0.01em}
.search-sub{font-size:13px;color:#A5A496;margin:0;line-height:1.5}
#search{padding:20px 28px 28px;overflow-y:auto;flex:1}

/* Pagefind UI theme overrides to match site */
:root{
  --pagefind-ui-primary:#C9A84C;
  --pagefind-ui-text:#E8E6DF;
  --pagefind-ui-background:#0A0F1A;
  --pagefind-ui-border:rgba(255,255,255,0.10);
  --pagefind-ui-tag:#1A2332;
  --pagefind-ui-border-radius:6px;
  --pagefind-ui-border-width:1px;
  --pagefind-ui-image-border-radius:4px;
  --pagefind-ui-image-box-ratio:3 / 2;
  --pagefind-ui-font:'Inter',system-ui,sans-serif;
}
.pagefind-ui__search-input{background:#121823!important;color:#E8E6DF!important;border-color:rgba(201,168,76,0.35)!important}
.pagefind-ui__search-input:focus{border-color:#C9A84C!important;outline:none!important}
.pagefind-ui__result-link{color:#C9A84C!important;font-weight:600!important}
.pagefind-ui__result-link:hover{color:#D4B768!important}
.pagefind-ui__result-excerpt{color:#A5A496!important}
.pagefind-ui__result-excerpt mark{background:rgba(201,168,76,0.25)!important;color:#fff!important;padding:0 2px;border-radius:2px}
.pagefind-ui__result{border-bottom:1px solid rgba(255,255,255,0.06)!important;padding:14px 0!important}
.pagefind-ui__message{color:#A5A496!important;font-size:13px!important}
</style>
<script>
(function(){
  let inited = false;
  const modal = document.getElementById('search-modal');
  const trigger = document.querySelector('[data-search-trigger]');
  const closer = document.querySelector('[data-search-close]');
  function open(){
    if(!inited){
      try { new PagefindUI({ element: '#search', showSubResults: true, autofocus: true, resetStyles: false }); inited = true; }
      catch(e){ console.error('Pagefind UI failed to init', e); }
    }
    if(modal && typeof modal.showModal === 'function') modal.showModal();
    setTimeout(function(){ var i = document.querySelector('.pagefind-ui__search-input'); if(i) i.focus(); }, 50);
    if(window.gtag) gtag('event','site_search_open',{event_category:'engagement'});
  }
  function close(){ if(modal && typeof modal.close === 'function') modal.close(); }
  if(trigger) trigger.addEventListener('click', open);
  if(closer) closer.addEventListener('click', close);
  if(modal) modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
  document.addEventListener('keydown', function(e){
    if(e.key === '/' && document.activeElement && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){
      e.preventDefault(); open();
    }
  });
})();
</script>

`;

// Anchor for the nav button: comes right after the Contact tab.
const NAV_ANCHOR = '<a href="/contact">Contact</a>\r\n</div>\r\n</nav>';
const NAV_REPLACEMENT = `<a href="/contact">Contact</a>\r\n${NAV_BUTTON}\r\n</div>\r\n</nav>`;

// Anchor for the modal: between </footer> and </body>. Some pages have
// the two tags on the same line (no CRLF between), others have a CRLF.
const BODY_ANCHORS = [
  ["</footer>\r\n</body>", `</footer>\r\n${MODAL_BLOCK}</body>`],
  ["</footer></body>",     `</footer>${MODAL_BLOCK}</body>`],
];

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

let added = 0, skipped = 0, navMissed = 0, bodyMissed = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(TRIGGER_MARKER)) { skipped++; continue; }

  let navOk = false, bodyOk = false;
  if (html.includes(NAV_ANCHOR)) {
    html = html.replace(NAV_ANCHOR, NAV_REPLACEMENT);
    navOk = true;
  } else {
    navMissed++;
  }
  for (const [from, to] of BODY_ANCHORS) {
    if (html.includes(from)) {
      html = html.replace(from, to);
      bodyOk = true;
      break;
    }
  }
  if (!bodyOk) bodyMissed++;

  if (navOk && bodyOk) {
    writeFileSync(path, html, "utf8");
    added++;
  } else {
    console.log(`  ${path} — nav=${navOk} body=${bodyOk}, skipped`);
  }
}
console.log(`\n${added} pages updated. ${skipped} already had search.`);
if (navMissed) console.log(`Nav anchor not found in ${navMissed} pages.`);
if (bodyMissed) console.log(`Body anchor not found in ${bodyMissed} pages.`);
