import {quantity,distinct,only,isFish,isBeef,isCorn,families,hasTag} from './semantics.js';
const has=(c,t)=>quantity(c,t)>0;
const count=quantity;
import {achievementCopy,viewCopy} from './copy.js';
import {gradeById,rarityThemes,rarityRank} from './rarity.js';
const live=e=>['add','minus'].includes(e);
const definitions=[
{id:'fries',name:'薯门永存',level:'稀有',icon:'fries',hint:'信仰需要一点点积累。',text:'汉堡只是过客，薯条才是信仰。你没有选择薯条，是薯条选择了你。',rule:'购物车同时有3份薯条',when:(c)=>live(c.event)&&count(c,'fries')>=3},
{id:'heretic',name:'麦门邪修',level:'史诗',icon:'alchemy',hint:'一个很热，一个很冷。',text:'正统麦门拒绝承认你的修炼方式。但你已经悟了。隐藏备注：甜咸两开花。',rule:'购物车同时有薯条和冰淇淋',when:c=>live(c.event)&&has(c,'fries')&&has(c,'ice')},
{id:'diet',name:'薛定谔的自律',level:'稀有',icon:'apple',hint:'有些组合，会让自律陷入叠加态。',text:'你试图用一袋苹果片，对冲整个炸鸡宇宙。系统无法判断，你究竟在养生还是放纵。',rule:'苹果片与炸鸡类餐品同时在购物车',when:c=>live(c.event)&&has(c,'apple')&&has(c,'chicken')},
{id:'miser',name:'葛朗台精神继承人',level:'传说',icon:'wallet',hint:'当你拥有很多，也可以选择放下。',text:'你曾经拥有整个麦门，然后选择一分钱都不花。葛朗台看了你的购物车，默默把保险柜又锁了一遍。',rule:'清空价值至少¥300的购物车',when:c=>c.event==='clear'&&c.before>=30000},
{id:'cola',name:'液体资产管理大师',level:'稀有',icon:'cola',hint:'资产可以是液体，收益可以是气泡。',text:'你的投资组合正在冒泡。建议不要摇晃，否则市场会喷出来。',rule:'本轮累计加购至少4份可乐（含套餐）',when:c=>c.event==='add'&&c.stats.cola>=4},
{id:'quantum',name:'量子点餐专家',level:'史诗',icon:'orbit',hint:'加减之间，有无法确定的东西。',text:'您想吃，也不想吃。请勿继续观测购物车，以免食欲坍缩。',rule:'本轮加减方向切换6次',when:c=>live(c.event)&&c.stats.flips>=6},
{id:'custom',name:'套餐重构工程师',level:'史诗',icon:'tools',hint:'标准答案，也可以有自己的版本。',text:'本套餐已被您重构三次。原作者保留了署名，您保留了意见。',rule:'本轮替换套餐选项3次',when:c=>c.event==='swap'&&c.stats.swaps>=3},
{id:'recall',name:'食欲撤回管理员',level:'稀有',icon:'eye',text:'刚才说想吃的不是本人。胃已撤回三条消息，建议手部停止代签。',rule:'本轮减购至少3次，并通过减购把购物车减到空',when:c=>c.event==='minus'&&c.units===0&&c.stats.removes>=3},
{id:'nobel',name:'精神诺贝尔经济学奖',level:'传说',icon:'economics',hint:'有些研究的结论，是一个漂亮的零。',text:'经过长期研究，你终于证明：本游戏没有支付接口，结算只会生成一张想象力清单。瑞典方面暂未对此作出回应。',rule:'本轮加购至少5次、减购至少3次、方向切换至少4次后手动清空',when:c=>c.event==='clear'&&c.stats.adds>=5&&c.stats.removes>=3&&c.stats.flips>=4},
{id:'godot',name:'等待戈多·麦门限定',level:'史诗',icon:'hourglass',hint:'有人等了很久，却什么都没有等到。',text:'汉堡没有来，骑手没有来，戈多也没有来。但你仍然相信，明天会有鸡块。',rule:'订单确认页累计60秒有效停留，至少3次间隔2秒的互动；只计可见且近15秒内有互动的时间',when:c=>c.event==='checkoutTime'&&c.stats.checkoutSeconds>=60&&c.stats.checkoutInteractions>=3&&c.units>0},
{id:'purist',name:'汉堡原教旨主义者',level:'稀有',icon:'temple',hint:'真理，也许夹在两片面包之间。',text:'薯条和可乐都是异端。真正的麦门信徒，只相信两片面包之间的真理。',rule:'购物车仅有汉堡，且合计至少3份；不将含配餐的套餐视为纯汉堡',when:c=>live(c.event)&&only(c,'burger')&&count(c,'burger')>=3},
{id:'archaeologist',name:'鸡块考古学家',level:'稀有',icon:'dig',hint:'有些文明，埋在蘸酱下面。',text:'你正在研究鸡块文明的起源。考古队坚持认为它们应该六块一组；菜单以实际规格为准，拒绝配合学术讨论。',rule:'本轮查看或加购鸡块类商品累计5次，并接触至少2个不同商品编号',when:c=>['view','add','swap'].includes(c.event)&&c.stats.nuggetVisits>=5&&c.stats.nuggetIds.length>=2},
{id:'traitor',name:'麦门叛徒',level:'史诗',icon:'exit',hint:'组织记得你每一次转身。',text:'麦门给过你机会，你却选择了离开。组织决定保留你的购物车档案。',rule:'本轮3次将加购后的购物车逐份减至空；手动清空与结算不算',when:c=>c.event==='minus'&&c.units===0&&c.stats.emptyCycles>=3},
{id:'threebody',name:'碳水三体问题',level:'史诗',icon:'threebody',hint:'两份还可以理解，第三份开始改变宇宙。',text:'三个汉堡正在相互吸引。麦门物理学界宣布：该系统已无法求解。',rule:'购物车同时有至少3个不同编号的汉堡，含已知套餐中实际选中的汉堡',when:c=>live(c.event)&&distinct(c,'burger')>=3},
{id:'stabilizer',name:'成年人的情绪稳定器',level:'稀有',icon:'balance',hint:'清醒与快乐之间，存在一条秘密通道。',text:'左手咖啡保持清醒，右手冰淇淋维持快乐。你的精神状态暂时达到了动态平衡。',rule:'购物车同时有咖啡和冰淇淋类商品，含已知套餐的实际选项',when:c=>live(c.event)&&has(c,'coffee')&&has(c,'ice')},
{id:'copy',name:'复制粘贴型人格',level:'普通',icon:'copy',hint:'你的手指，好像发现了一个快捷键。',text:'Ctrl+C。Ctrl+V。Ctrl+鸡腿堡。世界上有那么多选择，你偏偏只爱这一个。',rule:'连续5次加购同一编号且同一配置的商品；减购、清空、换配、结算会打断',when:c=>c.event==='add'&&c.stats.streak>=5},
{id:'collector',name:'汉堡收藏家',level:'传说',icon:'museum',hint:'有人的购物车，已经不适合叫购物车了。',text:'别人集邮，你收集汉堡。目前距离建立汉堡博物馆，只差一栋楼。',rule:'购物车同时有至少5个不同编号的汉堡',when:c=>live(c.event)&&distinct(c,'burger')>=5},
{id:'fishbear',name:'鱼与熊掌我都要',level:'稀有',icon:'fishbeef',hint:'两千年的难题，也许只缺一个购物车。',text:'“鱼与熊掌不可兼得。”孟子说完这句话，大概没想到后人发明了购物车。恭喜你，在麦门解决了困扰哲学界两千年的问题。隐藏吐槽：孟子正在重新修订教材。',rule:'购物车同时有实际识别的鱼肉汉堡和牛肉汉堡',when:c=>live(c.event)&&c.components.some(isFish)&&c.components.some(isBeef)},
{id:'mengmu',name:'赛博孟母三迁',level:'史诗',icon:'moving',hint:'目的地变了，胃口却没有。',text:'孟母搬了三次家，是为了孩子的教育。你搬了三次家，是为了一个汉堡。孟母：我当年也没你这么折腾。隐藏身份：麦门房地产观察员。',rule:'本轮完成至少3次地址切换，切换目标包含3个不同已选地址；点击当前地址不算',when:c=>c.event==='address'&&(c.world?.addressSwitches||0)>=3&&(c.world?.addressIds.length||0)>=3},
{id:'schrodinger',name:'麦门薛定谔',level:'稀有',icon:'catbox',hint:'有些餐品的存在性，非常不稳定。',text:'在你打开购物车之前，这个餐品同时处于存在与不存在两种状态。薛定谔看了你的购物车，决定退休。',rule:'本轮同一商品编号完成2次从零加购再通过减购删至零的有效来回；清空与结算不算删除',when:c=>c.event==='minus'&&c.foodAfter===0&&(c.world?.cycles?.[c.food]?.count||0)>=2},
{id:'merit',name:'麦门养生局',level:'史诗',icon:'lotus',hint:'这局到底谁组的？',text:'苹果、玉米、矿泉水。\n炸鸡薯条还没发言，\n就被你踢出了群聊。\n这局到底谁组的？',rule:'购物车同时有苹果片、玉米杯和矿泉水',when:c=>live(c.event)&&count(c,'apple')>0&&c.components.some(isCorn)&&count(c,'water')>0},
{id:'united',name:'金拱门联合国',level:'史诗',icon:'globe',hint:'有些晚饭，需要一张国际会议桌。',text:'麦门联合国大会正式召开！汉堡代表要求增加面包预算，薯条代表坚持盐粒主权，鸡块代表争夺甜辣酱。可乐代表：“大家先冷静一下，我有气。”最终决议：会议没有取得任何实质性进展。',rule:'购物车同时有汉堡、炸鸡、小食、甜品、饮品5种真实食物大类；展示栏目不计类别',when:c=>live(c.event)&&families(c).length>=5},
{id:'menuarchaeologist',name:'麦门考古学家',level:'稀有',icon:'scroll',hint:'有些发现，需要翻到最后一页。',text:'你翻遍了整个麦门文明，从汉堡纪元研究到薯条王朝，最终发现一个惊天秘密：原来你只是饿了。',rule:'本轮实际浏览全部可见菜单分类；每个分类只计一次',when:c=>c.event==='category'&&c.categoryCount>0&&(c.world?.categories.length||0)>=c.categoryCount},
{id:'marketCrash',name:'精神股市熔断',level:'传说',icon:'crash',hint:'有时候，余额不动，市值却没了。',text:'紧急通知！您的购物车市值在一分钟内蒸发了90%。华尔街正在连夜研究您的操作。巴菲特：“这位朋友的撤退速度，连我都没有见过。”',rule:'60秒内由至少¥200的实际金额通过主动减购或清空下降至少90%；不必减空',when:c=>['minus','clear'].includes(c.event)&&c.crashTriggered===true},
{id:'philosopher',name:'麦门哲学家',level:'稀有',icon:'thinker',hint:'凝视，也许比下单更有意义。',text:'当你凝视汉堡的时候，汉堡也在凝视你。尼采对此暂未发表评论。系统评价：此人并非想吃餐品，此人正在研究它的存在主义。',rule:'本轮连续3次打开同一真实商品详情并关闭，每次均未加购该商品；查看其他商品或详情内加购会打断',when:c=>c.event==='detailClose'&&(c.world?.detailRun.count||0)>=3},
{id:'emperor',name:'赛博皇帝的新衣',level:'稀有',icon:'robe',hint:'空白的地方，也可以获得一致赞美。',text:'大臣们纷纷表示：“陛下，您的购物车真丰富！”所有人点头称赞。只有一个孩子说：“可是里面根本没有东西啊！”您的精神购买力已获得皇室认可。',rule:'本轮从未成功加购，分别打开空购物车3次；同一次停留或反复点击已打开面板不算',when:c=>c.event==='cartOpen'&&!c.world?.everAdded&&(c.world?.emptyCartOpens||0)>=3},
{id:'newton',name:'牛顿第三定律失效',level:'稀有',icon:'pendulum',hint:'有些忙碌，只有手指获得了进展。',text:'你进行了大量操作。但经过精密测量，购物车没有发生任何变化。牛顿看了你的操作记录，决定重新研究力学。忙碌程度：100%。实际进展：0%。',rule:'同一商品连续至少3次加购与3次减购后回到非零起始数量；期间不减至零，与薛定谔来回区分',when:c=>live(c.event)&&c.world?.motion?.food===c.food&&c.world.motion.baseline>0&&!c.world.motion.touchedZero&&c.world.motion.adds>=3&&c.world.motion.minus>=3&&c.foodAfter===c.world.motion.baseline},
{id:'seaking',name:'麦门海王',level:'史诗',icon:'hearts',hint:'购物车知道，你不止说过一次喜欢。',text:'你对每个汉堡都说过喜欢。它们都相信了。最后，你只给一个汉堡留下了位置。组织决定授予你：“麦门情感管理大师”。',rule:'本轮实际加购过至少3种汉堡，主动减购至完全删除其中至少2种，当前只保留其中1种',when:c=>c.event==='minus'&&(c.world?.burgerAdded.length||0)>=3&&(c.world?.burgerDeleted.length||0)>=2&&distinct(c,'burger')===1&&c.components.filter(x=>hasTag(x,'burger')).every(x=>c.world.burgerAdded.includes(String(x.code)))},
{id:'ipo',name:'精神IPO上市',level:'传说',icon:'ipo',hint:'有些企业，从未收到过投资。',text:'重大喜讯！您的精神食堂今日正式挂牌上市！游戏档案：想象力号。当前市值：全靠想象。气泡俱乐部主持：“感谢想象力，虽然我们从未收到过任何投资。”仅为游戏称号，不代表真实股份或收益。',rule:'跨多轮累计完成5笔游戏内结算；刷新与查看订单不重复计数',when:c=>c.event==='pay'&&(c.career?.payments||0)>=5},
{id:'romanceFraud',name:'汉堡情感诈骗犯',level:'史诗',icon:'brokenheart',hint:'有些购买承诺，已经被记入档案。',text:'你曾多次进入它的购物车，又多次离开它的世界。目前该汉堡已决定专注事业。',rule:'本轮同一汉堡完成3次从零加购再逐份删至零，按顺序走完6段情感剧情',when:c=>c.event==='minus'&&(c.world?.relationships?.[c.food]?.stage||0)>=6},
{id:'colaChair',name:'液体资产终身董事长',level:'史诗',icon:'chair',hint:'董事会的出勤率，似乎越来越低了。',text:'经董事会一致决定，您已获得想象中气泡俱乐部的主持席位。气泡俱乐部成员：1人。反对票：0票。主要原因：其他气泡都去放假了。',rule:'本轮累计实际加购5份可乐（含已知套餐实际选项），走完5段董事会剧情',when:c=>c.event==='add'&&c.stats.cola>=5&&(c.world?.colaStage||0)>=5},
{id:'initiate',name:'麦门初代弟子',icon:'ticket',text:'恭喜您正式加入麦门。虽然您还没有交任何费用，但组织决定先观察您。系统备注：此人暂时看起来正常。',rule:'第一次成功加购任意商品；旧玩家升级后下一次成功加购也可领取',when:c=>c.event==='add'},
{id:'friesNovice',name:'薯门见习生',icon:'fries',text:'薯门已收到您的入教申请。目前正在审核您的盐分信仰。请继续保持对土豆的尊重。',rule:'第一次实际加购薯条，含已知套餐实际选择的薯条',when:c=>c.event==='add'&&quantity({components:c.addedComponents||[]},'fries')>0},
{id:'colaRegistrar',name:'液体资产登记员',icon:'cola',text:'恭喜！您正式拥有了一笔流动性极强的资产。风险提示：存在大量气泡。',rule:'第一次实际加购可乐，含已知套餐实际选择的可乐',when:c=>c.event==='add'&&quantity({components:c.addedComponents||[]},'cola')>0},
{id:'cornGodfather',name:'玉米教父',icon:'corn',text:'别人在吃快餐，您在建设农业文明。麦门农业部决定授予您荣誉教父称号。',rule:'第一次实际加购玉米杯，含已知套餐实际选择的玉米',when:c=>c.event==='add'&&(c.addedComponents||[]).some(isCorn)},
{id:'appleWellness',name:'麦门养生大师',icon:'apple',text:'在炸鸡、薯条和汉堡的包围下，您坚定地选择了苹果。组织对此感到困惑，建议继续观察。',rule:'第一次实际加购苹果片',when:c=>c.event==='add'&&quantity({components:c.addedComponents||[]},'apple')>0},
{id:'heartIntern',name:'心碎实习生',icon:'brokenheart',text:'这段关系开始得很突然，结束得也很突然。麦门情感咨询中心已经为您建立档案。',rule:'第一次主动成功减购任意商品；清空与结算不算',when:c=>c.event==='minus'}

];
export const badges=definitions.map(a=>({...a,oldName:a.name,...achievementCopy[a.id],name:achievementCopy[a.id].name||a.name,shortText:achievementCopy[a.id].short,rarity:gradeById[a.id],level:rarityThemes[gradeById[a.id]].name,animation:rarityThemes[gradeById[a.id]].animation,hintTier:rarityThemes[gradeById[a.id]].hintTier}));
export function awardPriority(a){return rarityRank(a.rarity)*100+(a.id==='marketCrash'?30:0)+(a.id==='romanceFraud'?10:0);}
export function discover(ctx,owned){return badges.filter(a=>!owned[a.id]&&a.when(ctx)).sort((a,b)=>awardPriority(b)-awardPriority(a));}
export const identityNames=['麦门新访客','购物车区域观察员','想象力编外观察员','麦门精神收藏家','麦门宇宙观察员'];
export const identityTexts=['欢迎加入想象力俱乐部，称号仅在游戏里生效。','想象力俱乐部认可了您的观察能力。管辖范围：您的手机屏幕。','恭喜进入想象力观察席；这是游戏称号，不对应真实企业职务或权益。','您已把晚饭发展成了一项跨胃部事业。','您已经开始观察食欲宇宙，而不是只观察菜单。'];
export function identityTier(c){return c.discoveries>=10?5:c.adds>=20&&c.discoveries>=5?4:c.peak>=50000?3:c.adds>=8?2:c.adds>=1?1:0;}
// Specific behavior takes precedence over general preference; never random.
export function persona(s,owned,world={}){
 const patterns=s.roundAchievements||[],hits=id=>patterns.includes(id),a=id=>viewCopy(badges.find(b=>b.id===id),s.roundFacts?.[id]||{});
 const normal=s.adds?(s.payments?'此人正常点餐，正常结账，没有任何离谱操作。正因为太正常，麦门决定重点调查。':'此人正常点餐，没有任何离谱操作。正因为太正常，麦门决定重点调查。'):'目前看起来，你还挺正常。正因为太正常，麦门决定重点调查。';
 let name='正常得有点可疑',title='正常得有点可疑',summary=normal,customMetrics=null;
 const choose=(n,text)=>{name=n;title=n;summary=text};
 if(s.preference?.burger>=3)choose('你搁这儿集邮呢？',achievementCopy.collector.text);
 if(s.cola>=4)choose('气泡俱乐部主持','想象中的气泡俱乐部开了个会：主持席留给你，因为其他气泡都去放假了。');
 if(hits('stabilizer'))choose('成年人的情绪稳定器',achievementCopy.stabilizer.text);
 if(s.heretic||s.diet){const item=a(s.heretic?'heretic':'diet');choose(item.name,item.text);}
 if(s.flips>=6)choose('当代纠结王','你和购物车的关系，比电视剧里的男女主角还复杂。建议先想清楚，再向汉堡作出承诺。');
 if(hits('collector'))choose(a('collector').name,a('collector').text);
 if(s.board)choose('你搁这儿进货呢？','不是哥们，你搁这儿进货呢？');
 if(hits('godot'))choose(a('godot').name,a('godot').text);
 if(s.bigClear)choose('葛朗台在世','你曾经拥有整个麦门。后来你把它全部删除了。本次最大成就：本轮游戏扣款仍为零。');
 if(hits('nobel'))choose(a('nobel').name,a('nobel').text);
 if(hits('mengmu'))choose('搬家大师','孟母三迁是为了教育。你搬家是为了吃饭。建议下次先决定住哪儿。');
 if(hits('merit'))choose(a('merit').name,a('merit').text);
 if(hits('united')){choose(a('united').name,a('united').text);customMetrics=[['商品多样性','SSS'],['餐品大类',String(world.maxFamilies||0)+'类'],['决策风格','先开会再吃'],['游戏扣款','¥0']];}
 if(hits('colaChair')){choose('气泡俱乐部主持','想象中的气泡俱乐部开了个会：主持席留给你，因为其他气泡都去放假了。');customMetrics=[['资产管理等级','SSS'],['气泡俱乐部','1人'],['反对票','0票'],['累计可乐',String(s.cola)+'份']];}
 if(hits('marketCrash')||s.bigClear){choose('葛朗台在世',s.bigClear?'你曾经拥有整个麦门。后来你把它全部删除了。本次最大成就：本轮游戏扣款仍为零。':a('marketCrash').text);customMetrics=[['精神购买力',s.peak>=50000?'SSS+':'SSS'],['本轮最高资产','¥'+(s.peak/100).toFixed(2)],['资产撤退速度',world.crash?world.crash.duration.toFixed(1)+'秒':'手动归零'],['游戏扣款','¥0']];}
 if(hits('romanceFraud')||hits('seaking')){if(hits('romanceFraud')){const rel=Object.values(world.relationships||{}).filter(r=>r.stage>=6).sort((x,y)=>(y.adds+y.deletes)-(x.adds+x.deletes))[0];const item=viewCopy(badges.find(b=>b.id==='romanceFraud'),rel?{romance:rel}:{});choose(item.name,item.text);}else choose('麦门海王',viewCopy(badges.find(b=>b.id==='seaking'),{burgerCount:world.burgerAdded?.length}).text);const rels=Object.values(world.relationships||{}),adds=rels.reduce((n,r)=>n+r.adds,0),deleted=rels.reduce((n,r)=>n+r.deletes,0);customMetrics=[['感情兑现率',String(adds?Math.round(Math.max(0,adds-deleted)/adds*100):0)+'%'],['关系档案',String(world.burgerAdded?.length||0)+'个汉堡'],['完全删除',String(world.burgerDeleted?.length||0)+'个汉堡'],['游戏扣款','¥0']];}
 const unlocked=[...new Set(s.roundUnlocks||[])].map(id=>badges.find(a=>a.id===id)).filter(a=>a&&owned[a.id]);const highest=unlocked.slice().sort((a,b)=>awardPriority(b)-awardPriority(a))[0];
 const pref=Object.entries(s.preference||{}).sort((a,b)=>b[1]-a[1])[0];const labels={burger:'汉堡',fries:'薯条',ice:'冰淇淋',cola:'可乐',coffee:'咖啡',apple:'苹果片',chicken:'炸鸡',water:'矿泉水'};
 return {name,title,summary,highestRarity:highest?.rarity||null,unlockCount:unlocked.length,specialEvents:unlocked.filter(a=>rarityRank(a.rarity)>=2).sort((a,b)=>awardPriority(b)-awardPriority(a)).slice(0,2).map(a=>a.name),metrics:customMetrics||[['精神购买力',s.peak>=50000?'SSS+':s.peak>=30000?'SSS':s.peak>=10000?'S':s.adds?'正常':'尚未加购'],['购物车撤退能力',s.bigClear?'世界级':s.removes>=3?'熟练':'尚未撤退'],['食欲稳定性',s.flips>=6?'纠结中':s.flips?'横跳中':'稳定'],['游戏扣款','¥0']],evidence:`加购 ${s.adds} · 减购 ${s.removes} · 换配 ${s.swaps} · 结算 ${s.payments}`,peak:s.peak,clears:s.clears,paid:s.payments,preference:pref?labels[pref[0]]||'多元派':'尚未表态',patterns:patterns.length,storyEvidence:(world.trace||[]).filter(x=>x.plot!=='aside').slice(-2).map(x=>x.text)};
}
