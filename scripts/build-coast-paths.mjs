// Keep important decision paths in ordinary HTML and identical in the React home view.
import { readFileSync, writeFileSync } from 'node:fs';
import { PCS_HERO, PCS_DECISIONS, CIVILIAN_BUY_DECISIONS, CIVILIAN_SELL_DECISIONS } from '../src/coastIntentData.js';
const check = process.argv.includes('--check');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function decisionHtml(data, military = false) {
  const color=military?'#E8E9EB':'#23343B', link=military?'#D4B768':'#145A63';
  return `<section id="${data.id}" class="coast-decision-paths" aria-labelledby="${data.id}-title" style="margin:32px auto;padding:clamp(20px,4vw,40px);max-width:1120px;box-sizing:border-box;border:1px solid ${military?'#354052':'#d7dfe1'};border-radius:16px;color:${color}"><h2 id="${data.id}-title">${esc(data.title)}</h2><p>${esc(data.intro)}</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px">${data.cards.map(c=>`<article><h3 style="font-size:20px;line-height:1.3;margin:12px 0">${esc(c.title)}</h3><p style="line-height:1.75">${esc(c.text)}</p><ul style="padding-left:20px;line-height:1.9">${c.links.map(([label,url])=>`<li><a href="${esc(url)}" style="color:${link};text-underline-offset:3px">${esc(label)}</a></li>`).join('')}</ul></article>`).join('')}</div></section>`;
}
let drift=0;
for(const [file,data,military] of [['index.html',PCS_DECISIONS,true],['civilian-site/buy.html',CIVILIAN_BUY_DECISIONS,false],['civilian-site/sell.html',CIVILIAN_SELL_DECISIONS,false]]){
  let html=readFileSync(file,'utf8'),before=html;
  const start=`<!-- COAST_PATHS:${data.id}:START -->`,end=`<!-- COAST_PATHS:${data.id}:END -->`;
  const block=start+'\n'+decisionHtml(data,military)+'\n'+end;
  if(html.includes(start)){const a=html.indexOf(start),b=html.indexOf(end,a);if(b<0)throw new Error('Unclosed marker: '+file);html=html.slice(0,a)+block+html.slice(b+end.length);}
  else {const anchor=military?'</header>':'<div class="gc-page-intro">';if(!html.includes(anchor))throw new Error('Missing placement: '+file);html=html.replace(anchor,military?anchor+'\n'+block:block+'\n'+anchor);}
  if(military){
    const rootAt=html.indexOf('<div id="root">'); const prefix=html.slice(0,rootAt);let body=html.slice(rootAt);
    body=body.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/,(_,a,b)=>a+esc(PCS_HERO.title)+'<br><em style="color:#C4A75A;font-style:italic">'+esc(PCS_HERO.emphasis)+'</em>'+b);
    body=body.replace(/(<h1\b[\s\S]*?<\/h1>\s*<p\b[^>]*>)[\s\S]*?(<\/p>)/,(_,a,b)=>a+esc(PCS_HERO.intro)+b);
    body=body.replace(/(<div id="root">[\s\S]*?<div)\b([^>]*)>/,(_,start,attrs)=>start+(attrs.includes('data-pagefind-body')?'':' data-pagefind-body')+attrs+'>');
    html=prefix+body;
    html=html.replaceAll('FL023','FL056').replaceAll('FL056 (Fort Walton Beach)','FL056 (Eglin AFB)');
  }
  if(html!==before){drift++;if(!check)writeFileSync(file,html);}
}
if(check&&drift){console.error(`Coast decision paths: ${drift} generated surfaces are stale. Run node scripts/build-coast-paths.mjs.`);process.exit(1);}
console.log(`Coast decision paths: ${drift} ${check?'stale':'updated'} surfaces.`);
