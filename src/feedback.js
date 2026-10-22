import {awardPriority} from './achievements.js';
import {viewCopy} from './copy.js';
import {categories} from './catalog.js';
import {emblem} from './art.js';
import {log,acknowledgeAward,acknowledgeLine,acknowledgeSeries,state} from './store.js';
import {rarityRank,rarityLabel} from './rarity.js';
import {quantity,only,tagsFor} from './semantics.js';
let last=0,lastText='',timer,awardTimer;const queue=[];let showing=false,lastCelebration=0,lastFullRank=-1,lastPlot=0;
const esc=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function whisper(text,force=false){if(!text||text===lastText||!force&&Date.now()-last<850)return;last=Date.now();lastText=text;log(text);const el=document.getElementById('voice');el.textContent=text;el.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('visible'),3400);}
export function banter({event,ctx,awards=[]}){
 if(awards.length||showing)return;
 if(state.world.pendingLines.length){pumpStories();return;}
 const s=ctx.stats,changed=tagsFor(ctx.food);let text='';
 if(event==='add'){
  if(s.adds===1)text='欢迎光临。目前看起来，你还挺正常。';
  else if(only(ctx,'water'))text='哥，你是不是走错店了？';
  else if(only(ctx,'apple'))text='麦门养生部门给你发来贺电。';
  else if(ctx.total>=30000)text='董事会已经报警了。';
  else if(ctx.total>=20000)text='您的购买力引起了董事会关注。';
  else if(ctx.total>=10000||quantity(ctx,'burger')>=3&&changed.includes('burger'))text='不是哥们，你搁这儿进货呢？';
 }
 if(event==='minus')text='刚才不是还挺喜欢的吗？';
 if(event==='clear')text='不是，你刚才不是说全都要吗？';
 if(event==='swap'&&s.swaps>=2)text='换这个，换那个。原套餐已经认不出自己了。';
 whisper(text,event==='clear'||s.adds===1&&event==='add');
}
export function pumpStories(){
 if(showing||document.visibilityState!=='visible'||Date.now()-lastPlot<1600||!state.world.pendingLines.length)return;
 const entry=state.world.pendingLines.find(x=>x.plot!=='aside')||state.world.pendingLines[0];
 if(entry.plot==='aside'&&Date.now()-lastPlot<3500)return;
 lastPlot=Date.now();whisper(entry.text,true);acknowledgeLine(entry.id);
}
setInterval(pumpStories,250);
export const seriesAwards=lines=>lines.map(l=>({id:'series:'+l.id,kind:'series',member:l.ids[0],rarity:'B',name:l.name+' · 系列完成',icon:l.icon,text:l.ids.length+'/'+l.ids.length+' 已收藏。',shortText:l.ids.length+'/'+l.ids.length+' 已收藏。',animation:'glow'}));
// One operation creates one notification. Every earned badge is saved and acknowledged together.
export function notifyAwards(list,showDetail,showBatch){
 const current=(document.getElementById('awardNotice')?.dataset.awards||'').split(',');
 const fresh=list.filter(a=>!current.includes(a.id)&&!queue.some(g=>g.some(x=>x.id===a.id)));
 if(fresh.length)queue.push(fresh.sort((a,b)=>awardPriority(b)-awardPriority(a)));
 queue.sort((a,b)=>awardPriority(b[0])-awardPriority(a[0]));
 const next=()=>{
  if(showing||!queue.length)return;showing=true;
  const group=queue.shift(),source=group[0],a=source.kind==='series'?source:viewCopy(source,state.receipts[source.id]||{},categories.length),rank=rarityRank(a.rarity),el=document.getElementById('awardNotice');
  const full=rank>=2&&(Date.now()-lastCelebration>=12000||rank>lastFullRank);
  if(full){lastCelebration=Date.now();lastFullRank=rank;}
  el.dataset.award=a.id;el.dataset.awards=group.map(x=>x.id).join(',');el.dataset.rarity=a.rarity;
  el.className=(full?'reveal-award':'compact-award')+' grade-'+a.rarity+(group.some(x=>x.kind==='series')?' series-notice':'');
  if(a.id==='marketCrash')el.classList.add('market-crash');
  document.getElementById('voice').classList.remove('visible');
  const heading=a.kind==='series'?'系列完成':rarityLabel(a.rarity)+' · 已收藏';
  const extras=group.length>1?`<span class="unlock-extras">另有 ${group.length-1} 项已收藏${group.some(x=>x.kind==='series')?' · 系列完成':''}</span>`:'';
  if(!full){
   el.innerHTML=`<section class="compact-unlock rarity-${a.rarity}${group.length>1?' has-extra':''}" aria-label="${heading}"><span class="mini-emblem">${emblem(a.icon)}</span><div>${rank>0&&a.behavior?`<span class="compact-behavior">${esc(a.behavior)}</span>`:''}<small>${heading}</small><h3>${esc(a.name)}</h3><p>${esc(a.shortText)}</p>${extras}</div><button class="unlock-view">${group.length>1?'展开':'查看'}</button><button class="unlock-continue" aria-label="收起成就通知">×</button></section>`;
  }else{
   el.innerHTML=`<section class="unlock-popup rarity-${a.rarity} animation-${a.animation}" role="dialog" aria-label="${a.rarity}级成就揭晓"><div class="unlock-rays"></div><div class="unlock-confetti">✦ · ✧ · ✦</div><h2 class="reveal-detection">${esc(a.behavior)}</h2><span class="unlock-rarity">${heading}</span><div class="reveal-flip"><div class="reveal-front badge-medallion">${emblem('lock')}</div><div class="reveal-back badge-medallion">${emblem(a.icon)}</div></div><h3 class="reveal-copy">${esc(a.name)}</h3><p class="reveal-copy">${esc(a.text)}</p>${extras}<div class="unlock-buttons"><button class="reveal-skip">立即揭晓 · 跳过动画</button><button class="primary unlock-continue">继续点餐</button><button class="unlock-view">${group.length>1?'查看本次收藏 ›':'查看成就 ›'}</button></div></section>`;
  }
  el.classList.add('visible');let dismissed=false;
  const done=()=>{if(dismissed)return;dismissed=true;for(const item of group){if(item.kind==='series')acknowledgeSeries(item.id.slice(7));else acknowledgeAward(item.id);}clearTimeout(awardTimer);el.classList.remove('visible');el.dataset.awards='';setTimeout(()=>{showing=false;next()},180)};
  el.querySelector('.unlock-continue').onclick=done;
  el.querySelector('.unlock-view').onclick=()=>{done();const ids=group.filter(x=>x.kind!=='series').map(x=>x.id);if(ids.length>1&&showBatch)showBatch(ids);else showDetail(ids[0]||a.member)};
  el.querySelector('.reveal-skip')?.addEventListener('click',()=>el.classList.add('reveal-skipped'));
  awardTimer=setTimeout(done,full?6500:a.rarity==='C'?2500:3200);
 };next();
}
