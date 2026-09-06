/* Optional Meta advertising only. Existing GA4/Clarity/FUB settings are separate. */
(() => {
  'use strict';
  // Fail closed on every preview host, even when production configuration is copied locally.
  if (window.costinProduction !== true) return;
  const config = window.COSTIN_META || {};
  const key = 'costin_meta_consent_v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const configured = config.enabled === true && /^\d{5,20}$/.test(config.pixelId || '');
  const normalizedPath = path => path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const routeAllowed = () => !config.allowedPaths || config.allowedPaths.includes(normalizedPath(location.pathname));
  // A limited campaign deployment must not send the previous page's sensitive topic either.
  const referrerAllowed = () => {
    if (!config.allowedPaths || !document.referrer) return true;
    try { const previous = new URL(document.referrer); return previous.origin !== location.origin || (!previous.search && !previous.hash && config.allowedPaths.includes(normalizedPath(previous.pathname))); }
    catch { return false; }
  };
  let choice = null, initialized = false, sentPageView = false, panel, opener;
  const validChoice = saved => saved && ['granted','denied'].includes(saved.choice) && Number.isFinite(saved.at) && Date.now() - saved.at < lifetime && saved.at <= Date.now() ? saved.choice : null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    choice = validChoice(saved);
  } catch {}
  const gpc = () => navigator.globalPrivacyControl === true;
  // Avoid loading the SDK on URLs with form data or other unknown parameters.
  const safeUrl = () => !location.hash && [...new URLSearchParams(location.search)].every(([name,value]) => /^(utm_(source|medium|campaign|content|term)|fbclid|gclid|_gl)$/.test(name) && /^[a-zA-Z0-9_.~* -]{1,240}$/.test(value));
  const allowed = () => configured && routeAllowed() && referrerAllowed() && choice === 'granted' && !gpc() && safeUrl();
  const load = () => {
    if (!allowed()) return false;
    if (!initialized) {
      initialized = true;
      if (!window.fbq) {
        const fbq = function() { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
        fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
        window.fbq = fbq; if (!window._fbq) window._fbq = fbq;
      }
      window.fbq('consent','grant');
      window.fbq('set','autoConfig',false,config.pixelId);
      window.fbq('init',config.pixelId);
      const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; script.dataset.costinMeta = 'true'; document.head.append(script);
    } else window.fbq('consent','grant');
    if (!sentPageView) { sentPageView = true; window.fbq('trackSingle',config.pixelId,'PageView'); }
    return true;
  };
  const clearCookies = () => {
    for (const name of ['_fbp','_fbc']) for (const domain of ['',location.hostname,'.' + location.hostname]) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? '; domain=' + domain : ''}`;
  };
  const save = value => {
    choice = gpc() ? 'denied' : value;
    try { localStorage.setItem(key, JSON.stringify({ choice, at: Date.now() })); } catch {}
    if (choice === 'granted') load();
    else { if (initialized && window.fbq) window.fbq('consent','revoke'); clearCookies(); }
    panel?.remove(); panel = null; if (opener?.isConnected) opener.focus();
  };
  const show = (trigger = null) => {
    if (!configured || panel) return;
    opener = trigger;
    panel = document.createElement('aside'); panel.className = 'gc-ad-panel'; panel.setAttribute('aria-label','Facebook and Instagram advertising preferences');
    panel.innerHTML = '<h2 tabindex="-1">Stay connected, on your terms.</h2><p>May we use Meta advertising cookies to measure our ads and show you relevant updates on Facebook and Instagram? You can change this choice in the footer. These controls apply to Meta advertising; other site analytics are described in our <a href="/privacy">Privacy Policy</a>.</p><div class="gc-ad-actions"><button type="button" data-meta-decline>No thanks</button><button type="button" data-meta-accept>Allow Meta cookies</button></div>';
    if (gpc()) { panel.querySelector('[data-meta-accept]').disabled = true; const note = document.createElement('p'); note.textContent = 'Your browser privacy signal keeps Meta advertising cookies off.'; panel.append(note); }
    panel.querySelector('[data-meta-accept]').addEventListener('click', () => save('granted'));
    panel.querySelector('[data-meta-decline]').addEventListener('click', () => save('denied'));
    document.body.append(panel); if (trigger) panel.querySelector('h2').focus();
  };
  window.costinMeta = Object.freeze({ track(event) { if (!['Lead','Contact'].includes(event) || !allowed() || !load()) return false; window.fbq('trackSingle',config.pixelId,event); return true; }, showSettings: show });
  if (!configured) return;
  document.querySelectorAll('[data-meta-settings]').forEach(button => { button.hidden = false; button.addEventListener('click', () => show(button)); });
  if (gpc()) { choice = 'denied'; clearCookies(); }
  if (choice === 'granted') load(); else if (choice === null && routeAllowed()) show();
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    try { choice = validChoice(JSON.parse(event.newValue || 'null')); } catch { choice = null; }
    if (!allowed() && initialized) window.fbq('consent','revoke');
    if (allowed()) load(); else clearCookies();
  });
  document.addEventListener('click', event => { if (event.target.closest('a[href^="tel:"],a[href^="sms:"]')) window.costinMeta.track('Contact'); });
  // Civilian forms already use the experience layer. Only configured military forms use this listener.
  document.addEventListener('costin:lead-success', event => {
    if (config.acceptedLeadForms?.includes(event.detail?.form_id)) window.costinMeta.track('Lead');
  });
})();
