// Insert a Realtor-protective legal disclaimer at the bottom of every static
// HTML page's <footer>. Idempotent: re-runs skip files that already contain
// the disclaimer marker (data-legal="disclaimer"). To update the wording,
// search-and-replace the inner <p> rather than re-running this script.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DISCLAIMER_HTML = `<p data-legal="disclaimer" style="color:var(--mutedD,#6f6e65);font-size:.7rem;font-style:italic;line-height:1.6;margin:1rem auto 0;text-align:center;max-width:820px"><strong>Disclaimer.</strong> Gregg Costin is a Florida- and Alabama-licensed Real Estate Agent with Levin Rinke Realty (220 W. Garden St., Pensacola, FL 32502). Information on this site — including BAH figures, VA loan terms, funding fees, tax rules, homestead and disability benefits, school zoning, and rental/investment commentary — is provided for general informational purposes only and is not legal, tax, financial, mortgage, lending, or investment advice. Real estate, lending, tax, and benefits rules change frequently and depend on individual circumstances; verify current figures with official sources (DoD BAH calculator, VA, IRS, your county property appraiser) and consult a licensed attorney, CPA, or NMLS-licensed loan officer for guidance specific to your situation. Gregg Costin is not a mortgage lender, attorney, tax professional, or financial advisor, and is not affiliated with, endorsed by, or representing the U.S. Department of Defense, Department of Veterans Affairs, or any branch of the U.S. military. Use of this site does not create an agency or fiduciary relationship; representation begins only upon a signed brokerage agreement. Equal Housing Opportunity.</p>`;

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

let inserted = 0, skipped = 0, noFooter = 0;

for (const path of walk("public")) {
  const c = readFileSync(path, "utf8");
  if (c.includes('data-legal="disclaimer"')) { skipped++; continue; }
  if (!c.includes("</footer>")) { noFooter++; continue; }
  const updated = c.replace("</footer>", `${DISCLAIMER_HTML}\n</footer>`);
  writeFileSync(path, updated, "utf8");
  inserted++;
}

console.log(`Disclaimer inserted into ${inserted} files. Skipped ${skipped} (already present). ${noFooter} files had no <footer>.`);
