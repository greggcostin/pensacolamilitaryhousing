import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePageLoading} from './page-loading-lib.mjs';
const page=(head='',body='')=>`<!doctype html><html><head><meta name="viewport" content="width=device-width">${head}</head><body>${body}</body></html>`;
test('header search rules are available in the head with their stylesheet order intact',()=>{
 const search='<link href="/pagefind/pagefind-ui.css" rel="stylesheet"><style>.banner-search{color:gold}</style>';
 const before=page('<style>.banner-search{color:white}</style>','<nav>Search</nav>'+search+'<script>window.searchReady=true;</script>');
 const after=preparePageLoading(before).html;
 assert.ok(after.indexOf(search)<after.indexOf('</head>'));
 assert.ok(after.indexOf('color:white')<after.indexOf('color:gold'));
 assert.equal(after.slice(after.indexOf('<body')),before.slice(before.indexOf('<body')).replace(search,''));
 assert.equal(preparePageLoading(after).html,after);
});
test('local font replacement preserves unrelated Google families and their connection hints',()=>{
 const tag=family=>`<link href="https://fonts.googleapis.com/css2?family=${family}&display=swap" rel="stylesheet">`;
 const before=page('<style data-costin-fonts></style><link rel="preconnect" href="https://fonts.googleapis.com">'+tag('Inter:wght@400;700')+tag('Lora'));
 assert.equal(preparePageLoading(before).html,before,'missing font assets must leave Google fonts intact');
 const after=preparePageLoading(before,{hasAsset:()=>true}).html;
 assert.ok(!after.includes('family=Inter'));
 assert.ok(after.includes(tag('Lora')));
 assert.ok(after.includes('rel="preconnect"'));
 assert.equal(preparePageLoading(after,{hasAsset:()=>true}).html,after);
});
test('duplicate font hints collapse while media-specific hints are retained',()=>{
 const tag='<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>';
 const before=page(tag+tag+tag.replace('>',' media="(min-width:800px)">'));
 const after=preparePageLoading(before);
 assert.equal(after.details.duplicateFontHints,1);
 assert.ok(after.html.includes('media="(min-width:800px)"'));
});
test('school scene comes only from an existing military school body and a present local asset',()=>{
 const before=page().replace('<body>',`<body class="pmh-school-page" style="--gc-interior-scene:url('/scene.avif')">`);
 assert.ok(!preparePageLoading(before).html.includes('as="image"'));
 const after=preparePageLoading(before,{hasAsset:p=>p==='/scene.avif'}).html;
 assert.ok(after.indexOf('name="viewport"')<after.indexOf('as="image"'));
 assert.equal(preparePageLoading(after,{hasAsset:()=>true}).html,after);
 assert.ok(!preparePageLoading(before.replace('pmh-school-page','gc-page'),{hasAsset:()=>true}).html.includes('as="image"'));
});
