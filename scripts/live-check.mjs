import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { flatDrinks } from '../assets/data.js';
const scope={window:{}};
vm.runInNewContext(await readFile(new URL('../assets/config.js',import.meta.url),'utf8'),scope);
const cfg=scope.window.UNICAFE_CONFIG;
const apiUrl=process.env.API_URL || cfg.apiUrl || cfg.supabaseUrl;
async function call(name,args={},expectSuccess=true) {
 const r=await fetch(`${apiUrl}/rest/v1/rpc/${name}`,{method:'POST',headers:{Origin:'https://unicafeznu.ir',apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(20000)});
 const text=await r.text(); const d=text ? JSON.parse(text) : null;
 if(expectSuccess) assert.ok(r.ok, `${name}: ${r.status} ${d?.message}`);
 else assert.ok(!r.ok, `${name} unexpectedly allowed`);
 return d;
}
const a=randomUUID(), b=randomUUID();
const get=async id=>(await call('public_catalog',{p_browser:id}));
const initial=await get(b);
assert.deepEqual(initial.drinks.map(d=>[d.code,d.name]),flatDrinks.map(d=>[d.code,d.name]));
assert.ok(!JSON.stringify(initial).includes('browser_id'));
for(const table of ['club_members','anonymous_messages','admin_users','votes']) {
 const r=await fetch(`${apiUrl}/rest/v1/${table}?select=*`,{headers:{apikey:cfg.supabaseAnonKey},signal:AbortSignal.timeout(20000)});
 assert.ok(!r.ok,`${table} exposed`);
}
await call('admin_data',{},false);
await call('admin_draw_winner',{},false);
const first=initial.drinks[0];
assert.ok(initial.settings.votes_enabled && initial.settings.results_visible && first.votes_enabled && first.show_results,'Voting/results must be enabled for this smoke test');
try {
 await call('vote_drink',{p_browser:a,p_code:first.code,p_value:1});
 let d=(await get(b)).drinks[0];
 assert.equal(d.total,first.total+1);assert.equal(d.likes,first.likes+1);assert.equal(d.my_vote,0);
 assert.equal((await get(a)).drinks[0].my_vote,1);
 await call('vote_drink',{p_browser:a,p_code:first.code,p_value:-1});
 d=(await get(b)).drinks[0];assert.equal(d.total,first.total+1);assert.equal(d.dislikes,first.dislikes+1);assert.equal(d.likes,first.likes);
} finally { await call('vote_drink',{p_browser:a,p_code:first.code,p_value:0}); }
assert.equal((await get(b)).drinks[0].total,first.total);
console.log('LIVE PASS: exact 24 products; two independent browser IDs; add/switch/remove votes; totals; private-table denial; admin RPC denial. Test votes removed.');
