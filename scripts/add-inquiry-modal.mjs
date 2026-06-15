// Add the "Start Your PCS Search" contact popup (the SPA's InquiryModal) to the
// static /buy and /sell pages as a self-contained vanilla-JS modal that posts the
// same payload to the same contact webhook. Adds a "Contact Me" trigger button to
// every CTA cluster (.hero-ctas) on the page. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";

const CSS = `
/* INQUIRY_MODAL_CSS */
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
`;

function modalHtml(defaultType) {
  const opt = (t) => `<option${t === defaultType ? " selected" : ""}>${t}</option>`;
  return `<div class="imodal-overlay" id="inquiry-modal" aria-hidden="true">
<div class="imodal" role="dialog" aria-modal="true" aria-label="Start Your PCS Search">
<button class="imodal-close" type="button" aria-label="Close" data-inquiry-close>&times;</button>
<h2>Start Your PCS Search</h2>
<p class="isub">Tell me a bit about your move. I respond within 2 hours during business hours.</p>
<div id="inquiry-body">
<form id="inquiry-form" novalidate>
<input class="ihp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div><label>Full Name *</label><input type="text" name="name" required></div>
<div><label>Email Address *</label><input type="email" name="email" required></div>
<div><label>Phone Number</label><input type="tel" name="phone"></div>
<div><label>What Can I Help With?</label><select name="inquiryType">${["PCS Relocation — Buying","PCS Relocation — Selling","VA Loan Questions","Investment Property","General Inquiry"].map(opt).join("")}</select></div>
<div><label>Message</label><textarea name="message" rows="4"></textarea></div>
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
function open(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var f=overlay.querySelector('input[name=name]');if(f)setTimeout(function(){f.focus();},50);if(window.gtag)gtag('event','inquiry_open',{event_category:'engagement'});}
function close(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.querySelectorAll('[data-inquiry-open]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();open();});});
overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
document.querySelectorAll('[data-inquiry-close]').forEach(function(b){b.addEventListener('click',close);});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
form.addEventListener('submit',function(e){
e.preventDefault();errBox.style.display='none';
var btn=form.querySelector('.isubmit');
var data={name:get('name').trim(),email:get('email').trim(),phone:get('phone').trim(),inquiryType:get('inquiryType'),message:get('message').trim(),honeypot:get('website')};
if(!data.name||!data.email){errBox.textContent='⚠ Name and email are required.';errBox.style.display='block';return;}
btn.disabled=true;btn.textContent='Sending...';
fetch('https://costin-contact.gregg-costin.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
.then(function(res){
if(res.ok&&res.j.success){body.innerHTML='<div class="iok"><div style="font-size:40px;margin-bottom:12px">✓</div><h4 style="color:#6adf6a;font-size:18px;font-weight:700;margin-bottom:12px">Message Received</h4><p style="color:#ccc;font-size:14px;line-height:1.7">Thanks for reaching out. I will respond within 2 hours during business hours.</p></div>';try{localStorage.setItem('pmh-inquiry-submitted','1');}catch(e){}if(window.gtag)gtag('event','inquiry_submit',{event_category:'conversion'});}
else{errBox.textContent='⚠ '+(res.j.error||'Something went wrong. Please call (850) 266-5005.');errBox.style.display='block';btn.disabled=false;btn.textContent='Send Message';}
})
.catch(function(){errBox.textContent='⚠ Connection error. Please call (850) 266-5005 directly.';errBox.style.display='block';btn.disabled=false;btn.textContent='Send Message';});
});
})();
</script>
`;
}

const CONTACT_BTN = `<button type="button" class="btn btn-secondary" data-inquiry-open>Contact Me</button>`;

function inject(file, defaultType) {
  let h = readFileSync(file, "utf8");
  if (h.includes("data-inquiry-open")) { console.log(`skip (already injected): ${file}`); return; }
  // CSS before first </style>
  h = h.replace("</style>", CSS + "</style>");
  // a "Contact Me" trigger appended to every CTA cluster
  h = h.replace(/<div class="hero-ctas">([\s\S]*?)<\/div>/g, (m, inner) => `<div class="hero-ctas">${inner}${CONTACT_BTN}</div>`);
  // modal markup + script before </body>
  h = h.replace("</body>", modalHtml(defaultType) + "</body>");
  writeFileSync(file, h);
  console.log(`injected inquiry modal -> ${file}`);
}

inject("public/buy.html", "PCS Relocation — Buying");
inject("public/sell.html", "PCS Relocation — Selling");
