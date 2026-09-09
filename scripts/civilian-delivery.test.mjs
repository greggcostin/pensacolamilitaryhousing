import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {bundleCivilianStyles,unbundleCivilianStyles} from './civilian-style-bundle.mjs';
import {auditStyleBundle} from './civilian-style-audit.mjs';
mkdirSync('.coast-release',{recursive:true});

for(const inline of [false,true])test(`${inline?'Inline':'Linked'} CSS round trip preserves scripts, body styles and cascade`,async()=>{
 const root=mkdtempSync('.coast-release/style-contract-');mkdirSync(join(root,'assets'));
 writeFileSync(join(root,'assets/one.css'),'h1 { color: blue; }');
 const html='<html><head><meta charset="utf-8"><title>Guide</title><style>h1{color:red}</style><script>window.kept=true;</script><link rel="stylesheet" href="/assets/one.css"></head><body><h1>School guide</h1><style>.body-rule{display:block}</style><p>Keep this.</p></body></html>';
 const {html:built}=await bundleCivilianStyles(html,root,{inline});
 assert.deepEqual(auditStyleBundle(built,root),[]);
 const restored=unbundleCivilianStyles(built,root);
 assert.ok(restored.includes('<script>window.kept=true;</script>'));
 assert.equal(restored.slice(restored.indexOf('<body>')),html.slice(html.indexOf('<body>')));
 assert.ok(restored.indexOf('h1{color:red}')<restored.indexOf('href="/assets/one.css"'));
 writeFileSync(join(root,'assets/one.css'),'h1{color:green}');
 assert.ok(auditStyleBundle(built,root).some(m=>m.includes('without rebuilding')));
 const rebuilt=await bundleCivilianStyles(built,root,{inline});assert.deepEqual(auditStyleBundle(rebuilt.html,root),[]);
 const manifest=JSON.parse(readFileSync(join(root,'assets/styles/manifest.json'))),entry=manifest.bundles[rebuilt.id];
 assert.ok(readFileSync(join(root,entry.path),'utf8').includes('green'));
});
