// Keep the shared opt-in runtime identical, with an explicit military campaign route list.
// This is not a sitewide Pixel rollout. Benefits, disability, tax and divorce guides are excluded.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
const check = process.argv.includes('--check');
let changes = 0;
function output(file, value) {
  if (existsSync(file) && readFileSync(file, 'utf8') === value) return;
  changes++;
  if (check) console.error('Military Meta asset is stale: ' + file);
  else writeFileSync(file, value);
}
const runtime = readFileSync('civilian-site/assets/costin-meta.js', 'utf8');
output('public/assets/costin-meta.js', runtime);
output('public/assets/costin-meta-config.js', `// Business dataset shared with GreggCostin.com; no automatic matching or visitor PII.\nwindow.COSTIN_META = Object.freeze({enabled:true,pixelId:'960230270427179',allowedPaths:['/pcs-checklist','/book-pcs-call'],acceptedLeadForms:['lm-form','book-form','inquiry-form']});\n`);
const styles = readFileSync('civilian-site/assets/costin-experience.css','utf8').split('\n').filter(line => line.startsWith('.gc-ad-panel')).join('\n');
output('public/assets/costin-meta.css', styles + '\n[data-meta-settings]{border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;padding:8px}\n@media(max-width:640px){footer{padding-bottom:140px!important}.gc-ad-panel{bottom:90px;max-height:65vh;overflow:auto}}\n');
for (const slug of ['pcs-checklist','book-pcs-call','privacy']) {
  const file = 'public/' + slug + '.html';
  let html = readFileSync(file, 'utf8');
  if (!html.includes('src="/assets/costin-meta.js"')) html = html.replace('</body>', '<link rel="stylesheet" href="/assets/costin-meta.css">\n<script defer src="/assets/costin-meta-config.js"></script>\n<script defer src="/assets/costin-meta.js"></script>\n</body>');
  if (!html.includes('data-meta-settings')) html = html.replace('</footer>', '<p><button type="button" data-meta-settings hidden>Facebook &amp; Instagram ad preferences</button></p>\n</footer>');
  if (slug !== 'privacy') {
    html = html.replace(/if\(res\.ok&&res\.j\.success(?:===true)?\)\{(?:document\.dispatchEvent\(new CustomEvent\('costin:lead-success',\{detail:\{form_id:form.id\}\}\)\);)?/g, "if(res.ok&&res.j.success===true){document.dispatchEvent(new CustomEvent('costin:lead-success',{detail:{form_id:form.id}}));");
    html = html.replace(/e.preventDefault\(\);errBox.style.display='none';(?!if\(!form.reportValidity)/g, "e.preventDefault();errBox.style.display='none';if(!form.reportValidity())return;");
  }
  output(file, html);
}
console.log((check ? 'Checked' : 'Prepared') + ' opt-in Meta measurement for two military campaign pages; ' + changes + (check ? ' stale files.' : ' files updated.'));
if (check && changes) process.exitCode = 1;
