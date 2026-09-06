// Sitewide, opt-in Meta measurement, including generated and interactive military pages.
import {readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {applyMilitaryMeta} from './military-meta-lib.mjs';
const check = process.argv.includes('--check');
let changes = 0;
function output(file, value) {
  // Git checkouts may use CRLF on Windows; line-ending conversion is not asset drift.
  if (existsSync(file) && readFileSync(file, 'utf8').replace(/\r\n/g,'\n') === value.replace(/\r\n/g,'\n')) return;
  changes++;
  if (check) console.error('Military Meta asset is stale: ' + file);
  else writeFileSync(file, value);
}
const runtime = readFileSync('civilian-site/assets/costin-meta.js', 'utf8');
output('public/assets/costin-meta.js', runtime);
output('public/assets/costin-meta-config.js', `// Sitewide business dataset shared with GreggCostin.com; no automatic matching or contact-field parameters.\nwindow.COSTIN_META = Object.freeze({enabled:true,pixelId:'960230270427179',acceptedLeadForms:['lm-form','book-form','val-form','inquiry-form','spa-inquiry-form','spa-contact-page']});\n`);
const styles = readFileSync('civilian-site/assets/costin-experience.css','utf8').split('\n').filter(line => line.startsWith('.gc-ad-panel')).join('\n');
output('public/assets/costin-meta.css', styles + '\n[data-meta-settings]{display:none;border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;padding:8px}.costin-meta-ready [data-meta-settings]{display:inline-block}\n@media(max-width:640px){footer{padding-bottom:140px!important}.gc-ad-panel{bottom:90px;max-height:65vh;overflow:auto}}\n');
const walk = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(dir+'/'+e.name) : e.name.endsWith('.html') ? [dir+'/'+e.name] : []);
const files = ['index.html', ...walk('public')];
for (const file of files) {
  const html = applyMilitaryMeta(readFileSync(file, 'utf8'));
  output(file, html);
  for (const asset of ['costin-meta.js','costin-meta-config.js','costin-meta.css']) {
    if (html.split('/assets/'+asset+'"').length-1 !== 1) {
      console.error(file + ': expected exactly one ' + asset); process.exitCode = 1;
    }
  }
  if ((html.match(/<button\b[^>]*data-meta-settings/g) || []).length !== 1) {
    console.error(file + ': expected exactly one advertising preferences control'); process.exitCode = 1;
  }
}
console.log((check ? 'Checked' : 'Prepared') + ' sitewide opt-in Meta measurement for ' + files.length + ' military HTML sources; ' + changes + (check ? ' stale files.' : ' files updated.'));
if (check && changes) process.exitCode = 1;
