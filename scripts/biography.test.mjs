import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BIOGRAPHY,civilianBiographyHtml} from '../src/biography.js';
import {professionalProfileHtml} from '../src/professionalProfile.js';
import {ROUTE_META} from '../src/routeMeta.js';
import {ROUTE_SECTIONS} from '../src/routeSections.js';
import {personFull} from './entity-lib.mjs';

test('owner-confirmed education and certification appear in full Person and both profiles',()=>{
 const person=personFull(),credentials=person.hasCredential;
 for(const name of ['Bachelor of Science in Economics','Bachelor of Arts in International Affairs','FAA Part 107 Certified Drone Pilot']){
  const entries=credentials.filter(c=>c.name===name);assert.equal(entries.length,1);
  assert.equal(entries[0]['@type'],'EducationalOccupationalCredential');
  assert.ok(!entries[0].identifier);assert.ok(!entries[0].validFrom);assert.ok(!entries[0].validUntil);
 }
 assert.equal(person['@id'],'https://greggcostin.com/#gregg');
 assert.equal(person.url,'https://greggcostin.com/team');
 for(const text of ['B.S. in Economics','B.A. in International Affairs','University of Tampa','Part 107 Certified Drone Pilot']){
  assert.ok(civilianBiographyHtml().includes(text));
  assert.ok(professionalProfileHtml().includes(text));
  assert.ok(JSON.stringify(ROUTE_SECTIONS.about).includes(text));
 }
});
test('military initial HTML and React use the same essential biography and heading',()=>{
 const about=ROUTE_META.find(r=>r.page==='about'),app=readFileSync('src/App.jsx','utf8');
 assert.equal(about.heading,BIOGRAPHY.militaryHeading);
 assert.equal(about.intro,BIOGRAPHY.militaryIntro);
 assert.ok(app.includes('{BIOGRAPHY.militaryIntro}'));
 assert.ok(app.includes('{BIOGRAPHY.qualifications}'));
 assert.ok(!app.includes('double B.S. and B.A.'));
 for(const copy of [BIOGRAPHY.militaryIntro,civilianBiographyHtml(),personFull().description]){
  assert.ok(copy.includes('two decades, from enlisted service to retirement as a Captain'));
  assert.ok(copy.includes('11 personal PCS moves'));
  assert.doesNotMatch(copy,/20[- ]year|years of service/);
 }
 assert.ok(civilianBiographyHtml().includes('href="/buy"'));
 assert.ok(civilianBiographyHtml().includes('href="/sell"'));
});

test('the firsthand story and detailed military experience remain readable without JavaScript',()=>{
 const paragraphs=ROUTE_SECTIONS.about.flatMap(s=>s.text),app=readFileSync('src/App.jsx','utf8');
 for(const key of ['storyOpening','clientOrigin','clientCommitment','militaryFoundation','militaryTechnicalCareer','militaryLeadership','teamPromise','militaryPcsExperience','militaryNetworks']){
  assert.ok(paragraphs.includes(BIOGRAPHY[key]),'Initial HTML omits '+key);
  assert.ok(app.includes('{BIOGRAPHY.'+key+'}'),'React no longer shares '+key);
 }
 for(const phrase of ['2M0 cruise missile technician','B-52 Stratofortress','Navigator and Combat Systems Officer','Iraq, Afghanistan, and Syria','Chief of Integrated Air and Missile Defense (IAMD) Plans for CENTCOM A5']){
  assert.ok(paragraphs.some(p=>p.includes(phrase)),phrase);
 }
 assert.doesNotMatch(paragraphs.join(' '),/Response within two hours|lender bench that closes on time/);
 for(const route of ['/neighborhoods','/schools','/mortgage-calculators','/contact'])assert.ok(civilianBiographyHtml().includes('href="'+route+'"'));
});
