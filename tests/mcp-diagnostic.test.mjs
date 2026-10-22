import test from 'node:test';
import assert from 'node:assert/strict';
import {safeResponseInfo,readErrorInfo} from '../tools/mcp-diagnostic-info.mjs';
test('saves classifications only, no token/cookie/body',()=>{
  const h=new Headers({'Content-Type':'application/json','Set-Cookie':'SECRET_COOKIE','WWW-Authenticate':'Bearer error="invalid_token"','X-Request-Id':'trace-123'});
  const info=safeResponseInfo(h,'{"message":"invalid token","credential":"SECRET_TOKEN"}');
  assert(info.reasonSignals.includes('EXPLICIT_INVALID_TOKEN'));
  assert.equal(info.requestIds['x-request-id'],'trace-123');
  assert(!JSON.stringify(info).includes('SECRET'));
});
test('403 alone does not invent authentication or policy reasons',()=>{
  const info=safeResponseInfo(new Headers({'content-type':'text/plain'}),'Forbidden');
  assert.equal(info.explicitReasonRecognized,false);
});
test('body inspection produces safe metadata without the original body',async()=>{
  const info=await readErrorInfo(new Response('{"error":"insufficient_scope","secret":"DO_NOT_STORE"}',{status:403,headers:{'Content-Type':'application/json','X-WAF-UUID':'abc-123'}}));
  assert(info.reasonSignals.includes('EXPLICIT_INSUFFICIENT_SCOPE'));
  assert.equal(info.requestIds['x-waf-uuid'],'abc-123');
  assert(!JSON.stringify(info).includes('DO_NOT_STORE'));
});
