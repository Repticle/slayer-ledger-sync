// Only this explicitly named data crosses the RuneLite pairing boundary.
import {MASTERS,taskPool,getMaster,rememberMaster,switchMaster} from './masters.mjs';
import {BOSSES} from './bosses-data.mjs';
const norm=s=>String(s||'').toLowerCase().replaceAll('’',"'").replace(/[^a-z0-9]/g,'');
export const SYNC_SCHEMA='slayer-ledger-sync-v1';
export const STALE_MS=120000;
export function cleanSlayerSnapshot(raw){
 if(!raw||raw.schema!==SYNC_SCHEMA||typeof raw.username!=='string'||!/^[-a-zA-Z0-9 _]{1,12}$/.test(raw.username))throw Error('Invalid Slayer snapshot.');
 const p={schema:SYNC_SCHEMA,username:raw.username.replaceAll('_',' ').trim(),capturedAt:raw.capturedAt,loggedIn:raw.loggedIn===true};
 const n=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max?v:null;
 if(!Number.isSafeInteger(p.capturedAt)||p.capturedAt<0)throw Error('Invalid capture time.');
 if(!p.loggedIn)return p;
 p.masterId=n(raw.masterId,30);p.taskId=n(raw.taskId,1000);p.remaining=n(raw.remaining,10000);p.initial=n(raw.initial,10000);p.points=n(raw.points,2000000);
 p.task=typeof raw.task==='string'?raw.task.slice(0,100):'';p.location=typeof raw.location==='string'?raw.location.slice(0,160):'';
 p.streaks=Object.fromEntries(['normal','wilderness','mortimer'].map(k=>[k,n(raw.streaks?.[k],1000000)]));
 p.modifier={id:n(raw.modifier?.id,20),value:n(raw.modifier?.value,10000),negative:raw.modifier?.negative===true};
 if(p.remaining===null||p.taskId===null||p.points===null||Object.values(p.streaks).some(v=>v===null))throw Error('Missing Slayer values.');
 if(p.remaining>0&&!p.task)throw Error('Task name is not ready.');
 return p;
}
// Game master IDs follow the game cache SlayerMaster table, not RuneLite NPC IDs.
export const GAME_MASTERS={1:'turael',2:'mazchna',3:'vannaka',4:'chaeldar',5:'duradel',6:'nieve',7:'krystilia',8:'konar',9:'spria',10:'mortimer'};
export function resolveSlayerTask(s,p){
 let master=GAME_MASTERS[s.masterId];if(!master)return {error:'The game’s Slayer master ID is not recognised. Your imported task was kept separate.'};
 if(master==='turael'&&p.quests.includes('wgs'))master='aya';if(master==='duradel'&&p.quests.includes('wgs'))master='kuradal';if(master==='nieve'&&p.quests.includes('mm2'))master='steve';
 const pool=taskPool(master);if(!s.remaining)return {master,current:'',bossTask:'',remaining:0,location:'',mortimerPoints:0};
 const aliases={bloodvelds:'bloodveld',kalphites:'kalphite',monkey:'monkeys',suqah:'suqahs',waterfiend:'waterfiends',metaldragons:'metal-dragons',spiritualmages:'spiritual-creatures',spiritualrangers:'spiritual-creatures',spiritualwarriors:'spiritual-creatures'};
 let t=pool.find(t=>norm(t.name)===norm(s.task)||norm(t.id)===norm(s.task)||t.id===aliases[norm(s.task)]),bossTask='';
 if(s.taskId===98){const boss=BOSSES.find(b=>norm(b.name.split(' / ')[0])===norm(s.task)||norm(b.name)===norm(s.task)||({'barrows':'barrowsbrothers','thermy':'thermonuclearsmokedevil','kril':'kriltsutsaroth','kbd':'kingblackdragon','archaeologist':'crazyarchaeologist'}[b.id]===norm(s.task)));t=pool.find(t=>t.id==='boss');bossTask=boss?.id||'';if(!bossTask)return {error:'This boss task is not yet recognised by the planner.'};}
 if(!t)return {error:'RuneLite reported “'+s.task+'”, which is not mapped in this master’s task pool. No task was guessed.'};
 const location=getMaster(master).pool==='konar'?(t.locations||[]).find(x=>norm(x)===norm(s.location))||'':'';
 return {master,current:t.id,bossTask,remaining:s.remaining,location,mortimerPoints:getMaster(master).pool==='mortimer'&&s.modifier.id===1?s.modifier.value:0};
}
export function applySlayerSnapshot(profile,s,{username,now=Date.now(),receivedAt=0,followMaster=true}={}){
 if(!s||!s.loggedIn)return {profile,error:'RuneLite is logged out. Showing the last saved planner snapshot.'};
 if(norm(username)!==norm(s.username))return {profile,error:'The Slayer character does not match the Group Ironmen character. No values were applied.'};
 if(!receivedAt||now-receivedAt>STALE_MS||now-s.capturedAt>STALE_MS)return {profile,error:'Slayer data is older than two minutes. Reconnect RuneLite before using it.'};
 const mapped=resolveSlayerTask(s,profile);if(mapped.error)return {profile,error:mapped.error};
 const p=structuredClone(profile);if(followMaster)switchMaster(p,mapped.master);const matches=getMaster(p).pool===getMaster(mapped.master).pool;p.current=matches?mapped.current:'';p.bossTask=matches?mapped.bossTask:'';p.remaining=matches?mapped.remaining:0;p.konarLocation=matches?mapped.location:'';p.mortimerPoints=matches?mapped.mortimerPoints:0;p.points=s.points;p.streaks={...s.streaks};p.streak=s.streaks[getMaster(p).counter];rememberMaster(p);
 return {profile:p,error:'',taskName:s.task};
}

export function cleanSlayerSource(raw){try{const snapshot=raw?.snapshot?cleanSlayerSnapshot(raw.snapshot):null;return {snapshot,username:typeof raw?.username==='string'?raw.username.slice(0,12):'',receivedAt:Number.isSafeInteger(raw?.receivedAt)?raw.receivedAt:0};}catch{return {snapshot:null,username:'',receivedAt:0};}}
export function slayerImportStatus(state,p,now=Date.now()){const source=cleanSlayerSource(state.slayer);if(!source.snapshot)return {valid:false,error:'Pair the RuneLite companion to import your Slayer task, counts and points.'};const result=applySlayerSnapshot(p,source.snapshot,{username:state.source.username||source.username,receivedAt:source.receivedAt,now,followMaster:false});if(result.error)return {valid:false,error:result.error};const mapped=resolveSlayerTask(source.snapshot,p);return {valid:true,mapped,source,viewMatches:getMaster(p).pool===getMaster(mapped.master).pool,error:''};}
