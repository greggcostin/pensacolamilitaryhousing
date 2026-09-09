import {IDENTITY as I} from '../src/entityData.js';
export const recordLink=`<link rel="describedby" type="application/json" href="${I.recordUrl}" data-business-record>`;
// Add a discoverable public record while preserving prose, review dates, schema and form code.
export function linkBusinessRecord(html){
 if(/<link\b[^>]*data-business-record[^>]*>/i.test(html))return html.replace(/<link\b[^>]*data-business-record[^>]*>/i,recordLink);
 if(!/<\/head>/i.test(html))throw Error('Missing head for business record link');
 return html.replace(/<\/head>/i,recordLink+'\n</head>');
}
