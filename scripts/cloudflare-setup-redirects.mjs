#!/usr/bin/env node
// Cloudflare setup automation: for each of the 23 short domains, add minimal
// DNS records (A + CNAME, proxied) and a 301 Redirect Rule pointing to the
// canonical page on pensacolamilitaryhousing.com.
//
// Usage:
//   1. Create a Cloudflare API token at https://dash.cloudflare.com/profile/api-tokens
//      with these permissions (Zone resource, All zones):
//         - Zone: Read
//         - DNS: Edit
//         - Zone Settings: Edit
//         - Zone: Edit (for Rulesets)
//   2. Export it locally:  set CF_API_TOKEN=your_token_here    (Windows CMD)
//                          $env:CF_API_TOKEN="your_token_here" (PowerShell)
//                          export CF_API_TOKEN="your_token"    (bash)
//   3. Make sure every domain has already been added to Cloudflare (nameservers
//      switched + status "Active" in dashboard). This script does NOT add zones
//      — just configures the already-added zones.
//   4. Run:  node scripts/cloudflare-setup-redirects.mjs
//
// The script is idempotent — re-running skips records/rules that already exist.

const CF_API = "https://api.cloudflare.com/client/v4";
const TOKEN = process.env.CF_API_TOKEN;

if (!TOKEN) {
  console.error("Error: CF_API_TOKEN env var not set.");
  console.error("Create one at https://dash.cloudflare.com/profile/api-tokens");
  console.error("Needs: Zone:Read, DNS:Edit, Zone Settings:Edit, Zone:Edit");
  process.exit(1);
}

// All 41 owned short domains and their canonical 301 targets.
// Direct redirects only — no chains — so PageRank consolidates cleanly.
// Source-of-truth in scripts/domain-funnel.mjs.
import { DOMAIN_MAP, CANONICAL } from "./domain-funnel.mjs";
const DOMAINS = DOMAIN_MAP.map(([d, path]) => [d, `${CANONICAL}${path}`]);

async function cf(method, path, body) {
  const r = await fetch(`${CF_API}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
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
  if (!zones.length) {
    throw new Error(`Zone not found or not Active. Add it in CF dashboard first.`);
  }
  return zones[0].id;
}

async function ensureDnsRecord(zoneId, type, name, content) {
  // Check if record already exists
  const existing = await cf("GET", `/zones/${zoneId}/dns_records?type=${type}&name=${name}`);
  if (existing.length) {
    // Update existing record to ensure correct content + proxied
    const r = existing[0];
    if (r.content !== content || !r.proxied) {
      await cf("PATCH", `/zones/${zoneId}/dns_records/${r.id}`, { type, name, content, proxied: true, ttl: 1 });
      return "updated";
    }
    return "ok";
  }
  await cf("POST", `/zones/${zoneId}/dns_records`, { type, name, content, proxied: true, ttl: 1 });
  return "created";
}

async function ensureRedirectRule(zoneId, domain, target) {
  // Using legacy Page Rules API — works with just Zone:Edit (no account-level
  // rulesets permission needed). 1 rule per zone, well under the free-plan cap.
  const existing = await cf("GET", `/zones/${zoneId}/pagerules`);

  // Already have an identical forwarding rule? Skip.
  const match = (existing || []).find(pr =>
    pr.actions?.some(a => a.id === "forwarding_url" && a.value?.url === target)
  );
  if (match) return "ok";

  const body = {
    targets: [{
      target: "url",
      constraint: { operator: "matches", value: `*${domain}/*` },
    }],
    actions: [{
      id: "forwarding_url",
      value: { url: target, status_code: 301 },
    }],
    priority: 1,
    status: "active",
  };
  await cf("POST", `/zones/${zoneId}/pagerules`, body);
  return "created";
}

async function setupDomain(domain, target) {
  try {
    const zoneId = await getZoneId(domain);
    const aResult = await ensureDnsRecord(zoneId, "A", domain, "192.0.2.1");
    const cnameResult = await ensureDnsRecord(zoneId, "CNAME", `www.${domain}`, domain);
    const ruleResult = await ensureRedirectRule(zoneId, domain, target);
    return { domain, ok: true, a: aResult, cname: cnameResult, rule: ruleResult };
  } catch (e) {
    return { domain, ok: false, error: e.message };
  }
}

(async () => {
  console.log(`Configuring ${DOMAINS.length} domains...\n`);
  const results = [];
  for (const [domain, target] of DOMAINS) {
    process.stdout.write(`  ${domain.padEnd(42)} → `);
    const res = await setupDomain(domain, target);
    results.push(res);
    if (res.ok) {
      console.log(`✓ A=${res.a} CNAME=${res.cname} rule=${res.rule}`);
    } else {
      console.log(`✗ ${res.error}`);
    }
  }
  const ok = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok);
  console.log(`\n${ok}/${DOMAINS.length} domains configured successfully.`);
  if (failed.length) {
    console.log(`\nFailed:`);
    failed.forEach(f => console.log(`  ${f.domain}: ${f.error}`));
    console.log(`\nFix the above in the CF dashboard or re-run this script after correcting.`);
    process.exit(1);
  }
  console.log(`\nTest a few:`);
  console.log(`  curl -sIL https://naspensacolamilitaryhousing.com | grep -iE "^HTTP|^Location"`);
  console.log(`  curl -sIL https://navarremilitaryhousing.com | grep -iE "^HTTP|^Location"`);
})();
