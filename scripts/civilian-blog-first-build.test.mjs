import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, existsSync, rmSync} from 'node:fs';
import {join, resolve, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {buildPost, loadFragment, syncSitemapAndLlms} from './civilian-blog-factory.mjs';
import {bundleCivilianStyles} from './civilian-style-bundle.mjs';
import {auditStyleBundle} from './civilian-style-audit.mjs';
import {chrome} from './civilian-page-lib.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
test('template extraction supports guarded and legacy tracker markup without dropping earlier CSS',()=>{
  for(const tracker of ['<script data-costin-tracker src="/analytics.js"></script>','<script async src="https://www.googletagmanager.com/gtag/js?id=EXAMPLE"></script>']){
    const before='<style>body{margin:0}.banner-row{display:grid}</style>',after='<link rel="stylesheet" href="/assets/costin-fonts.css">';
    const html='<head>'+before+tracker+after+'</head><body><nav class="main-banner">Navigation</nav><footer>'+('Shared footer content. '.repeat(10))+'</footer></body>';
    const shell=chrome(html);
    assert(shell.sharedHead.includes(before));
    assert(shell.sharedHead.includes(after));
    assert(shell.sharedHead.indexOf(before)<shell.sharedHead.indexOf(after));
    assert(shell.nav.includes('Navigation'));
  }
});
test('first civilian post build equals rebuild and delivers both shared styles',async()=>{
  const out=mkdtempSync(join(tmpdir(),'costin-first-post-'));
  const canonical=join(root,'civilian-site/blog/home-appraisals-explained.html');
  const before=readFileSync(canonical);
  try {
    const spec=loadFragment(join(root,'content/civilian-blog/home-appraisals-explained.fragment.html'));
    spec.outDir=out;
    const file=join(out,'blog',spec.slug+'.html');
    assert.equal(existsSync(file),false);
    buildPost(spec);
    const first=readFileSync(file,'utf8');
    const main=first.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    assert.match(main.trimStart(),/^<div class="quick-answer" data-quick-answer>/);
    assert.equal((first.match(/data-quick-answer(?=[\s>])/g)||[]).length,1);
    buildPost(spec);
    assert.equal(readFileSync(file,'utf8'),first,'a missing destination must reach the same steady state as a rebuild');
    assert.deepEqual(readFileSync(canonical),before,'preview builds leave the canonical page alone');
    for(const name of ['blog.html','sitemap.xml','llms.txt']) assert.equal(existsSync(join(out,name)),false);
    mkdirSync(join(out,'assets'),{recursive:true});
    for(const css of ['costin-fonts.css','costin-experience.css']) {
      assert.match(first,new RegExp('href="/assets/'+css.replaceAll('.','\\.')+'"'));
      cpSync(join(root,'civilian-site/assets',css),join(out,'assets',css));
    }
    // Bundle the real generated head, including every other referenced CSS source.
    for(const m of first.slice(0,first.indexOf('</head>')).matchAll(/href="(\/assets\/[^"?]+\.css)(?:\?[^\"]*)?"/g)) {
      mkdirSync(join(out,m[1],'..'),{recursive:true});
      cpSync(join(root,'civilian-site',m[1]),join(out,m[1]));
    }
    const delivery=await bundleCivilianStyles(first,out);
    writeFileSync(file,delivery.html);
    assert.deepEqual(auditStyleBundle(delivery.html,out),[]);
    for(const css of ['costin-fonts.css','costin-experience.css']) assert(delivery.sourceFiles.includes('/assets/'+css));
    const css=readFileSync(join(out,'assets/styles',delivery.id+'.css'),'utf8');
    assert.match(css,/@font-face/);
    assert.match(css,/\.banner-row\{[^}]*display:grid/,'the delivered page retains the base navigation layout');
    assert.match(css,/\*\{[^}]*margin:0/,'the delivery retains the base reset, not just fonts and experience overrides');
    assert.equal((await bundleCivilianStyles(delivery.html,out)).html,delivery.html);
    // A complete preview may be newer than canonical source. Retain its routes
    // when the blog's discovery files are updated.
    const sentinel='<url><loc>https://greggcostin.com/resources/newer-live-guide</loc><lastmod>2026-09-11</lastmod></url>';
    writeFileSync(join(out,'sitemap.xml'),'<urlset>'+sentinel+'</urlset>');
    writeFileSync(join(out,'llms.txt'),'# Civilian\n\n## Newer live resource\n\nKeep this exact guide.\n');
    syncSitemapAndLlms([spec],out);
    assert(readFileSync(join(out,'sitemap.xml'),'utf8').includes(sentinel));
    assert(readFileSync(join(out,'llms.txt'),'utf8').includes('Keep this exact guide.'));
  } finally {
    const full=resolve(out);assert(full.startsWith(resolve(tmpdir())+sep)&&full.includes('costin-first-post-'));
    rmSync(full,{recursive:true,force:true});
  }
});
