// Read-only release checks for the two school editions. No network or form submission.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {findSchools,milesBetween} from '../public/school-assets/school-finder-core.js';

const PMH='https://pensacolamilitaryhousing.com',GC='https://greggcostin.com';
const read=path=>readFileSync(path,'utf8');
const data=JSON.parse(read('civilian-site/assets/school-finder-data.json'));
const paths=[...new Set(data.schools.map(s=>s.reportUrl))];
const routes=['/schools',...paths];
const pages=new Map(routes.map(route=>[route,{pmh:read('public'+route+'.html'),gc:read('civilian-site'+route+'.html')}]));
const hub=pages.get('/schools').pmh;
const decode=value=>String(value).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&middot;/g,'·').replace(/&rarr;/g,'→').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const text=html=>decode(html.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const meta=(html,key)=>[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0])).find(a=>a.name===key||a.property===key)?.content;
const scripts=html=>[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>({attrs:attrs(m[1]),body:m[2]}));
const schemas=html=>scripts(html).filter(s=>s.attrs.type==='application/ld+json').map(s=>JSON.parse(s.body));
const anchors=html=>[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m=>({...attrs(m[1]),text:text(m[2]),html:m[0]}));
function elementAtId(html,id){
  const opening=new RegExp('<([a-z][a-z0-9-]*)\\b[^>]*\\bid="'+id+'"[^>]*>','i').exec(html);
  assert(opening,'Missing #'+id);const tokens=new RegExp('<(/?)'+opening[1]+'\\b[^>]*>','gi');tokens.lastIndex=opening.index;let depth=0,match;
  while((match=tokens.exec(html))){depth+=match[1]?-1:1;if(!depth)return html.slice(opening.index,tokens.lastIndex);}
  assert.fail('Unclosed #'+id);
}
const normalizeSchool=node=>JSON.parse(JSON.stringify(node).replaceAll(PMH+'/schools',GC+'/schools'));
let passed=0,failed=0;
function check(name,run){try{run();passed++;console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+': '+error.message);}}

