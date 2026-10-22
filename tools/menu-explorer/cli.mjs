import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline/promises';
import {explore} from './runner.mjs';
import {normalizeToken,ExplorerError} from './analysis.mjs';
const output=new URL('../../.artifacts/menu-explorer/runs/',import.meta.url);
async function input(label,hidden=false){
 if(process.platform==='darwin')return new Promise((resolve,reject)=>{const script='text returned of (display dialog '+JSON.stringify(label)+' default answer "" '+(hidden?'with hidden answer ':'')+'buttons {"取消", "继续"} default button "继续" cancel button "取消" with title "麦门本地菜单探索器")';const p=spawn('/usr/bin/osascript',['-e',script],{stdio:['ignore','pipe','pipe']});let s='';p.stdout.setEncoding('utf8');p.stdout.on('data',v=>s+=v);p.stderr.resume();p.on('error',()=>reject(new ExplorerError('SECURE_INPUT_UNAVAILABLE')));p.on('close',n=>n===0?resolve(s.trim()):reject(new ExplorerError('INPUT_CANCELLED')))});
 if(!process.stdin.isTTY)throw new ExplorerError('SECURE_TTY_REQUIRED');
 if(!hidden){const rl=createInterface({input:process.stdin,output:process.stdout});try{return(await rl.question(label+': ')).trim()}finally{rl.close()}}
 return new Promise((resolve,reject)=>{let s='';process.stdout.write(label+'（输入不回显）: ');process.stdin.setRawMode(true);process.stdin.resume();const done=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n')};const onData=chunk=>{for(const ch of chunk.toString()){if(ch==='\u0003'){done();reject(new ExplorerError('INPUT_CANCELLED'));return}if(ch==='\r'||ch==='\n'){done();resolve(s);return}if(ch==='\u007f')s=s.slice(0,-1);else if(ch>=' ')s+=ch;}};process.stdin.on('data',onData)});
}
let run;
try{
 console.log('开发者本地只读：一次初始化、工具发现、一次query-meals。失败停止，不保存原始响应，不改H5。');
 const storeCode=String(process.env.MCD_MCP_STORE_CODE||await input('请输入官方查询所需的门店编码（仅本机使用，不记录）')).trim();
 let secret=process.env.MCD_MCP_TOKEN||await input('请粘贴你自己的MCP Token；不要输入聊天。可含Bearer前缀，内部空白将被拒绝。',true);delete process.env.MCD_MCP_TOKEN;
 secret=normalizeToken(secret);const simulation=JSON.parse(await readFile(new URL('../../data/menu.json',import.meta.url),'utf8'));
 run=await explore({secret,storeCode,simulation});secret='';
}catch(error){run={evidence:{module:'mamen-local-menu-explorer',liveAttempt:false,result:'FAILED',phase:'local-input',error:error instanceof ExplorerError?error.code:'LOCAL_PREPARATION_FAILURE',toolAttempts:0,toolSuccesses:0,rawResponseSaved:false,gameDataModified:false,finishedAt:new Date().toISOString()}}}
await mkdir(output,{recursive:true,mode:0o700});const stamp=new Date().toISOString().replace(/[:.]/g,'-');
await writeFile(new URL(stamp+'-evidence.json',output),JSON.stringify(run.evidence,null,2)+'\n',{mode:0o600});
if(run.analysis){await writeFile(new URL(stamp+'-analysis.json',output),JSON.stringify(run.analysis,null,2)+'\n',{mode:0o600});console.log('真实查询和分析成功。以下为固定类别汇总，不是官方商品列表：');for(const row of run.analysis.coverage)console.log(row.label+'：'+row.matchedSingleNames);for(const x of run.analysis.opportunities)console.log(x.theme+'：真实菜单单品名称覆盖'+(x.realMenuHasNamedSingles?'有':'未确认')+'；H5中可试 '+x.simulationFoods.join(' + '));}
else console.log('本次停止：'+run.evidence.phase+' / '+run.evidence.error+'。没有重试。');
console.log(JSON.stringify(run.evidence,null,2));console.log('脱敏记录保存在本机被忽略的.artifacts/menu-explorer/runs/；未写入原始菜单或认证信息。');
process.exitCode=run.evidence.result==='SUCCESS'?0:2;
