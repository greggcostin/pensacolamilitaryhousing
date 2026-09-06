import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadSchoolGuideContext, withSchoolGuide } from './school-report-guide-lib.mjs';
const context=loadSchoolGuideContext();
let changed=0;
for (const school of context.reports) {
  const path=`civilian-site${school.reportUrl}.html`;
  if (!existsSync(path)) throw new Error(`Missing existing report: ${path}`);
  const before=readFileSync(path,'utf8'), after=withSchoolGuide(before,school.reportUrl,context);
  if (before!==after) { writeFileSync(path,after);changed++; }
}
console.log(`School guides: ${context.reports.length} reports; ${changed} changed; ${context.reports.filter(s=>context.editorial[s.reportUrl]).length} with school-specific editorial sources.`);
