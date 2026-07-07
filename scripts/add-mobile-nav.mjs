// Add a real mobile hamburger + tap-accordion to the shared .banner-tabs nav on
// every static page. Desktop is untouched (hover dropdowns as before). On <=900px
// the tab bar collapses behind a "Menu" button and each dropdown expands on tap
// instead of hover (hover is unreliable on touch), with 48px full-width targets.
//
// Idempotent: keyed on the `banner-burger` marker. Safe to re-run.
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSS = `<style id="mnav-css">
.banner-burger{display:none}
@media(max-width:900px){
  .banner-burger{display:flex;align-items:center;justify-content:center;gap:8px;width:calc(100% - 24px);margin:2px auto 6px;padding:12px 16px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.35);border-radius:8px;color:var(--gold);font-family:var(--sans);font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;min-height:46px}
  .banner-burger svg{width:18px;height:18px}
  .banner-tabs{display:none!important;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:0!important;flex-wrap:nowrap!important;padding:0 12px 10px!important}
  .main-banner.nav-open .banner-tabs{display:flex!important}
  .banner-tabs>a,.main-banner .banner-tabs .dropdown>button{width:100%;text-align:left;box-sizing:border-box;padding:14px 16px!important;font-size:14px!important;letter-spacing:.6px!important;min-height:48px;display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,0.07);border-radius:0}
  .banner-tabs .dropdown{position:static;width:100%;padding-bottom:0}
  .main-banner .banner-tabs .dropdown>button{justify-content:space-between}
  .main-banner .banner-tabs .dropdown>button::after{content:"+";font-size:18px;color:var(--gold);line-height:1}
  .main-banner .banner-tabs .dropdown.open>button::after{content:"\\2212"}
  .banner-tabs .dropdown:hover .dropdown-menu,.banner-tabs .dropdown:focus-within .dropdown-menu{display:none}
  .banner-tabs .dropdown.open .dropdown-menu{display:block;position:static;box-shadow:none;border:none;border-radius:0;background:rgba(0,0,0,0.28);min-width:0;max-height:none;padding:0}
  .banner-tabs .dropdown.open .dropdown-menu a{padding:13px 28px;min-height:46px;display:flex;align-items:center;font-size:13px}
  .banner-search{width:100%;justify-content:center;margin-top:4px}
}
</style>
`;

const JS = `<script>
(function(){
  var banner=document.querySelector(".main-banner");if(!banner)return;
  var burger=banner.querySelector(".banner-burger");
  if(burger)burger.addEventListener("click",function(){
    var open=banner.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded",open?"true":"false");
  });
  var mq=window.matchMedia("(max-width:900px)");
  banner.querySelectorAll(".banner-tabs .dropdown>button").forEach(function(btn){
    btn.addEventListener("click",function(e){
      if(mq.matches){e.preventDefault();btn.parentElement.classList.toggle("open");}
      else if(btn.dataset.hub){location.href=btn.dataset.hub;}
    });
  });
})();
</script>
`;

const BURGER = `<button type="button" class="banner-burger" aria-expanded="false" aria-controls="banner-tabs" aria-label="Open navigation menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>Menu</button>\n`;

function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}

let done = 0, skip = 0;
for (const f of walk("public")) {
  let s = readFileSync(f, "utf8");
  if (!s.includes('<nav class="main-banner"')) { skip++; continue; }
  if (s.includes("banner-burger")) { skip++; continue; }
  // convert desktop onclick-navigate dropdown buttons to data-hub (so mobile can intercept)
  s = s.replace(/<button type="button" onclick="location\.href='([^']+)'">/g, '<button type="button" data-hub="$1">');
  // add id + inject the Menu button before the tab bar
  s = s.replace('<div class="banner-tabs">', BURGER + '<div class="banner-tabs" id="banner-tabs">');
  // inject CSS + JS
  s = s.replace("</head>", CSS + "</head>");
  s = s.replace("</body>", JS + "</body>");
  writeFileSync(f, s);
  done++;
}
console.log(`mobile-nav injected on ${done} page(s); skipped ${skip}`);
