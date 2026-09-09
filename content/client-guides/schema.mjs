export const EDITION = '2026-09-06';
export const p = text => ({type:'paragraph',text});
export const note = (title,text) => ({type:'note',title,text});
export const list = (title,items) => ({type:'list',title,items});
export const table = (title,columns,rows,caption='') => ({type:'table',title,columns,rows,caption});
export const worksheet = (title,fields) => ({type:'worksheet',title,fields});
export const page = (title,deck,blocks,sources=[]) => ({title,deck,blocks,sources});
export const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const payment = (principal,annual,months=360) => {const r=annual/1200;return r ? principal*r/(1-(1+r)**(-months)) : principal/months;};
