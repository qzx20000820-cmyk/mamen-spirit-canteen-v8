import {foodFamily,hasTag,distinct} from './semantics.js';
// V7 supplied copy. IDs and triggers remain in achievements.js.
export const achievementCopy={
fries:{text:'汉堡只是过客，\n薯条才是归宿。',short:'汉堡只是过客，薯条才是归宿。',aside:'你对土豆的感情，多少有点不正常。',behavior:'你选择了多份薯条。'},
heretic:{text:'薯条蘸冰淇淋？\n\n正统麦门已经容不下你了。\n\n但你确实有点东西。',short:'薯条蘸冰淇淋，你是真敢啊。',behavior:'你把薯条和冰淇淋放进了同一个购物车。'},
diet:{text:'左手苹果片，右手炸鸡。\n\n你到底是想减肥，\n还是想给自己一个交代？',short:'左手苹果片，右手炸鸡。',behavior:'你同时选择了苹果片和炸鸡。'},
miser:{text:'你曾经拥有整个麦门。\n\n然后一键清空。\n\n葛朗台看完你的购物车，\n默默把保险柜又锁了一遍。',short:'拥有整个麦门，然后一键清空。',behavior:'你刚刚清空了一笔大额购物车。'},
cola:{text:'别人投资房产。\n\n你投资可乐。\n\n目前资产流动性极强，\n就是气泡有点多。',short:'别人投资房产，你投资可乐。',behavior:'你在这一轮里选了多份可乐。'},
quantum:{name:'不是哥们，你到底买不买？',text:'加了又删，删了又加。\n\n这汉堡都不知道\n自己到底有没有被你选中。',short:'加了又删，删了又加。',behavior:'你刚才反复加减购物车商品。'},
custom:{name:'这个套餐是你亲生的吗？',text:'换这个，换那个。\n\n原套餐已经认不出自己了。',short:'换这个，换那个。原套餐已经认不出自己了。',behavior:'你已经多次修改同一轮的套餐配置。'},
recall:{name:'当我没说',text:'上一秒：全都要。\n\n下一秒：算了算了。\n\n购物车：你礼貌吗？',short:'上一秒：全都要。下一秒：算了算了。',behavior:'你刚刚把商品一件件撤回了。'},
nobel:{text:'经过多年研究，\n\n你终于证明了：\n\n只要不付款，\n钱就不会减少。\n\n瑞典方面暂未回应。',short:'只要不付款，钱就不会减少。',behavior:'你反复加减商品，最后清空了购物车。'},
godot:{name:'不是，还没想好吗？',text:'汉堡等你半天了。\n\n骑手都准备退休了。\n\n你还在纠结点不点。',short:'汉堡等你半天了，你还在纠结点不点。',extra:'文学特别奖：等待戈多·麦门限定',behavior:'你在订单确认页停留、互动，却迟迟没有结算。'},
purist:{name:'除了汉堡，谁都别来',text:'薯条？不要。\n\n可乐？不要。\n\n今天谁来劝我都没用。',short:'薯条？不要。可乐？不要。',behavior:'你的购物车里只有汉堡。'},
archaeologist:{name:'鸡块研究生',text:'别人研究历史。\n\n你研究鸡块。\n\n目前论文进度：\n\n还在纠结甜辣酱。',short:'别人研究历史，你研究鸡块。',behavior:'你反复查看或选择了不同的鸡块。'},
traitor:{text:'麦门给过你机会。\n\n你连根薯条都没留下。\n\n组织决定：\n以后重点观察你。',short:'麦门给过你机会，你什么都没留下。',behavior:'你多次加购，又把购物车逐份删空。'},
threebody:{name:'汉堡开会没叫你',text:'三个汉堡凑到了一起。\n\n它们好像在商量什么。\n\n反正没打算告诉你。',short:'它们好像在商量什么，反正没打算告诉你。',behavior:'你把几种不同汉堡放进了同一个购物车。'},
stabilizer:{text:'一边喝咖啡强行清醒。\n\n一边吃冰淇淋安慰自己。\n\n成年人的体面，\n靠这两样东西硬撑。',short:'成年人的体面，靠这两样东西硬撑。',behavior:'你同时选择了咖啡和冰淇淋。'},
copy:{text:'这么多商品你不选。\n\n就盯着这一个猛点。\n\n你还挺专一。',short:'这么多商品你不选，就盯着这一个猛点。',behavior:'你连续加购了同一种、同配置的商品。'},
collector:{name:'你搁这儿集邮呢？',text:'别人集邮票。\n\n你集汉堡。\n\n展品先放在购物车，\n博物馆开在想象里。',short:'别人集邮票，你集汉堡。',behavior:'你选了好多种不同汉堡。'},
fishbear:{text:'孟子说鱼与熊掌不可兼得。\n\n你说：\n\n不好意思，\n我有购物车。',short:'不好意思，我有购物车。',behavior:'你同时选择了鱼肉堡和牛肉堡。'},
mengmu:{name:'搬家比点餐还勤',text:'孟母搬了三次家，\n是为了孩子的教育。\n\n你搬了三次家，\n是为了一个汉堡。',short:'孟母搬家为了教育，你搬家为了汉堡。',behavior:'你在这一轮里切换了多个配送地址。'},
schrodinger:{name:'复合了，又分了',text:'加购。\n删除。\n又加购。\n又删除。\n\n你俩这感情，\n比电视剧还复杂。',short:'你俩这感情，比电视剧还复杂。',behavior:'你把同一个商品加购、删空，又加购、删空。'},
merit:{name:'麦门养生局',text:'苹果、玉米、矿泉水。\n炸鸡薯条还没发言，\n就被你踢出了群聊。\n这局到底谁组的？',short:'这局到底谁组的？',behavior:'你同时选择了苹果片、玉米杯和矿泉水。'},
united:{text:'汉堡、炸鸡、薯条、饮料……\n\n各国代表已经到齐。\n\n目前最大的争议：\n\n甜辣酱到底归谁？',short:'目前最大的争议：甜辣酱到底归谁？',behavior:'你把多种食物大类放进了同一个购物车。'},
menuarchaeologist:{name:'你把菜单翻烂了？',text:'所有分类你都看了一遍。\n\n调查结果已经出来：\n\n你是真饿了。',short:'调查结果已经出来：你是真饿了。',behavior:'你把菜单分类全都看过了。'},
marketCrash:{text:'紧急通知！\n\n您的购物车市值\n刚刚暴跌90%。\n\n华尔街连夜研究你的撤退技术。',short:'华尔街连夜研究你的撤退技术。',behavior:'你在一分钟内让购物车金额大幅下降。'},
philosopher:{name:'看一眼怎么了？',text:'看了三遍。\n\n一次都不买。\n\n汉堡：哥，\n你到底是看上我哪儿了？',short:'一次都不买，你到底是看上我哪儿了？',behavior:'你反复打开同一个商品详情，关了也没加购。'},
emperor:{name:'皇帝的新购物车',text:'所有人都说：\n\n陛下，您的购物车真丰富！\n\n只有一个孩子说：\n\n可是里面啥都没有啊！',short:'可是里面啥都没有啊！',behavior:'你反复打开购物车，但里面一直是空的。'},
newton:{name:'忙了半天，白忙了',text:'加了三次。\n\n删了三次。\n\n最后数量一点没变。\n\n牛顿：\n你到底图啥？',short:'最后数量一点没变。牛顿：你到底图啥？',behavior:'你连续加减同一个商品，最后数量回到原处。'},
seaking:{text:'对三个汉堡都说喜欢。\n\n最后只留下一个。\n\n不是哥们，\n你还挺会改主意。',short:'最后只留下一个，你还挺会改主意。',behavior:'你加购过几种汉堡，最后只保留了一种。'},
ipo:{name:'你公司上市了？',text:'重大喜讯！\n\n您的想象力项目在游戏里挂牌。\n\n当前市值：\n\n全靠想象。\n\n想象力主持：您本人。',short:'当前市值：全靠想象。想象力主持：您本人。',behavior:'你已经完成了多笔游戏内结算。'},
romanceFraud:{text:'经调查，\n\n你曾三次向同一个汉堡\n作出购买承诺。\n\n又三次亲手抛弃了它。\n\n目前该汉堡已经决定：\n\n不谈恋爱，专心搞钱。',short:'不谈恋爱，专心搞钱。',behavior:'你反复把同一个汉堡加购后又删空。'},
colaChair:{text:'经董事会一致决定，\n\n您成为了想象中的气泡俱乐部主持。\n\n气泡俱乐部成员：1人。\n\n反对票：0票。\n\n主要原因：\n\n其他气泡都去放假了。',short:'主要原因：其他气泡都去放假了。',behavior:'你在这一轮里选了至少5份可乐。'},
initiate:{text:'欢迎入教。\n\n组织目前还不知道\n你是什么路数。',short:'欢迎入教。组织目前还不知道你是什么路数。',behavior:'你成功把一份餐品加入了购物车。'},
friesNovice:{text:'薯门已收到申请。\n\n请继续保持\n对土豆的尊重。',short:'薯门已收到申请。请继续保持对土豆的尊重。',behavior:'你成功加购了薯条。'},
colaRegistrar:{text:'恭喜购入液体资产。\n\n优点：流动性强。\n\n缺点：全是气泡。',short:'优点：流动性强。缺点：全是气泡。',behavior:'你成功加购了可乐。'},
cornGodfather:{text:'别人来麦门寻找快乐。\n\n你来建设农业文明。',short:'别人来麦门寻找快乐，你来建设农业文明。',behavior:'你成功加购了玉米杯。'},
appleWellness:{name:'来麦当劳养生来了？',text:'周围全是炸鸡汉堡。\n\n你点了苹果。\n\n你搁这儿卧底呢？',short:'你点了苹果。你搁这儿卧底呢？',behavior:'你成功加购了苹果片。'},
heartIntern:{name:'刚爱上就分手',text:'刚加进购物车。\n\n转头就删了。\n\n不是，你俩认识满一分钟了吗？',short:'不是，你俩认识满一分钟了吗？',behavior:'你主动减掉了一份餐品。'}
};
const numberWord=n=>({2:'两',3:'三'}[n]||String(n));
export function viewCopy(a,receipt={},menuCount){const copy=achievementCopy[a.id];let text=copy.text;
 if(['quantum','philosopher'].includes(a.id)&&receipt.subjectBurger!==true)text=text.replace('这汉堡','这份餐品').replace('汉堡：哥','餐品：哥');
 if(a.id==='threebody')text=text.replace('三个汉堡',receipt.cartBurgers?numberWord(receipt.cartBurgers)+'个汉堡':'几个汉堡');
 if(a.id==='philosopher')text=text.replace('看了三遍。',receipt.detailCount?'看了'+numberWord(receipt.detailCount)+'遍。':'反复看了。');
 if(a.id==='menuarchaeologist')text=text.replace('所有分类',Number.isFinite(receipt.menuCount||menuCount)?String(receipt.menuCount||menuCount)+'个分类':'所有分类');
 if(a.id==='united'&&!(receipt.types?.includes('burger')&&receipt.types.includes('chicken')&&receipt.types.includes('drink')&&receipt.fries))text='各路餐品代表已经到齐。\n\n目前最大的争议：\n\n甜辣酱到底归谁？';
 if(a.id==='traitor'&&receipt.friesBefore!==true)text=text.replace('你连根薯条都没留下。','你什么都没留下。');
 if(a.id==='marketCrash'){
  const crash=receipt.crash;if(crash&&crash.peak>0&&crash.remaining>=0){const drop=(crash.peak-crash.remaining)/crash.peak*100;const rounded=Math.round(drop);const p=Math.abs(drop-rounded)<1e-7?rounded+'%':'约'+Math.min(99.99,drop).toFixed(2)+'%';text=text.replace('刚刚暴跌90%。','刚刚暴跌了'+p+'。');}else text=text.replace('刚刚暴跌90%。','刚刚大幅下跌。');
 }
 if(a.id==='newton')text=receipt.motion?text.replace('加了三次。','加了'+numberWord(receipt.motion.adds)+'次。').replace('删了三次。','删了'+numberWord(receipt.motion.minus)+'次。'):text.replace('加了三次。\n\n删了三次。','加了又删。');
 if(a.id==='mengmu')text=text.replace('你搬了三次家，',receipt.addressSwitches?'你搬了'+numberWord(receipt.addressSwitches)+'次家，':'你反复搬家，');
 if(a.id==='seaking')text=text.replace('对三个汉堡都说喜欢。',receipt.burgerCount?'对'+numberWord(receipt.burgerCount)+'个汉堡都说喜欢。':'对几个汉堡都说喜欢。');
 if(a.id==='romanceFraud')text=receipt.romance?text.replace('你曾三次','你曾'+numberWord(receipt.romance.adds)+'次').replace('又三次','又'+numberWord(receipt.romance.deletes)+'次'):text.replace('你曾三次','你曾反复').replace('又三次','又反复');
 return {...a,name:copy.name||a.name,text,shortText:copy.short,behavior:copy.behavior,extra:copy.extra,aside:copy.aside};
}
export function captureReceipt(c){return {at:c.now,subjectBurger:hasTag({id:c.food||c.world.detailRun.food},'burger'),menuCount:c.categoryCount,addressSwitches:c.world.addressSwitches,types:[...new Set(c.components.map(x=>foodFamily(x)).filter(Boolean))],fries:c.components.some(x=>hasTag(x,'fries')),friesBefore:(c.beforeComponents||[]).some(x=>hasTag(x,'fries')),cartBurgers:distinct(c,'burger'),detailCount:c.world.detailRun.count,motion:c.world.motion?{...c.world.motion}:null,romance:c.world.relationships[c.food]?{...c.world.relationships[c.food]}:null,crash:c.world.crash?{...c.world.crash}:null,burgerCount:c.world.burgerAdded.length};}

export function validReceipt(raw){if(!raw||typeof raw!=='object')return null;const r={};for(const k of ['at','menuCount','addressSwitches','burgerCount','cartBurgers','detailCount'])if(Number.isFinite(raw[k])&&raw[k]>=0)r[k]=raw[k];r.subjectBurger=raw.subjectBurger===true;r.fries=raw.fries===true;r.friesBefore=raw.friesBefore===true;r.types=Array.isArray(raw.types)?raw.types.filter(x=>['burger','chicken','snack','dessert','drink'].includes(x)):[];for(const [key,fields]of [['motion',['adds','minus','baseline']],['romance',['adds','deletes','stage']],['crash',['peak','remaining','duration','at']]])if(raw[key]&&fields.every(k=>Number.isFinite(raw[key][k])&&raw[key][k]>=0))r[key]={...raw[key]};return r;}
