import {agentProfile as p} from '../content/client-guides/agent-profile.mjs';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function profilePage({portrait,brandMarks,footer,palette}){
 return `<section class="sheet contact-page agent-feature ${palette}" id="your-next-step" data-profile="courthouse-feature">
  <div class="profile-mast brand-lockup">${brandMarks()}</div>
  <div class="profile-hero">
   <figure class="profile-portrait" data-photo="portrait"><img src="../assets/${portrait.asset}" alt="${esc(portrait.caption)}"></figure>
   <div class="profile-hero-copy"><p class="eyebrow">THE COSTIN TEAM · LEVIN RINKE REALTY</p><h2>${esc(p.name)}</h2><p class="profile-role">${esc(p.role)}</p><h3>${p.headline.map(esc).join('<br>')}</h3><p class="profile-promise">${esc(p.promise)}</p>
    <div class="profile-recognition"><span>RECOGNITION</span><a href="${p.recognition.url}">${esc(p.recognition.title)}</a><p>${esc(p.recognition.issuer)}</p></div>
    <p class="profile-service">${esc(p.service)}<br><strong>${esc(p.experience)}</strong></p>
   </div>
  </div>
  <section class="profile-results" aria-label="Client results reported by Gregg Costin">${p.results.map(r=>`<div class="profile-result"><strong>${esc(r.value)}</strong><span>${esc(r.label)}${r.detail?`<br>${esc(r.detail)}`:''}</span></div>`).join('')}</section>
  <div class="profile-details"><div class="profile-credentials"><h3>Credentials behind the guidance.</h3><div class="credential-grid">${p.credentials.map(([abbr,name])=>`<div class="profile-credential" data-credential="${abbr}"><strong>${abbr}${abbr==='FAA'?'':'<sup>®</sup>'}</strong><span>${esc(name)}</span></div>`).join('')}</div></div>
   <div class="profile-connect"><div><h3>Let’s plan your next move.</h3><a class="profile-phone" href="${p.phoneUrl}">${p.phone}</a><a class="profile-email" href="mailto:${p.email}">${p.email}</a></div><div class="profile-sites">${p.sites.map(s=>`<a href="${s.url}" data-profile-site><span>${s.label}</span><strong>${s.text}</strong></a>`).join('')}</div></div>
   <nav class="profile-socials" aria-label="Gregg Costin social profiles">${p.socials.map(s=>`<a href="${s.url}" data-profile-social><strong>${s.name}</strong><span>${s.handle}</span></a>`).join('')}</nav>
   <p class="profile-evidence">${esc(p.resultsSource)}<br>Credentials & recognition: ${p.sourceLinks.map(s=>`<a href="${s.url}">${s.label}</a>`).join(' · ')} · Reviewed ${p.reviewed}. <a href="${p.links}">All contact links</a>.<br>Florida license SL3630964 · Licensed in Florida & Alabama · Equal Housing Opportunity.</p>
  </div>${footer}</section>`;
}