check('All 274 directory identities retain their 271 canonical guides on both sites',()=>{
  assert.equal(data.schools.length,274);assert.equal(paths.length,271);
  const output=readdirSync('public/schools').filter(name=>name.endsWith('.html')).map(name=>'/schools/'+name.slice(0,-5));
  assert.deepEqual(output.sort(),[...paths].sort());
  for(const route of routes){const p=pages.get(route);assert.equal((p.pmh.match(/<h1\b/g)||[]).length,1,route);assert(!/\bNaN\b|undefined%|null%/.test(p.pmh),route);}
});
check('Each edition owns its canonical, social URLs and page metadata',()=>{
  for(const [route,p]of pages){
    for(const [edition,origin]of [['pmh',PMH],['gc',GC]]){
      const html=p[edition],canon=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).filter(a=>a.rel==='canonical');
      assert.equal(canon.length,1,route+': canonical count');assert.equal(canon[0].href,origin+route);
      for(const key of ['og:url','twitter:url'])assert.equal(meta(html,key),origin+route,route+': '+key);
      assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html),route+': indexable');
      if(edition==='pmh'){
        const title=text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');assert(title.length>10);
        assert.equal(meta(html,'og:title'),title);assert.equal(meta(html,'twitter:title'),title);
        assert.equal(meta(html,'og:description'),meta(html,'description'));assert.equal(meta(html,'twitter:description'),meta(html,'description'));
        assert.equal(meta(html,'og:site_name'),'Pensacola Military Housing');
        for(const key of ['og:image','twitter:image']){const url=new URL(meta(html,key));assert.equal(url.origin,PMH);assert(existsSync('public'+url.pathname),route+': social image');}
      }
    }
    assert.notEqual(meta(p.pmh,'description'),meta(p.gc,'description'),route+': distinct edition description');
  }
});
check('Structured data preserve school facts and business identity while giving PMH pages their own URLs',()=>{
  for(const [route,p]of pages){
    const ps=schemas(p.pmh),gs=schemas(p.gc),serialized=JSON.stringify(ps);
    assert(!serialized.includes(GC+'/schools'),route+': GC school URL in PMH schema');
    for(const id of ['#gregg','#team','#brokerage'])assert(serialized.includes(GC+'/'+id),route+': shared business '+id);
    const pg=ps.find(n=>['WebPage','CollectionPage'].includes(n['@type']));assert(pg,route+': page schema');
    assert.equal(pg.url,PMH+route);assert.equal(pg.name,meta(p.pmh,'og:title'));assert.equal(pg.description,meta(p.pmh,'description'));
    assert.equal(pg.isPartOf.url,PMH+'/');assert.equal(pg.isPartOf.name,'Pensacola Military Housing');
    if(route!=='/schools'){
      const school=ps.find(n=>n['@type']==='School'),original=gs.find(n=>n['@type']==='School');
      assert(school&&original,route+': school schema');assert.deepEqual(normalizeSchool(school),original,route+': academic identity changed');
      assert(!school.aggregateRating,route+': invented school rating');
    }
  }
});
check('Editorial, academic facts, enrollment, comparison and source sections survive the mirror intact',()=>{
  for(const route of paths){const p=pages.get(route);for(const id of ['school-summary','school-perspective','school-comparison','school-enrollment','similar-schools','school-guide-sources']){
    assert.equal(text(elementAtId(p.pmh,id)),text(elementAtId(p.gc,id)),route+': '+id);
  }}
});
check('School maps use an exact shared repository and locally served copies of the tested modules',()=>{
  assert.deepEqual(JSON.parse(read('public/school-assets/school-finder-data.json')),data);
  for(const name of ['school-finder.js','school-finder-core.js','school-address-search.js','school-driving-route.js']){
    assert.equal(read('public/school-assets/'+name),read('civilian-site/assets/'+name).replaceAll('/assets/','/school-assets/'),name+': unexpected algorithm fork');
    const script=read('public/school-assets/'+name);assert(!script.includes("'/assets/"),name+': foreign assets');
    for(const match of script.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g))assert(existsSync('public/school-assets/'+match[1].slice(2)),name+': missing module');
  }
  for(const match of hub.matchAll(/(?:href|src)="(\/school-assets\/[^"?]+)(?:\?v=([a-f0-9]+))?"/g)){
    const bytes=readFileSync('public'+match[1]);if(match[2])assert.equal(createHash('sha256').update(bytes).digest('hex').slice(0,match[2].length),match[2],match[1]+': stale cache version');
  }
  for(const name of ['leaflet.js','leaflet.css'])assert(existsSync('public/school-assets/vendor/leaflet/'+name));
});
check('Corresponding school editions cross-link once in each direction without canonicalizing away either page',()=>{
  for(const [route,p]of pages){
    const outward=anchors(p.pmh).filter(a=>a['data-school-edition']==='civilian'),inward=anchors(p.gc).filter(a=>a['data-school-edition']==='military');
    assert.equal(outward.length,1,route);assert.equal(inward.length,1,route);assert.equal(outward[0].href,GC+route);assert.equal(inward[0].href,PMH+route);
    assert(!/nofollow/.test(outward[0].rel||''));assert(!/nofollow/.test(inward[0].rel||''));
  }
});
check('Every guide is discoverable in static HTML, the PMH sitemap and PMH AI discovery text',()=>{
  const directory=elementAtId(hub,'all-school-guides'),links=anchors(directory).filter(a=>a.href?.startsWith('/schools/'));
  assert.deepEqual(links.map(a=>a.href).sort(),[...paths].sort());
  const sitemap=read('public/sitemap.xml'),llms=read('public/llms.txt');
  for(const route of routes){assert(sitemap.includes('<loc>'+PMH+route+'</loc>'),route);assert(llms.includes(PMH+route),route);}
  for(const [route,p]of pages)for(const a of anchors(p.pmh).filter(a=>a.href?.startsWith('/schools'))){
    const url=new URL(a.href,PMH);assert(existsSync('public'+url.pathname+'.html'),route+': missing '+a.href);
    if(url.hash){const target=read('public'+url.pathname+'.html');assert(target.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),route+': missing fragment '+a.href);}
  }
});
check('The map precedes letter-grade and private cards, which precede both long directories',()=>{
  const ids=['school-finder','elementary','middle','high','combination-k-8','charter-schools','private-schools','christian-schools','magnet-schools','private-school-resources','all-school-guides'];
  let previous=-1;for(const id of ids){const position=hub.indexOf('id="'+id+'"');assert(position>previous,id+': wrong order');assert.equal(hub.split('id="'+id+'"').length-1,1,id+': duplicated');previous=position;}
  for(const id of ids.slice(1,9))assert(hub.includes('href="#'+id+'"'),id+': missing category jump');
  const privateSection=elementAtId(hub,'private-schools');assert(!/<span\b[^>]*(?:badge|grade)[^>]*>\s*[ABCDF]\s*<\/span>/.test(privateSection));
});
check('Native PMH inquiry form and guarded analytics are retained independently of school-address search',()=>{
  const original=read('public/first-time-military-homebuyer.html'),form=elementAtId(original,'inquiry-form');
  const nativeScripts=scripts(original).filter(s=>/G-W29GHBK38M|costin-contact\.gregg-costin\.workers\.dev/.test(s.body));assert(nativeScripts.length>=2);
  for(const [route,p]of pages){
    assert.equal(elementAtId(p.pmh,'inquiry-form'),form,route+': form contract changed');
    for(const s of nativeScripts)assert(p.pmh.includes(s.body),route+': native analytics/form behavior changed');
    assert(p.pmh.includes('_gotcha:get(\'website\')'));assert(p.pmh.includes('data-costin-sites'));
    const module=scripts(p.pmh).filter(s=>s.attrs.type==='module'&&s.attrs.src?.includes('school-finder.js'));assert.equal(module.length,route==='/schools'?1:0,route+': map loader scope');
  }
});
check('Address input remains masked, explicit-submit-only and outside history, analytics and inquiry payloads',()=>{
  const ui=read('public/school-assets/school-finder.js'),transport=read('public/school-assets/school-address-search.js');
  assert(!/localStorage|sessionStorage|history\.(pushState|replaceState)|location\.(search|hash)\s*=/.test(ui+transport));
  const input=hub.match(/<input id="sf-home-address"[^>]*>/)?.[0];assert(input?.includes('data-clarity-mask="true"'));assert(input.includes('data-private="true"'));assert(!/\bname=/.test(input));
  assert(!elementAtId(hub,'inquiry-form').includes('sf-home-address'));
  for(const key of ['data-sf-address-matches','data-sf-home-active'])assert(new RegExp('<[^>]*'+key+'[^>]*data-clarity-mask="true"').test(hub));
  assert(ui.includes("get('#sf-address-form').addEventListener('submit'"));assert(ui.includes('apply();\n  openMap();'));
  assert(!/gtag|dataLayer|fbq/.test(transport));assert(ui.includes("popup.setAttribute('data-clarity-mask','true')"));
});
check('PMH filtering keeps straight-line radius separate from road routes and never invents virtual-campus distances',()=>{
  const origin={lat:30.42205,lng:-87.299501},result=findSchools(data.schools,{origin,radius:'10'});
  assert(result.length>0);let previous=-1;
  for(const s of result){assert.equal(s.distance,milesBetween(origin,s));assert(s.distance<=10);assert(s.distance>=previous);assert(!s.virtual);previous=s.distance;}
  const privateResult=findSchools(data.schools,{type:'private'}),christianResult=findSchools(data.schools,{type:'christian'});
  assert.equal(privateResult.length,66);assert(christianResult.length>0);assert(christianResult.every(s=>s.sector==='private'&&s.christian===true));
  const all=findSchools(data.schools,{origin,radius:'all'});assert.equal(all.length,274);assert(all.filter(s=>s.virtual).every(s=>s.distance===null));
  assert(/shortest-distance route/.test(hub));assert(/exclude live traffic/.test(hub));assert(/Google Maps/.test(hub));
});

console.log(`Military school mirror: ${passed}/${passed+failed} groups passed; ${data.schools.length} source records, ${paths.length} school guides and one hub.`);
if(failed)process.exitCode=1;
