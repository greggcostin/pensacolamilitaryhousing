// Mobile header drawer + touch-target patch for the static pages (audit 2026-09-02:
// mob-01, mob-02, mob-03, mob-04, mob-05, mob-06, mob-07, mob-08, cro-04).
//
// Replaces the wrapped 4-to-6-row tab bar on phones with a 56 px header (logo, phone,
// hamburger) and a full-height drawer holding the same links; dropdowns toggle on tap
// instead of navigating; the inquiry modal gets 16 px inputs and a 44 px close button;
// the sticky Call/Text/Email bar no longer covers the footer; greggcostin.com's hero
// CTAs return to the flow and the trust band shows four tiles on phones.
// Desktop (over 900 px) is untouched. Idempotent (marker comments).
//
//   node scripts/mobile-header-drawer.mjs public/first-time-military-homebuyer.html civilian-site/index.html
//   node scripts/mobile-header-drawer.mjs public/*.html public/*/*.html civilian-site/*.html civilian-site/*/*.html
import { readFileSync, writeFileSync } from "node:fs";

const MARK = "/* MOBILE_DRAWER_START */";
const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>`;
const TOGGLE = `<button type="button" class="nav-toggle" aria-controls="site-drawer" aria-expanded="false" aria-label="Open menu">${ICON}</button>`;

const CSS_COMMON = `
${MARK}
.nav-toggle{display:none}
@media(max-width:900px){
  .main-banner{position:sticky;top:0}
  .banner-row{grid-template-columns:auto 1fr auto auto!important;padding:6px 12px!important;gap:10px!important;min-height:56px;align-items:center}
  .banner-lrr{display:none!important}
  .banner-logo{justify-self:start}
  .banner-logo img{height:40px!important}
  .banner-contact{justify-self:end;flex-direction:row;gap:0}
  .banner-email{display:none!important}
  .banner-phone{display:inline-flex;align-items:center;min-height:44px;padding:0 8px;font-size:15px!important;white-space:nowrap}
  @media(max-width:340px){.banner-phone{font-size:13px!important;padding:0 4px}}
  .nav-toggle{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--gold-line);border-radius:8px;background:transparent;color:var(--gold);cursor:pointer;padding:0}
  .nav-toggle svg{width:22px;height:22px}
  .site-drawer{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;background:var(--ink);overflow-y:auto;padding:8px 12px calc(88px + env(safe-area-inset-bottom));z-index:1001}
  .site-drawer.open{display:block}
  .banner-tabs{flex-direction:column;align-items:stretch;gap:0!important;padding:0!important}
  .banner-tabs>a,.banner-tabs .dropdown>button,.banner-tabs .banner-search{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px!important;font-size:15px!important;letter-spacing:.3px!important;border-bottom:1px solid var(--hair);border-radius:0;width:100%;text-align:left;text-transform:none;margin:0!important}
  .banner-tabs>a.mil-link{border:1px solid var(--gold-line);border-radius:8px;margin:10px 0 0!important;justify-content:center}
  .banner-tabs .dropdown{padding:0}
  .banner-tabs .dropdown>button[aria-expanded="true"]{color:var(--gold)}
  .dropdown-menu{position:static!important;display:none;box-shadow:none;border:0;padding:0 0 6px 14px;max-height:none!important;min-width:0;background:transparent}
  .dropdown:hover .dropdown-menu,.dropdown:focus-within .dropdown-menu{display:none}
  .dropdown.open .dropdown-menu{display:block}
  .dropdown-menu a{min-height:44px;display:flex;align-items:center;font-size:14px;padding:0 10px}
  body.drawer-open{overflow:hidden}
  body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}
  .sticky-mobile-cta{bottom:calc(12px + env(safe-area-inset-bottom))}
  footer a{display:inline-block;padding:10px 6px;min-height:44px;line-height:24px}
  .chips a{min-height:44px;display:inline-flex;align-items:center}
  .explore .related a,.related a{min-height:44px;display:flex;align-items:center;padding:8px 0}
  .imodal .ifine{font-size:12px}
}
@media(max-width:640px){
  .imodal-overlay{padding:16px 12px calc(24px + env(safe-area-inset-bottom));align-items:flex-start}
  .imodal{padding:44px 18px 22px;border-radius:12px}
  .imodal-close{width:44px;height:44px;top:6px;right:6px;padding:0;display:flex;align-items:center;justify-content:center}
  .imodal input,.imodal select,.imodal textarea{font-size:16px;padding:12px 14px}
  .imodal .isubmit{width:100%;min-height:48px}
  main table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
}
`;
const CSS_GC = `
@media(max-width:900px){
  .hero .btn-row{display:flex!important;flex-direction:column;gap:10px;margin:0 0 20px!important}
  .hero-cta-overlay{display:none!important}
  .hero .btn-p,.hero .btn-g{min-height:48px;line-height:1.2;justify-content:center;width:100%}
  .hero-portrait{max-width:300px}
  .hero-portrait::after{display:none}
  .mil-band .btn-p{white-space:normal;overflow-wrap:anywhere;max-width:100%}
}
@media(max-width:700px){.tb-tile:nth-child(n+5){display:none}}
`;
const CSS_END = `/* MOBILE_DRAWER_END */\n`;

const JS = `<script>/* MOBILE_DRAWER_JS */(function(){var t=document.querySelector('.nav-toggle'),d=document.getElementById('site-drawer');if(!t||!d)return;var mq=window.matchMedia('(max-width:900px)');
function setOpen(o){d.classList.toggle('open',o);document.body.classList.toggle('drawer-open',o);t.setAttribute('aria-expanded',o?'true':'false');t.setAttribute('aria-label',o?'Close menu':'Open menu');}
t.addEventListener('click',function(){setOpen(!d.classList.contains('open'));});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.classList.contains('open')){setOpen(false);t.focus();}});
d.querySelectorAll('.dropdown>button').forEach(function(b){var oc=b.getAttribute('onclick');var href=oc&&(oc.match(/'([^']+)'/)||[])[1];if(oc)b.removeAttribute('onclick');b.setAttribute('aria-haspopup','true');b.setAttribute('aria-expanded','false');
b.addEventListener('click',function(e){if(mq.matches){e.preventDefault();var open=!b.parentElement.classList.contains('open');d.querySelectorAll('.dropdown.open').forEach(function(x){if(x!==b.parentElement){x.classList.remove('open');var xb=x.querySelector('button');if(xb)xb.setAttribute('aria-expanded','false');}});b.parentElement.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false');}else if(href){location.href=href;}});});
d.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){if(mq.matches)setOpen(false);});});
if(mq.addEventListener)mq.addEventListener('change',function(){if(!mq.matches)setOpen(false);});
if(/[?&]drawer=open/.test(location.search))setOpen(true);})();</script>`;

let done = 0, skipped = 0;
for (const file of process.argv.slice(2)) {
  let h = readFileSync(file, "utf8");
  const crlf = h.includes("\r\n");
  h = h.replace(/\r\n/g, "\n");
  if (h.includes(MARK)) { skipped++; continue; }
  const isGC = file.replace(/\\/g, "/").startsWith("civilian-site/");
  // 1) toggle button inside .banner-row (after the contact block), drawer wrapper around .banner-tabs
  const rowEnd = h.indexOf("\n</div>\n<div class=\"banner-tabs\">");
  if (rowEnd < 0) { console.error("skip (no banner-row/tabs anchor):", file); skipped++; continue; }
  h = h.slice(0, rowEnd) + "\n" + TOGGLE + h.slice(rowEnd);
  h = h.replace("\n</div>\n<div class=\"banner-tabs\">", "\n</div>\n<div id=\"site-drawer\" class=\"site-drawer\">\n<div class=\"banner-tabs\">");
  const navEnd = h.indexOf("\n</div>\n</nav>");
  if (navEnd < 0) { console.error("skip (no nav close anchor):", file); skipped++; continue; }
  h = h.slice(0, navEnd) + "\n</div>\n</div>\n</nav>" + h.slice(navEnd + "\n</div>\n</nav>".length);
  // 2) CSS before the first </style>
  h = h.replace("</style>", CSS_COMMON + (isGC ? CSS_GC : "") + CSS_END + "</style>");
  // 3) JS before </body>
  h = h.replace("</body>", JS + "\n</body>");
  writeFileSync(file, crlf ? h.replace(/\n/g, "\r\n") : h);
  done++;
}
console.log(`mobile drawer: applied ${done}, skipped ${skipped}`);
