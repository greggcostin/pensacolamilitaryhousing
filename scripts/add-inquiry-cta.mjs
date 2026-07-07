// Add on-page lead capture to the static content guides (audit finding: the
// SEO-traffic guides had no on-page form and one buried bottom CTA).
// Per page (skips buy/sell which already have it, and pages with no FAQ anchor):
//   1. Inject the proven inquiry-modal CSS (into <style>) + HTML/script (before
//      </body>) ported verbatim from buy.html — same webhook, same payload.
//   2. Inject an archetype-aware conversion block (real-review proof strip +
//      CTA) immediately BEFORE the FAQ heading (mid-content, at peak intent).
//      Buyer/info pages -> opens the modal ("Start your home search"); seller
//      pages -> RealScout valuation. Both include a call/text link.
// Idempotent (markers: .imodal-overlay, id=inquiry-modal, class=inq-cta).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const SELLER = ["rent-or-sell-pcs-pensacola", "military-rental-property-management"];
const SKIP = ["buy.html", "sell.html", "reviews.html", "faq.html", "blog.html"];

const MODAL_CSS = `
/* inquiry modal (ported from buy.html) */
.imodal-overlay{position:fixed;inset:0;background:rgba(10,15,26,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:2000;display:none;align-items:flex-start;justify-content:center;padding:80px 20px 40px;overflow-y:auto}
.imodal-overlay.open{display:flex}
.imodal{background:var(--panel);border:1px solid var(--hair);border-radius:14px;padding:40px 32px 32px;width:100%;max-width:560px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.6);text-align:left}
.imodal-close{position:absolute;top:12px;right:14px;background:transparent;border:none;color:#999;font-size:28px;line-height:1;cursor:pointer;padding:6px}
.imodal h2{font-family:var(--serif);font-size:26px;color:#fff;margin:0 0 8px;text-align:center;font-weight:500}
.imodal .isub{color:var(--muted);font-size:14px;line-height:1.7;margin:0 0 8px;text-align:center}
.imodal form{display:flex;flex-direction:column;gap:12px;margin-top:24px}
.imodal label{color:#999;font-size:12px;margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:1px}
.imodal input,.imodal select,.imodal textarea{width:100%;padding:12px 16px;background:var(--elev);border:1px solid #444;border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:var(--sans)}
.imodal .ihp{position:absolute;left:-9999px;opacity:0;pointer-events:none}
.imodal .isubmit{background:var(--gold);color:var(--ink);border:none;padding:14px 28px;font-size:14px;font-weight:700;border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:.5px;margin-top:8px;font-family:var(--sans)}
.imodal .ifine{color:#666;font-size:11px;margin-top:4px;text-align:center}
.imodal .iok{background:#1a3a1a;border:2px solid #3aa03a;border-radius:12px;padding:24px;text-align:center}
.imodal .ierr{background:#3a1a1a;border:1px solid #a03a3a;border-radius:8px;padding:12px;color:#ff9999;font-size:13px}
.inq-cta{background:linear-gradient(135deg,rgba(201,168,76,0.10),rgba(201,168,76,0.02));border:1px solid var(--gold-line);border-radius:14px;padding:26px 28px;margin:40px 0}
.inq-cta .iq{color:var(--muted);font-style:italic;font-size:14px;line-height:1.6;margin:0 0 14px;border-left:2px solid var(--gold-line);padding-left:14px}
.inq-cta .ih{color:#fff;font-family:var(--serif);font-size:22px;line-height:1.3;margin:0 0 8px;font-weight:500}
.inq-cta .is{color:var(--muted);font-size:14.5px;line-height:1.7;margin:0 0 18px}
.inq-cta .ir{display:flex;flex-wrap:wrap;gap:12px}
.inq-cta .ip{background:var(--gold);color:var(--ink);border:none;padding:13px 22px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;font-family:var(--sans);letter-spacing:.3px;text-decoration:none;display:inline-flex;align-items:center}
.inq-cta .il{display:inline-flex;align-items:center;padding:13px 22px;border-radius:8px;border:1px solid var(--gold-line);color:var(--gold);text-decoration:none;font-weight:600;font-size:14px;font-family:var(--sans)}`;

