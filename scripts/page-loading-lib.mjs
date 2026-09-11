// Keep the search stylesheet and its theme rules together at first paint.
export function preparePageLoading(html,{hasAsset=()=>false}={}){
 const details={searchStylesMoved:false,remoteFontsRemoved:false,duplicateFontHints:0,preloads:[]};
 const body=html.indexOf('<body');
 if(body<0||!html.includes('</head>'))return {html,details};
 const tail=html.slice(body);
 // The footer search CSS also styles the visible navigation button. Its late
 // arrival hides the phone label and can rewrap the entire navigation.
 const search=tail.match(/<link\b[^>]*href="\/pagefind\/pagefind-ui\.css"[^>]*>\s*<style(?:\s[^>]*)?>\s*\.banner-search\{[\s\S]*?<\/style>/);
 if(search){html=html.slice(0,body)+tail.replace(search[0],'');html=html.replace('</head>',search[0]+'\n</head>');details.searchStylesMoved=true;}
 const localFonts=html.includes('data-costin-fonts')&&['/fonts/inter-latin-variable.woff2','/fonts/playfair-latin-variable.woff2'].every(hasAsset);
 if(localFonts){
  const old=html;
  const redundant=tag=>{
   const href=tag.match(/\bhref="([^"]+)"/)?.[1];
   if(!href?.startsWith('https://fonts.googleapis.com/'))return false;
   const families=new URL(href.replaceAll('&amp;','&')).searchParams.getAll('family').flatMap(f=>f.split('|')).map(f=>f.split(':')[0]);
   return families.length>0&&families.every(f=>['Inter','Playfair Display'].includes(f));
  };
  html=html.replace(/<noscript>\s*(<link\b[^>]*>)\s*<\/noscript>\s*/g,(whole,tag)=>redundant(tag)?'':whole)
   .replace(/<link\b[^>]*>\s*/g,tag=>redundant(tag)?'':tag);
  if(!/href="https:\/\/fonts\.googleapis\.com\//.test(html))html=html.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com\/?"[^>]*>\s*/g,'');
  details.remoteFontsRemoved=html!==old;
 }
 const seen=new Set(),signatures=new Set();
 html=html.replace(/<link\b[^>]*>/g,tag=>{
  if(!/\brel="preload"/.test(tag)||!/\bas="font"/.test(tag))return tag;
  const key=tag.match(/\bhref="([^"]+)"/)?.[1];if(!key)return tag;
  const signature=[key,...['type','crossorigin','media'].map(name=>tag.match(new RegExp('\\b'+name+'(?:="([^"]*)")?(?=\\s|>)'))?.[0]||'')].join('|');
  if(signatures.has(signature)){details.duplicateFontHints++;return '';}
  signatures.add(signature);
  seen.add(key);return tag;
 });
 const hints=[];
 if(localFonts)for(const font of ['/fonts/inter-latin-variable.woff2','/fonts/playfair-latin-variable.woff2'])if(!seen.has(font)){hints.push(`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin data-costin-loading="font">`);details.preloads.push(font);}
 // This URL is taken from the page's existing scene, never chosen separately.
 const schoolSceneEligible=/<body\b[^>]*\bpmh-school-page\b/.test(html);
 if(!schoolSceneEligible)html=html.replace(/<link\b[^>]*data-costin-loading="scene"[^>]*>\s*/g,'');
 const scene=schoolSceneEligible?html.match(/<body\b[^>]*--gc-interior-scene:url\('([^']+)'\)/)?.[1]:null;
 if(scene&&hasAsset(scene)&&!html.includes(`href="${scene}" as="image"`)){
  hints.push(`<link rel="preload" href="${scene}" as="image" fetchpriority="high" data-costin-loading="scene">`);details.preloads.push(scene);
 }
 if(hints.length){const viewport=html.match(/<meta\b[^>]*name="viewport"[^>]*>/)?.[0];if(!viewport)throw Error('Viewport must precede loading hints');html=html.replace(viewport,viewport+'\n'+hints.join('\n'));}
 return {html,details};
}
