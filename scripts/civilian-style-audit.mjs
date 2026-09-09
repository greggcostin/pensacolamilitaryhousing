import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function auditStyleBundle(html,root){
  const issues=[],tag=html.match(/<(?:link|style)\b[^>]*data-costin-style-bundle="([a-f0-9]+)"[^>]*>/);
  if(!tag)return issues;
  try{
    const manifest=JSON.parse(readFileSync(join(root,'assets/styles/manifest.json'),'utf8')),entry=manifest.bundles[tag[1]];
    if(!entry||!/^assets\/styles\/[a-f0-9]+\.css$/.test(entry.path))throw Error('missing style bundle record');
    const css=readFileSync(join(root,entry.path),'utf8');if(hash(css)!==entry.sha256)throw Error('style bundle hash mismatch');
    if(tag[0].startsWith('<style')){
      const start=tag.index+tag[0].length,inline=html.slice(start,html.indexOf('</style>',start));
      if(inline!==css)throw Error('inline styles differ from verified bundle');
    }else if(!tag[0].includes(`href="/${entry.path}"`))throw Error('style bundle URL mismatch');
    for(const path of entry.sourceFiles){
      if(!/^\/assets\/[a-z0-9/-]+\.css$/.test(path)||!existsSync(join(root,path)))throw Error('missing style source '+path);
      if(hash(readFileSync(join(root,path),'utf8'))!==entry.sourceHashes?.[path])throw Error('style source changed without rebuilding bundle '+path);
    }
  }catch(error){issues.push(error.message);}
  return issues;
}
