// Test-only acceptance scenarios, never loaded by the game or copied to dist/.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.MAMEN_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.MAMEN_TEST_URL||'http://127.0.0.1:8030/';
const out=path.resolve(process.env.MAMEN_TEST_OUTPUT||'.artifacts/qa');fs.mkdirSync(out,{recursive:true});
const checks=[],achievementRuns=[],errors=[],requests=[];
function ok(name,value){assert(value,name);checks.push(name);console.log('PASS',name)}
async function settle(p){await p.waitForTimeout(450)}
async function dismiss(p){for(let i=0;i<50&&await p.locator('#awardNotice.visible').count();i++){await p.locator('.unlock-continue').click();await settle(p)}}
async function openPage(browser,engine){const p=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push({engine,message:e.message}));p.on('console',m=>{if(m.type()==='error')errors.push({engine,message:m.text()})});p.on('request',r=>requests.push({engine,url:r.url(),method:r.method()}));await p.goto(base);await p.locator('[data-act="close"]').click();await settle(p);return p}
async function run(engine){const launch={headless:true};if(engine==='chromium'&&process.env.MAMEN_CHROME_PATH)launch.executablePath=process.env.MAMEN_CHROME_PATH;
 const browser=await pw[engine].launch(launch);let p=await openPage(browser,engine);
 const result=await p.evaluate(async()=>{
  const st=await import('./src/store.js'),cat=await import('./src/catalog.js'),a=await import('./src/achievements.js'),sem=await import('./src/semantics.js'),world=await import('./src/world.js');
  const results={},awards=[],got=id=>!!st.state.owned[id],remove=id=>{const key=st.state.cart.find(x=>x.food===id)?.key;if(key)st.minus(key)};
  const reset=()=>{st.trackPanel(null);st.state.cart=[];st.newRound();st.state.owned={};st.state.pendingAwards=[];st.state.pendingSeries=[];st.state.completedSeries=[];st.state.receipts={};st.state.orders=[];st.state.address='bed';st.state.mode='pickup';st.state.career={adds:0,peak:0,tier:0,discoveries:0,payments:0}};
  const scenario=(id,fn)=>{reset();fn();const b=a.badges.find(x=>x.id===id);awards.push({id,name:b.name,rarity:b.rarity,passed:got(id)});results['achievement:'+id]=got(id)};
  scenario('fries',()=>{st.add('80021',[],2);results.friesBelow=!got('fries');st.add('80021')});
  scenario('heretic',()=>{st.add('80021');st.add('80031')});
  scenario('diet',()=>{st.add('80041');st.add('80011')});
  scenario('miser',()=>{st.add('80021',[],30);st.clear()});
  scenario('cola',()=>{st.add('80052',[],3);results.colaBelow=!got('cola');st.add('80052')});
  scenario('quantum',()=>{for(let i=0;i<3;i++){st.add('80011');remove('80011')}st.add('80011')});
  scenario('custom',()=>{st.swap('中份薯条');st.swap('玉米杯');results.swapsBelow=!got('custom');st.swap('大份薯条')});
  scenario('recall',()=>{st.add('80021',[],3);for(let i=0;i<3;i++)remove('80021')});
  scenario('nobel',()=>{for(let i=0;i<4;i++){st.add('80011');remove('80011')}st.add('80011');st.clear()});
  scenario('godot',()=>{st.add('80011');for(let i=0;i<3;i++)st.checkoutInteraction();for(let i=0;i<29;i++)st.checkoutTime(2);results.godotBelow=!got('godot');st.checkoutTime(2)});
  scenario('purist',()=>st.add('80003',[],3));
  scenario('archaeologist',()=>{for(let i=0;i<4;i++)st.viewFood('80011');results.nuggetsBelow=!got('archaeologist');st.viewFood('80012')});
  scenario('traitor',()=>{for(let i=0;i<3;i++){st.add('80007');remove('80007')}});
  scenario('threebody',()=>{for(const id of ['80003','80002','80004'])st.add(id)});
  scenario('stabilizer',()=>{st.add('80054');st.add('80031')});
  scenario('copy',()=>{for(let i=0;i<4;i++)st.add('80007');results.copyBelow=!got('copy');st.add('80007')});
  scenario('collector',()=>{for(const id of ['80003','80002','80004','80001','80005'])st.add(id)});
  scenario('fishbear',()=>{st.add('80004');st.add('80003')});
  scenario('mengmu',()=>{st.selectAddress('bed');results.sameAddressIgnored=st.state.world.addressSwitches===0;st.selectAddress('galaxy');st.selectAddress('vip');results.addressBelow=!got('mengmu');st.selectAddress('bed')});
  scenario('schrodinger',()=>{for(let i=0;i<2;i++){st.add('80007');remove('80007')}});
  scenario('merit',()=>{st.add('80041');st.add('80042');results.meritBelow=!got('merit');st.add('80051')});
  scenario('united',()=>{for(const id of ['80003','80011','80021','80031','80052'])st.add(id);results.fiveRealFamilies=st.state.world.maxFamilies===5});
  scenario('menuarchaeologist',()=>{for(const c of cat.categories)st.recordCategory(c.id);results.categoryNotPurchase=st.state.stats.adds===0});
  scenario('marketCrash',()=>{const original=Date.now;let n=100000;Date.now=()=>n;st.add('80021',[],20);n+=30000;for(let i=0;i<18;i++)remove('80021');results.crashRemainder=st.total()>0&&st.state.world.crash.duration===30;Date.now=original});
  scenario('philosopher',()=>{for(let i=0;i<3;i++){st.trackPanel('detail','80003');st.trackPanel(null)}});
  scenario('emperor',()=>{for(let i=0;i<3;i++){st.trackPanel('cart');st.trackPanel(null)}});
  scenario('newton',()=>{st.add('80007');for(let i=0;i<3;i++)st.add('80007');for(let i=0;i<3;i++)remove('80007');results.newtonNonzero=st.state.cart[0].quantity===1&&!got('schrodinger')});
  scenario('seaking',()=>{for(const id of ['80003','80002','80007'])st.add(id);remove('80003');results.seakingBelow=!got('seaking');remove('80002')});
  scenario('ipo',()=>{for(let i=0;i<4;i++){st.add('80041');st.pay();st.newRound()}results.ipoBelow=!got('ipo');st.add('80041');st.pay();const n=st.state.career.payments;st.pay();results.noDuplicatePay=st.state.career.payments===n});
  scenario('romanceFraud',()=>{for(let i=0;i<3;i++){st.add('80007');remove('80007')}results.romanceOrdered=st.state.world.trace.filter(x=>x.plot==='romance:80007').map(x=>x.text).join('|')===world.romanceLines.join('|')});
  scenario('colaChair',()=>{for(let i=0;i<5;i++)st.add('80052');results.colaOrdered=st.state.world.trace.filter(x=>x.plot==='cola').map(x=>x.text).join('|')===world.colaLines.join('|')});
  scenario('initiate',()=>st.add('80007'));
  scenario('friesNovice',()=>st.add('80021'));
  scenario('colaRegistrar',()=>st.add('80052'));
  scenario('cornGodfather',()=>st.add('80042'));
  scenario('appleWellness',()=>st.add('80041'));
  scenario('heartIntern',()=>{st.add('80007');remove('80007')});
  results.all37Unique=awards.length===37&&new Set(awards.map(x=>x.id)).size===37&&a.badges.length===37;
  reset();st.add('80041');st.add('80042');st.add('80055');results.juiceNotWater=!got('merit');
  reset();st.add('80007');st.add('80003');results.chickenNotFish=!got('fishbear');
  reset();st.add('81001',cat.groupDefaults('81001'));st.add('80031');results.realMealFries=got('heretic');
  reset();const corn=cat.groupDefaults('81001');corn[1]=[3];st.add('81001',corn);st.add('80031');results.cornMealNotFries=!got('heretic');
  reset();results.unknownMealNotInvented=!st.add('missing-game-meal')&&Object.keys(cat.meals).length===5;
  results.namesNotSemantics=!sem.hasTag({code:'no-such-id',name:'薯条'},'fries')&&sem.families({components:[{code:'80003',name:'可乐',count:1},{code:'80002',name:'薯条',count:1}]}).length===1;
  reset();results.invalidAdd=!st.add('no-such-id')&&!st.add('80003',[],0)&&!st.add('80003',[],100)&&!st.add('81001',[]);st.add('80003',[],99);results.quantity99Cap=!st.add('80003')&&st.units()===99;
  reset();st.add('80007');st.clear();st.add('80007');st.pay();results.clearPayNotCycle=st.state.stats.emptyCycles===0;
  const oldNow=Date.now;let n=1000000;Date.now=()=>n;reset();st.add('80021',[],20);n+=60001;st.clear();results.crashTimeBoundary=!got('marketCrash');reset();st.add('80021',[],14);st.clear();results.crashAmountBoundary=!got('marketCrash');Date.now=oldNow;
  const c={event:'clear',components:[],stats:{adds:5,removes:3,flips:4},total:0,units:0,before:29999};results.miser300Boundary=!a.discover(c,{}).some(x=>x.id==='miser')&&a.discover({...c,before:30000},{}).some(x=>x.id==='miser');results.duplicateAwards=a.discover({...c,before:30000},{miser:1,nobel:1}).length===0;
  reset();st.add('80021');const ids=Object.keys(st.state.owned);st.add('80021');results.alreadyOwnedNotRequeued=ids.every(id=>st.state.pendingAwards.filter(x=>x===id).length===1);
  reset();st.state.owned=Object.fromEntries(a.badges.map((b,i)=>[b.id,1700000000000+i]));st.state.owned.legacy_unknown=12345;st.state.pendingAwards=[];st.enter();
  return {results,awards,contract:a.badges.map(x=>({id:x.id,name:x.name,rarity:x.rarity,rule:x.rule,when:String(x.when)}))};
 });
 for(const [k,v]of Object.entries(result.results))ok(engine+': '+k,v);achievementRuns.push({engine,achievements:result.awards});
 const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'game-contract.json')));ok(engine+': achievement IDs/rules/rarities/effective names unchanged',JSON.stringify(contract)===JSON.stringify(result.contract));
 await p.reload();ok(engine+': all37 and old unknown records survive refresh',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('mamen.codex.v1'));return Object.keys(s.owned).length===38&&s.owned.fries===1700000000000&&s.owned.legacy_unknown===12345}));
 await p.locator('[data-tab="achievements"]').click();ok(engine+': all37 collection tiles',await p.locator('.badge-tile.unlocked').count()===37);
 for(const grade of ['C','B','A','S','SR','SSR']){await p.locator(`[data-act="rarityFilter"][data-rarity="${grade}"]`).click();ok(engine+': filter '+grade,await p.locator('.badge-tile').count()===contract.filter(x=>x.rarity===grade).length)}
 await p.close();p=await openPage(browser,engine);
 // A completely fresh browser storage proves hidden collection output.
 await p.locator('[data-tab="achievements"]').click();ok(engine+': locked names not shown',await p.locator('.badge-tile.locked b').evaluateAll(xs=>xs.length===37&&xs.every(x=>['未知成就','？？？'].includes(x.textContent))));
 await p.locator('.badge-tile.locked').first().click();ok(engine+': locked detail hides exact rules',await p.locator('.rule-note').count()===0);await p.locator('[data-act="close"]').click();await settle(p);
 await p.locator('[data-tab="menu"]').click();await p.screenshot({path:path.join(out,engine+'-menu.png')});
 const imageResults=await p.evaluate(async()=>{const cat=await import('./src/catalog.js');const paths=[...new Set([...cat.foods.values()].map(x=>x.image).concat(Object.values(cat.meals).flatMap(m=>[m.image,...m.groups.flatMap(g=>g.options.map(o=>o.image))])))].filter(Boolean);let failed=[];for(const src of paths){try{const img=new Image;img.src=src;await img.decode()}catch{failed.push(src)}}return{paths:paths.length,failed}});
 ok(engine+': every referenced photograph decodes',imageResults.paths>0&&imageResults.failed.length===0);
 const cats=await p.locator('[data-act="category"]').evaluateAll(xs=>xs.map(x=>x.dataset.category));for(const id of cats){await p.locator(`[data-category="${id}"]`).click();ok(engine+': category '+id,await p.locator('.food-panel').count()>0)}await dismiss(p);
 await p.locator('#foodSearch').fill('自在汉堡套餐');ok(engine+': generic name search',await p.locator('[data-food="81001"]').count()===1);
 await p.locator('[data-food="81001"] [data-act="detail"]').first().click();ok(engine+': meal original default game price',await p.locator('.detail-footer b').textContent()==='¥31');
 await p.locator('[data-act="choice"][data-group="1"][data-option="2"]').click();ok(engine+': meal upgrade price unchanged',await p.locator('.detail-footer b').textContent()==='¥34');await p.screenshot({path:path.join(out,engine+'-meal.png')});
 await p.locator('[data-act="detailAdd"]').click();await settle(p);await dismiss(p);await p.locator('[data-act="checkout"]').click();ok(engine+': checkout selected meal composition',await p.locator('.checkout-panel').textContent().then(x=>x.includes('大份薯条')));
 await p.locator('[data-act="payment"]').click();ok(engine+': no real debit or delivery notice',await p.locator('.payment-note').textContent().then(x=>x.includes('¥0.00')&&x.includes('不会扣款')));
 await p.locator('[data-act="payNow"]').click();await p.waitForTimeout(9200);ok(engine+': pickup order reaches completion',await p.locator('#orderStatus').textContent()==='已取餐');
 await p.locator('[data-act="report"]').click();await p.locator('[data-act="shareReport"]').click();const src=await p.locator('#shareResult img').getAttribute('src');ok(engine+': report PNG and fallback',src.startsWith('data:image/png')&&(await p.locator('#shareResult').textContent()).includes('长按'));
 fs.writeFileSync(path.join(out,engine+'-report.png'),Buffer.from(src.split(',')[1],'base64'));await p.screenshot({path:path.join(out,engine+'-report-screen.png')});
 await p.locator('[data-act="close"]').click();await settle(p);await p.locator('[data-act="backMenu"]').click();
 await p.locator('[data-act="addresses"]').click();await p.locator('[data-act="newAddress"]').click();await p.locator('[name="title"]').fill('月球测试便利店');await p.locator('[name="detail"]').fill('环形山右转');await p.locator('[name="nickname"]').fill('测试玩家');await p.locator('button[type="submit"]').click();await settle(p);
 ok(engine+': imaginary address saved locally',await p.locator('.address-card').textContent().catch(()=>p.locator('.address-card').allTextContents()).then(x=>String(x).includes('月球测试便利店')));
 await p.locator('[data-act="selectAddress"]').last().click();await settle(p);await p.reload();ok(engine+': chosen address survives refresh',await p.locator('.place-row').textContent().then(x=>x.includes('月球测试便利店')));
 await p.locator('[data-act="addresses"]').click();await p.locator('[data-act="editAddress"]').click();await p.locator('[name="detail"]').fill('环形山左转');await p.locator('button[type="submit"]').click();await settle(p);ok(engine+': address edited',await p.locator('.address-card').last().textContent().then(x=>x.includes('左转')));await p.locator('[data-act="close"]').first().click();await settle(p);
 await p.locator('#foodSearch').fill('香脆鸡块');await p.locator('[data-food="80011"] [data-act="add"]').click();await dismiss(p);await p.locator('[data-act="checkout"]').click();await p.locator('[data-act="payment"]').click();await p.locator('[data-act="payNow"]').click();await p.waitForTimeout(9200);ok(engine+': delivery order reaches completion',await p.locator('#orderStatus').textContent()==='已签收');
 await p.locator('[data-act="backMenu"]').click();await p.locator('[data-act="addresses"]').click();await p.locator('[data-act="editAddress"]').click();await p.locator('[data-act="deleteAddress"]').click();await settle(p);ok(engine+': address deletion and safe fallback',await p.locator('.address-card').count()===3);await p.locator('[data-act="close"]').first().click();await settle(p);
 // Separate queued events and persisted unread awards.
 await p.evaluate(async()=>{const s=await import('./src/store.js');s.state.cart=[];s.newRound();s.state.owned={};s.state.pendingAwards=[];s.state.completedSeries=[];s.state.pendingSeries=[];s.add('80021');s.add('80031');s.add('80041')});await settle(p);await p.reload();await settle(p);ok(engine+': unread award popup survives reload',await p.locator('#awardNotice.visible').count()===1);await dismiss(p);ok(engine+': queue drains all pending awards',await p.evaluate(async()=>{const s=await import('./src/store.js');return s.state.pendingAwards.length===0&&s.state.pendingSeries.length===0}));await p.reload();ok(engine+': acknowledged awards do not repeat',await p.locator('#awardNotice.visible').count()===0);
 for(const size of [{width:320,height:568},{width:375,height:667},{width:393,height:852}]){await p.setViewportSize(size);await p.evaluate(async()=>{const f=await import('./src/feedback.js'),a=await import('./src/achievements.js');f.notifyAwards([a.badges.find(x=>x.id==='nobel')],()=>{})});await settle(p);ok(engine+': popup fits '+size.width,await p.locator('#awardNotice section').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}));ok(engine+': mobile no horizontal overflow '+size.width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(out,engine+'-award-'+size.width+'.png')});await dismiss(p)}
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(async()=>{const f=await import('./src/feedback.js'),a=await import('./src/achievements.js');f.notifyAwards(a.badges.slice(0,4),()=>{})});await settle(p);ok(engine+': multiple same-event awards retained',await p.locator('#awardNotice').getAttribute('data-awards').then(x=>x.split(',').length===4));await dismiss(p);
 await browser.close();
}
(async()=>{for(const e of (process.env.MAMEN_TEST_ENGINES||'chromium,webkit').split(','))await run(e);ok('No script/CSP/resource console errors',errors.length===0);ok('All network requests are same-origin GETs',requests.every(r=>r.method==='GET'&&(r.url.startsWith(new URL(base).origin+'/')||r.url.startsWith('data:')||r.url.startsWith('blob:'))));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'Desktop automated Chromium and WebKit mobile viewports; not physical iPhone/Android/WeChat',passed:checks.length,achievementRuns,checks,errors,requests},null,2));console.log(JSON.stringify({passed:checks.length,engines:achievementRuns.map(x=>x.engine),achievementsEach:37}));})().catch(e=>{fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks,errors},null,2));console.error(e);process.exit(1)});
