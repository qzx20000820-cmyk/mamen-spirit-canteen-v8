export const rarityOrder=['C','B','A','S','SR','SSR'];
export const rarityThemes={C:{name:'普通',animation:'toast',hintTier:'明确提示'},B:{name:'进阶',animation:'glow',hintTier:'行为方向'},A:{name:'稀有',animation:'flip',hintTier:'组合谜语'},S:{name:'史诗',animation:'gold',hintTier:'文学线索'},SR:{name:'超稀有',animation:'redgold',hintTier:'模糊剪影'},SSR:{name:'传说',animation:'legend',hintTier:'完全隐藏'}};
export const rarityRank=r=>rarityOrder.indexOf(r);
export const rarityLabel=r=>r+'级 · '+rarityThemes[r].name;
export const gradeById={fries:'B',heretic:'A',diet:'A',miser:'SR',cola:'B',quantum:'B',custom:'B',recall:'B',nobel:'SR',godot:'S',purist:'A',archaeologist:'B',traitor:'S',threebody:'A',stabilizer:'A',copy:'B',collector:'S',fishbear:'A',mengmu:'S',schrodinger:'B',merit:'A',united:'S',menuarchaeologist:'B',marketCrash:'SSR',philosopher:'S',emperor:'B',newton:'A',seaking:'SR',ipo:'SR',romanceFraud:'SSR',colaChair:'S',initiate:'C',friesNovice:'C',colaRegistrar:'C',cornGodfather:'C',appleWellness:'C',heartIntern:'C'};
const clues={initiate:'成功加入一份喜欢的餐品。',friesNovice:'试试点一份薯条。',colaRegistrar:'登记一份会冒泡的液体资产。',cornGodfather:'农业文明，也可以从一杯玉米开始。',appleWellness:'菜单里的苹果，正在等待你的选择。',heartIntern:'不喜欢了？试试减掉一份。',fries:'信仰，也许不止一份。',cola:'气泡的轨迹，也许藏着线索。',quantum:'加与减之间，理性反复横跳。',custom:'标准套餐，也可以有你的意见。',recall:'收回几份愿望，直到购物车安静下来。',archaeologist:'不同鸡块，藏着不同文明。',copy:'你的手指，好像发现了快捷键。',menuarchaeologist:'答案，也许在菜单的最后一栏。',emperor:'空无一物，也值得再看一眼。',schrodinger:'让同一份食欲出现，又消失。',heretic:'冰与火之外，还有甜与咸。',diet:'水果正在替油锅撰写免责声明。',purist:'两片面包之间，也许不需要配角。',threebody:'三个不同的引力中心，可以组成一顿饭。',stabilizer:'让清醒与冰凉的快乐坐在同一桌。',fishbear:'海洋与牧场，也许可以达成协议。',merit:'这局到底谁组的？',newton:'忙碌之后，数字似乎又回到了原处。',godot:'戈多迟迟不来，按钮也还在等待。',traitor:'组织记得你反复离开的背影。',collector:'博物馆里，展品不能全长一样。',mengmu:'孟母知道，目的地可以改变故事。',united:'各国代表，对蘸酱归属仍有争议。',philosopher:'尼采认为，凝视也许比下单更重要。',colaChair:'一个人的董事会，正在缓慢成形。',miser:'真正的富豪，也懂得放下。',nobel:'瑞典方面尚未回应。',seaking:'有些承诺，从未被兑现。',ipo:'某个想象力项目，传来了挂牌的风声。'};
export const hintFor=a=>a.rarity==='SSR'?'神秘徽章':clues[a.id]||a.hint||'继续探索，也许会有回应。';
export const growthLines=[
 {id:'fries',name:'薯门修行',ids:['friesNovice','fries','heretic'],icon:'fries'},
 {id:'cola',name:'可乐金融帝国',ids:['colaRegistrar','cola','colaChair'],icon:'cola'},
 {id:'romance',name:'汉堡情感档案',ids:['heartIntern','schrodinger','romanceFraud'],icon:'brokenheart'},
 {id:'finance',name:'精神金融危机',ids:['miser','marketCrash'],icon:'crash',prologue:'精神资产的增长，只是一切的开始。'}
];
export function growthFor(id,owned){const line=growthLines.find(l=>l.ids.includes(id));if(!line)return null;const count=line.ids.filter(k=>owned[k]).length;return {...line,count,complete:count===line.ids.length,next:line.ids.find(k=>!owned[k])||null};}
