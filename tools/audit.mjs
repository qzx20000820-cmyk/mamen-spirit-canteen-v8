import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export function listFiles(folder){return fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(x=>{const file=path.join(folder,x.name);if(x.isSymbolicLink())throw new Error('Symlinks are excluded: '+file);return x.isDirectory()?listFiles(file):[file]})}
export function auditTree(folder,{runtime=false}={}){
 const findings=[],files=[];let bytes=0;
 const manifestPath=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs/asset-manifest.json');
 const approved=JSON.parse(fs.readFileSync(manifestPath,'utf8')).assets||[];
 const photoNames=new Set(['beef-burger','chicken-burger','chicken-nuggets','fries','cola','burger-meal','snack-duo','cheese-chicken-burger','breakfast-muffin','sauced-chicken','double-beef-burger'].map(x=>'assets/photography/'+x+'.webp'));
 for(const file of listFiles(folder)){
  const rel=path.relative(folder,file).replaceAll(path.sep,'/'),data=fs.readFileSync(file);bytes+=data.length;files.push({path:rel,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
  if(/(^|\/)(\.git|node_modules|backups?|previews|audits)(\/|$)|\.log$|\.env(\.|$)/i.test(rel)&&!['.env.example'].includes(rel))findings.push({path:rel,reason:'private or development material'});
  if(/\.(png|jpe?g|gif|webp|avif|woff2?|ttf|otf)$/i.test(rel)&&!(photoNames.has(rel)&&approved.some(a=>a.path===rel&&['approved-original-imagegen-output','original-imagegen-output-a-direction'].includes(a.source)&&a.sha256===files.at(-1).sha256)))findings.push({path:rel,reason:'unreviewed raster or font file'});
  if(rel==='data/menu.json'){
   try{const menu=JSON.parse(data),items=menu.categories.flatMap(c=>c.items);
    if(!menu.meta?.source?.startsWith('Independently authored')||items.some(f=>!/^8[01]\d{3}$/.test(f.c)||!Number.isInteger(f.p)||'o'in f))findings.push({path:rel,reason:'catalog is not reviewed independently authored game data'});
   }catch{findings.push({path:rel,reason:'invalid authored catalog'})}
  }
  if(rel==='data/meals.json'){
   try{const catalog=JSON.parse(fs.readFileSync(path.join(folder,'data/menu.json'),'utf8')),ids=new Set(catalog.categories.flatMap(c=>c.items.map(f=>f.c))),sets=JSON.parse(data);
    if(Object.entries(sets).some(([id,m])=>!/^81\d{3}$/.test(id)||!ids.has(id)||!m.desc?.includes('游戏独立设计')||m.rounds.some(g=>g.choices.some(o=>!ids.has(o.code)))))findings.push({path:rel,reason:'unreviewed or foreign meal identifiers'});
   }catch{findings.push({path:rel,reason:'invalid authored meals'})}
  }
  if(data.length<1500000&&/\.(html|js|mjs|cjs|json|md|svg|toml|txt)$|^LICENSE$|_headers$/.test(rel)){
   const text=data.toString('utf8');
   const checks=[['official photograph host',/https?:\/\/(?:menu-img|img|cdn)\.mcd\.cn\/(?:pcm|gallery)\//i],['local absolute personal path',/\/(?:Users|home)\/[A-Za-z0-9_.-]+\//],['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['credential value',/(?:Bearer\s+(?!\$\{|YOUR_|EXAMPLE)[A-Za-z0-9_-]{24,}|(?:api[_-]?key|token|password|secret)\s*[=:]\s*["'][A-Za-z0-9_-]{24,}["'])/i]];
   for(const [reason,pattern]of checks)if(pattern.test(text))findings.push({path:rel,reason});
   if(runtime&&/^data\//.test(rel)&&/https?:\/\//.test(text))findings.push({path:rel,reason:'remote URL in runtime menu data'});
   if(rel.endsWith('.svg')&&(/<image\b|<script\b|(?:href|src)=["']https?:\/\//i.test(text)))findings.push({path:rel,reason:'external or executable SVG content'});
  }
 }
 return {files,bytes,findings};
}
const main=fileURLToPath(import.meta.url)===path.resolve(process.argv[1]||'');
if(main){const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const result=auditTree(path.join(root,'dist'),{runtime:true});console.log(JSON.stringify(result,null,2));if(result.findings.length)process.exit(1)}
