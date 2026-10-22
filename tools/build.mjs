import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditTree} from './audit.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
// The output is reproducible. No V7 folder, account data, env file or logs are inputs.
if(fs.existsSync(output))fs.rmSync(output,{recursive:true});
fs.mkdirSync(output);
for(const file of ['index.html','favicon.svg'])fs.copyFileSync(path.join(root,file),path.join(output,file));
for(const dir of ['src','data','assets'])fs.cpSync(path.join(root,dir),path.join(output,dir),{recursive:true,filter:p=>!fs.lstatSync(p).isSymbolicLink()});
fs.writeFileSync(path.join(output,'_headers'),`/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()
`);
const result=auditTree(output,{runtime:true});
if(result.findings.length)throw new Error('Release audit failed: '+JSON.stringify(result.findings));
fs.mkdirSync(path.join(root,'.artifacts'),{recursive:true});
fs.writeFileSync(path.join(root,'.artifacts/build-manifest.json'),JSON.stringify(result,null,2)+'\n');
console.log(`Built ${result.files.length} static files (${result.bytes} bytes) in dist/. No upload performed.`);
