// Small native SVG charts. Financial values come from the shared calculation engine.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.abs(n)<.5?0:n);
const shortCash=n=>Math.abs(n)>=1e6?'$'+(n/1e6).toFixed(1)+'m':Math.abs(n)>=1000?'$'+Math.round(n/1000)+'k':cash(n);
const W=720,H=270,L=72,R=24,T=22,B=36;
export function chartModel({id,title,series,details=[],axis='month',selected=60}) {
 if(!/^[a-z][a-z0-9-]*$/.test(id)||!series.length)throw Error('Chart identity and series are required.');
 const max=series[0].values.length-1;
 if(max<1||max>480)throw Error('Chart needs a bounded timeline.');
 for(const s of [...series,...details])if(s.values.length!==max+1||s.values.some(v=>!Number.isFinite(v)))throw Error('Chart values must be finite and share one timeline.');
 const values=series.flatMap(s=>s.values),minY=Math.min(0,...values),maxY=Math.max(1,...values);
 return {id,title,series,details,axis,max,minY,maxY,selected:Math.max(0,Math.min(max,Math.round(selected)))};
}
const point=(m,i,value)=>({x:L+i/m.max*(W-L-R),y:T+(m.maxY-value)/(m.maxY-m.minY)*(H-T-B)});
export function chartSelection(m,index){const i=Math.max(0,Math.min(m.max,Math.round(Number(index)||0)));return {index:i,label:m.axis==='occupancy'?`Paid occupancy: ${i}%`:i===0?'Loan start':`Month ${i} · ${Math.floor(i/12)} years${i%12?`, ${i%12} months`:''}`,values:[...m.series,...m.details].map(s=>({label:s.label,value:s.values[i]}))};}
function readout(m,index){const s=chartSelection(m,index);return `<div class="cal-chart-period">${s.label}</div><div class="cal-chart-values">${s.values.map((v,i)=>`<div><span><i style="background:${m.series[i]?.color||'#b6c3d3'}"></i>${esc(v.label)}</span><strong>${cash(v.value)}</strong></div>`).join('')}</div>`;}
function markers(m,index){const {x}=point(m,index,0),labels=[];return `<line x1="${x}" x2="${x}" y1="${T}" y2="${H-B}" stroke="#d9bf7e" stroke-dasharray="4 4" opacity=".75"/>`+m.series.map(s=>{
 const p=point(m,index,s.values[index]),tx=x>W-155?x-122:x+13;let ty=Math.max(T+15,Math.min(H-B-4,p.y-9));
 if(labels.some(y=>Math.abs(y-ty)<23))ty=Math.max(T+15,Math.min(H-B-4,ty+(ty<H/2?26:-26)));labels.push(ty);
 return `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${s.color}" stroke="#fff" stroke-width="1.5"/><rect x="${tx-5}" y="${ty-16}" width="112" height="23" rx="4" fill="#0d1725" stroke="${s.color}"/><text x="${tx}" y="${ty}" class="cal-curve-value" fill="${s.color}">${cash(s.values[index])}</text>`;
 }).join('');}
export function renderChart(spec){
 const m=chartModel(spec),selected=m.selected;
 const yTicks=Array.from({length:5},(_,i)=>m.minY+(m.maxY-m.minY)*i/4);
 const xTicks=Array.from({length:7},(_,i)=>Math.round(m.max*i/6));
 const grid=yTicks.map(v=>{const p=point(m,0,v);return `<line x1="${L}" x2="${W-R}" y1="${p.y}" y2="${p.y}" stroke="#40516a" stroke-dasharray="3 5"/><text x="${L-12}" y="${p.y+5}" text-anchor="end" class="cal-axis-label">${shortCash(v)}</text>`;}).join('');
 const ticks=xTicks.map((n,i)=>`<text x="${point(m,n,0).x}" y="${H-10}" text-anchor="middle" class="cal-axis-label${i%2?' cal-axis-secondary':''}">${m.axis==='occupancy'?n+'%':Number((n/12).toFixed(1))+'y'}</text>`).join('');
 const curves=m.series.map(s=>{const path=s.values.map((v,i)=>{const p=point(m,i,v);return `${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="3" vector-effect="non-scaling-stroke"/>`;}).join('');
 const zero=m.minY<0?`<line x1="${L}" x2="${W-R}" y1="${point(m,0,0).y}" y2="${point(m,0,0).y}" stroke="#cad2da" stroke-width="1.5"/>`:'';
 const label=m.axis==='occupancy'?'Inspect paid occupancy':'Inspect '+m.title.toLowerCase()+' month';
 return `<section class="cal-explorer" data-cal-chart="${m.id}" data-chart-model="${esc(JSON.stringify(m))}" aria-labelledby="chart-title-${m.id}"><div class="cal-chart-heading"><h3 id="chart-title-${m.id}">${esc(m.title)}</h3><span>Move across the chart or use the slider</span></div><div class="cal-chart-readout" aria-live="off">${readout(m,selected)}</div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.title)}. ${m.series.map(s=>esc(s.label)).join(' compared with ')}. Exact values are available with the slider below.">${grid}${ticks}${zero}${curves}<g data-chart-markers>${markers(m,selected)}</g><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}" fill="transparent" data-chart-surface/></svg><div class="cal-chart-slider"><label for="chart-range-${m.id}">${esc(label)}</label><input id="chart-range-${m.id}" type="range" min="0" max="${m.max}" step="1" value="${selected}" aria-valuetext="${esc(chartSelection(m,selected).label)}"><output for="chart-range-${m.id}">${esc(chartSelection(m,selected).label)}</output></div></section>`;
}
export function bindCharts(root){
 for(const element of root.querySelectorAll('[data-cal-chart]')){
  if(element.dataset.chartBound)continue;element.dataset.chartBound='true';
  const m=JSON.parse(element.dataset.chartModel),svg=element.querySelector('svg'),slider=element.querySelector('input[type=range]');
  let frame=0,pending=m.selected;
  const update=index=>{const choice=chartSelection(m,index);slider.value=String(choice.index);slider.setAttribute('aria-valuetext',choice.label+'; '+choice.values.map(v=>v.label+' '+cash(v.value)).join('; '));element.querySelector('[data-chart-markers]').innerHTML=markers(m,choice.index);element.querySelector('.cal-chart-readout').innerHTML=readout(m,choice.index);element.querySelector('output').textContent=choice.label;};
  const fromPointer=e=>{const rect=svg.getBoundingClientRect();pending=Math.round(((e.clientX-rect.left)/rect.width*W-L)/(W-L-R)*m.max);if(!frame)frame=requestAnimationFrame(()=>{frame=0;update(pending);});};
  svg.addEventListener('pointermove',fromPointer);svg.addEventListener('pointerdown',fromPointer);
  slider.addEventListener('input',()=>update(slider.value));update(m.selected);
 }
}
export function loanChartSeries(loan){
 const balances=[loan.principal],interest=[0];let paid=0;
 for(let i=0;i<loan.months;i++){const r=loan.actual.rows[i];paid+=r?.interest||0;balances.push(r?.balance||0);interest.push(paid);}
 return {balances,interest};
}
