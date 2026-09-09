import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadCivilianHomeHero} from './civilian-home-preload.mjs';
const picture='<div class="gc-hero-image"><picture><source type="image/avif" srcset="/images/coast-480.avif 480w, /images/coast-1200.avif 1200w" sizes="100vw"><source type="image/webp" srcset="/images/coast.webp 1200w" sizes="100vw"><img src="/images/coast.jpg" alt="Coast" width="1200" height="800"></picture></div>';
const page=`<html><head><meta charset="utf-8"><style>body{color:navy}</style><meta name="viewport" content="width=device-width, initial-scale=1"><script>window.trackerPreserved=true;</script></head><body>${picture}<p>Existing review date and linked proof.</p></body></html>`;

test('Early preload uses the actual responsive choice after the viewport and before CSS',()=>{
  const out=preloadCivilianHomeHero(page);
  assert.ok(out.indexOf('name="viewport"')<out.indexOf('rel="preload"'));
  assert.ok(out.indexOf('rel="preload"')<out.indexOf('<style>'));
  assert.ok(out.includes('imagesrcset="/images/coast-480.avif 480w, /images/coast-1200.avif 1200w" imagesizes="100vw"'));
  assert.equal((out.match(/rel="preload"/g)||[]).length,1);
  assert.equal(out.slice(out.indexOf('<body>')),page.slice(page.indexOf('<body>')));
  assert.ok(out.includes('<script>window.trackerPreserved=true;</script>'));
});
test('Regeneration replaces obsolete image hints without accumulating tags or whitespace',()=>{
  const once=preloadCivilianHomeHero(page);
  assert.equal(preloadCivilianHomeHero(once),once);
  const updated=once.replace(picture,picture.replaceAll('/images/coast-','/images/new-'));
  const rebuilt=preloadCivilianHomeHero(updated);
  assert.ok(rebuilt.includes('imagesrcset="/images/new-480.avif'));
  assert.ok(!rebuilt.includes('imagesrcset="/images/coast-'));
});
test('Art-directed and absent pictures retain normal browser selection',()=>{
  const conditional=page.replace('<source type="image/avif"','<source media="(min-width: 800px)" type="image/avif"');
  assert.equal(preloadCivilianHomeHero(conditional),conditional);
  const noPicture=page.replace(picture,'<h1>Guide</h1>');
  assert.equal(preloadCivilianHomeHero(noPicture),noPicture);
  assert.equal(preloadCivilianHomeHero(page.replace('name="viewport"','name="other"')),page.replace('name="viewport"','name="other"'));
});
