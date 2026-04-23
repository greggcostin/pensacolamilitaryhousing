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

const DOMAINS = [
  ["naspensacolamilitaryhousing.com",        "https://pensacolamilitaryhousing.com/bases/nas-pensacola"],
  ["corrystationmilitaryhousing.com",        "https://pensacolamilitaryhousing.com/bases/corry-station"],
  ["whitingfieldmilitaryhousing.com",        "https://pensacolamilitaryhousing.com/bases/whiting-field"],
  ["naswhitingfieldmilitaryhousing.com",     "https://pensacolamilitaryhousing.com/bases/whiting-field"],
  ["hurlburtmilitaryhousing.com",            "https://pensacolamilitaryhousing.com/bases/hurlburt-field"],
  ["hurlburtfieldmilitaryhousing.com",       "https://pensacolamilitaryhousing.com/bases/hurlburt-field"],
  ["eglinmilitaryhousing.com",               "https://pensacolamilitaryhousing.com/bases/eglin-afb"],
  ["eglinafbmilitaryhousing.com",            "https://pensacolamilitaryhousing.com/bases/eglin-afb"],
  ["dukefieldmilitaryhousing.com",           "https://pensacolamilitaryhousing.com/bases/duke-field"],
  ["saufleyfieldmilitaryhousing.com",        "https://pensacolamilitaryhousing.com/bases/saufley-field"],
  ["navarremilitaryhousing.com",             "https://pensacolamilitaryhousing.com/communities/navarre"],
  ["gulfbreezemilitaryhousing.com",          "https://pensacolamilitaryhousing.com/communities/gulf-breeze"],
  ["nicevillemilitaryhousing.com",           "https://pensacolamilitaryhousing.com/communities/niceville"],
  ["fortwaltonbeachmilitaryhousing.com",     "https://pensacolamilitaryhousing.com/communities/fort-walton-beach"],
  ["fwbmilitaryhousing.com",                 "https://pensacolamilitaryhousing.com/communities/fort-walton-beach"],
  ["destinmilitaryhousing.com",              "https://pensacolamilitaryhousing.com/communities/destin"],
  ["crestviewmilitaryhousing.com",           "https://pensacolamilitaryhousing.com/communities/crestview"],
  ["miltonmilitaryhousing.com",              "https://pensacolamilitaryhousing.com/communities/milton"],
  ["pacemilitaryhousing.com",                "https://pensacolamilitaryhousing.com/communities/pace"],
  ["maryesthermilitaryhousing.com",          "https://pensacolamilitaryhousing.com/communities/mary-esther"],
  ["valparaisomilitaryhousing.com",          "https://pensacolamilitaryhousing.com/communities/valparaiso"],
  ["shalimarmilitaryhousing.com",            "https://pensacolamilitaryhousing.com/communities/shalimar"],
  ["perdidokeymilitaryhousing.com",          "https://pensacolamilitaryhousing.com/communities/perdido-key"],
];

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
  const phase = "http_request_dynamic_redirect";
  const ruleset = await cf("GET", `/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`).catch(() => null);

  const expr = `(http.host eq "${domain}") or (http.host eq "www.${domain}")`;
  const rule = {
    description: `Forward to pensacolamilitaryhousing.com`,
    expression: expr,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: target },
        status_code: 301,
        preserve_query_string: false,
      },
    },
    enabled: true,
  };

  if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
    await cf("PUT", `/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, {
      rules: [rule],
    });
    return "created";
  }

  // Check if an identical rule already exists
  const match = ruleset.rules.find(r =>
    r.expression === expr && r.action === "redirect" &&
    r.action_parameters?.from_value?.target_url?.value === target
  );
  if (match) return "ok";

  // Append our rule (don't disturb existing rules)
  await cf("PUT", `/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, {
    rules: [...ruleset.rules, rule],
  });
  return "appended";
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
