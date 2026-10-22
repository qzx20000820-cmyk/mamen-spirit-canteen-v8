import {foods,meals,categories,configurationPrice,components} from './catalog.js';
import {discover,badges,identityTier,identityNames,identityTexts} from './achievements.js';
import {captureReceipt,validReceipt} from './copy.js';
import {growthLines} from './rarity.js';
import {hasTag,quantity} from './semantics.js';
import {freshWorld,restoreWorld,advanceWorld} from './world.js';
const KEY='mamen.codex.v1';
const freshStats=()=>({adds:0,removes:0,cola:0,swaps:0,clears:0,peak:0,flips:0,last:'',payments:0,bigClear:0,heretic:0,diet:0,board:0,checkoutSeconds:0,checkoutInteractions:0,nuggetVisits:0,nuggetIds:[],emptyCycles:0,streak:0,streakKey:'',lastFood:'',lastActionFood:'',sameFoodFlips:0,preference:{},roundAchievements:[],roundUnlocks:[],roundFacts:{}});
export const defaultAddresses=[{id:'bed',title:'我的被窝',detail:'枕头左转第二个抱枕 · 请勿叫醒',nickname:'被窝常住居民'},{id:'galaxy',title:'银河系第三旋臂',detail:'太阳系第三颗行星 · 星舰停靠位',nickname:'地球访客'},{id:'vip',title:'精神食堂VIP包厢',detail:'想象力大厦88楼 · 靠窗座位',nickname:'干饭贵宾'}];
export const state={catalogVersion:'independent-v1',cart:[],owned:{},stats:freshStats(),addresses:[],address:'bed',mode:'pickup',orders:[],entered:false,activity:[],career:{adds:0,peak:0,tier:0,discoveries:0},pendingAwards:[],events:[],world:freshWorld(),completedSeries:[],pendingSeries:[],receipts:{}};
let listeners=[],trackedPanel=null;
export function onChange(fn){listeners.push(fn);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
export function restore(){
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||typeof s!=='object')return;
 state.cart=Array.isArray(s.cart)?s.cart.filter(l=>foods.has(l.food)&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=99&&validPicks(l.food,l.picks)):[];
 state.owned=s.owned&&typeof s.owned==='object'&&!Array.isArray(s.owned)?s.owned:{};
 state.stats=freshStats();for(const [k,v]of Object.entries(state.stats)){const value=s.stats?.[k];if(typeof v==='number')state.stats[k]=Number.isFinite(value)&&value>=0?value:0;else if(typeof v==='string')state.stats[k]=typeof value==='string'?value.slice(0,1000):'';else if(Array.isArray(v))state.stats[k]=Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'))].slice(0,120):[];}
 state.stats.last=['add','minus',''].includes(state.stats.last)?state.stats.last:'';
 if(s.stats?.preference&&typeof s.stats.preference==='object')for(const tag of ['burger','fries','ice','cola','coffee','apple','chicken','water'])if(Number.isFinite(s.stats.preference[tag])&&s.stats.preference[tag]>=0)state.stats.preference[tag]=s.stats.preference[tag];
 for(const k of Object.keys(state.career))state.career[k]=Number.isFinite(s.career?.[k])&&s.career[k]>=0?s.career[k]:0;
 state.career.adds=Math.max(state.career.adds,state.stats.adds);state.career.peak=Math.max(state.career.peak,state.stats.peak);state.career.discoveries=badges.filter(a=>state.owned[a.id]).length;state.career.tier=Math.max(Math.min(5,state.career.tier),identityTier(state.career));
 state.pendingAwards=Array.isArray(s.pendingAwards)?[...new Set(s.pendingAwards.filter(id=>badges.some(a=>a.id===id)&&state.owned[id]))]:[];
 state.events=Array.isArray(s.events)?s.events.filter(e=>e&&typeof e.event==='string'&&Number.isFinite(e.at)).slice(-120):[];
 state.addresses=Array.isArray(s.addresses)?s.addresses.filter(a=>a&&/^custom-\d+$/.test(a.id)&&typeof a.title==='string'&&typeof a.detail==='string').map(a=>({...a,title:a.title.slice(0,30),detail:a.detail.slice(0,80),nickname:String(a.nickname||'').slice(0,20)})):[];
 state.address=String(s.address||'bed');if(!addressById(state.address))state.address='bed';state.mode=s.mode==='delivery'?'delivery':'pickup';state.entered=s.entered===true;
 state.orders=Array.isArray(s.orders)?s.orders.filter(o=>o&&typeof o.id==='string'&&Number.isFinite(o.at)&&Number.isFinite(o.total)&&Array.isArray(o.cart)).slice(0,8):[];
 state.activity=Array.isArray(s.activity)?s.activity.filter(x=>typeof x==='string').slice(-8):[];
 state.world=restoreWorld(s.world);if(!s.world)state.world.everAdded=state.stats.adds>0||state.cart.length>0;
 state.career.payments=Math.max(Number(s.career?.payments)||0,state.stats.payments,new Set(state.orders.map(o=>o.id)).size);
 if(!Array.isArray(s.stats?.roundUnlocks))state.stats.roundUnlocks=[...new Set(state.events.flatMap(e=>Array.isArray(e.awards)?e.awards:[]).filter(id=>badges.some(a=>a.id===id)&&state.owned[id]))];
 const complete=growthLines.filter(l=>l.ids.every(id=>state.owned[id])).map(l=>l.id);state.completedSeries=[...new Set([...(Array.isArray(s.completedSeries)?s.completedSeries.filter(id=>growthLines.some(l=>l.id===id)):[]),...complete])];
 state.pendingSeries=Array.isArray(s.pendingSeries)?s.pendingSeries.filter(id=>complete.includes(id)):[];
 state.receipts={};for(const a of badges){const receipt=validReceipt(s.receipts?.[a.id]);if(receipt&&state.owned[a.id])state.receipts[a.id]=receipt;const fact=validReceipt(s.stats?.roundFacts?.[a.id]);if(fact)state.stats.roundFacts[a.id]=fact;}
 if(s.catalogVersion!=='independent-v1'){
 // Preserve the pre-migration save locally; never upload or encode it into source.
 try{if(!localStorage.getItem(KEY+'.pre-independent'))localStorage.setItem(KEY+'.pre-independent',JSON.stringify(s));}catch{}
 state.cart=[];state.stats=freshStats();state.world=freshWorld();
 }
 }catch{}
}
function validPicks(id,picks){const m=meals[id];if(!m)return Array.isArray(picks)&&picks.length===0;return Array.isArray(picks)&&picks.length===m.groups.length&&m.groups.every((g,i)=>Array.isArray(picks[i])&&picks[i].length===g.count&&picks[i].every(j=>Number.isInteger(j)&&j>=0&&j<g.options.length));}
export function total(){return state.cart.reduce((n,l)=>n+configurationPrice(l.food,l.picks)*l.quantity,0);}
export const units=()=>state.cart.reduce((n,l)=>n+l.quantity,0);
export const allAddresses=()=>[...defaultAddresses,...state.addresses];
export const addressById=id=>allAddresses().find(a=>a.id===id);
export const expanded=()=>state.cart.flatMap(components);
function context(event,extra){return {event,components:expanded(),stats:state.stats,total:total(),hour:new Date().getHours(),lines:state.cart.length,units:units(),isCombo:state.cart.some(l=>foods.get(l.food)?.combo),world:state.world,career:state.career,categoryCount:categories.length,now:Date.now(),...extra};}
function emit(event,extra={}){
 const ctx=context(event,extra);const oldLine=state.world.nextLine;advanceWorld(state.world,ctx);
 if(['add','minus'].includes(event)){
  if(quantity(ctx,'fries')&&quantity(ctx,'ice'))state.stats.heretic=1;
  if(quantity(ctx,'apple')&&quantity(ctx,'chicken'))state.stats.diet=1;
  if(ctx.total>=50000)state.stats.board=1;
 }
 state.stats.peak=Math.max(state.stats.peak,ctx.total);state.career.peak=Math.max(state.career.peak,ctx.total);
 const matched=badges.filter(a=>a.when(ctx));for(const a of matched){if(!state.stats.roundAchievements.includes(a.id))state.stats.roundAchievements.push(a.id);if(!state.stats.roundFacts[a.id])state.stats.roundFacts[a.id]=captureReceipt(ctx);}
 const awards=discover(ctx,state.owned);for(const a of awards){state.owned[a.id]=Date.now();state.pendingAwards.push(a.id);state.stats.roundUnlocks.push(a.id);state.receipts[a.id]=captureReceipt(ctx);}
 const series=growthLines.filter(l=>!state.completedSeries.includes(l.id)&&l.ids.every(id=>state.owned[id]));for(const l of series){state.completedSeries.push(l.id);state.pendingSeries.push(l.id);}
 const freshLines=state.world.pendingLines.filter(x=>+x.id>oldLine);if(freshLines.length){const weight=x=>x.plot==='finance'?80+x.stage:x.plot.startsWith('romance:')?(x.stage>1?95:70):x.plot==='cola'?90:50;const chosen=awards.length?null:freshLines.slice().sort((a,b)=>weight(b)-weight(a))[0];state.world.pendingLines=state.world.pendingLines.filter(x=>+x.id<=oldLine||x.id===chosen?.id);}
 state.career.discoveries=badges.filter(a=>state.owned[a.id]).length;
 const tier=identityTier(state.career),promotion=tier>state.career.tier?{name:identityNames[tier-1],text:identityTexts[tier-1]}:null;
 if(promotion)state.career.tier=tier;
 if(!['checkoutTime','mode','newRound'].includes(event))state.events.push({at:Date.now(),event,food:extra.food||'',amount:ctx.total,quantity:extra.quantity||0,awards:awards.map(a=>a.id)});
 state.events=state.events.slice(-120);persist();listeners.forEach(f=>f({event,awards,ctx,promotion,series}));return awards;
}
export function acknowledgeSeries(id){state.pendingSeries=state.pendingSeries.filter(k=>k!==id);persist();}
export function acknowledgeLine(id){state.world.pendingLines=state.world.pendingLines.filter(x=>x.id!==id);persist();}
export function recordCategory(id){if(!categories.some(c=>c.id===id)||state.world.categories.includes(id))return;emit('category',{category:id});}
export function trackPanel(next,food='',orderMode=''){if(next===trackedPanel)return;const previous=trackedPanel;trackedPanel=next;if(previous==='detail')emit('detailClose');if(previous==='checkout'&&!['pay','order','badge'].includes(next)||previous==='pay'&&next==='checkout')emit('checkoutBack');if(next==='detail')emit('detailOpen',{food});if(next==='cart')emit('cartOpen');if(next==='order')emit('orderView',{orderMode});}
export function acknowledgeAward(id){state.pendingAwards=state.pendingAwards.filter(x=>x!==id);persist();}
function recordNuggets(ids){const found=[...new Set(ids.filter(id=>hasTag({id},'nugget')))];if(found.length){state.stats.nuggetVisits++;for(const id of found)if(!state.stats.nuggetIds.includes(id))state.stats.nuggetIds.push(id);}}
export function viewFood(food){if(!foods.has(food))return;recordNuggets([food]);emit('view',{food});}
export function checkoutInteraction(){state.stats.checkoutInteractions++;persist();}
export function checkoutTime(seconds){if(!Number.isFinite(seconds)||seconds<=0||seconds>2||!state.cart.length)return;state.stats.checkoutSeconds+=seconds;emit('checkoutTime');}

