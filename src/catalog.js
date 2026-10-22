export const categories = [], foods = new Map(), meals = {};
export async function loadCatalog(){
 const [a,b,images]=await Promise.all([fetch('./data/menu.json').then(r=>{if(!r.ok)throw new Error('菜单不可用');return r.json()}),fetch('./data/meals.json').then(r=>{if(!r.ok)throw new Error('套餐不可用');return r.json()}),fetch('./data/image-cache.json').then(r=>r.ok?r.json():{}).catch(()=>({}))]);
 for(const c of a.categories){categories.push({id:c.id,name:c.name,ids:c.items.map(f=>f.c)});for(const f of c.items){if(!foods.has(f.c))foods.set(f.c,{id:f.c,name:f.n,price:Math.round(f.p*100),was:Math.round(f.p*100),image:images[f.img]||f.img,tags:f.t||[],family:f.family||null,category:c.id,combo:!!f.combo});}}
 for(const [id,m]of Object.entries(b)){meals[id]={image:images[m.image]||m.image,description:m.desc,groups:m.rounds.map(r=>({name:r.name,count:r.qty||1,options:r.choices.map(o=>({id:o.code,name:o.name,diff:Math.round(o.diff*100),default:!!o.isDefault,image:o.image}))}))};}
 // Authored game catalog only; no imported snapshots or remote image URLs.
 return {source:a.meta};
}
export const price = cents => '¥'+(cents/100).toFixed(2).replace(/\.00$/,'');
export function groupDefaults(id){return meals[id]?.groups.map(g=>Array(g.count).fill(Math.max(0,g.options.findIndex(o=>o.default))))||[];}
export function configurationPrice(id,picks){const f=foods.get(id);if(!f)return 0;const m=meals[id];return f.price+(m?m.groups.reduce((s,g,i)=>s+(picks[i]||[]).reduce((n,j)=>n+(g.options[j]?.diff||0),0),0):0);}
export function components(line){const f=foods.get(line.food);const m=meals[line.food];if(!f)return [];if(!m)return [{name:f.name,code:f.id,count:line.quantity}];return m.groups.flatMap((g,i)=>(line.picks[i]||[]).map(j=>({name:g.options[j].name,code:g.options[j].id,count:line.quantity})));}
