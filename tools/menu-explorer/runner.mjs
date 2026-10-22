import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {normalizeToken,unpackMenu,analyzeMenu,queryArguments,ExplorerError} from './analysis.mjs';
export const ENDPOINT='https://mcp.mcd.cn';
export async function explore({secret,storeCode,simulation,fetchImpl=globalThis.fetch,live=true}){
 const evidence={module:'mamen-local-menu-explorer',sdk:'@modelcontextprotocol/sdk@1.32.1',liveAttempt:live,startedAt:new Date().toISOString(),result:'FAILED',phase:'local-input',phases:{initialization:'NOT_STARTED',toolDiscovery:'NOT_STARTED',businessQuery:'NOT_STARTED',analysis:'NOT_STARTED'},http:[],toolAttempts:0,toolSuccesses:0,gameDataModified:false,rawResponseSaved:false};
 let client,transport,token='',analysis,failed=false;const headers={},counts={};
 const safeFetch=async(url,init={})=>{
  if(failed)throw new ExplorerError('STOPPED_AFTER_FAILURE');
  if(String(url)!==ENDPOINT&&String(url)!==ENDPOINT+'/')throw new ExplorerError('UNEXPECTED_DESTINATION');
  const method=init.method||'GET';let rpc=null;
  if(method==='POST'){try{rpc=JSON.parse(init.body)}catch{throw new ExplorerError('INVALID_SDK_REQUEST')}
   if(!['initialize','notifications/initialized','tools/list','tools/call','notifications/cancelled'].includes(rpc.method))throw new ExplorerError('RPC_NOT_ALLOWED');
   if(rpc.method==='tools/call'&&rpc.params?.name!=='query-meals')throw new ExplorerError('TOOL_NOT_ALLOWED');
   counts[rpc.method]=(counts[rpc.method]||0)+1;
   if(counts[rpc.method]>(rpc.method==='tools/list'?5:1))throw new ExplorerError('AUTOMATIC_RETRY_BLOCKED');
   if(rpc.method==='tools/call')evidence.toolAttempts++;
  }else if(method!=='GET')throw new ExplorerError('HTTP_METHOD_NOT_ALLOWED');
  const rec={method,rpc:rpc?.method||'optional-server-stream',httpStatus:null};evidence.http.push(rec);
  try{const response=await fetchImpl(url,{...init,redirect:'error',signal:AbortSignal.any([...(init.signal?[init.signal]:[]),AbortSignal.timeout(30000)])});rec.httpStatus=response.status;if(!response.ok&&!(method==='GET'&&response.status===405))failed=true;return response;}
  catch(error){failed=true;const code=error?.cause?.code;rec.networkCode=['ENOTFOUND','EAI_AGAIN','ECONNRESET','ECONNREFUSED','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','CERT_HAS_EXPIRED'].includes(code)?code:'NETWORK_OR_TIMEOUT';throw new ExplorerError(rec.networkCode)}
 };
 try{
  token=normalizeToken(secret);secret='';if(!/^\d{1,16}$/.test(storeCode))throw new ExplorerError('INVALID_LOCAL_STORE_CODE');headers.Authorization='Bearer '+token;
  evidence.bearerPrefixCount=1;
  transport=new StreamableHTTPClientTransport(new URL(ENDPOINT),{requestInit:{headers},fetch:safeFetch,reconnectionOptions:{maxRetries:0,initialReconnectionDelay:1000,maxReconnectionDelay:1000,reconnectionDelayGrowFactor:1}});
  client=new Client({name:'mamen-real-menu-explorer',version:'1.0.0'},{capabilities:{}});client.onerror=()=>{};
  evidence.phase='initialization';evidence.phases.initialization='IN_PROGRESS';await client.connect(transport,{timeout:30000});evidence.phases.initialization='COMPLETED';
  evidence.phase='toolDiscovery';evidence.phases.toolDiscovery='IN_PROGRESS';let tool,cursor;
  for(let page=0;page<5;page++){const result=await client.listTools(cursor?{cursor}:{},{timeout:20000});tool=result.tools.find(t=>t.name==='query-meals');if(tool||!result.nextCursor)break;cursor=result.nextCursor;}
  if(!tool)throw new ExplorerError('QUERY_MEALS_UNAVAILABLE');evidence.phases.toolDiscovery='COMPLETED';
  const args=queryArguments(tool.inputSchema,storeCode);evidence.phase='businessQuery';evidence.phases.businessQuery='IN_PROGRESS';
  const result=await client.callTool({name:'query-meals',arguments:args},undefined,{timeout:30000});const data=unpackMenu(result);evidence.toolSuccesses=1;evidence.phases.businessQuery='COMPLETED';
  evidence.phase='analysis';evidence.phases.analysis='IN_PROGRESS';analysis=analyzeMenu(data,simulation);evidence.phases.analysis='COMPLETED';evidence.phase='completed';evidence.result='SUCCESS';
 }catch(error){if(evidence.phases[evidence.phase]==='IN_PROGRESS')evidence.phases[evidence.phase]='FAILED';const http=evidence.http.find(r=>r.httpStatus>=400&&!(r.method==='GET'&&r.httpStatus===405));evidence.error=http?'HTTP_'+http.httpStatus:error instanceof ExplorerError?error.code:'SDK_PROTOCOL_OR_TIMEOUT';}
 finally{try{await client?.close()}catch{}headers.Authorization='';token='';secret='';evidence.finishedAt=new Date().toISOString();}
 return {evidence,analysis};
}
