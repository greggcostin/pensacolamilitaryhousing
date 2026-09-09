/* Self-reported planning completion is separate from an inquiry or consultation. */
(() => {
 for (const panel of document.querySelectorAll('[data-region-task]')) {
  const boxes=[...panel.querySelectorAll('input[type=checkbox]')],status=panel.querySelector('[data-task-status]'),button=panel.querySelector('[data-task-complete]');let counted=false;
  const update=()=>{const n=boxes.filter(b=>b.checked).length;button.disabled=n!==boxes.length;status.textContent=`${n} of ${boxes.length} planning checks completed.`;};
  boxes.forEach(b=>b.addEventListener('change',update));
  button.addEventListener('click',()=>{
   if(!boxes.every(b=>b.checked))return;
   status.textContent='Planning checklist complete. Bring your documents and remaining questions to your consultation.';
   if(!counted&&navigator.globalPrivacyControl!==true&&navigator.doNotTrack!=='1'){
    counted=true;window.gtag?.('event','task_complete',{task_id:'navarre_property_comparison',completion_method:'self_reported_checklist'});
   }
  });
  panel.querySelector('[data-task-download]').addEventListener('click',()=>{
   const rows=[['Navarre comparison checklist','Self-reported planning record'],['Prepared',new Date().toISOString().slice(0,10)],...boxes.map(b=>[b.parentElement.textContent.trim(),b.checked?'Checked by reader':'Not checked']),['Route record','Origin / work destination / authorized entrance / provider / date / departure / direction / distance / estimate / tolls / gate exclusions'],['Cost record','Address / source document / date / quoted or estimated amount / inclusions / missing items']];
   const csv=rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\r\n');
   const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='navarre-property-comparison.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   if(navigator.globalPrivacyControl!==true&&navigator.doNotTrack!=='1')window.gtag?.('event','guide_tool_use',{tool:'navarre_comparison',action:'download_checklist'});
  });update();
 }
})();
