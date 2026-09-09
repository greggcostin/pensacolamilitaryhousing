// Build-time consolidation, retaining exact cascade order and editable source styles.
// This changes delivery only: no stylesheet is deferred or gated on JavaScript.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {transform} from 'esbuild';
const digest=s=>createHash('sha256').update(s).digest('hex');
const manifestPath=root=>join(root,'assets/styles/manifest.json');
const load=root=>existsSync(manifestPath(root))?JSON.parse(readFileSync(manifestPath(root),'utf8')):{version:1,bundles:{}};
const styleTags=/<style\b[^>]*>[\s\S]*?<\/style>|<link\b(?=[^>]*\brel="stylesheet")[^>]*>/g;
export function unbundleCivilianStyles(html,root){
  const manifest=load(root);
  return html.replace(/<link\b[^>]*\bdata-costin-style-bundle="([a-f0-9]+)"[^>]*>|<style\b[^>]*\bdata-costin-style-bundle="([a-f0-9]+)"[^>]*>[\s\S]*?<\/style>/g,(tag,linkId,styleId)=>{
    const id=linkId||styleId;
    const entry=manifest.bundles[id];
    if(!entry||digest(readFileSync(join(root,entry.path),'utf8'))!==entry.sha256)throw Error('Missing or changed style bundle '+id);
    return entry.tokens.join('\n');
  });
}
export async function bundleCivilianStyles(html,root,{inline=false}={}){
  const source=unbundleCivilianStyles(html,root),end=source.indexOf('</head>');
  if(end<0)throw Error('Missing head');
  let head=source.slice(0,end);const tokens=head.match(styleTags)||[];
  if(!tokens.length)return {html,changed:false};
  const sourceFiles=[],chunks=[];
  for(const token of tokens){
    if(token.startsWith('<style')){
      if(/\bmedia=/.test(token))throw Error('Media-specific inline styles need explicit bundling support');
      chunks.push(token.slice(token.indexOf('>')+1,token.lastIndexOf('</style>')));
    }else{
      const href=token.match(/href="([^"]+)"/)?.[1];
      if(!href?.startsWith('/assets/')||!href.split('?')[0].endsWith('.css')||/\b(media|integrity|onload)=/.test(token))throw Error('Unsupported stylesheet '+token);
      const path=href.split('?')[0];sourceFiles.push(path);chunks.push(readFileSync(join(root,path),'utf8'));
    }
  }
  const css=chunks.join('\n');
  if(/@import\b/.test(css))throw Error('Resolve CSS imports before bundling');
  for(const m of css.matchAll(/url\(\s*['"]?([^'"\s)]+)/g))if(!/^(?:\/|https?:|data:|#)/.test(m[1]))throw Error('Relative CSS URL requires rebasing '+m[1]);
  const result=await transform(css,{loader:'css',minify:true,target:['chrome100','safari15','firefox100'],legalComments:'inline'});
  if(result.warnings.length)throw Error('CSS build warning '+result.warnings.map(w=>w.text).join('; '));
  const hash=digest(result.code),id=hash.slice(0,20),path=`assets/styles/${id}.css`;
  mkdirSync(join(root,'assets/styles'),{recursive:true});writeFileSync(join(root,path),result.code);
  const manifest=load(root);manifest.bundles[id]={path,sha256:hash,sourceFiles,sourceHashes:Object.fromEntries(sourceFiles.map(p=>[p,digest(readFileSync(join(root,p),'utf8'))])),tokens,unminifiedBytes:Buffer.byteLength(css),bytes:Buffer.byteLength(result.code)};
  writeFileSync(manifestPath(root),JSON.stringify(manifest)+'\n');
  head=head.replace(styleTags,'');
  const attributes=`data-costin-style-bundle="${id}" data-costin-style-sources="${[...new Set(sourceFiles)].join(' ')}"`;
  // Four measured entry pages receive the full CSS in HTML, with no extra blocking fetch.
  // Long-tail guides reuse the hashed cacheable bundle. Neither path depends on JavaScript.
  const link=inline?`<style ${attributes}>${result.code}</style>`:`<link rel="stylesheet" href="/${path}" ${attributes}>`;
  // Discover critical styling before the asynchronous analytics loaders.
  // Consume only the whitespace left by restored style tokens at the insertion
  // point. Otherwise each restore/build cycle adds blank lines to the HTML.
  head=head.replace(/(<meta\b[^>]*charset=[^>]*>)\s*/,(_,charset)=>charset+'\n'+link+'\n');
  if(!head.includes(link))throw Error('Missing charset insertion point');
  return {html:head+source.slice(end),changed:true,id,inline,sourceFiles,beforeBytes:Buffer.byteLength(html),afterBytes:Buffer.byteLength(head+source.slice(end)),cssBytes:Buffer.byteLength(result.code)};
}
