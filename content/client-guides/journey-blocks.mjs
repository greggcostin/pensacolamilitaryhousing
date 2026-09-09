// Explicit information formats. A table's shape never determines its meaning.
export const flow=(title,steps,caption='')=>({type:'flow',title,steps:steps.map(([title,text])=>({title:title.replace(/^\d+\.\s*/,''),text})),caption});
export const handoff=(title,roles,outcome)=>({type:'handoff',title,roles:roles.map(([title,text])=>({title,text})),outcome});
export const decision=(title,question,yes,no,then)=>({type:'decision',title,question,yes,no,then});
export const diagram=(title,kind,labels,caption='')=>({type:'diagram',title,kind,labels:labels.map(([title,text])=>({title,text})),caption});
export const waterfall=(title,rows,caption)=>({type:'waterfall',title,rows,caption});
export const routes=(title,paths,caption='')=>({type:'routes',title,paths:paths.map(([name,...steps])=>({name,steps})),caption});
// Rendered-value coverage is deliberately independent of presentation.
export function visualStrings(b){
 const values=[b.title,b.caption,b.question,b.yes,b.no,b.then,b.outcome];
 for(const a of [b.steps,b.roles,b.labels])for(const v of a||[])values.push(v.title,v.text);
 for(const path of b.paths||[])values.push(path.name,...path.steps);
 if(b.type==='waterfall')for(const row of b.rows)values.push(...row.map(String));
 return values.filter(v=>v!==undefined&&v!=='');
}
