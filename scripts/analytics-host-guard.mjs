// Only the two public brands may send analytics. Preview servers need no special configuration.
export const PRODUCTION_HOSTS = ['pensacolamilitaryhousing.com', 'www.pensacolamilitaryhousing.com', 'greggcostin.com', 'www.greggcostin.com'];
export function isProductionLocation(location) {
  return location.protocol === 'https:' && !location.port && PRODUCTION_HOSTS.includes(location.hostname);
}
export const HOST_GUARD = `<script data-costin-host-guard>(function(){window.costinProduction=location.protocol==='https:'&&!location.port&&${JSON.stringify(PRODUCTION_HOSTS)}.includes(location.hostname);if(!window.costinProduction){window.gtag=function(){};}})();</script>`;
const TRACKER = /googletagmanager\.com\/gtag\/|window\.dataLayer\s*=|clarity\.ms\/tag\/|widgetbe\.com\/agent|static\.cloudflareinsights\.com\/beacon/;

export function guardAnalytics(html) {
  html = html.replace(/\s*<script\b[^>]*data-costin-host-guard[^>]*>[\s\S]*?<\/script>\s*/g, '\n');
  // Idle time while the hero is still downloading is not a safe time for a large CRM widget.
  html = html.replace(/  if \('requestIdleCallback' in window\) \{ requestIdleCallback\(loadFUB, \{timeout: 5000\}\); \} else \{ setTimeout\(loadFUB, 4000\); \}/g,
    "  function scheduleFUB(){ if ('requestIdleCallback' in window) { requestIdleCallback(loadFUB, {timeout: 5000}); } else { setTimeout(loadFUB, 1000); } }\n  if(document.readyState==='complete') scheduleFUB(); else window.addEventListener('load',scheduleFUB,{once:true});");
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, body) => {
    if (/application\/ld\+json|data-costin-tracker/.test(attrs) || !TRACKER.test(tag)) return tag;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/)?.[1];
    if (src) {
      // An unconditional src attribute would send a request before an inline guard could run.
      const beacon = attrs.match(/\bdata-cf-beacon='([^']+)'/)?.[1];
      body = `var s=document.createElement('script');s.async=true;s.src=${JSON.stringify(src)};${beacon ? `s.setAttribute('data-cf-beacon',${JSON.stringify(beacon)});` : ''}document.head.appendChild(s);`;
      attrs = '';
    } else {
      body = body.replace(/function\s+gtag\(\)\s*\{\s*dataLayer\.push\(arguments\);?\s*\}/g, 'window.gtag=function(){window.dataLayer.push(arguments);};');
    }
    return `<script${attrs} data-costin-tracker>(function(){if(!window.costinProduction)return;\n${body.trim()}\n})();</script>`;
  });
  // Keep the charset early; the guard must precede every executable tracking block.
  return html.replace(/(<head\b[^>]*>)\s*/i, '$1\n' + HOST_GUARD + '\n');
}

export function analyticsGuardFindings(html) {
  const findings = [];
  const guard = html.indexOf('data-costin-host-guard');
  if (guard < 0) findings.push('missing production hostname guard');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/application\/ld\+json/.test(m[1]) || !TRACKER.test(m[0])) continue;
    if (!m[1].includes('data-costin-tracker') || !m[2].includes('if(!window.costinProduction)return;') || /\bsrc=/.test(m[1]) || m.index < guard) findings.push('unguarded analytics loader');
  }
  return findings;
}
