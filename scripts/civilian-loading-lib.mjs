// Loading hints only. Text, layout, tracking code and content dates are preserved.
import {existsSync} from 'node:fs';
import {join} from 'node:path';
export function improveCivilianLoading(html,root='civilian-site'){
  let out=html.replace('<script src="/assets/costin-conversions.js">','<script src="/assets/costin-conversions.js" defer>');
  // The same resource that CSS paints can be discovered by the HTML preloader.
  const scene=out.match(/<body[^>]*--gc-interior-scene:url\('([^']+)'\)/)?.[1];
  if(scene&&/<header class="gc-interior-hero\b/.test(out)&&existsSync(join(root,scene))&&!out.includes('data-costin-hero-preload')){
    out=out.replace('</head>',`<link rel="preload" as="image" href="${scene}" fetchpriority="high" data-costin-hero-preload>\n</head>`);
  }
  return out;
}
