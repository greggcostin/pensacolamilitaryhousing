import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { guardAnalytics, analyticsGuardFindings } from './analytics-host-guard.mjs';
const check = process.argv.includes('--check');
const files = ['index.html'];
function walk(dir) { for (const e of readdirSync(dir, {withFileTypes:true})) { const p=join(dir,e.name); if(e.isDirectory()) walk(p); else if(p.endsWith('.html')) files.push(p); } }
walk('public'); walk('civilian-site');
let changed=0, errors=0;
for(const file of files) {
  const before=readFileSync(file,'utf8');
  if(check) { const issues=analyticsGuardFindings(before); if(issues.length){console.error(file+': '+issues.join(', '));errors++;} }
  else {const after=guardAnalytics(before);if(after!==before){writeFileSync(file,after);changed++;}}
}
console.log(`Analytics hostname protection: ${files.length} HTML files, ${changed} changed, ${errors} failures.`);
if(errors) process.exitCode=1;
