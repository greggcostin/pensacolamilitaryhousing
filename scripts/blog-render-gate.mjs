// Draft scoring cannot prove that a layout pass retained the reviewed content.
import {quickAnswerHtml} from './quick-answer-lib.mjs';
import {readFileSync} from 'node:fs';import {ROOT} from './blog-lib.mjs';
import {hasLinkedPhotoCredit} from './photo-credits-lib.mjs';
export function assertBlogRendered(spec,html){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 if((html.match(/data-quick-answer/g)||[]).length!==1)throw Error(spec.slug+': rendered page must contain one quick answer');
 const paragraph=h=>h.match(/<p class="qa-text">([\s\S]*?)<\/p>/)?.[1];
 if(paragraph(main)!==paragraph(quickAnswerHtml({text:spec.quickAnswer})))throw Error(spec.slug+': rendered quick answer differs from the reviewed source');
 if(!main.includes('src="'+spec.figure.src+'"'))throw Error(spec.slug+': reviewed article image was lost during layout');
 const credits=JSON.parse(readFileSync(ROOT+'content/blog/image-credits.json','utf8')).images;
 const civilian=html.includes('rel="canonical" href="https://greggcostin.com/');
 const credit=credits[(civilian?'civilian-site':'')+spec.figure.src];
 if(!credit?.license||!credit?.pageUrl||!credit?.credit)throw Error(spec.slug+': selected image attribution is absent from the ledger');
 const linkedCredit=hasLinkedPhotoCredit(html,spec.outDir||ROOT+(civilian?'civilian-site':'public'),spec.figure.src);
 if(credit.creditRequired&&(!main.includes('Photo:')||!main.includes(credit.license))&&!linkedCredit)throw Error(spec.slug+': required photo attribution is missing from the article or its linked photography credits');
 if(!/<table\b/.test(main)||!/<caption\b/.test(main))throw Error(spec.slug+': rendered worked table or caption missing');
 for(const q of spec.faq||spec.faqs||[]){const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');if(!main.includes(esc(q.q)))throw Error(spec.slug+': rendered FAQ missing: '+q.q);}
 return true;
}