function direction(event,food){if(state.stats.last&&state.stats.last!==event){state.stats.flips++;state.stats.sameFoodFlips=state.stats.lastActionFood===food?state.stats.sameFoodFlips+1:0;}else if(state.stats.lastActionFood!==food)state.stats.sameFoodFlips=0;state.stats.last=event;state.stats.lastActionFood=food;}
export function add(food,picks=[],quantity=1){
 if(!foods.has(food)||!validPicks(food,picks)||!Number.isInteger(quantity)||quantity<1||quantity>99)return false;
 const before=total(),beforeComponents=expanded(),foodBefore=state.cart.filter(l=>l.food===food).reduce((n,l)=>n+l.quantity,0);
 const key=food+JSON.stringify(picks);const ex=state.cart.find(l=>l.key===key);if(ex&&ex.quantity+quantity>99)return false;
 if(ex)ex.quantity+=quantity;else state.cart.push({key,food,picks:structuredCloneFallback(picks),quantity});
 state.stats.adds++;state.career.adds++;direction('add',food);
 state.stats.streak=state.stats.streakKey===key?state.stats.streak+1:1;state.stats.streakKey=key;state.stats.lastFood=food;
 const cs=components({food,picks,quantity});state.stats.cola+=cs.filter(i=>hasTag(i,'cola')).reduce((n,i)=>n+i.count,0);
 for(const tag of ['burger','fries','ice','cola','coffee','apple','chicken','water']){const n=cs.filter(i=>hasTag(i,tag)).reduce((sum,i)=>sum+i.count,0);if(n)state.stats.preference[tag]=(state.stats.preference[tag]||0)+n;}
 recordNuggets(cs.map(c=>c.code));
 emit('add',{food,quantity,before,beforeComponents,addedComponents:cs,foodBefore,foodAfter:state.cart.filter(l=>l.food===food).reduce((n,l)=>n+l.quantity,0)});return true;
}
export function minus(key){const i=state.cart.findIndex(l=>l.key===key);if(i<0)return;const before=total(),beforeComponents=expanded();const l=state.cart[i],food=l.food,foodBefore=state.cart.filter(l=>l.food===food).reduce((n,l)=>n+l.quantity,0);if(--l.quantity===0)state.cart.splice(i,1);state.stats.removes++;state.stats.streak=0;state.stats.streakKey='';if(!state.cart.length)state.stats.emptyCycles++;direction('minus',food);emit('minus',{before,food,beforeComponents,foodBefore,foodAfter:state.cart.filter(l=>l.food===food).reduce((n,l)=>n+l.quantity,0)});}
export function clear(){if(!state.cart.length)return;const before=total(),beforeComponents=expanded();state.cart=[];state.stats.clears++;if(before>=30000)state.stats.bigClear++;state.stats.last='';state.stats.lastActionFood='';state.stats.sameFoodFlips=0;state.stats.streak=0;state.stats.streakKey='';emit('clear',{before,beforeComponents});}
export function swap(choice,food='',code=''){state.stats.swaps++;state.stats.streak=0;state.stats.streakKey='';recordNuggets([code]);emit('swap',{choice,food,code});}
export function selectAddress(id){if(!addressById(id)||state.address===id)return;state.address=id;emit('address',{address:id});}
export function setMode(mode){if(!['pickup','delivery'].includes(mode))return;state.mode=mode;emit('mode');}
export function saveAddress(a){if(!a.title.trim()||!a.detail.trim())return false;const val={id:a.id||'custom-'+Date.now(),title:a.title.trim().slice(0,30),detail:a.detail.trim().slice(0,80),nickname:String(a.nickname||'').trim().slice(0,20)};const i=state.addresses.findIndex(x=>x.id===val.id);if(i<0)state.addresses.push(val);else state.addresses[i]=val;persist();return val.id;}
export function deleteAddress(id){state.addresses=state.addresses.filter(a=>a.id!==id);if(state.address===id)state.address='bed';persist();}
export function pay(){
 if(!state.cart.length||state.mode==='delivery'&&!addressById(state.address))return null;
 state.stats.payments++;state.career.payments=(state.career.payments||0)+1;state.stats.streak=0;state.stats.streakKey='';emit('pay');const order={id:'CX'+Date.now()+'-'+state.career.payments,at:Date.now(),total:total(),cart:structuredCloneFallback(state.cart),mode:state.mode,address:state.mode==='delivery'?structuredCloneFallback(addressById(state.address)):null,pickup:String(1000+Math.floor(Math.random()*9000)),arrived:false};state.orders.unshift(order);state.orders=state.orders.slice(0,8);state.cart=[];persist();return order;
}
export function arrive(id){const o=state.orders.find(o=>o.id===id);if(!o||o.arrived)return;o.arrived=true;emit('arrive');}
export function enter(){state.entered=true;persist();}
export function log(text){state.activity.push(text);state.activity=state.activity.slice(-8);persist();}
export function newRound(){if(state.cart.length)return false;state.stats=freshStats();state.world=freshWorld();state.activity=[];state.events=[];emit('newRound');return true;}
const structuredCloneFallback=o=>JSON.parse(JSON.stringify(o));
