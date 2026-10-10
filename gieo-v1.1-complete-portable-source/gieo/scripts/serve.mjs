import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function resolvePublicFile(requestURL,directory=dist){
 let pathname;
 try{pathname=decodeURIComponent(new URL(requestURL,'http://local.invalid').pathname);}catch{return {status:400,type:types['.txt'],body:'Bad request'};}
 if(pathname.includes('\0')||pathname.includes('\\'))return {status:400,type:types['.txt'],body:'Bad request'};
 const base=path.resolve(directory),candidate=path.resolve(base,'.'+pathname);
 if(candidate!==base&&!candidate.startsWith(base+path.sep))return {status:403,type:types['.txt'],body:'Forbidden'};
 let file=candidate;
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(fs.statSync(file).isFile())return {status:200,file,type:types[path.extname(file)]||'application/octet-stream'};}catch{}
 // Missing assets stay real 404s, never the homepage disguised as JavaScript.
 if(pathname.startsWith('/assets/')||path.extname(pathname))return {status:404,type:types['.txt'],body:'Not found'};
 const notFound=path.join(base,'404.html');
 return fs.existsSync(notFound)?{status:404,file:notFound,type:types['.html']}:{status:404,type:types['.txt'],body:'Not found'};
}
export function handleRequest(req,res,directory=dist){
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD','Content-Type':types['.txt']});res.end('Method not allowed');return;}
 const result=resolvePublicFile(req.url,directory);
 res.writeHead(result.status,{'Content-Type':result.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'});
 if(req.method==='HEAD'){res.end();return;}
 if(result.file){const stream=fs.createReadStream(result.file);stream.on('error',()=>res.destroy());stream.pipe(res);}else res.end(result.body);
}
function build(){const result=spawnSync(process.execPath,[path.join(root,'scripts/build.mjs')],{cwd:root,env:process.env,stdio:'inherit'});return result.status===0;}
function main(){
 const args=process.argv.slice(2),dev=args.includes('--dev');
 const value=(key,fallback)=>{const index=args.indexOf(key);return index<0?fallback:args[index+1];};
 const port=Number(value('--port',process.env.PORT||'4173')),host=value('--host','127.0.0.1');
 if(!Number.isInteger(port)||port<1||port>65535||!host){console.error('Use --port 1..65535 and a valid --host value.');process.exitCode=1;return;}
 if(dev&&!build()){process.exitCode=1;return;}
 if(!fs.existsSync(path.join(dist,'index.html'))){console.error('No built site found. Run npm run build before npm run preview.');process.exitCode=1;return;}
 const server=http.createServer((req,res)=>handleRequest(req,res));
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});
 server.listen(port,host,()=>console.log('GIEO '+(dev?'development':'preview')+' server: http://'+(host==='0.0.0.0'?'localhost':host)+':'+port));
 const watchers=[];let debounce;
 if(dev){for(const folder of ['src','public'])watchers.push(fs.watch(path.join(root,folder),{recursive:true},()=>{clearTimeout(debounce);debounce=setTimeout(()=>{if(build())console.log('Rebuilt. Refresh your browser.');},150);}));}
 const stop=()=>{clearTimeout(debounce);watchers.forEach(w=>w.close());server.close(()=>process.exit(0));};
 process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