const MODAL_HTML = `<div class="imodal-overlay" id="inquiry-modal" aria-hidden="true">
<div class="imodal" role="dialog" aria-modal="true" aria-label="Start Your PCS Search">
<button class="imodal-close" type="button" aria-label="Close" data-inquiry-close>&times;</button>
<h2>Start Your PCS Search</h2>
<p class="isub">Tell me a bit about your move. I respond within 2 hours during business hours.</p>
<div id="inquiry-body">
<form id="inquiry-form" novalidate>
<input class="ihp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div><label for="inq-name">Full Name *</label><input id="inq-name" type="text" name="name" required></div>
<div><label for="inq-email">Email Address *</label><input id="inq-email" type="email" name="email" required></div>
<div><label for="inq-phone">Phone Number</label><input id="inq-phone" type="tel" name="phone"></div>
<div><label for="inq-type">What Can I Help With?</label><select id="inq-type" name="inquiryType"><option selected>PCS Relocation — Buying</option><option>PCS Relocation — Selling</option><option>VA Loan Questions</option><option>Investment Property</option><option>General Inquiry</option></select></div>
<div><label for="inq-message">Message</label><textarea id="inq-message" name="message" rows="4"></textarea></div>
<div class="ierr" id="inquiry-err" style="display:none"></div>
<button type="submit" class="isubmit">Send Message</button>
<p class="ifine">By submitting, you agree to be contacted by The Costin Team. Your information is never sold or shared.</p>
</form>
</div>
</div>
</div>
<script>
(function(){
var overlay=document.getElementById('inquiry-modal');if(!overlay)return;
var form=document.getElementById('inquiry-form'),errBox=document.getElementById('inquiry-err'),body=document.getElementById('inquiry-body');
function get(n){var el=form.querySelector('[name="'+n+'"]');return el?el.value:'';}
function open(t){if(t){var s=overlay.querySelector('select[name=inquiryType]');if(s){for(var i=0;i<s.options.length;i++){if(s.options[i].value===t||s.options[i].text===t){s.selectedIndex=i;break;}}}}overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var f=overlay.querySelector('input[name=name]');if(f)setTimeout(function(){f.focus();},50);if(window.gtag)gtag('event','inquiry_open',{event_category:'engagement'});}
function close(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.querySelectorAll('[data-inquiry-open]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();open(b.getAttribute('data-inquiry-type'));});});
overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
document.querySelectorAll('[data-inquiry-close]').forEach(function(b){b.addEventListener('click',close);});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
form.addEventListener('submit',function(e){
e.preventDefault();errBox.style.display='none';
var btn=form.querySelector('.isubmit');
var data={name:get('name').trim(),email:get('email').trim(),phone:get('phone').trim(),inquiryType:get('inquiryType'),message:get('message').trim(),honeypot:get('website')};
if(!data.name||!data.email){errBox.textContent='\\u26a0 Name and email are required.';errBox.style.display='block';return;}
btn.disabled=true;btn.textContent='Sending...';
fetch('https://costin-contact.gregg-costin.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
.then(function(res){
if(res.ok&&res.j.success){body.innerHTML='<div class="iok"><div style="font-size:40px;margin-bottom:12px">\\u2713</div><h4 style="color:#6adf6a;font-size:18px;font-weight:700;margin-bottom:12px">Message Received</h4><p style="color:#ccc;font-size:14px;line-height:1.7">Thanks for reaching out. I will respond within 2 hours during business hours.</p></div>';try{localStorage.setItem('pmh-inquiry-submitted','1');}catch(e){}if(window.gtag)gtag('event','inquiry_submit',{event_category:'conversion'});}
else{errBox.textContent='\\u26a0 '+(res.j.error||'Something went wrong. Please call (850) 266-5005.');errBox.style.display='block';btn.disabled=false;btn.textContent='Send Message';}
})
.catch(function(){errBox.textContent='\\u26a0 Connection error. Please call (850) 266-5005 directly.';errBox.style.display='block';btn.disabled=false;btn.textContent='Send Message';});
});
})();
</script>`;

