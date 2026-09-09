// Transparent, retina-ready header marks. Keep the original asset as the fallback.
import {existsSync, statSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
export const LOGO_WIDTHS=[128,256,384];
export const LOGO_NAMES=['logo-lrr','logo-08-sm'];
export async function generateHeaderLogos(root){
  const results=[];
  for(const name of LOGO_NAMES){
    const source=join(root,'images',name+'.png');
    if(!existsSync(source))throw Error('Missing original logo '+source);
    for(const width of LOGO_WIDTHS){
      const output=join(root,'images',`${name}-header-${width}.webp`);
      // Lossless preserves the fine gold lettering and the transparent background.
      await sharp(source).resize({width,withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(output);
      const m=await sharp(output).metadata();
      results.push({path:`images/${name}-header-${width}.webp`,width:m.width,height:m.height,bytes:statSync(output).size});
    }
  }
  return results;
}
export function responsiveHeaderLogos(html,root){
  return html.replace(/<picture>\s*(?:<source\b[^>]*>\s*)*(<img\b[^>]*src="\/images\/(logo-lrr|logo-08-sm)\.png"[^>]*>)\s*<\/picture>/g,(whole,img,name)=>{
    const files=LOGO_WIDTHS.map(w=>({w,path:`/images/${name}-header-${w}.webp`}));
    if(files.some(f=>!existsSync(join(root,f.path))))return whole;
    const desktop=name==='logo-lrr'?'117px':'162px';
    const mobile=name==='logo-lrr'?'64px':'89px';
    return `<picture><source type="image/webp" srcset="${files.map(f=>`${f.path} ${f.w}w`).join(', ')}" sizes="(max-width: 640px) ${mobile}, ${desktop}">${img}</picture>`;
  });
}
