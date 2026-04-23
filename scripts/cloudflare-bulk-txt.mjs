#!/usr/bin/env node
// Bulk-add TXT records for Google Search Console / Bing Webmaster verification
// across all 23 short domains.
//
// Usage:
//   1. Go to https://search.google.com/search-console and add each short
//      domain as a "Domain property". Google gives you a TXT record value
//      like "google-site-verification=abc123xyz..." for each.
//   2. (Optional) Do the same at https://www.bing.com/webmasters for Bing.
//      Bing gives you a simpler value like "IntYourCodeHere".
//   3. Paste the verification strings into the VERIFICATIONS map below
//      (domain → { gsc, bing }). Leave blank if you haven't done that one.
//   4. Set your CF API token:
//        $env:CF_API_TOKEN="your_token"    (PowerShell)
//        export CF_API_TOKEN="your_token"  (bash/zsh)
//   5. Run: node scripts/cloudflare-bulk-txt.mjs
//
// Script is idempotent — re-running skips TXT records that already exist with
// the same value.

const CF_API = "https://api.cloudflare.com/client/v4";
const TOKEN = process.env.CF_API_TOKEN;

if (!TOKEN) {
  console.error("Error: CF_API_TOKEN env var not set.");
  console.error("Create one at https://dash.cloudflare.com/profile/api-tokens");
  console.error("Needs: Zone:Read, DNS:Edit");
  process.exit(1);
}

// ============================================================
// Fill these in as you claim each domain in GSC / Bing.
// Format: "domain.com": { gsc: "google-site-verification=...", bing: "..." }
// Leave empty string "" for verification codes you haven't gotten yet.
// ============================================================
const VERIFICATIONS = {
  "naspensacolamilitaryhousing.com":       { gsc: "", bing: "" },
  "corrystationmilitaryhousing.com":       { gsc: "", bing: "" },
  "whitingfieldmilitaryhousing.com":       { gsc: "", bing: "" },
  "naswhitingfieldmilitaryhousing.com":    { gsc: "", bing: "" },
  "hurlburtmilitaryhousing.com":           { gsc: "", bing: "" },
  "hurlburtfieldmilitaryhousing.com":      { gsc: "", bing: "" },
  "eglinmilitaryhousing.com":              { gsc: "", bing: "" },
  "eglinafbmilitaryhousing.com":           { gsc: "", bing: "" },
  "dukefieldmilitaryhousing.com":          { gsc: "", bing: "" },
  "saufleyfieldmilitaryhousing.com":       { gsc: "", bing: "" },
  "navarremilitaryhousing.com":            { gsc: "", bing: "" },
  "gulfbreezemilitaryhousing.com":         { gsc: "", bing: "" },
  "nicevillemilitaryhousing.com":          { gsc: "", bing: "" },
  "fortwaltonbeachmilitaryhousing.com":    { gsc: "", bing: "" },
  "fwbmilitaryhousing.com":                { gsc: "", bing: "" },
  "destinmilitaryhousing.com":             { gsc: "", bing: "" },
  "crestviewmilitaryhousing.com":          { gsc: "", bing: "" },
  "miltonmilitaryhousing.com":             { gsc: "", bing: "" },
  "pacemilitaryhousing.com":               { gsc: "", bing: "" },
  "maryesthermilitaryhousing.com":         { gsc: "", bing: "" },
  "valparaisomilitaryhousing.com":         { gsc: "", bing: "" },
  "shalimarmilitaryhousing.com":           { gsc: "", bing: "" },
  "perdidokeymilitaryhousing.com":         { gsc: "", bing: "" },
};

async function cf(method, path, body) {
  const r = await fetch(`${CF_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!data.success) {
    const errs = (data.errors || []).map(e => `[${e.code}] ${e.message}`).join(" | ");
    throw new Error(`CF ${method} ${path} failed: ${errs || r.status}`);
  }
  return data.result;
}

async function getZoneId(domain) {
  const zones = await cf("GET", `/zones?name=${domain}&status=active`);
  if (!zones.length) throw new Error("Zone not found or not Active");
  return zones[0].id;
}

async function ensureTxt(zoneId, domain, name, content, label) {
  const existing = await cf("GET", `/zones/${zoneId}/dns_records?type=TXT&name=${name}`);
  const match = existing.find(r => r.content === content || r.content === `"${content}"`);
  if (match) return `${label}=ok`;
  const withMatchingKey = existing.find(r => r.content.includes(content.split("=")[0]));
  if (withMatchingKey) {
    await cf("PATCH", `/zones/${zoneId}/dns_records/${withMatchingKey.id}`, { type: "TXT", name, content, ttl: 1 });
    return `${label}=updated`;
  }
  await cf("POST", `/zones/${zoneId}/dns_records`, { type: "TXT", name, content, ttl: 1 });
  return `${label}=created`;
}

async function setupDomain(domain, verifs) {
  try {
    const zoneId = await getZoneId(domain);
    const results = [];
    if (verifs.gsc) {
      const r = await ensureTxt(zoneId, domain, domain, verifs.gsc, "gsc");
      results.push(r);
    }
    if (verifs.bing) {
      const r = await ensureTxt(zoneId, domain, domain, verifs.bing, "bing");
      results.push(r);
    }
    return { domain, ok: true, results: results.length ? results.join(" ") : "(no codes set — skipped)" };
  } catch (e) {
    return { domain, ok: false, error: e.message };
  }
}

(async () => {
  const entries = Object.entries(VERIFICATIONS);
  const hasAny = entries.some(([, v]) => v.gsc || v.bing);
  if (!hasAny) {
    console.log("No verification codes filled in yet. Edit VERIFICATIONS in this script first.");
    console.log("Then re-run. Script is idempotent so you can fill them in batches.");
    process.exit(0);
  }

  console.log(`Adding TXT records for ${entries.length} zones...\n`);
  for (const [domain, verifs] of entries) {
    if (!verifs.gsc && !verifs.bing) {
      console.log(`  ${domain.padEnd(42)} → (no codes — skipped)`);
      continue;
    }
    process.stdout.write(`  ${domain.padEnd(42)} → `);
    const res = await setupDomain(domain, verifs);
    console.log(res.ok ? `✓ ${res.results}` : `✗ ${res.error}`);
  }
})();
