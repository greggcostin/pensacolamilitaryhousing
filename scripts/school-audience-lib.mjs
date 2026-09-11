// Audience-specific decisions; school identities and academic results stay shared.
import {readFileSync} from 'node:fs';
export const schoolAudience = JSON.parse(readFileSync(new URL('../content/schools/audience-guidance-2026-09.json',import.meta.url),'utf8'));
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sectionAtId(html,id){
 const open=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>','i').exec(html);if(!open)throw Error('Missing section '+id);
 const re=/<(\/?)section\b[^>]*>/gi;re.lastIndex=open.index;let depth=0,m;
 while((m=re.exec(html))){depth+=m[1]?-1:1;if(!depth)return html.slice(open.index,re.lastIndex);}throw Error('Unclosed section '+id);
}
export function withSchoolAudience(html,route,site){
 const record=schoolAudience.schools.find(s=>route==='/schools/'+s.slug);if(!record)return html;
 const edition=record[site];if(!edition)throw Error('Unknown audience '+site);
 const sources=`<p class="sg-method">Planning guidance reviewed <time datetime="${schoolAudience.reviewed}">September 10, 2026</time>. Official resources: ${record.sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.label)}</a>`).join('; ')}. Confirm current enrollment with the school.</p>`;
 const perspective=`<section class="sg-section" id="school-perspective" data-school-audience="${site}"><span class="sg-eyebrow">${site==='gc'?'School and home planning':'The school side of your PCS'}</span><h2>${e(edition.heading)}</h2>${edition.perspective.map(p=>'<p>'+e(p)+'</p>').join('')}${sources}</section>`;
 const enrollment=`<section class="sg-section" id="school-enrollment" data-school-audience="${site}"><h2>${e(edition.enrollmentHeading)}</h2><ul class="sg-questions">${edition.questions.map(q=>'<li>'+e(q)+'</li>').join('')}</ul><p>${site==='gc'?'Keep the district or school response with your property comparison. The Costin Team can help organize locations and housing costs; the receiving school determines admission and placement.':'Keep the receiving-school contacts, missing records and confirmed first day with your PCS checklist. The installation liaison can help coordinate questions; the school makes the enrollment and course decisions.'}</p></section>`;
 html=html.replace(sectionAtId(html,'school-perspective'),()=>perspective).replace(sectionAtId(html,'school-enrollment'),()=>enrollment);
 html=html.replace(/(<p class="lead">)[\s\S]*?(<\/p>)/,()=>'<p class="lead">'+e(edition.lead)+'</p>');
 return html;
}
