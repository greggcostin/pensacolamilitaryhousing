// Optional browser integration check. All external requests are blocked or mocked.
// BLOG_PLAYWRIGHT_MODULE may name an installed Playwright module outside the repo.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { ROOT } from "../blog-lib.mjs";
const modulePath = process.env.BLOG_PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.BLOG_BROWSER_CHANNEL ? { channel: process.env.BLOG_BROWSER_CHANNEL } : {}) });
const results = [], servers = [];
const out = ROOT + "docs/blog-engine-audit-2026-09-05";
mkdirSync(out, { recursive: true });
try {
  for (const [site, dir, slug] of [
    ["pmh", "public", "bah-2026-pensacola-what-can-you-afford"],
    ["gc", "civilian-site", "closing-costs-florida-buyers"],
  ]) {
    const root = resolve(ROOT, dir);
    const server = createServer((req, res) => {
      let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (path.endsWith("/")) path += "index.html";
      if (!extname(path)) path += ".html";
      const file = resolve(root, "." + path);
      if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
      const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2" }[extname(file)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime }); res.end(readFileSync(file));
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r)); servers.push(server);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    let accepted = false, submitted = 0;
    await context.route("**/*", (route) => {
      const u = new URL(route.request().url());
      if (u.hostname === "127.0.0.1") return route.continue();
      if (u.hostname === "costin-contact.gregg-costin.workers.dev") {
        const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
        submitted++;
        const data = route.request().postDataJSON();
        assert.equal(data.email, "blog-test@example.invalid");
        return route.fulfill({ headers, status: accepted ? 200 : 400, contentType: "application/json", body: JSON.stringify(accepted ? { success: true } : { error: "Test rejection" }) });
      }
      return route.abort();
    });
    const page = await context.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:" + server.address().port + "/blog/" + slug);
    await page.evaluate(() => { window.__auditEvents = []; window.gtag = (...args) => window.__auditEvents.push(args); });
    const panel = page.locator("[data-article-journey]");
    assert.equal(await panel.count(), 1);
    assert.equal(await panel.locator("[data-blog-next]").count(), 3);
    await panel.scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.equal(overflow, false, site + " horizontal overflow at 390px");
    await panel.screenshot({ path: out + "/" + site + "-article-next-mobile.png" });
    await panel.locator("[data-blog-next=inquiry]").click();
    const form = page.locator("#inquiry-form");
    await form.locator("[name=name]").fill("Local Browser Test");
    await form.locator("[name=email]").fill("blog-test@example.invalid");
    await form.locator("[name=message]").fill("Intercepted locally. No message may reach the external worker.");
    await form.locator("button[type=submit], .isubmit").first().click();
    await page.waitForFunction(() => document.getElementById("inquiry-err")?.textContent.includes("Test rejection"));
    assert.equal(await page.evaluate(() => window.__auditEvents.filter((e) => e[1] === "blog_inquiry_success").length), 0);
    accepted = true;
    await form.locator("button[type=submit], .isubmit").first().click();
    await page.waitForFunction(() => document.getElementById("inquiry-body")?.textContent.includes("Message Received"));
    const count = await page.evaluate(() => window.__auditEvents.filter((e) => e[1] === "blog_inquiry_success").length);
    assert.equal(count, 1);
    const runtimeErrors = errors.filter((e) => !/pagefind|Failed to fetch|NetworkError/i.test(e));
    assert.deepEqual(runtimeErrors, []);
    results.push({ site, width: 390, nextStepLinks: 3, horizontalOverflow: false, mockedRejectedRequestCountedAsLead: false, mockedSuccessfulInquiries: count, interceptedRequests: submitted, externalRequestsSent: 0 });
    await context.close();
  }
  console.log(JSON.stringify({ results, note: "All external requests blocked. Contact responses were locally simulated; no real lead or production analytics event was sent." }, null, 2));
} finally {
  await browser.close();
  for (const s of servers) await new Promise((r) => s.close(r));
}
