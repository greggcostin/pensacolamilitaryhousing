// Browser checks for visitor journeys, all-page layout, successful/failed forms, and Meta consent.
// Start `npm run dev:civilian` first. No requests are sent to the real contact worker or trackers.
// Set CIVILIAN_PLAYWRIGHT_MODULE to a Playwright installation if it is not in node_modules.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { homedir } from 'node:os';
const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.CIVILIAN_PLAYWRIGHT_MODULE || 'playwright'); }
catch { pw = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await pw.chromium.launch({ headless: true, ...(existsSync(edge) ? { executablePath: edge } : {}) });
const out = process.env.CIVILIAN_CHECK_OUTPUT || 'docs/site-growth-2026-09-06';
mkdirSync(out, { recursive: true });
const base = process.env.CIVILIAN_PREVIEW_URL || 'http://127.0.0.1:4174';
const checks = [], issues = [], consoleErrors = [];
const check = async (name, fn) => { try { await fn(); checks.push({ name, pass: true }); console.log('PASS ' + name); } catch (e) { checks.push({ name, pass: false, error: e.message }); console.log('FAIL ' + name + ': ' + e.message); } };
const external = /googletagmanager|google-analytics|clarity\.ms|widgetbe\.com|fonts\.google|connect\.facebook|facebook\.com\/tr/;
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await context.route('**/*', route => external.test(route.request().url()) ? route.abort() : route.continue());
await context.route('**/costin-contact.gregg-costin.workers.dev/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"success":false}' }));
await context.addInitScript(() => {
  // Test-only recorder, installed after the site's production guard. It never sends events.
  document.addEventListener('DOMContentLoaded', () => {
    window.__uiEvents = [];
    window.gtag = (...args) => window.__uiEvents.push(args);
  });
});
const page = await context.newPage();
page.on('pageerror', error => consoleErrors.push(error.message));
await page.goto(base + '/', { waitUntil: 'load' });
await check('Local preview omits production analytics loaders and always disables Meta', async () => {
  const loaders = await page.locator('script').evaluateAll(scripts => scripts.filter(s => /googletagmanager|clarity\.ms\/tag|widgetbe\.com\/agent|cloudflareinsights/.test(s.outerHTML)).length);
  assert.equal(loaders, 0);
  assert.equal(await page.evaluate(() => window.COSTIN_META.enabled), false);
  assert.match(readFileSync('civilian-site/index.html','utf8'), /googletagmanager\.com/);
});
await check('Original portrait and primary action are visible on the first desktop and mobile screen', async () => {
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    const portrait = page.locator('.gc-hero-portrait img');
    assert.match(await portrait.getAttribute('src'), /gregg-courthouse\.jpg$/);
    assert.equal(await portrait.getAttribute('fetchpriority'), 'high');
    const imageBox = await page.locator('.gc-hero-portrait picture').boundingBox();
    const actionBox = await page.locator('.gc-coast-hero .gc-button').first().boundingBox();
    assert.ok(imageBox.y > 0 && imageBox.y + imageBox.height < viewport.height);
    assert.ok(actionBox.y + actionBox.height < viewport.height - (viewport.width < 640 ? 64 : 0));
  }
  await page.setViewportSize({width:1440,height:1000});
});
await check('Homepage journeys work and preserve the chosen form topic', async () => {
  await page.locator('[data-plan=sell]').click();
  assert.match(await page.locator('[data-plan-result] h3').textContent(), /thoughtful strategy/);
  await page.locator('[data-plan-result] [data-inquiry-open]').click();
  assert.equal(await page.locator('#inq-type').inputValue(), 'Selling My Home');
  assert.match(await page.locator('#inq-message').inputValue(), /pricing and marketing/);
  await page.waitForFunction(() => document.activeElement?.id === 'inq-name');
  assert.equal(await page.locator('#inq-name').evaluate(el => el === document.activeElement), true);
});
await check('Inquiry dialog contains keyboard focus and restores the opener', async () => {
  await page.locator('[data-inquiry-close]').focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('.imodal').evaluate(el => el.contains(document.activeElement)), true);
  assert.equal(await page.locator('.main-banner').evaluate(el => el.inert), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('gc-dialog-open'));
  assert.equal(await page.locator('.main-banner').evaluate(el => el.inert), false);
  assert.equal(await page.locator('[data-plan-result] [data-inquiry-open]').evaluate(el => el === document.activeElement), true);
});
let requests = [];
await page.route('https://costin-contact.gregg-costin.workers.dev/**', route => { requests.push(JSON.parse(route.request().postData())); return route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"error":"Test server unavailable"}' }); });
await check('Invalid email is blocked before the contact worker', async () => {
  await page.locator('[data-plan-result] [data-inquiry-open]').click();
  await page.locator('#inq-name').fill('Browser Test');
  await page.locator('#inq-email').fill('not-an-email');
  await page.locator('#inquiry-form button[type=submit]').click();
  assert.equal(await page.locator('#inq-email').evaluate(el => el.validity.valid), false);
  assert.equal(requests.length, 0);
});
await check('A server failure keeps the inquiry and never records a lead', async () => {
  await page.locator('#inq-email').fill('test@example.invalid');
  await page.locator('#inquiry-form button[type=submit]').click();
  await page.locator('#inquiry-err').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#inq-email').inputValue(), 'test@example.invalid');
  assert.equal(await page.evaluate(() => (window.__uiEvents || []).filter(e => e[1] === 'generate_lead').length), 0);
  assert.equal(await page.locator('#inquiry-form button[type=submit]').isEnabled(), true);
});
await page.unroute('https://costin-contact.gregg-costin.workers.dev/**');
await page.route('https://costin-contact.gregg-costin.workers.dev/**', route => { requests.push(JSON.parse(route.request().postData())); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
await check('Confirmed inquiry records exactly one lead without contact details', async () => {
  await page.locator('#inquiry-form button[type=submit]').click();
  await page.locator('#inquiry-body [role=status]').waitFor();
  const events = await page.evaluate(() => (window.__uiEvents || []).filter(e => e[1] === 'generate_lead').map(e => [...e]));
  assert.equal(events.length, 1);
  assert.equal(JSON.stringify(events).includes('test@example'), false);
  const payload = requests.at(-1);
  assert.equal(payload.inquiryType, 'Selling My Home');
  assert.equal(payload._gotcha, '');
  assert.ok(payload.name && payload.email && payload.message);
});
await page.goto(base + '/contact', { waitUntil: 'load' });
await check('Contact page form also records one confirmed lead', async () => {
  await page.locator('#c-name').fill('Browser Test');
  await page.locator('#c-email').fill('test@example.invalid');
  await page.locator('#inquiry-form-c button[type=submit]').click();
  await page.locator('#inquiry-body-c [role=status]').waitFor();
  assert.equal(await page.evaluate(() => (window.__uiEvents || []).filter(e => e[1] === 'generate_lead').length), 1);
});
await check('Long guides expose working section navigation', async () => {
  await page.goto(base + '/resources/florida-home-insurance', { waitUntil: 'load' });
  await page.locator('.gc-toc summary').click();
  const link = page.locator('.gc-toc a').first(), href = await link.getAttribute('href');
  assert.equal(await page.locator(href).count(), 1);
  await link.click();
  assert.ok(page.url().endsWith(href));
  const events = await page.evaluate(() => (window.__uiEvents || []).map(e => e[1]));
  assert.ok(events.includes('guide_contents_open'));
  assert.ok(events.includes('guide_section_select'));
  assert.ok(!events.includes('generate_lead'));
});
await check('Profile and service pages reserve the opening content for the visitor', async () => {
  for (const route of ['/team','/buy','/sell','/contact','/neighborhoods']) {
    await page.goto(base + route, {waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.gc-toc').count(), 0, route);
  }
});
await check('Delayed fonts do not shift the buyer guide after its first render', async () => {
  const c = await browser.newContext({ viewport:{width:390,height:844} });
  await c.route('**/*', route => external.test(route.request().url()) ? route.abort() : route.continue());
  await c.route('**/fonts/*.woff2', async route => { await new Promise(resolve => setTimeout(resolve,1200)); await route.continue(); });
  await c.addInitScript(() => {
    window.__layoutShifts = [];
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value); }).observe({ type:'layout-shift', buffered:true });
  });
  const p = await c.newPage(); await p.goto(base + '/buy',{waitUntil:'load'});
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const shifts = await p.evaluate(() => window.__layoutShifts.reduce((sum,value) => sum + value,0));
  assert.ok(shifts < .01, `Delayed fonts produced ${shifts} layout shift`);
  await c.close();
});
await check('All 121 content pages render without mobile or desktop overflow', async () => {
  const files = [];
  function walk(dir) { for (const e of readdirSync(dir,{withFileTypes:true})) { const f = join(dir,e.name); if (e.isDirectory()) walk(f); else if (f.endsWith('.html') && !f.endsWith('404.html')) files.push(f); } }
  walk('civilian-site');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of files) {
      const route = file.replaceAll('\\','/').replace(/^civilian-site\//,'').replace(/\.html$/,'');
      await page.goto(base + (route === 'index' ? '/' : '/' + route), { waitUntil: 'domcontentloaded' });
      const result = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth, h1s: document.querySelectorAll('h1').length, skip: !!document.querySelector('a.skip-link[href="#main-content"]'), main: !!document.getElementById('main-content') }));
      if (result.content > width + 2 || result.h1s !== 1 || !result.skip || !result.main) issues.push({ file, ...result });
    }
    console.log(`Scanned ${files.length} pages at ${width}px`);
  }
  assert.deepEqual(issues, []);
});
await check('Homepage works at 320px and with all area guides expanded', async () => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.locator('.gc-all-areas summary').click();
  assert.equal(await page.locator('.area-card').count(), 16);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
});
await check('Meta stays inactive without a real configuration', async () => {
  assert.equal(await page.evaluate(() => typeof window.fbq), 'undefined');
  assert.equal(await page.locator('[data-meta-settings]').isVisible(), false);
});
// Isolated, intercepted Meta SDK. This tests code paths without contacting Meta or using a real ID.
const metaBase = 'https://greggcostin.com';
const localMime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml'};
async function metaContext({ consent, gpc = false, enabled = true, pixelId = '123456789012345', url = '/' } = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // Use an intercepted production origin so the real host guard runs unmodified.
  // Every resource is local or mocked; the network never reaches the live site or Meta.
  await c.route('**/*', route => {
    const u = new URL(route.request().url());
    if (!['greggcostin.com','pensacolamilitaryhousing.com'].includes(u.hostname)) return route.abort();
    const root = resolve(u.hostname === 'greggcostin.com' ? 'civilian-site' : 'public');
    let path = decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname);
    if (!extname(path)) path += '.html';
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep) || !existsSync(file)) return route.fulfill({status:404,body:''});
    return route.fulfill({contentType:localMime[extname(file)] || 'application/octet-stream',body:readFileSync(file)});
  });
  await c.route('**/assets/costin-meta-config.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.COSTIN_META=${JSON.stringify({ enabled,pixelId })};` }));
  await c.addInitScript(({consent,gpc}) => {
    window.__sdkLoads = 0;
    Object.defineProperty(navigator,'globalPrivacyControl',{value:gpc});
    if (consent) localStorage.setItem('costin_meta_consent_v1', JSON.stringify(consent));
  }, {consent,gpc});
  await c.route('https://connect.facebook.net/en_US/fbevents.js', route => route.fulfill({ contentType:'text/javascript',body:'window.__sdkLoads++;' }));
  const p = await c.newPage(); await p.goto(metaBase + url, {waitUntil:'load'}); return { c,p };
}
await check('Meta declines load no SDK; acceptance sends one PageView; withdrawal blocks events', async () => {
  const {c,p} = await metaContext();
  assert.equal(await p.evaluate(() => typeof window.fbq), 'undefined');
  await p.locator('[data-meta-decline]').click();
  assert.equal(await p.evaluate(() => typeof window.fbq), 'undefined');
  await p.locator('[data-meta-settings]').click();
  await p.locator('[data-meta-accept]').click();
  await p.waitForFunction(() => window.__sdkLoads === 1);
  const calls = await p.evaluate(() => window.fbq.queue.map(c => [...c]));
  assert.equal(calls.filter(c => c[0] === 'trackSingle' && c[2] === 'PageView').length, 1);
  assert.ok(calls.some(c => c[0] === 'set' && c[1] === 'autoConfig' && c[2] === false));
  await p.evaluate(() => document.dispatchEvent(new CustomEvent('costin:lead-success',{detail:{form_id:'inquiry-form'}})));
  assert.equal(await p.evaluate(() => window.fbq.queue.filter(c => c[2] === 'Lead').length), 1);
  await p.locator('[data-meta-settings]').click();
  await p.locator('[data-meta-decline]').click();
  assert.equal(await p.evaluate(() => window.costinMeta.track('Lead')), false);
  assert.equal(await p.evaluate(() => window.fbq.queue.filter(c => c[2] === 'Lead').length), 1);
  await c.close();
});
await check('GPC, expired consent, malformed ID and sensitive query strings never activate Meta', async () => {
  for (const options of [{ gpc:true,consent:{choice:'granted',at:Date.now()} },{ consent:{choice:'granted',at:0} },{ pixelId:'not-a-pixel',consent:{choice:'granted',at:Date.now()} },{ url:'/?email=test%40example.invalid',consent:{choice:'granted',at:Date.now()} }]) {
    const {c,p} = await metaContext(options);
    assert.equal(await p.evaluate(() => typeof window.fbq), 'undefined');
    await c.close();
  }
});
await check('Consent withdrawal in another tab blocks further Meta events', async () => {
  const {c,p} = await metaContext();
  const other = await c.newPage(); await other.goto(metaBase + '/buy',{waitUntil:'load'});
  await p.locator('[data-meta-accept]').click();
  await other.waitForFunction(() => typeof window.fbq === 'function');
  await p.locator('[data-meta-settings]').click(); await p.locator('[data-meta-decline]').click();
  await other.waitForFunction(() => window.fbq.queue.some(call => call[0] === 'consent' && call[1] === 'revoke'));
  assert.equal(await other.evaluate(() => window.costinMeta.track('Lead')), false);
  await p.evaluate(() => localStorage.setItem('costin_meta_consent_v1',JSON.stringify({choice:'granted',at:0})));
  assert.equal(await other.evaluate(() => window.costinMeta.track('Lead')), false);
  await c.close();
});
await check('No JavaScript still exposes search, guides, market sources and contact links', async () => {
  const c = await browser.newContext({ javaScriptEnabled:false }); const p = await c.newPage();
  await p.goto(base + '/', {waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('h1').count(), 1);
  assert.equal(await p.locator('.gc-plan-choices a[href]').count(), 4);
  assert.equal(await p.locator('.gc-data tbody tr').count(), 4);
  await p.locator('.gc-all-areas summary').click();
  assert.equal(await p.locator('.area-card').count(), 16);
  await p.goto(base + '/resources/florida-home-insurance',{waitUntil:'domcontentloaded'});
  await p.locator('.gc-toc summary').click();
  assert.equal(await p.locator(await p.locator('.gc-toc a').first().getAttribute('href')).count(), 1);
  await c.close();
});
await page.setViewportSize({width:1440,height:1000});
await page.goto(base+'/',{waitUntil:'load'});
await page.screenshot({ path:out+'/after-desktop.png',fullPage:true });
await page.screenshot({ path:out+'/homepage-desktop.png' });
await page.setViewportSize({width:390,height:844});
await page.screenshot({ path:out+'/after-mobile.png',fullPage:true });
await page.screenshot({ path:out+'/homepage-mobile.png' });
await check('No browser JavaScript errors', async () => assert.deepEqual(consoleErrors,[]));
writeFileSync(out+'/browser-checks.json',JSON.stringify({at:new Date().toISOString(),checks,issues,consoleErrors,workerRequests:'All intercepted with synthetic success or failure; no CRM records created.',limitations:'Chromium/Edge desktop emulation; external analytics blocked; not a screen-reader or real-device certification.'},null,2)+'\n');
await browser.close();
if (checks.some(c=>!c.pass)) process.exitCode = 1;
