import test from 'node:test';import assert from 'node:assert/strict';
import {chartModel,chartSelection,loanChartSeries,renderChart} from '../civilian-calculator-charts.mjs';
import {loanScenario,rentalScenario} from '../mortgage-math.mjs';
import {defaultState,renderCalculatorSuite} from '../civilian-calculator-ui.mjs';
test('chart month selection uses exact amortization balances and cumulative interest',()=>{
 const loan=loanScenario(defaultState().loan,{monthly:200}),data=loanChartSeries(loan);
 assert.equal(data.balances.length,361);assert.equal(data.balances[0],315000);assert.equal(data.balances.at(-1),0);
 assert.equal(data.balances[60],loan.actual.rows[59].balance);
 assert.equal(data.interest.at(-1),loan.actual.totalInterest);
 const m=chartModel({id:'test',title:'Balance',series:[{label:'Loan',color:'#fff',values:data.balances}]});
 assert.equal(chartSelection(m,60).values[0].value,loan.actual.rows[59].balance);
 assert.equal(chartSelection(m,999).index,360);assert.equal(chartSelection(m,-10).index,0);
});
test('rental graph preserves negative cash flow and displayed occupied-year assumptions',()=>{
 const rental=defaultState().rentals.short,values=Array.from({length:101},(_,occupancy)=>rentalScenario({...rental,occupancy}).cashFlow/12);
 const m=chartModel({id:'rental-test',title:'Cash flow',axis:'occupancy',series:[{label:'Cash flow',color:'#fff',values}]});
 assert.ok(m.minY<0);assert.ok(m.maxY>0);assert.equal(chartSelection(m,60).values[0].value,rentalScenario(rental).cashFlow/12);
 assert.equal(chartSelection(m,0).label,'Paid occupancy: 0%');
});
test('cash purchases render finite zero-balance paths and accessible timeline controls',()=>{
 const data=loanChartSeries(loanScenario({...defaultState().loan,downPct:100}));
 const html=renderChart({id:'cash',title:'Cash purchase',series:[{label:'Balance',color:'#fff',values:data.balances}]});
 assert.ok(html.includes('type="range"'));assert.ok(!/NaN|Infinity/.test(html));
 assert.throws(()=>chartModel({id:'invalid',series:[{values:[0,NaN]}]}));
});
test('both quote editors have unique controls, three charts and the five-tool ribbon',()=>{
 const html=renderCalculatorSuite(),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);assert.ok(html.includes('name="compareA.price"'));assert.ok(html.includes('name="compareB.price"'));
 assert.equal((html.match(/data-cal-chart="/g)||[]).length,3);assert.equal((html.match(/role="tabpanel"/g)||[]).length,5);
 assert.ok(html.includes('B minus A'));assert.ok(html.includes('Compare your three rental plans'));
});
