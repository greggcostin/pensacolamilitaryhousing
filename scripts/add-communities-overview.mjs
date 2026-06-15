// Add an "All Communities Overview" link (-> /neighborhoods) to the top of the
// Communities nav dropdown on every static page (the SPA already has it).
// Idempotent.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const ANCHOR = 'Communities ▾</button><div class="dropdown-menu"><a href="/communities/gulf-breeze">';
const REPLACE = 'Communities ▾</button><div class="dropdown-menu"><a href="/neighborhoods" style="color:#C9A84C;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.1)">All Communities Overview</a><a href="/communities/gulf-breeze">';
function walk(d,o=[]){for(const f of readdirSync(d,{withFileTypes:true})){const p=`${d}/${f.name}`;if(f.isDirectory())walk(p,o);else if(f.name.endsWith(".html"))o.push(p);}return o;}
let n=0,skip=0;
for(const p of walk("public")){
  let c=readFileSync(p,"utf8");
  if(!c.includes(ANCHOR))continue;
  if(c.includes('>All Communities Overview</a>')){skip++;continue;}
  c=c.replace(ANCHOR,REPLACE);
  writeFileSync(p,c);n++;
}
console.log(`Added "All Communities Overview" to ${n} pages (skipped ${skip}).`);
