import {hasTag,quantity,foodFamily,families,only} from './semantics.js';
export const romanceLines=['欢迎光临。目前看起来，你还挺正常。','刚才不是还挺喜欢的吗？','哟，复合了？','得，又分了。','你俩这是准备拍连续剧？','目前该汉堡已经决定：不谈恋爱，专心搞钱。'];
export const colaLines=['买入一笔液体资产。','资产规模扩大中。','想象中的气泡俱乐部开始有意见了。','气泡俱乐部申请集体放假。','恭喜，想象中的气泡俱乐部只剩你主持了。'];
export const assetLines=['您的精神资产正在稳步增长。','不是哥们，你搁这儿进货呢？','您的购物车数字引起了想象力俱乐部关注。','想象力俱乐部宣布：先把计算器放个假。'];
export function freshWorld(){return {everAdded:false,addressSwitches:0,addressIds:[],cycles:{},relationships:{},motion:null,burgerAdded:[],burgerDeleted:[],categories:[],emptyCartOpens:0,detailRun:{food:'',count:0},detailSession:null,anchors:[],crash:null,moneyStages:[],withdrawn:false,halted:false,zeroDone:false,colaStage:0,trace:[],pendingLines:[],nextLine:0,foodLines:[],maxFamilies:0,observedFamilies:[],orderViews:0,deliveryViews:0,deleteRun:[]};}
export function restoreWorld(raw){const w=freshWorld();if(!raw||typeof raw!=='object')return w;
 for(const k of ['everAdded','withdrawn','halted','zeroDone'])w[k]=raw[k]===true;
 for(const k of ['addressSwitches','emptyCartOpens','colaStage','nextLine','maxFamilies','orderViews','deliveryViews'])if(Number.isFinite(raw[k])&&raw[k]>=0)w[k]=raw[k];
 for(const k of ['addressIds','burgerAdded','burgerDeleted','categories','observedFamilies','foodLines','deleteRun'])if(Array.isArray(raw[k]))w[k]=[...new Set(raw[k].filter(x=>typeof x==='string'))].slice(0,150);
 if(Array.isArray(raw.moneyStages))w.moneyStages=[...new Set(raw.moneyStages.filter(x=>[5000,10000,20000,30000].includes(x)))];
 for(const k of ['trace','pendingLines'])if(Array.isArray(raw[k]))w[k]=raw[k].filter(x=>x&&typeof x.text==='string'&&typeof x.id==='string').slice(-300).map(x=>({id:x.id,text:storyText(x),plot:String(x.plot||''),stage:Number(x.stage)||0}));
 for(const [id,c]of Object.entries(raw.cycles||{}))if(/^\d+$/.test(id)&&c&&typeof c==='object')w.cycles[id]={armed:c.armed===true,count:Math.max(0,Number(c.count)||0)};
 for(const [id,c]of Object.entries(raw.relationships||{}))if(/^\d+$/.test(id)&&c&&typeof c==='object')w.relationships[id]={stage:Math.min(6,Math.max(0,Number(c.stage)||0)),adds:Math.max(0,Number(c.adds)||0),deletes:Math.max(0,Number(c.deletes)||0)};
 if(raw.detailRun&&typeof raw.detailRun.food==='string')w.detailRun={food:raw.detailRun.food,count:Math.max(0,Number(raw.detailRun.count)||0)};
 if(raw.motion&&typeof raw.motion.food==='string'&&['baseline','adds','minus'].every(k=>Number.isFinite(raw.motion[k])))w.motion={...raw.motion};
 if(Array.isArray(raw.anchors))w.anchors=raw.anchors.filter(x=>x&&Number.isFinite(x.at)&&Number.isFinite(x.amount)&&x.amount>=20000).slice(-100);
 if(raw.crash&&['peak','remaining','duration','at'].every(k=>Number.isFinite(raw.crash[k])))w.crash={...raw.crash};
 const safeAsides=['婚都要结了，你又说考虑考虑？','你是准备买它，还是准备跟它处对象？','骑手没变。倒是你的焦虑又增加了。','麦门养生部门给你发来贺电。','哥，你是不是走错店了？','别人来麦门寻找快乐，你来建设农业文明。'];w.pendingLines=w.pendingLines.filter(x=>x.plot!=='aside'||safeAsides.includes(x.text));
 return w;
}
function storyText(entry){const stage=Number(entry.stage);if(String(entry.plot).startsWith('romance:')&&stage>=1&&stage<=6)return romanceLines[stage-1];if(entry.plot==='cola'&&stage>=1&&stage<=5)return colaLines[stage-1];if(entry.plot==='finance'&&stage>=1&&stage<=4)return assetLines[stage-1];if(entry.plot==='finance'&&stage>=5)return stage===6?'紧急通知！您的购物车市值刚刚大幅下跌。':'不是，你刚才不是说全都要吗？';return entry.text.slice(0,500);}
function line(w,plot,stage,text){const entry={id:String(++w.nextLine),plot,stage,text};w.trace.push(entry);w.pendingLines.push(entry);w.trace=w.trace.slice(-300);w.pendingLines=w.pendingLines.slice(-300);}
export function onceLine(w,key,text){if(w.foodLines.includes(key))return;w.foodLines.push(key);line(w,'aside',0,text);}
const qty=(items,id)=>items.filter(x=>String(x.code)===id).reduce((n,x)=>n+x.count,0);
export function advanceWorld(w,c){
 const before=c.beforeComponents||[],after=c.components,id=String(c.food||''),codeBefore=c.foodBefore||0,codeAfter=c.foodAfter||0;
 if(c.event==='add'){
  w.everAdded=true;w.deleteRun=[];
  if(codeBefore===0){const cy=w.cycles[id]||(w.cycles[id]={armed:false,count:0});cy.armed=true;}
  if(after.some(x=>hasTag(x,'burger'))){for(const x of c.addedComponents||[])if(hasTag(x,'burger')&&!w.burgerAdded.includes(String(x.code)))w.burgerAdded.push(String(x.code));}
 }
 if(c.event==='minus'){
  if(!w.deleteRun.includes(id))w.deleteRun.push(id);
  
  if(codeAfter===0&&w.cycles[id]?.armed){w.cycles[id].armed=false;w.cycles[id].count++;}
  for(const x of before)if(hasTag(x,'burger')&&qty(after,String(x.code))===0&&w.burgerAdded.includes(String(x.code))&&!w.burgerDeleted.includes(String(x.code)))w.burgerDeleted.push(String(x.code));
 }
 if(['add','minus'].includes(c.event)&&hasTag({id},'burger')){
  const rel=w.relationships[id]||(w.relationships[id]={stage:0,adds:0,deletes:0});
  const entering=c.event==='add'&&codeBefore===0,leaving=c.event==='minus'&&codeAfter===0;
  if(entering)rel.adds++;if(leaving)rel.deletes++;
  if(rel.stage<6&&((entering&&rel.stage%2===0)||(leaving&&rel.stage%2===1))){line(w,'romance:'+id,rel.stage+1,romanceLines[rel.stage]);rel.stage++;}
 }
 if(['add','minus'].includes(c.event)){
  if(!w.motion||w.motion.food!==id)w.motion={food:id,baseline:codeBefore,adds:0,minus:0,touchedZero:codeBefore===0};
  if(w.motion.baseline===0&&c.event==='add'&&codeBefore===0)w.motion={food:id,baseline:codeAfter,adds:0,minus:0,touchedZero:false};
  else{w.motion[c.event==='add'?'adds':'minus']++;if(codeAfter===0)w.motion.touchedZero=true;}
 }
 if(['clear','pay'].includes(c.event)){for(const cy of Object.values(w.cycles))cy.armed=false;w.motion=null;w.deleteRun=[];}
 if(c.event==='address'){w.addressSwitches++;if(!w.addressIds.includes(c.address))w.addressIds.push(c.address);}
 if(c.event==='category'&&!w.categories.includes(c.category))w.categories.push(c.category);
 if(c.event==='cartOpen'&&!w.everAdded&&c.units===0)w.emptyCartOpens++;
 if(c.event==='detailOpen')w.detailSession={food:id,added:false};
 if(c.event==='add'&&w.detailSession?.food===id)w.detailSession.added=true;
 if(c.event==='detailClose'&&w.detailSession){const d=w.detailSession;if(!d.added)w.detailRun=w.detailRun.food===d.food?{food:d.food,count:w.detailRun.count+1}:{food:d.food,count:1};else w.detailRun={food:'',count:0};if(w.detailRun.count>=2)onceLine(w,'detail:'+d.food,'你是准备买它，还是准备跟它处对象？');w.detailSession=null;}
 if(c.event==='orderView'){w.orderViews++;if(c.orderMode==='delivery'){w.deliveryViews++;if(w.deliveryViews>=3)onceLine(w,'order-watch','骑手没变。倒是你的焦虑又增加了。');}}
 if(c.event==='checkoutBack')onceLine(w,'wedding','婚都要结了，你又说考虑考虑？');
 if(c.event==='add'&&quantity({components:c.addedComponents||[]},'cola')){
  const target=Math.min(5,c.stats.cola);while(w.colaStage<target){w.colaStage++;line(w,'cola',w.colaStage,colaLines[w.colaStage-1]);}
 }
 w.anchors=w.anchors.filter(x=>c.now>=x.at&&c.now-x.at<=60000);
 if(['minus','clear'].includes(c.event)){
  const anchor=w.anchors.filter(x=>c.total<=x.amount*.1).sort((a,b)=>b.amount-a.amount)[0];
  if(anchor&&!w.halted){c.crashTriggered=true;w.crash={peak:anchor.amount,remaining:c.total,duration:Math.max(0,(c.now-anchor.at)/1000),at:c.now};w.halted=true;line(w,'finance',6,'紧急通知！您的购物车市值刚刚大幅下跌。');}
  else if(!w.withdrawn&&c.before>=10000&&c.total<=c.before*.7){w.withdrawn=true;line(w,'finance',5,'不是，你刚才不是说全都要吗？');}
  if(c.total===0&&c.before>0&&w.moneyStages.length&&!w.zeroDone){w.zeroDone=true;line(w,'finance',7,'不是，你刚才不是说全都要吗？');}
 }
 if(c.event==='add'){
  [5000,10000,20000,30000].forEach((amount,i)=>{if(c.total>=amount&&!w.moneyStages.includes(amount)){w.moneyStages.push(amount);line(w,'finance',i+1,assetLines[i]);}});
  if(c.total>=20000)w.anchors.push({at:c.now,amount:c.total});w.anchors=w.anchors.slice(-100);
  // Dedicated remarks are remembered separately from the plot progression.
  const items=c.addedComponents||[],has=t=>items.some(x=>hasTag(x,t)),hasCode=code=>items.some(x=>String(x.code)===code);
  if(hasCode('80042')||hasCode('80043'))onceLine(w,'corn','别人来麦门寻找快乐，你来建设农业文明。');
  if(only(c,'apple'))onceLine(w,'apple','麦门养生部门给你发来贺电。');
  if(only(c,'water'))onceLine(w,'water','哥，你是不是走错店了？');
 }
 const types=families(c);w.maxFamilies=Math.max(w.maxFamilies,types.length);for(const t of types)if(!w.observedFamilies.includes(t))w.observedFamilies.push(t);
}
