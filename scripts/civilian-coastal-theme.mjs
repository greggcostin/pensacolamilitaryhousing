// One versioned stylesheet and a body marker; never rewrite content or schema.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {transform} from 'esbuild';
export const COASTAL_THEME='coastal-2026-09';
const file='civilian-coastal-theme.css';
const source=()=>readFileSync(new URL('./'+file,import.meta.url),'utf8');
export const coastalVersion=()=>createHash('sha256').update(source()).digest('hex').slice(0,12);
export async function installCivilianCoastalTheme(root){
 const result=await transform(source(),{loader:'css',minify:true,target:['chrome100','safari15','firefox100'],legalComments:'none'});
 if(result.warnings.length)throw Error(result.warnings.map(w=>w.text).join('; '));
 mkdirSync(join(root,'assets'),{recursive:true});writeFileSync(join(root,'assets',file),result.code);
 return {path:'/assets/'+file,bytes:Buffer.byteLength(result.code),version:coastalVersion()};
}
export function withoutCoastalThemeLink(html){return html.replace(/<link\b[^>]*\bdata-gc-coastal-theme[^>]*>\s*/g,'');}
export function withCivilianCoastalTheme(html){
 html=withoutCoastalThemeLink(html);
 if(!html.includes('</head>')||!/<body\b/i.test(html))throw Error('Complete HTML document required for coastal theme');
 const path=html.match(/rel="canonical" href="https:\/\/greggcostin\.com([^"?]*)"/)?.[1]||'/404';
 const family=path==='/404'?'error':path.startsWith('/blog/')?'article':path.startsWith('/schools/')?'school':path.startsWith('/neighborhoods/')?'area':path.startsWith('/resources/')?'guide':({'/':'home','/blog':'directory','/neighborhoods':'directory','/schools':'school-finder','/resources':'library','/gulf-shores-orange-beach':'area','/mortgage-calculators':'calculator'})[path]||path.slice(1);
 html=html.replace(/<body\b([^>]*)>/i,(tag,attrs)=>{
  attrs=attrs.replace(/\sdata-gc-(?:theme|coastal-family)="[^"]*"/g,'');
  const classes=['gc-coastal',...(family==='error'?['gc-coastal--error']:[])];
  if(/\bclass="/.test(attrs))attrs=attrs.replace(/class="([^"]*)"/,(_,value)=>`class="${[...new Set([...value.split(/\s+/).filter(Boolean),...classes])].join(' ')}"`);
  else attrs+=` class="${classes.join(' ')}"`;
  return `<body${attrs} data-gc-theme="${COASTAL_THEME}" data-gc-coastal-family="${family}">`;
 });
 return html.replace('</head>',`<link rel="stylesheet" href="/assets/${file}?v=${coastalVersion()}" data-gc-coastal-theme>\n</head>`);
}
