// Audit (and optionally fix) the "www" subdomain across ALL Cloudflare zones on
// the account. Default = READ-ONLY audit. Pass --apply to make changes.
//
// Fix = for each zone missing a working www: add a proxied CNAME www -> apex,
// and a 301 redirect rule www -> apex (path + query preserved).
//
// Run: node --env-file-if-exists=.env.local scripts/cf-www-fix.mjs         (audit)
//      node --env-file-if-exists=.env.local scripts/cf-www-fix.mjs --apply (fix)

const TOKEN = process.env.CF_API_TOKEN;
const APPLY = process.argv.includes("--apply");
const API = "https://api.cloudflare.com/client/v4";

if (!TOKEN) { console.error("ERROR: CF_API_TOKEN not set (add it to .env.local)."); process.exit(1); }

async function cf(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  let j; try { j = await r.json(); } catch { j = {}; }
  return { ok: r.ok && j.success !== false, status: r.status, j };
}

// 1) verify token
const v = await cf("/user/tokens/verify");
if (!v.ok) {
  console.error(`Token verify FAILED (HTTP ${v.status}):`, JSON.stringify(v.j.errors || v.j));
  process.exit(1);
}
console.log(`Token OK (status: ${v.j.result?.status}).\n`);

// 2) list all zones (paginated)
let zones = [], page = 1;
while (true) {
  const z = await cf(`/zones?per_page=50&page=${page}`);
  if (!z.ok) { console.error("List zones failed:", JSON.stringify(z.j.errors || z.j)); process.exit(1); }
  zones.push(...z.j.result);
  const ti = z.j.result_info;
  if (!ti || page >= ti.total_pages) break;
  page++;
}
console.log(`${zones.length} zones on account.${APPLY ? "  MODE: APPLY (will make changes)" : "  MODE: audit (read-only)"}\n`);

const needFix = [];
for (const z of zones) {
  const wwwName = `www.${z.name}`;
  const dns = await cf(`/zones/${z.id}/dns_records?name=${encodeURIComponent(wwwName)}`);
  const hasWww = dns.ok && dns.j.result.length > 0;
  const apex = await cf(`/zones/${z.id}/dns_records?name=${encodeURIComponent(z.name)}`);
  const apexProxied = apex.ok && apex.j.result.some(r => r.proxied);
  const status = hasWww ? "OK" : "MISSING www";
  console.log(`  ${status.padEnd(12)} ${z.name}  (apex records: ${apex.j.result?.length || 0}${apexProxied ? ", proxied" : ""})`);
  if (!hasWww) needFix.push(z);
}

console.log(`\n${needFix.length} zone(s) missing a www record:`);
needFix.forEach(z => console.log(`   - ${z.name}`));

if (!APPLY) {
  console.log(`\n(Read-only audit. Re-run with --apply to add www CNAME + www->apex 301 redirect on the ${needFix.length} zone(s) above.)`);
  process.exit(0);
}

// 3) APPLY: add www CNAME (proxied) + dynamic redirect www -> apex
console.log("\n--- applying fixes ---");
for (const z of needFix) {
  // a) CNAME www -> apex, proxied
  const c = await cf(`/zones/${z.id}/dns_records`, {
    method: "POST",
    body: JSON.stringify({ type: "CNAME", name: "www", content: z.name, proxied: true, ttl: 1 }),
  });
  console.log(`  ${z.name}: CNAME www -> apex ${c.ok ? "added ✓" : "FAILED " + JSON.stringify(c.j.errors)}`);

  // b) redirect rule www -> apex (301, preserve path + query)
  const rule = {
    expression: `(http.host eq "www.${z.name}")`,
    description: "www to apex 301",
    action: "redirect",
    action_parameters: {
      from_value: {
        status_code: 301,
        target_url: { expression: `concat("https://${z.name}", http.request.uri.path)` },
        preserve_query_string: true,
      },
    },
  };
  const put = await cf(`/zones/${z.id}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
    method: "PUT",
    body: JSON.stringify({ rules: [rule] }),
  });
  console.log(`  ${z.name}: www->apex redirect ${put.ok ? "set ✓" : "FAILED " + JSON.stringify(put.j.errors)}`);
}
console.log("\nDone.");
