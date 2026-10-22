import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {auditTree,listFiles} from './audit.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
const release=path.join(root,'releases','v8-public-'+pkg.version);
// Only rebuild this disposable candidate folder, never the project or V7.
if(fs.existsSync(release))fs.rmSync(release,{recursive:true});
const source=path.join(release,'github-source'),web=path.join(release,'h5-static');
fs.mkdirSync(source,{recursive:true});
const copy=rel=>{const from=path.join(root,rel),to=path.join(source,rel);if(!fs.existsSync(from))throw new Error('Missing required release file: '+rel);fs.mkdirSync(path.dirname(to),{recursive:true});fs.cpSync(from,to,{recursive:true,filter:p=>!fs.lstatSync(p).isSymbolicLink()});};
for(const dir of ['src','data','assets','licenses','tests','submission'])copy(dir);
for(const file of ['README.md','MCP_INTEGRATION.md','CONTEST_DECLARATION.md','ASSET_SOURCES.md','workbuddy.md','LICENSE','package.json','package-lock.json','netlify.toml','mcp-config.example.json','.env.example','.gitignore','index.html','favicon.svg'])copy(file);
for(const file of ['build.mjs','preview.mjs','audit.mjs','package-release.mjs'])copy('tools/'+file);
for(const file of ['package.json','package-lock.json','cli.mjs','runner.mjs','analysis.mjs','explorer.test.mjs','THIRD_PARTY.json','SDK-LICENSE.txt'])copy('tools/menu-explorer/'+file);
for(const file of ['DEPLOYMENT.md','TEST_REPORT.md','MENU_USAGE_RISKS.md','CONTEST_READINESS.md','mcp-evidence-summary.json','menu-provenance.json','official-declaration-source.json','photo-generation-records.json','asset-manifest.json','product-image-mapping.json','product-image-mapping.csv','MCP_FINAL_CONNECTION_STATUS.md','LOCAL_MCP_IMPORT.md','final-release-checks.json','FINAL_RELEASE_RISKS.md','PUBLICATION_PREFLIGHT.md','publication-rights-audit.csv','remediation-diff.csv','MENU_EXPLORER.md','MENU_EXPLORER_STATUS.json'])copy('docs/'+file);
fs.cpSync(path.join(root,'dist'),web,{recursive:true});
const result={version:pkg.version,publicUploaded:false,githubPushed:false,issueSubmitted:false,source:auditTree(source),static:auditTree(web,{runtime:true})};
if(result.source.findings.length||result.static.findings.length)throw new Error('Release audit rejected: '+JSON.stringify([...result.source.findings,...result.static.findings]));
const mandatory=['README.md','MCP_INTEGRATION.md','CONTEST_DECLARATION.md','mcp-config.example.json'];
for(const f of mandatory)if(!fs.existsSync(path.join(source,f)))throw new Error('Mandatory contest file missing');
const expected=JSON.parse(fs.readFileSync(path.join(root,'docs/official-declaration-source.json')));
const declarationHash=createHash('sha256').update(fs.readFileSync(path.join(source,'CONTEST_DECLARATION.md'))).digest('hex');
// Source metadata schemas can differ; immutable local reference is also recorded.
result.contestDeclarationSha256=declarationHash;
if(!JSON.stringify(expected).includes(declarationHash))throw new Error('Official declaration hash mismatch');
for(const [folder,archive]of [[source,'github-source.zip'],[web,'h5-static.zip']]){
 execFileSync('/usr/bin/zip',['-q','-r',path.join(release,archive),'.'],{cwd:folder,stdio:'pipe'});
 result[archive]={bytes:fs.statSync(path.join(release,archive)).size,sha256:createHash('sha256').update(fs.readFileSync(path.join(release,archive))).digest('hex')};
}
fs.writeFileSync(path.join(release,'release-manifest.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({version:pkg.version,sourceFiles:result.source.files.length,staticFiles:result.static.files.length,sourceZipBytes:result['github-source.zip'].bytes,staticZipBytes:result['h5-static.zip'].bytes,findings:0,uploaded:false}));
