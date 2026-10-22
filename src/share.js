import {emblem} from './art.js';
import {price} from './catalog.js';
export async function cardImage(data,type='report'){
 const c=document.createElement('canvas');c.width=1000;c.height=1450;const x=c.getContext('2d');
 const gradeColors={C:'#78818d',B:'#235ea8',A:'#65269e',S:'#8c601c',SR:'#8b263c',SSR:'#211a32'};
 const bg=x.createLinearGradient(0,0,1000,1450);bg.addColorStop(0,type==='report'?'#ffcb20':gradeColors[data.rarity]||'#32115b');bg.addColorStop(1,type==='report'?'#ff8b2b':'#13162f');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
 const text=(t,y,size=32,color='#242424',weight='600')=>{x.fillStyle=color;x.font=`${weight} ${size}px -apple-system, "PingFang SC", sans-serif`;x.fillText(t,80,y);};
 const wrap=(t,y,width,size=32,color='#242424')=>{x.font=`500 ${size}px -apple-system, "PingFang SC", sans-serif`;let line='',cy=y;for(const ch of String(t).replace(/\s+/g,' ')){if(x.measureText(line+ch).width>width){text(line,cy,size,color,'500');cy+=size*1.65;line='';}line+=ch;}text(line,cy,size,color,'500');return cy;};
 text('麦门精神食堂',105,32,type==='report'?'#292424':'#ffe9ac');text(type==='report'?'精神消费鉴定报告':'隐藏成就 / '+data.rarity+'级 · '+data.level,190,48,type==='report'?'#292424':'#ffe9ac');
 if(type==='report'){
  x.fillStyle='#fff8e6';x.beginPath();x.roundRect?x.roundRect(50,250,900,1100,44):x.rect(50,250,900,1100);x.fill();
  text('鉴定结果',325,26,'#875524');wrap(data.name,415,820,56);wrap(data.summary,515,820,30);if(data.storyEvidence?.length)wrap('剧情摘录：'+data.storyEvidence.at(-1),685,820,20,'#875524');
  data.metrics.forEach(([k,v],i)=>{const ox=80+(i%2)*450,oy=785+Math.floor(i/2)*150;x.fillStyle='#73716b';x.font='26px sans-serif';x.fillText(k,ox,oy);x.fillStyle='#d2182e';x.font='bold 52px sans-serif';x.fillText(v,ox,oy+67);});
  text('正式授予',1100,24,'#777066');wrap(data.title,1160,820,38);text(data.evidence,1240,24,'#736a60');text('峰值 '+price(data.peak)+' · 清空 '+data.clears+' · 新收藏 '+data.unlockCount+' · 最高 '+(data.highestRarity||'未解锁'),1290,23,'#736a60');
 }else{
  wrap(data.behavior||'',255,820,24,'#d0c2dc');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 72 72" color="#ffd65d">${emblem(data.icon).replace(/<svg[^>]*>|<\/svg>/g,'')}</svg>`;const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await new Promise((r,j)=>{img.onload=r;img.onerror=j});x.drawImage(img,350,290,300,300);wrap(data.name,700,820,60,'#ffe4a0');wrap(data.text,830,820,36,'#fff4e2');text('解锁条件',1090,24,'#c5b6db');wrap(data.rule,1150,820,30,'#fff4e2');
 }
 text('独立娱乐游戏 · 不发生真实付款和配送',1410,23,type==='report'?'#5b3020':'#bfc0df');
 return c.toDataURL('image/png');
}
export async function presentShare(container,data,type){
 container.innerHTML='<p class="helper">正在生成图片…</p>';
 try{const src=await cardImage(data,type);container.innerHTML='';const img=new Image();img.src=src;img.alt=type==='report'?'精神消费鉴定报告分享图片':data.name+'成就分享图片';container.append(img);const help=document.createElement('p');help.className='helper';help.textContent='iPhone 可长按图片保存；也可以直接截图分享。';container.append(help);const link=document.createElement('a');link.className='primary';link.href=src;link.download=type==='report'?'精神消费鉴定报告.png':data.name+'.png';link.textContent='下载图片';container.append(link);
 if(navigator.canShare&&navigator.share){const b=document.createElement('button');b.className='secondary';b.textContent='分享给朋友';b.onclick=async()=>{try{const blob=await(await fetch(src)).blob();const f=new File([blob],'麦门分享卡.png',{type:'image/png'});if(navigator.canShare({files:[f]}))await navigator.share({files:[f]});else help.textContent='当前浏览器可长按图片保存后分享。';}catch{help.textContent='可以继续长按图片保存。';}};container.append(b);}
 img.scrollIntoView({block:'nearest'});
 }catch{container.innerHTML='<p class="helper">图片生成暂不可用，请直接截图保存。</p>';}
}
