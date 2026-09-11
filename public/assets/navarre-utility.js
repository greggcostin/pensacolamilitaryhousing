import {navarreUtilityIllustration} from './navarre-utility-core.js';
const form=document.querySelector('[data-navarre-utility]');
if(form){
 let schedule;
 const status=form.querySelector('[role="status"]'),output=form.querySelector('output');
 const money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD'});
 const draw=()=>{try{const raw=form.querySelector('input').value;if(raw.trim()==='')throw Error('Enter the illustrative monthly usage first.');const r=navarreUtilityIllustration(Number(raw),schedule);output.textContent=`${money(r.water)} water + ${money(r.sewer)} sewer = ${money(r.total)} per month`;status.textContent='Schedule calculation only. Other charges and shared-meter accounts are excluded.';}catch(e){output.textContent='';status.textContent=e.message;}};
 form.addEventListener('submit',e=>{e.preventDefault();if(schedule)draw();});
 fetch('/data/navarre-cost-evidence.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{navarreUtilityIllustration(5000,d);schedule=d;draw();form.querySelector('button').disabled=false;}).catch(()=>{status.textContent='The calculator could not load its reviewed schedule. Use the examples and official rate sheet below.';});
}
