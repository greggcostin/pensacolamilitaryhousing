// Local-only evidence intake for browser-visible benchmark/inspection exports.
// No external requests; never part of either deployed website.
import {createServer} from 'node:http';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const root='docs/seo-geo-2026-09-06/projects/08-measurement/2026-09-08';mkdirSync(root,{recursive:true});
createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex');
 if(req.method==='GET'&&req.url==='/panel'){res.setHeader('Content-Type','application/json');return res.end(readFileSync('docs/seo-geo-2026-09-06/ai-benchmark.json'));}
 if(req.method==='POST'&&req.url==='/save'){
  let raw='';for await(const c of req){raw+=c;if(raw.length>8000000){res.writeHead(413).end();return;}}
  try{const p=new URLSearchParams(raw),name=p.get('name');if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid name');const d=JSON.parse(p.get('evidence'));writeFileSync(`${root}/${name}.json`,JSON.stringify(d,null,2)+'\n');res.setHeader('Content-Type','text/html');return res.end(`<p role="status">Saved ${name}.json</p><a href="/">Save another record</a>`);}catch(e){res.writeHead(400).end(e.message);return;}
 }
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="en"><title>Local coast evidence</title><h1>Save browser evidence locally</h1><form method="post" action="/save"><label>Record name<input name="name" required></label><label>Evidence JSON<textarea name="evidence" rows="8" cols="80" required></textarea></label><button>Save evidence</button></form></html>');
}).listen(4188,'127.0.0.1',()=>console.log('Local evidence intake http://127.0.0.1:4188'));