// Real, verbatim Google reviews (the verified 6-name set) for the proof strip.
const QUOTE = `<p class="iq">&ldquo;We were extremely fortunate to meet Gregg during our home search. As a Veteran I cannot recommend him more highly.&rdquo; &mdash; Darin Vazquez, Google review</p>`;

const BUYER_BLOCK = `<!-- inq-cta --><div class="inq-cta">
<div style="color:var(--gold);font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">&#9733;&#9733;&#9733;&#9733;&#9733; &nbsp;5.0 on Google &middot; <a href="/reviews" style="color:var(--gold)">Verified Reviews</a></div>
${QUOTE}
<p class="ih">Ready to make your move to Pensacola?</p>
<p class="is">I am a retired USAF officer and dual-licensed Realtor who has made 11 PCS moves myself. Tell me your rank, timeline, and target base, and I will build you a plan &mdash; no pressure, no obligation.</p>
<div class="ir">
<button type="button" class="ip" data-inquiry-open data-inquiry-type="PCS Relocation &mdash; Buying">Start Your Pensacola Home Search &rarr;</button>
<a class="il" href="tel:+18502665005">Call or Text (850) 266-5005</a>
</div>
</div>`;

const SELLER_BLOCK = `<!-- inq-cta --><div class="inq-cta">
<div style="color:var(--gold);font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">&#9733;&#9733;&#9733;&#9733;&#9733; &nbsp;5.0 on Google &middot; <a href="/reviews" style="color:var(--gold)">Verified Reviews</a></div>
${QUOTE}
<p class="ih">Keep it as a rental, or sell it? Start with the numbers.</p>
<p class="is">Get a free, data-driven valuation of your Pensacola-area home, then we will talk through whether selling or holding fits your orders, your equity, and the local rent market.</p>
<div class="ir">
<a class="ip" href="https://greggcostin.realscout.com/whats-my-home-worth" target="_blank" rel="noopener">Get Your Free Home Valuation &rarr;</a>
<a class="il" href="tel:+18502665005">Call or Text (850) 266-5005</a>
</div>
</div>`;

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist"].includes(f.name)) continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const FAQ_RE = /<h2\b[^>]*>\s*(?:FAQ|Frequently Asked)/i;
let modals = 0, blocks = 0, skipped = 0;
for (const file of walk("public")) {
  const base = file.split("/").pop();
  if (SKIP.includes(base)) { skipped++; continue; }
  let s = readFileSync(file, "utf8");
  const faqMatch = s.match(FAQ_RE);
  if (!faqMatch) { skipped++; continue; }        // no anchor -> skip (keeps modal from being orphaned)
  if (s.includes('id="inquiry-modal"')) { skipped++; continue; } // idempotent
  // 1. conversion block before the FAQ h2 FIRST — uses faqMatch.index on the
  //    original string. (Must precede any head edit, which would shift indices.)
  const block = SELLER.some((k) => base.includes(k)) ? SELLER_BLOCK : BUYER_BLOCK;
  s = s.slice(0, faqMatch.index) + block + "\n" + s.slice(faqMatch.index);
  blocks++;
  // 2. modal CSS into <style> (string.replace re-searches — index-safe now)
  if (!s.includes(".imodal-overlay") && s.includes("</style>")) {
    s = s.replace("</style>", `${MODAL_CSS}\n</style>`);
  }
  // 3. modal HTML+script before </body>
  if (s.includes("</body>")) { s = s.replace("</body>", `${MODAL_HTML}\n</body>`); modals++; }
  writeFileSync(file, s);
}
console.log(`inquiry-cta: modals injected ${modals}, conversion blocks ${blocks}, skipped ${skipped}`);
