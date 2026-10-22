import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(project,'dist');
const port=Number(process.env.PORT||8030),host=process.env.HOST||'127.0.0.1';
if(!fs.existsSync(path.join(root,'index.html')))throw new Error('Run npm run build first.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
const lines=fs.readFileSync(path.join(root,'_headers'),'utf8').split('\n').filter(x=>x.startsWith('  '));
const server=http.createServer((req,res)=>{
 for(const line of lines){const at=line.indexOf(':');res.setHeader(line.slice(0,at).trim(),line.slice(at+1).trim())}
 res.setHeader('Cache-Control','no-cache');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Static preview only')}
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end('Bad request')}
 const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()||path.basename(file)==='_headers'){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
});
server.listen(port,host,()=>console.log(`Local: http://${host}:${port}/ — static V8 preview, no upload`));
