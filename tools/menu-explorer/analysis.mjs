// Local analysis only. No source names, IDs, prices, image URLs or raw records leave this module.
export class ExplorerError extends Error{constructor(code){super(code);this.code=code}}
export function normalizeToken(value){
 if(typeof value!=='string')throw new ExplorerError('MISSING_TOKEN');
 let token=value.trim();for(let i=0;i<20&&/^Bearer\s+/i.test(token);i++)token=token.replace(/^Bearer\s+/i,'').trim();
 if(!token||/^Bearer$/i.test(token))throw new ExplorerError('MISSING_TOKEN');
 // Never silently delete internal spaces: a pasted invalid secret must be rejected locally.
 if(!/^[\x21-\x7e]+$/.test(token)||/\s/.test(token))throw new ExplorerError('INVALID_TOKEN_FORMAT');
 return token;
}
export function unpackMenu(result){
 if(result?.isError)throw new ExplorerError('TOOL_ERROR');
 let envelope=result?.structuredContent;
 if(!envelope){const text=result?.content?.find(x=>x.type==='text')?.text;if(typeof text!=='string'||text.length>4*1024*1024)throw new ExplorerError('INVALID_RESULT');try{envelope=JSON.parse(text)}catch{throw new ExplorerError('INVALID_RESULT')}}
 if(envelope?.success!==true||Number(envelope?.code)!==200)throw new ExplorerError('BUSINESS_NOT_SUCCESS');
 if(!Array.isArray(envelope.data?.categories))throw new ExplorerError('UNSUPPORTED_MENU_SHAPE');
 return envelope.data;
}
const labels={burger:'汉堡与卷',chicken:'炸鸡小食',fries:'薯条',ice:'冰淇淋',apple:'苹果片',corn:'玉米',water:'饮用水',cola:'可乐',coffee:'咖啡'};
function tags(name){const a=[];if(/汉堡|堡|卷|三明治/.test(name))a.push('burger');else if(/鸡/.test(name))a.push('chicken');for(const [tag,re]of [['fries',/薯条/],['ice',/冰淇淋|冰激凌|圣代|新地|麦旋风/],['apple',/苹果片/],['corn',/玉米/],['water',/矿泉水|纯净水|饮用水/],['cola',/可乐/],['coffee',/咖啡|拿铁|美式|卡布奇诺/]])if(re.test(name))a.push(tag);return a;}
export function analyzeMenu(data,simulation){
 if(!Array.isArray(data?.categories))throw new ExplorerError('UNSUPPORTED_MENU_SHAPE');
 const sets=Object.fromEntries(Object.keys(labels).map(k=>[k,new Set()])),seen=new Set();let categoryCount=0,itemsObserved=0,combos=0,unclassified=0;const categorySizes=[];
 for(const category of data.categories){
  const items=category.items??category.meals??category.products;
  if(!Array.isArray(items))throw new ExplorerError('UNSUPPORTED_CATEGORY_ITEMS');
  categoryCount++;categorySizes.push(items.length);
  for(const item of items){
   // Official observed shape: category.meals contains references; root meals is the detail index.
   const detail=data.meals&&typeof data.meals==='object'&&!Array.isArray(data.meals)?data.meals[String(item.code??item.c??item.id)]:undefined;
   const name=item.name??item.n??item.productName??item.mealName??detail?.name;
   if(typeof name!=='string'||name.length>240)throw new ExplorerError('UNSUPPORTED_ITEM_NAME');
   const key=String(item.code??item.c??item.id??item.productCode??name);
   if(seen.has(key))continue;seen.add(key);itemsObserved++;
   if(/套餐|件套|全家桶|分享餐|人餐|组合|拼盘|拼盒|全盒/.test(name)){combos++;continue;}
   const found=tags(name);if(!found.length)unclassified++;for(const tag of found)sets[tag].add(key);
  }
 }
 if(itemsObserved===0)throw new ExplorerError('EMPTY_MENU');
 const simulated=[...new Map(simulation.categories.flatMap(c=>c.items).map(f=>[f.c,f])).values()];
 const rules=[['薯条与冰淇淋','fries','ice'],['水果与炸鸡','apple','chicken'],['咖啡与冰淇淋','coffee','ice'],['果蔬与饮用水','apple','corn','water']];
 const opportunities=rules.map(([theme,...required])=>({theme,realMenuHasNamedSingles:required.every(k=>sets[k].size>0),simulationCanExplore:required.every(k=>simulated.some(f=>!f.combo&&f.t?.includes(k))),simulationFoods:required.map(k=>simulated.find(f=>!f.combo&&f.t?.includes(k))?.n||'未配置')}));
 return {kind:'local-aggregate-analysis-not-official-recommendation',categoryCount,uniqueItemsObserved:itemsObserved,categorySizes,comboNamesExcluded:combos,unclassifiedSingles:unclassified,coverage:Object.entries(labels).map(([key,label])=>({label,matchedSingleNames:sets[key].size})),opportunities,limits:['仅依据单品名称作保守类别匹配；不是营养分析。','未调用套餐详情，名称含套餐或拼盘的记录不用于推断组成。','组合探索只在H5原创菜单内进行，不建议据此实际购买，也不改变游戏数据。']};
}
export function queryArguments(schema,storeCode){
 if(!/^\d{1,16}$/.test(storeCode))throw new ExplorerError('INVALID_LOCAL_STORE_CODE');
 if(schema?.type!=='object'||!schema.properties)throw new ExplorerError('UNSUPPORTED_TOOL_SCHEMA');
 const known={storeCode,orderType:1,beType:1},args={};
 for(const name of schema.required||[])if(!(name in known))throw new ExplorerError('UNSUPPORTED_REQUIRED_ARGUMENT');
 for(const [key,value]of Object.entries(known)){const field=schema.properties[key];if(!field){if(key==='storeCode')throw new ExplorerError('UNSUPPORTED_TOOL_SCHEMA');continue;}if(field.type&&field.type!==typeof value&&!(field.type==='integer'&&Number.isInteger(value)))throw new ExplorerError('ARGUMENT_SCHEMA_CHANGED');if(field.enum&&!field.enum.includes(value))throw new ExplorerError('ARGUMENT_SCHEMA_CHANGED');args[key]=value;}
 return args;
}
