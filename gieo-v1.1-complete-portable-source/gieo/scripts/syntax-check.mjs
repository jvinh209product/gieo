import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let count=0;
for(const folder of ['src','scripts'])for(const name of fs.readdirSync(path.join(root,folder))){
 if(!/\.(m?js)$/.test(name))continue;
 const result=spawnSync(process.execPath,['--check',path.join(root,folder,name)],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
 count++;
}
console.log('Syntax checked '+count+' JavaScript files.');
