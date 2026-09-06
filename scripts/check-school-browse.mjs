// Source-derived checks for the static school browser and directory order.
// Read only: no network, map requests, page generation, forms or report files.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {withSchoolFinder} from './school-finder-lib.mjs';

const data=JSON.parse(readFileSync('civilian-site/assets/school-finder-data.json','utf8'));
const hub=readFileSync('civilian-site/schools.html','utf8');
const generated=withSchoolFinder(hub,'/schools',data);
const canonical=[];
const seen=new Set();
for(const school of data.schools){if(school.reportUrl&&!seen.has(school.reportUrl)){seen.add(school.reportUrl);canonical.push(school);}}
const privateSchools=canonical.filter(s=>s.sector==='private');
const christianSchools=privateSchools.filter(s=>s.christian===true);
const magnetSchools=canonical.filter(s=>s.sector==='public'&&s.magnet===true);
const decode=value=>String(value).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&middot;/g,'·').replace(/&rarr;/g,'→').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const text=html=>decode(html.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const anchors=html=>[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m=>({html:m[0],attrs:m[1],body:m[2],href:decode(m[1].match(/\bhref="([^"]*)"/)?.[1]||''),text:text(m[2]),index:m.index}));
function elementAtId(html,id){
  const opening=new RegExp('<([a-z][a-z0-9-]*)\\b[^>]*\\bid="'+id+'"[^>]*>','i').exec(html);
  assert(opening,'Missing #'+id);
  const tag=opening[1],tokens=new RegExp('<(/?)'+tag+'\\b[^>]*>','gi');tokens.lastIndex=opening.index;
  let depth=0,match;
  while((match=tokens.exec(html))){depth+=match[1]?-1:1;if(!depth)return html.slice(opening.index,tokens.lastIndex);}
  assert.fail('Unclosed #'+id);
}
function category(label){
  const jump=anchors(generated).find(a=>a.href.startsWith('#')&&new RegExp('^'+label+'(?: schools)? \\(' ,'i').test(a.text));
  assert(jump,'Missing '+label+' category jump');
  const id=jump.href.slice(1);
  const labelledSection=new RegExp('<section\\b[^>]*aria-labelledby="'+id+'"[^>]*>[\\s\\S]*?<\\/section>').exec(generated);
  const section=labelledSection?.[0]||elementAtId(generated,id);
  return {jump,id,section,cards:anchors(section).filter(a=>a.href.startsWith('/schools/'))};
}
let passed=0,failed=0;
function check(name,run){try{run();passed++;console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+': '+error.message);}}

check('Private and Christian category counts use canonical schools and sourced affiliation',()=>{
  assert(privateSchools.length>0);assert(christianSchools.length>0&&christianSchools.length<privateSchools.length);
  for(const [label,expected] of [['Private',privateSchools],['Christian',christianSchools],['Magnet',magnetSchools]]){
    const group=category(label);assert(group.jump.text.includes('('+expected.length+')'),group.jump.text);
    assert.deepEqual(group.cards.map(a=>a.href).sort(),expected.map(s=>s.reportUrl).sort(),label+' coverage');
    assert.equal(new Set(group.cards.map(a=>a.href)).size,group.cards.length,label+' duplicate school cards');
    for(const school of expected)assert(existsSync('civilian-site'+school.reportUrl+'.html'),school.reportUrl);
  }
});
check('Private cards include name, locality, grade span, affiliation and readable guide links',()=>{
  const cards=category('Private').cards;
  for(const school of privateSchools){
    const card=cards.find(a=>a.href===school.reportUrl);assert(card,school.name);
    for(const value of [school.name,school.city,school.county,school.state])assert(card.text.includes(value),school.name+': '+value);
    if(school.gradeSpan)assert(card.text.includes(school.gradeSpan)||card.text.includes(school.gradeSpan.replace(/KG/g,'K')),school.name+': grade span');
    if(school.religiousOrientation)assert(card.text.includes(school.religiousOrientation),school.name+': affiliation');
    assert(/guide|report/i.test(card.text),school.name+': guide label');
    assert(!/<(?:button|a)\b/.test(card.body),school.name+': nested interactive content');
  }
});
check('Private badges cannot be mistaken for invented accountability letters',()=>{
  for(const label of ['Private','Christian']){
    const group=category(label);
    for(const card of group.cards){
      assert(!/(?:sf-grade|school-browse-badge)--[ABCDF](?:[\s"])/.test(card.html),card.href+': private letter class');
      assert(!/<span\b[^>]*(?:badge|grade)[^>]*>\s*[ABCDF]\s*<\/span>/.test(card.html),card.href+': private letter badge');
      assert(/(?:aria-label|title)="[^"]*(?:Private|Christian|type)/i.test(card.html),card.href+': badge meaning');
      assert(/(?:aria-label|title)="[^"]*not an? (?:accountability|academic) grade/i.test(card.html),card.href+': grade explanation');
    }
  }
});
check('Grade-card browsing precedes the two long resource directories',()=>{
  const positions=['elementary','middle','high','combination-k-8','charter-schools',category('Private').id,category('Christian').id,category('Magnet').id].map(id=>generated.indexOf('id="'+id+'"'));
  const privateDirectory=generated.indexOf('id="private-school-resources"'),allDirectory=generated.indexOf('id="all-school-guides"');
  assert(positions.every(n=>n>=0));assert(privateDirectory>Math.max(...positions));assert(allDirectory>Math.max(...positions));
  assert(generated.indexOf('id="school-finder"')<Math.min(...positions));
  for(const id of ['private-school-resources','all-school-guides',category('Private').id,category('Christian').id,category('Magnet').id])assert.equal(generated.split('id="'+id+'"').length-1,1,id+' appears once');
});
check('Every canonical guide remains statically discoverable after moving the directories',()=>{
  const directory=elementAtId(generated,'all-school-guides');
  assert.deepEqual(anchors(directory).filter(a=>a.href.startsWith('/schools/')).map(a=>a.href).sort(),canonical.map(s=>s.reportUrl).sort());
  const resources=elementAtId(generated,'private-school-resources');
  assert(/https:\/\//.test(resources));assert(resources.includes('data-sf-school-link'));
  for(const id of ['elementary','middle','high','combination-k-8','charter-schools']){
    assert(generated.includes('href="#'+id+'"'),'Existing jump '+id);
  }
});
check('Canonical duplicates preserve the primary sourced school identity',()=>{
  const umbrella=category('Private').cards.find(a=>a.href==='/schools/umbrella-learning-academy');
  assert(umbrella.text.includes('Nonsectarian'));assert(/K(?:G)?[–-]12/.test(umbrella.text));
  const duplicatePaths=[...new Set(data.schools.filter(s=>data.schools.filter(p=>p.reportUrl===s.reportUrl).length>1).map(s=>s.reportUrl))];
  for(const path of duplicatePaths)assert.equal(category('Private').cards.filter(a=>a.href===path).length,1,path);
});
check('Hub transform is repeatable and leaves unrelated pages and source data untouched',()=>{
  const before=JSON.stringify(data);
  assert.equal(withSchoolFinder(generated,'/schools',data),generated,'Second pass changes generated HTML');
  assert.equal(withSchoolFinder('<html><main>Existing school report</main></html>','/schools/example',data),'<html><main>Existing school report</main></html>');
  assert.equal(JSON.stringify(data),before,'Source data mutated');
});
console.log(`School browse: ${passed}/${passed+failed} groups passed; ${privateSchools.length} private, ${christianSchools.length} Christian, ${magnetSchools.length} magnet guides.`);
if(failed)process.exitCode=1;
