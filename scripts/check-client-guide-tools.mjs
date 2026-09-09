// Behavioral acceptance: no real analytics or contact traffic is allowed.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const base=process.env.CIVILIAN_PREVIEW_URL||'http://127.0.0.1:4180';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const out='artifacts/client-library/qa';mkdirSync(out,{recursive:true});const observations=[];
const pages={'seller-net':'/resources/seller-net-proceeds','ownership-cost':'/resources/coastal-ownership-costs','florida-tax':'/resources/florida-homestead-exemption'};
try{for(const mode of ['site','standalone'])for(const [kind,path] of Object.entries(pages)){
 const context=await browser.newContext({viewport:{width:375,height:812},acceptDownloads:true});
 await context.route('**/*',r=>r.request().url().startsWith(base+'/')||r.request().url().startsWith('file:')?r.continue():r.abort());
 await context.addInitScript(()=>{window.__toolEvents=[];window.gtag=(...args)=>window.__toolEvents.push(args);});
 const pg=await context.newPage();const errors=[];pg.on('pageerror',e=>errors.push(e.message));
 const url=mode==='site'?base+path:pathToFileURL(resolve(out,'../worksheets',kind+'.html')).href;
 await pg.goto(url);const tool=pg.locator(`[data-guide-tool="${kind}"]`);await tool.locator('[data-tool-export]').waitFor();
 if(mode!=='site')assert.equal(await pg.locator('.worksheet-brands img').count(),2,'Standalone worksheet must carry both original logos');
 assert.equal(await tool.locator('[data-tool-export]').isEnabled(),true);
 assert.equal(await tool.getAttribute('data-clarity-mask'),'True');
 assert.equal(await tool.locator('[data-tool-result]').evaluate(e=>e.closest('[data-clarity-mask]')?.getAttribute('data-clarity-mask')),'True');
 const result=tool.locator('[data-tool-result]');const expected={'seller-net':'$133,900.00','ownership-cost':'$3,790.00','florida-tax':'$6,450.00'};
 assert.ok((await result.innerText()).includes(expected[kind]),mode+kind+' initial math');
 const field=tool.locator('input').first();const original=await field.inputValue();await field.fill('');await tool.locator('[data-tool-calculate]').click();
 assert.equal(await tool.locator('[data-tool-error]').isVisible(),true);assert.equal(await tool.locator('[data-tool-export]').isEnabled(),false);
 await field.fill(original);await tool.locator('[data-tool-calculate]').click();assert.ok((await result.innerText()).includes(expected[kind]));
 await field.fill(String(Number(original)+1000));assert.equal(await tool.locator('[data-tool-export]').isEnabled(),false);await tool.locator('[data-tool-reset]').click();
 const downloadPromise=pg.waitForEvent('download');await tool.locator('[data-tool-export]').click();const download=await downloadPromise;
 const csv=readFileSync(await download.path(),'utf8');assert.ok(csv.includes('Inputs are user scenarios'));assert.ok(csv.includes(kind));
 const events=await pg.evaluate(()=>[...(window.__toolEvents||[]),...(window.dataLayer||[])].filter(x=>x[0]==='event'&&x[1]==='guide_tool_use').map(x=>[...x]));
 assert.equal(events.filter(e=>e[2].action==='calculate').length,1);assert.equal(events.filter(e=>e[2].action==='download_worksheet').length,1);
 assert.ok(events.every(e=>Object.keys(e[2]).sort().join(',')==='action,tool'));
 const width=await pg.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));assert.ok(width.document<=width.viewport+1,mode+kind+' overflow');assert.deepEqual(errors,[]);
 await tool.screenshot({path:`${out}/${mode}-${kind}-mobile.png`});observations.push({mode,kind,validCalculation:true,invalidInputRejected:true,staleExportDisabled:true,csvDownloaded:true,analyticsFields:['tool','action'],width});await context.close();
}}finally{await browser.close();}
writeFileSync(out+'/worksheet-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),observations,findings:[]},null,2)+'\n');console.log('Six worksheet scenarios passed: site and standalone, mobile, math, CSV and financial-input privacy.');
