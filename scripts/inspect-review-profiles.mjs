// Read-only public profile evidence. Never submits a review or authenticates.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); }
catch { pw = require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const html = readFileSync('civilian-site/reviews.html','utf8');
const google = html.match(/href="(https:\/\/www.google.com\/maps[^\"]+)"/)[1];
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await pw.chromium.launch({headless:true,...(existsSync(edge) ? {executablePath:edge} : {})});
const evidence = [];
const targets = process.argv.includes('--google-search') ? [['GoogleSearch','https://www.google.com/search?kgmid=/g/11mdg2zjxd&hl=en']] : [['Google',google],['Zillow','https://www.zillow.com/profile/GreggCostin']];
for (const [platform,url] of targets) {
  const page = await browser.newPage();
  try {
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
    await page.locator('body').waitFor();
    try { await page.getByRole('heading',{name:/Gregg Costin/i}).first().waitFor({timeout:10000}); } catch {}
    const text = (await page.locator('body').innerText()).slice(0,14000);
    evidence.push({platform,url:page.url(),at:new Date().toISOString(),text});
    console.log(JSON.stringify({platform,text:text.slice(0,6500)}));
    await page.screenshot({path:`docs/site-audit-2026-09-05/reviews-${platform.toLowerCase()}-source.png`});
  } catch (error) {
    evidence.push({platform,url,error:error.message,at:new Date().toISOString()});
    console.log(platform + ': ' + error.message.slice(0,250));
  }
  await page.close();
}
writeFileSync('docs/site-audit-2026-09-05/review-profile-evidence' + (process.argv.includes('--google-search') ? '-search' : '') + '.json',JSON.stringify(evidence,null,2)+'\n');
await browser.close();
