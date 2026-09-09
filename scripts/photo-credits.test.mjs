import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {cleanPhotoCredits,splitCaption,collectCredits} from './photo-credits-lib.mjs';
test('retains useful context and archival notice while relocating credit',()=>{
 assert.deepEqual(splitCaption('Pensacola Bay. Photo: A Photographer, CC BY-SA 3.0.'),{caption:'Pensacola Bay.',credit:'Photo: A Photographer, CC BY-SA 3.0.'});
 assert.equal(splitCaption('Photo: A Photographer, CC BY 2.0. Archival photograph.').caption,'Archival photograph.');
 assert.equal(splitCaption('Source: Florida Department of Education.').caption,'Source: Florida Department of Education.');
});
test('does not strip script data, schema, location captions, or brand copyright',()=>{
 const script='<script>const x="<figcaption>Photo: Keep this code</figcaption>";</script>';
 const input=script+'<figure><img src="/images/bay.jpg" alt="Pensacola Bay"><figcaption>Pensacola Bay. Photo: Jane, CC BY 2.0.</figcaption></figure><footer>Copyright The Costin Team</footer>';
 const result=cleanPhotoCredits(input,{ids:['bay']}).html;
 assert.ok(result.includes(script));assert.ok(result.includes('<figcaption>Pensacola Bay.</figcaption>'));
 assert.ok(result.includes('Copyright The Costin Team'));assert.equal(cleanPhotoCredits(result,{ids:['bay']}).html,result);
});
test('removes standalone photo credits, retains non-photo research citations',()=>{
 const result=cleanPhotoCredits('<p>City photos: Jane (CC BY 2.0)</p><p>School data: Florida DOE.</p><footer></footer>');
 assert.ok(!result.html.includes('City photos:'));assert.ok(result.html.includes('School data: Florida DOE.'));
});

test('includes credits for the editable SPA entry outside the static directory',()=>{
 const fixture=mkdtempSync(join(tmpdir(),'costin-photo-'));
 try {
  const root=join(fixture,'public'),entry=join(fixture,'index.html');mkdirSync(root);
  writeFileSync(join(root,'guide.html'),'<footer></footer>');
  writeFileSync(entry,'<img src="https://greggcostin.com/images/portrait.jpg">');
  const ledger={'civilian-site/images/portrait.jpg':{title:'Owner portrait',credit:'The Costin Team',license:'All rights reserved'}};
  const catalog=collectCredits(root,'pmh',ledger,{extraFiles:[entry]});
  assert.equal(catalog.entries.length,1);
  assert.equal(catalog.entries[0].image,'https://greggcostin.com/images/portrait.jpg');
  assert.deepEqual(catalog.entries[0].uses,['../index.html']);
 } finally {
  assert.ok(resolve(fixture).startsWith(resolve(tmpdir())+sep+'costin-photo-'));
  rmSync(fixture,{recursive:true,force:true});
 }
});
