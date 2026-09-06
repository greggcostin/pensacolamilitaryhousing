// Idempotent shared upgrades. Keeps the existing contact-worker handlers and field contract.
import { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { withGuideNavigation } from './civilian-experience-lib.mjs';
const root = 'civilian-site';
const fontCss = readFileSync(`${root}/assets/costin-fonts.css`, 'utf8').trim();
const files = [];
function walk(dir) { for (const entry of readdirSync(dir,{withFileTypes:true})) { const file = join(dir,entry.name); if (entry.isDirectory()) walk(file); else if (file.endsWith('.html')) files.push(file); } }
walk(root);
for (const logo of ['logo-lrr','logo-08-sm']) for (const ext of ['png','webp','avif']) { const from = `public/images/${logo}.${ext}`, to = `${root}/images/${logo}.${ext}`; if (existsSync(from) && !existsSync(to)) copyFileSync(from,to); }
const headTemplate = '<!-- COSTIN_EXPERIENCE_START -->\n<link rel="preload" href="/fonts/inter-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="/fonts/playfair-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="/assets/costin-fonts.css">\n<link rel="stylesheet" href="/assets/costin-experience.css">\n<script src="/assets/costin-meta-config.js" defer></script>\n<script src="/assets/costin-meta.js" defer></script>\n<script src="/assets/costin-experience.js" defer></script>\n<!-- COSTIN_EXPERIENCE_END -->';
const head = headTemplate.replace('<link rel="stylesheet" href="/assets/costin-fonts.css">', '<style data-costin-fonts>' + fontCss + '</style>');
let changed = 0;
for (const file of files) {
  let html = readFileSync(file,'utf8'), before = html;
  if (file.endsWith('404.html')) continue;
  html = html.replace(/<noscript>\s*<link\b[^>]*href="https:\/\/fonts\.googleapis\.com[^>]*>\s*<\/noscript>\s*/g,'').replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/g,'');
  if (!html.includes('class="gc-home"')) html = html.replace(/<body([^>]*)>/, (tag, attrs) => attrs.includes('gc-page') ? tag : attrs.includes('class=') ? tag.replace('class="', 'class="gc-page ') : '<body class="gc-page"' + attrs + '>');
  html = html.replace(/<!-- COSTIN_EXPERIENCE_START -->[\s\S]*?<!-- COSTIN_EXPERIENCE_END -->\s*/g,'').replace('</head>', head + '\n</head>');
  if (!html.includes('class="skip-link"')) html = html.replace(/<body[^>]*>/, '$&\n<a class="skip-link" href="#main-content">Skip to content</a>');
  html = html.replace(/<main(\s[^>]*)?>/, (tag, attrs) => /\bid=/.test(attrs || '') ? tag : tag.replace('>', ' id="main-content">'));
  // Keep entity graph logo URLs canonical; only visible image markup uses local copies.
  html = html.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, block => block.replace(/"(\/images\/logo-(?:lrr|08-sm)\.(?:png|avif|webp))"/g, '"https://pensacolamilitaryhousing.com$1"'));
  html = html.replace(/<picture[\s\S]*?<\/picture>/g, picture => picture.replace(/https:\/\/pensacolamilitaryhousing\.com(?=\/images\/logo-(lrr|08-sm)\.)/g,''));
  html = html.replace(/if\(res\.ok&&res\.j\.success\)\{(?!document\.dispatchEvent)/g, "if(res.ok&&res.j.success){document.dispatchEvent(new CustomEvent('costin:lead-success',{detail:{form_id:form.id}}));");
  html = html.replace(/<div class="ierr" id="([^"]+)"(?! role=)/g, '<div class="ierr" id="$1" role="alert"');
  if (!html.includes('data-meta-settings')) html = html.replace('</footer>', '<p><button class="gc-ad-settings" type="button" data-meta-settings hidden>Facebook &amp; Instagram ad preferences</button></p>\n</footer>');
  html = withGuideNavigation(html);
  if (html !== before) { writeFileSync(file,html); changed++; }
}
console.log(`Civilian shared refinement: ${changed} changed pages; ${files.length - 1} content pages covered.`);
