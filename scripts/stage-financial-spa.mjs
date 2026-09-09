// Overlay only the six current React shells and their new immutable build assets.
import {readFileSync,writeFileSync,readdirSync,existsSync,cpSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';import {createHash} from 'node:crypto';
import {PCS_DECISIONS} from '../src/coastIntentData.js';
const path='docs/seo-geo-2026-09-06/projects/03-accuracy/financial/candidate-manifest.json',manifest=JSON.parse(readFileSync(path,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const home=readFileSync('dist/index.html','utf8');if(!PCS_DECISIONS.cards.every(c=>home.includes(c.title))||!home.includes('data-pagefind-body'))throw Error('Current built homepage does not contain the approved answers.');
const changes=new Map(manifest.changes.map(c=>[c.site+':'+c.path,c]));
const add=(p,reason)=>{const bytes=readFileSync(join('dist',p)),oldPath=join(manifest.baseline,'pmh',p),old=existsSync(oldPath)?readFileSync(oldPath):null;mkdirSync(dirname(join(manifest.candidate,'pmh',p)),{recursive:true});writeFileSync(join(manifest.candidate,'pmh',p),bytes);changes.set('pmh:'+p,{site:'pmh',path:p,reasons:[reason],oldSha256:old?hash(old):null,sha256:hash(bytes)});};
for(const p of ['index.html','about.html','contact.html','pcs-guide.html','mortgage-calculators.html','communities.html'])add(p,'Restore current six-route React content, shared HTML answers and search coverage');
for(const p of readdirSync('dist/assets').filter(p=>/^index-[\w-]+\.(?:js|css)$/.test(p)))add('assets/'+p,'Current Vite build asset for the six React routes');
manifest.changes=[...changes.values()];manifest.spaRestored={builtAt:new Date().toISOString(),routes:6,homepageAnswers:5};writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest.spaRestored));
