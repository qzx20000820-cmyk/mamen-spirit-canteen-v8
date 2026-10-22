// Public authored-data checks; no live MCP or real business operations.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.MAMEN_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),base=process.env.MAMEN_TEST_URL||'http://127.0.0.1:8030/';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/asset-manifest.json'))),menu=JSON.parse(fs.readFileSync(path.join(root,'data/menu.json'))),meals=JSON.parse(fs.readFileSync(path.join(root,'data/meals.json')));
const foods=[...new Map(menu.categories.flatMap(c=>c.items).map(f=>[f.c,f])).values()];
const out=path.resolve(process.env.MAMEN_TEST_OUTPUT||'.artifacts/qa');fs.mkdirSync(out,{recursive:true});const checks=[];const ok=(n,v)=>{assert(v,n);checks.push(n)};
(async()=>{
 ok('31 independently authored products',foods.length===31&&foods.every(f=>/^8[01]\d{3}$/.test(f.c)));
 ok('9 game categories and5 designed meals',menu.categories.length===9&&Object.keys(meals).length===5);
 ok('no historical original-price fields',foods.every(f=>!('o'in f)&&Number.isInteger(f.p)&&f.p>0));
 ok('all meals explicitly fictional',Object.values(meals).every(m=>m.desc.includes('游戏独立设计')));
 const launch={headless:true,...(process.env.MAMEN_CHROME_PATH?{executablePath:process.env.MAMEN_CHROME_PATH}:{})};const b=await pw.chromium.launch(launch);
 try{const p=await b.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});await p.goto(base);await p.locator('[data-act="close"]').click();await p.waitForTimeout(450);
 ok('nonofficial simulation identity',await p.locator('.game-identity').innerText().then(t=>t.includes('非麦当劳官方产品')));
 ok('only simulated prices',await p.locator('.open-dot').innerText().then(t=>t.includes('模拟价格')));
 ok('no crossed-out promotion',await p.locator('del,s').count()===0);
 ok('no stale unknown meal status',!(await p.locator('body').innerText()).includes('信息未收录'));
 const failed=await p.evaluate(async xs=>{const bad=[];for(const x of xs){const i=new Image;i.src=x.path;try{await i.decode()}catch{bad.push(x.path)}}return bad},manifest.assets);ok('11 unchanged original food photos decode',manifest.assets.length===11&&failed.length===0);
 for(const [id,m]of Object.entries(meals)){await p.locator('#foodSearch').fill(foods.find(f=>f.c===id).n);await p.locator(`[data-food="${id}"] [data-act="detail"]`).first().click();await p.waitForTimeout(450);ok(id+' fictional description',await p.locator('.detail-info').innerText().then(x=>x.includes('游戏独立设计')));ok(id+' configurable options',await p.locator('.option-card').count()===m.rounds.reduce((n,g)=>n+g.choices.length,0));await p.locator('#overlay [data-act="close"]').first().click();}
 await p.locator('#foodSearch').fill('');await p.screenshot({path:path.join(out,'public-independent-home.png')});
 await p.evaluate(async()=>{const s=await import('./src/store.js');s.state.cart=[];s.state.pendingAwards=[];s.state.pendingSeries=[];s.state.owned={};s.add('80011');s.state.pendingAwards=[];s.state.pendingSeries=[];s.enter()});await p.reload();await p.locator('[data-act="checkout"]').click();ok('checkout no real payment or delivery',await p.locator('.checkout-safety').innerText().then(x=>x.includes('不扣款、不配送')));await p.locator('[data-act="payment"]').click();ok('payment zero actual debit',await p.locator('.payment-note').innerText().then(x=>x.includes('¥0.00')&&x.includes('不会扣款')));await p.locator('[data-act="payNow"]').click();await p.waitForTimeout(450);ok('game order identity',await p.locator('.order-summary').innerText().then(x=>x.includes('游戏订单')));
 await p.evaluate(()=>{const k='mamen.codex.v1';const s=JSON.parse(localStorage.getItem(k));delete s.catalogVersion;s.owned={fries:12345};s.cart=[{food:'retired-product',quantity:1,picks:[]}];s.stats.adds=42;s.world={};localStorage.setItem(k,JSON.stringify(s));localStorage.removeItem(k+'.pre-independent')});await p.reload();
 ok('legacy collection timestamp preserved',await p.evaluate(()=>JSON.parse(localStorage.getItem('mamen.codex.v1')).owned.fries===12345));
 ok('legacy save backed up locally before round reset',await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem('mamen.codex.v1.pre-independent')),b=JSON.parse(localStorage.getItem('mamen.codex.v1'));return a.stats.adds===42&&a.cart[0].food==='retired-product'&&b.cart.length===0&&b.stats.adds===0&&b.catalogVersion==='independent-v1'}));
 await p.reload();ok('migration backup is not overwritten',await p.evaluate(()=>JSON.parse(localStorage.getItem('mamen.codex.v1.pre-independent')).stats.adds===42));
 for(const url of ['/.env','/.artifacts/mcp/evidence.json','/tools/verify-mcp-once.mjs','/README.md'])ok(url+' excluded from H5',(await p.request.get(base.replace(/\/$/,'')+url)).status()===404);
 }finally{await b.close()}fs.writeFileSync(path.join(out,'public-results.json'),JSON.stringify({passed:checks.length,checks,scope:'desktop mobile viewport, not physical phone'},null,2));console.log(JSON.stringify({passed:checks.length}));
})().catch(e=>{console.error(e);process.exit(1)});
