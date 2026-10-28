import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('database authorization, voting, moderation, private data and draws', async t => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email_confirmed_at timestamptz, is_anonymous boolean default false);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
    create function auth.role() returns text language sql as $$select current_setting('test.role',true)$$;
    grant usage on schema public,auth to anon,authenticated;
    grant execute on function auth.uid(),auth.role() to anon,authenticated;
  `);
  await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
  const a='00000000-0000-4000-8000-000000000001';
  const b='00000000-0000-4000-8000-000000000002';
  const manager='00000000-0000-4000-8000-000000000003';
  const rpc = async (name,params=[]) => {
    const call=`public.${name}(${params.map((_,i)=>`$${i+1}`).join(',')})`;
    if(name==='get_public_comments') return (await db.query(`select * from ${call}`,params)).rows;
    return (await db.query(`select ${call} as data`,params)).rows[0].data;
  };
  const runAs = async (role,uid='') => {
    await db.exec('reset role');
    await db.query("select set_config('test.uid',$1,false),set_config('test.role',$2,false)",[uid,role]);
    await db.exec(`set role ${role}`);
  };
  await runAs('anon');
  assert.equal((await rpc('public_catalog',[a])).drinks.length,24);
  for(const table of ['admin_users','site_settings','drinks','votes','comments','anonymous_messages','club_members','raffle_draws']) {
    await assert.rejects(db.query(`select * from public.${table}`), /permission denied/);
  }
  for(const [name,args] of [['admin_data',[]],['admin_set_setting',['results_visible','false']],['admin_set_drink',[10,'show_results',false]],['admin_moderate_comment',[a,'approved']],['admin_delete_member',[a]],['admin_draw_winner',[]]]) {
    await assert.rejects(rpc(name,args), /permission denied|Forbidden/);
  }
  await assert.rejects(rpc('vote_drink',[10,null,a]), /Invalid rating/);
  await assert.rejects(rpc('vote_drink',[10,1,null]), /identifier required/);
  await rpc('vote_drink',[10,1,a]);
  let item=(await rpc('public_catalog',[b])).drinks[0];
  assert.equal(item.likes,1); assert.equal(item.my_vote,0);
  await rpc('vote_drink',[10,-1,a]);
  item=(await rpc('public_catalog',[a])).drinks[0];
  assert.equal(item.total,1);assert.equal(item.dislikes,1);assert.equal(item.my_vote,-1);
  await rpc('vote_drink',[10,1,b]);
  assert.equal((await rpc('public_catalog',[a])).drinks[0].total,2);
  await rpc('vote_drink',[10,0,a]);
  assert.equal((await rpc('public_catalog',[a])).drinks[0].total,1);
  await rpc('send_comment',[10,'آزمایش','نظر آزمایشی',a]);
  assert.equal((await rpc('get_public_comments',[10])).length,0);
  await assert.rejects(rpc('send_comment',[10,'','نظر دوم',a]), /wait/);
  await rpc('send_message',['پیام خصوصی آزمایشی',a]);
  await assert.rejects(rpc('join_club',['تست','09120000000','',false,a]), /Consent/);
  await assert.rejects(rpc('join_club',['تست','invalid','',true,a]), /Invalid/);
  assert.equal(await rpc('join_club',['عضو آزمایشی','09120000000','testuser',true,a]),true);
  assert.equal(await rpc('join_club',['دیگری','09120000000','',true,b]),true);
  await runAs('authenticated', b);
  await assert.rejects(rpc('admin_data'), /Forbidden/);
  await db.exec('reset role');
  await db.query('insert into auth.users(id,email_confirmed_at) values($1,now());',[manager]);
  await db.query('insert into public.admin_users values($1)',[manager]);
  await runAs('authenticated',manager);
  let admin=await rpc('admin_data');
  assert.equal(admin.members.length,1);assert.equal(admin.messages.length,1);
  const comment=admin.comments[0];assert.equal(comment.status,'pending');
  await rpc('admin_moderate_comment',[comment.id,'approved']);
  assert.equal((await rpc('get_public_comments',[10])).length,1);
  await rpc('admin_set_drink',[10,'comments_visible',false]);
  assert.equal((await rpc('get_public_comments',[10])).length,0);
  await rpc('admin_set_drink',[10,'show_results',false]);
  assert.equal((await rpc('public_catalog',[b])).drinks[0].likes,null);
  await rpc('admin_set_drink',[10,'show_results',true]);
  await rpc('admin_set_setting',['results_visible','false']);
  assert.equal((await rpc('public_catalog',[b])).drinks[0].total,null);
  await rpc('admin_set_setting',['votes_enabled','false']);
  await runAs('anon');
  await assert.rejects(rpc('vote_drink',[11,1,a]), /unavailable/);
  await runAs('authenticated',manager);
  assert.equal((await rpc('admin_draw_winner')).phone,'09120000000');
  await assert.rejects(rpc('admin_draw_winner'), /No eligible/);
  await rpc('admin_delete_member',[admin.members[0].id]);
  assert.equal((await rpc('admin_data')).members.length,0);
  await db.exec('reset role');
  await db.query('update auth.users set email_confirmed_at=null where id=$1',[manager]);
  await runAs('authenticated',manager);
  await assert.rejects(rpc('admin_data'), /Forbidden/);
});
