import test from 'node:test';
import assert from 'node:assert/strict';
import {selectWork} from './blog-plan-lib.mjs';
const url=slug=>'https://greggcostin.com/blog/'+slug;
const requested=(slug,requestedOrder)=>({slug,refreshUrl:url(slug),status:'queued',requestedBy:'Gregg',requestedAt:'2026-09-12',requestedOrder});
const args={site:'gc',today:'2026-09-12',corpus:['fed','mortgage'].map(slug=>({url:url(slug),site:'gc',title:slug,targetKeywords:[]})),refreshes:[{site:'gc',slug:'routine-refresh',priority:80}],queue:[requested('mortgage',2),requested('fed',1)]};
test('owner refresh order survives generated refresh priorities without claiming demand',()=>{
 const p=selectWork(args);assert.equal(p.selected.kind,'owner-requested-refresh');assert.equal(p.selected.item.slug,'fed');assert.equal(p.selected.item.observedDemand,false);
 assert.equal(selectWork({...args,queue:args.queue.filter(q=>q.slug!=='fed')}).selected.item.slug,'mortgage');
});
test('owner requests retain source, destination, hold and completion gates',()=>{
 for(const change of [{status:'hold'},{status:'completed'},{notBefore:'2026-10-01'},{refreshUrl:url('absent')},{sourceGate:{kind:'release',periodEnd:'2026-09-11'}}]){
   const p=selectWork({...args,queue:[{...requested('fed',1),...change}]});assert.equal(p.selected.item.slug,'routine-refresh');
 }
 const event={status:'verified',primarySource:'https://example.gov/release',checkedAt:args.today,materialImpact:'documented rule change',ownerUrl:url('fed'),date:args.today};
 assert.equal(selectWork({...args,events:[event]}).selected.kind,'event');
});
