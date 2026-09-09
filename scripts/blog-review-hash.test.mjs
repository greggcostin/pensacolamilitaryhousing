import test from 'node:test';
import assert from 'node:assert/strict';
import {contentHash} from './blog-editorial-lib.mjs';

test('a Windows checkout preserves the review seal but an editorial change invalidates it',()=>{
 const spec={slug:'reviewed-guide',figure:{src:'/images/guide.jpg',alt:'A documented property'}};
 const body='<p>A sourced statement.</p>\n<p><a href="https://example.com/source">Source</a></p>';
 const seal=contentHash(spec,body);
 assert.equal(contentHash(spec,body.replaceAll('\n','\r\n')),seal);
 assert.notEqual(contentHash(spec,body.replace('sourced','unverified')),seal);
 assert.notEqual(contentHash(spec,body.replace('/source','/different')),seal);
 assert.notEqual(contentHash({...spec,figure:{...spec.figure,src:'/images/different.jpg'}},body),seal);
});
