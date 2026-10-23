import {cleanSlayerSnapshot} from '../public/slayer-sync-data.mjs';
const DAY=86400000;
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const normalize=s=>s.replaceAll('_',' ').trim().toLowerCase();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export async function readSlayerSyncRequest(request,db,{now=Date.now()}={}){
 if(!db)return json({error:'Slayer sync storage is not available yet.'},503);
 const sameOrigin=request.headers.get('origin')===new URL(request.url).origin;
 if(!['POST','GET','DELETE'].includes(request.method))return json({error:'Method not allowed.'},405);
 let body;if(request.method==='POST'){if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Expected JSON.'},415);try{if(Number(request.headers.get('content-length'))>8192)throw Error();const text=await request.text();if(text.length>8192)throw Error();body=JSON.parse(text);}catch{return json({error:'Invalid request body.'},400);}}
 try{
 if(body?.action==='create'){
  if(!sameOrigin)return json({error:'Create connections from Slayer Ledger.'},403);
  const username=typeof body.username==='string'?body.username.replaceAll('_',' ').trim():'';if(!/^[-a-zA-Z0-9 ]{1,12}$/.test(username))return json({error:'Enter your OSRS character name.'},400);
  const id=hex(crypto.getRandomValues(new Uint8Array(16))),readSecret=random(),writeSecret=random();
  await db.prepare('DELETE FROM slayer_connections WHERE expires_at < ?').bind(now).run();
  await db.prepare('INSERT INTO slayer_connections (id,username,read_hash,write_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)').bind(id,normalize(username),await hash(readSecret),await hash(writeSecret),now,now+180*DAY).run();
  return json({readKey:'slr1_'+id+'.'+readSecret,writeKey:'slw1_'+id+'.'+writeSecret,username,expiresAt:now+180*DAY},201);
 }
 const auth=request.headers.get('authorization')||'',match=/^Bearer (sl[rw]1)_([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(auth);if(!match)return json({error:'Pairing key is required.'},401);
 const [,kind,id,secret]=match,role=kind==='slr1'?'read':'write';
 if((request.method==='GET'||request.method==='DELETE')&&role!=='read'||request.method==='POST'&&role!=='write')return json({error:'This key does not permit that operation.'},403);
 if(request.method==='DELETE'&&!sameOrigin)return json({error:'Open this connection from Slayer Ledger.'},403);
 const row=await db.prepare('SELECT * FROM slayer_connections WHERE id = ?').bind(id).first();if(!row||row.expires_at<now||await hash(secret)!==row[role+'_hash'])return json({error:'Pairing key was rejected or revoked.'},401);
 if(request.method==='DELETE'){await db.prepare('DELETE FROM slayer_connections WHERE id = ?').bind(id).run();return json({revoked:true});}
 if(request.method==='GET')return json({username:row.username,snapshot:row.snapshot?JSON.parse(row.snapshot):null,receivedAt:row.received_at,expiresAt:row.expires_at});
 let s;try{s=cleanSlayerSnapshot(body);}catch(e){return json({error:e.message},400);}
 if(normalize(s.username)!==row.username)return json({error:'This key belongs to a different character.'},403);
 if(s.capturedAt>now+120000||s.capturedAt<now-120000)return json({error:'Capture time is outside the two-minute sync window. Check the computer clock.'},400);
 const result=await db.prepare('UPDATE slayer_connections SET snapshot=?,captured_at=?,received_at=?,expires_at=? WHERE id=? AND captured_at < ?').bind(JSON.stringify(s),s.capturedAt,now,now+180*DAY,id,s.capturedAt).run();
 return result.meta?.changes===0?json({error:'An older or duplicate update was ignored.'},409):json({accepted:true,receivedAt:now});
 }catch{return json({error:'Slayer sync is temporarily unavailable.'},503);}
}
