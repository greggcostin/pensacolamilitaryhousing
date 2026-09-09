// Windows file scanners can briefly hold an HTML file during a large generated update.
// Retry only transient file-access failures, then surface the real error.
import {writeFile} from 'node:fs/promises';
export async function writeText(file,body){
 for(let attempt=0;;attempt++){
  try{await writeFile(file,body,'utf8');return;}
  catch(error){if(attempt>=5||!['UNKNOWN','EBUSY','EPERM','EACCES'].includes(error.code))throw error;await new Promise(resolve=>setTimeout(resolve,100*(attempt+1)));}
 }
}
