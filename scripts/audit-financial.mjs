import {auditFinancial} from './financial-audit-lib.mjs';
const i=process.argv.indexOf('--root'),root=i>=0?process.argv[i+1]:'public';const r=auditFinancial(root);console.log(JSON.stringify({root,...r},null,2));if(!r.ok)process.exitCode=1;
