import {TASK_POOLS} from './master-tasks.mjs';
const master=(id,name,pool,combat,slayer,base,block,quest='',note='')=>({id,name,pool,combat,slayer,base,block,skip:pool==='mortimer'?100:30,blockGroup:pool==='spria'?'turael':pool,counter:pool==='krystilia'?'wilderness':pool==='mortimer'?'mortimer':'normal',quest,note});
export const MASTERS=[
 master('turael','Turael','turael',0,0,0,40,'','Burthorpe · replaced by Aya after While Guthix Sleeps. Fresh tasks build the normal streak for 0 points. Replacing another master’s task resets the normal streak.'),
 master('aya','Aya','turael',0,0,0,40,'wgs','Burthorpe · Turael’s replacement, with the same tasks and block list. Replacement tasks reset the normal streak.'),
 master('spria','Spria','spria',0,0,0,40,'porcine','Draynor Village · includes sourhogs; shares Turael/Aya’s block list. Cannot replace another master’s task.'),
 master('krystilia','Krystilia','krystilia',0,2,25,100,'','Edgeville · Wilderness kills only, including boss tasks. Uses a separate Wilderness streak. Combat level filters do not apply.'),
 master('mazchna','Mazchna','mazchna',20,0,6,50,'priest','Canifis · requires Priest in Peril.'),
 master('achtryn','Achtryn','mazchna',20,0,6,50,'priest','Temporary replacement for Mazchna during While Guthix Sleeps; same tasks, points and blocks.'),
 master('vannaka','Vannaka','vannaka',40,0,8,60,'','Edgeville Dungeon · 40 combat.'),
 master('chaeldar','Chaeldar','chaeldar',70,0,10,70,'lost','Zanaris · 70 combat and Lost City.'),
 master('konar','Konar quo Maten','konar',75,0,18,80,'','Mount Karuulm · kills must be in the assigned location. Elite Kourend & Kebos reward raises base points to 20.'),
 master('nieve','Nieve','nieve',85,0,12,90,'','Tree Gnome Stronghold · replaced by Steve after Monkey Madness II. Elite Western Provinces reward raises base points to 15.'),
 master('steve','Steve','nieve',85,0,12,90,'mm2','Nieve’s replacement after Monkey Madness II; shares her tasks and block list.'),
 master('duradel','Duradel','duradel',100,50,15,100,'shilo','Shilo Village · replaced by Kuradal after While Guthix Sleeps. Same task weights and blocks.'),
 master('kuradal','Kuradal','duradel',100,50,15,100,'wgs','Shilo Village · Duradel’s replacement after While Guthix Sleeps. 100 combat and 50 Slayer, or a Slayer cape, plus access.'),
 master('mortimer','Mortimer','mortimer',100,70,0,120,'fallen','Wyrmscraig Cavern · Fallen From Grace access. Choose 2 offers, or 3 after 50 completions. Separate counter; no normal streak bonus. Only 2 block slots; cannot Turael reset.')
];
export const getMaster=p=>MASTERS.find(m=>m.id===(typeof p==='string'?p:p?.master))||MASTERS.find(m=>m.id==='kuradal');
export const taskPool=p=>TASK_POOLS[getMaster(p).pool];
export const allTasks=()=>Object.values(TASK_POOLS).flat();
export const basePoints=p=>getMaster(p).pool==='konar'&&p.kourendElite?20:getMaster(p).pool==='nieve'&&p.westernElite?15:getMaster(p).base;
export const blockSlots=p=>getMaster(p).pool==='mortimer'?2:Math.min(6,Math.floor(p.questPoints/50))+(p.elite?1:0);
export function pointReward(completed,p={}){const m=getMaster(p);if(m.pool==='mortimer')return p.mortimerPoints||0;if(completed<5)return 0;const base=basePoints(p);for(const [n,x]of [[1000,50],[250,35],[100,25],[50,15],[10,5]])if(completed%n===0)return base*x;return base;}
export const averageReward=p=>basePoints(p)*1.775;
export function rememberMaster(p){const m=getMaster(p);p.masterBlocks={...p.masterBlocks,[m.blockGroup]:[...p.blocked]};p.masterPlans={...p.masterPlans,[m.pool]:{current:p.current,remaining:p.remaining,bossTask:p.bossTask,konarLocation:p.konarLocation||'',mortimerPoints:p.mortimerPoints||0}};p.streaks={normal:0,wilderness:0,mortimer:0,...p.streaks,[m.counter]:p.streak};return p;}
export function switchMaster(p,id){rememberMaster(p);const m=getMaster(id);p.master=m.id;const plan=p.masterPlans[m.pool]||{};p.blocked=[...(p.masterBlocks[m.blockGroup]||[])];p.current=plan.current||'';p.remaining=plan.remaining||0;p.bossTask=plan.bossTask||'';p.konarLocation=plan.konarLocation||'';p.mortimerPoints=plan.mortimerPoints||0;p.streak=p.streaks[m.counter]||0;return p;}
// Exact weighted sampling without replacement, with at most three offered tasks.
export function offerChance(target,active,p){const count=Math.min(active.length,p.streak>=50?3:2),total=active.reduce((n,t)=>n+t.weight,0);if(!total||!active.includes(target))return 0;let absent=0;function walk(left,weight,used,prob){if(!left){absent+=prob;return;}for(const t of active)if(t!==target&&!used.has(t)){used.add(t);walk(left-1,weight-t.weight,used,prob*t.weight/weight);used.delete(t);}}walk(count,total,new Set(),1);return Math.max(0,Math.min(1,1-absent));}
export function replacementReset(p,task){const from=getMaster(p);if(from.counter==='mortimer'||from.pool==='spria'||from.pool==='turael'||TASK_POOLS.turael.some(t=>t.id===task)&&!p.masterBlocks?.turael?.includes(task))return null;return {normal:from.counter==='normal'?0:p.streaks?.normal||0,wilderness:from.counter==='wilderness'?0:p.streaks?.wilderness||0,mortimer:p.streaks?.mortimer||0};}
