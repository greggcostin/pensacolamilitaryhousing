import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {navarreUtilityIllustration as calculate} from '../public/assets/navarre-utility-core.js';
const data=JSON.parse(readFileSync('content/communities/navarre-cost-evidence.json','utf8'));
test('Class I minimum and both water tiers match independent schedule arithmetic',()=>{
 assert.equal(calculate(0,data).total,89.04);assert.equal(calculate(3000,data).total,89.04);
 assert.deepEqual(calculate(5000,data),{gallons:5000,water:54.49,sewer:60.71,total:115.2});
 assert.deepEqual(calculate(6000,data),{gallons:6000,water:61.19,sewer:67.09,total:128.28});
 assert.deepEqual(calculate(8000,data),{gallons:8000,water:75.69,sewer:79.85,total:155.54});
});
test('Unknown schedules and quantities outside the published illustration method fail visibly',()=>{
 for(const n of [-1000,Infinity,NaN,3001,100001])assert.throws(()=>calculate(n,data));
 assert.throws(()=>calculate(3000,{...data,water:{...data.water,effective:'2027-07'}}));
 assert.throws(()=>calculate(3000,{}));
});
