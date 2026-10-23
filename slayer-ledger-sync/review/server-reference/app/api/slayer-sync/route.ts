import {env} from 'cloudflare:workers';
import {readSlayerSyncRequest} from '../../../lib/slayer-sync-api.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return readSlayerSyncRequest(request,env.DB);}
export async function POST(request:Request){return readSlayerSyncRequest(request,env.DB);}
export async function DELETE(request:Request){return readSlayerSyncRequest(request,env.DB);}
