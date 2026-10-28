begin;
-- UniCafe schema: run ONCE in the SQL Editor of a new Supabase project.
-- Visitors use a random browser UUID, never Supabase anonymous Auth.
-- Browser IDs are casual deduplication, not proof of a unique person.
-- Direct table access is denied to browser roles; vetted RPC functions are the API.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.site_settings (
  id integer primary key default 1 check (id=1),
  polls_visible boolean not null default true,
  votes_enabled boolean not null default true,
  results_visible boolean not null default true,
  comments_visible boolean not null default true,
  comments_enabled boolean not null default true,
  club_enabled boolean not null default true,
  leaderboard_enabled boolean not null default true,
  min_votes integer not null default 5 check (min_votes between 1 and 100000),
  support_phone text not null default '',
  support_whatsapp text not null default '',
  support_hours text not null default ''
);
insert into public.site_settings(id) values(1) on conflict do nothing;
create table if not exists public.drinks (
  code integer primary key,
  name text not null check (char_length(name) between 1 and 90),
  category text not null check (category in ('robusta','arabica','hazelnut','decaf','tea')),
  category_order smallint not null,
  item_order smallint not null,
  is_visible boolean not null default true,
  votes_enabled boolean not null default true,
  show_results boolean not null default true,
  comments_enabled boolean not null default true,
  comments_visible boolean not null default true
);
insert into public.drinks(code,name,category,category_order,item_order) values
(10,'دبل اسپرسو','robusta',0,0),(11,'اسپرسو','robusta',0,1),(12,'لانگ','robusta',0,2),
(13,'ماکیاتو','robusta',0,3),(14,'کاپوچینو','robusta',0,4),(15,'موکاچینو','robusta',0,5),
(21,'اسپرسو','arabica',1,0),(22,'لانگ','arabica',1,1),(23,'کافه لاته','arabica',1,2),(24,'کاپوچینو با شیر اضافه','arabica',1,3),
(17,'لاته 70/30','hazelnut',2,0),(18,'کاپوچینو 30/70','hazelnut',2,1),(44,'شکلات فندقی','hazelnut',2,2),(20,'موکاچینو 70/30','hazelnut',2,3),
(31,'اسپرسو','decaf',3,0),(32,'آمریکانو','decaf',3,1),(33,'لاته ماکیاتو','decaf',3,2),(34,'کاپوچینو با شیر اضافه','decaf',3,3),(35,'موکاچینو','decaf',3,4),
(41,'چای ماسالا','tea',4,0),(42,'چای کرک','tea',4,1),(37,'شیر','tea',4,2),(38,'هات چاکلت','tea',4,3),(39,'کرم شکلات','tea',4,4)
on conflict(code) do nothing;

create table if not exists public.votes (
  browser_id uuid not null,
  drink_code integer not null references public.drinks(code),
  value smallint not null check(value in (-1,1)),
  updated_at timestamptz not null default now(),
  primary key(browser_id,drink_code)
);
create index if not exists votes_drink_idx on public.votes(drink_code,value);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  browser_id uuid not null,
  drink_code integer not null references public.drinks(code),
  display_name text not null default '' check(char_length(display_name)<=40),
  body text not null check(char_length(body) between 3 and 700),
  status text not null default 'pending' check(status in('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists comments_visible_idx on public.comments(drink_code,status,created_at desc);
create index if not exists comments_rate_idx on public.comments(browser_id,created_at desc);
create table if not exists public.anonymous_messages (
  id uuid primary key default gen_random_uuid(),
  browser_id uuid not null,
  body text not null check(char_length(body) between 5 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists messages_rate_idx on public.anonymous_messages(browser_id,created_at desc);
create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  browser_id uuid not null,
  full_name text not null check(char_length(full_name) between 2 and 80),
  phone text not null unique check(phone ~ '^09[0-9]{9}$'),
  telegram_id text check(telegram_id is null or telegram_id ~ '^@[A-Za-z0-9_]{5,32}$'),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.raffle_draws (
  id uuid primary key default gen_random_uuid(),
  winner_id uuid references public.club_members(id) on delete set null,
  drawn_by uuid not null references auth.users(id),
  eligible_count integer not null,
  drawn_at timestamptz not null default now()
);

-- Explicitly lock every underlying relation, including settings and public counts.
do $$
declare t text;
begin
  foreach t in array array['admin_users','site_settings','drinks','votes','comments','anonymous_messages','club_members','raffle_draws'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from anon, authenticated',t);
  end loop;
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
   and exists(select 1 from public.admin_users a where a.user_id=auth.uid())
   and auth.role()='authenticated'
   and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.is_anonymous is false)
$$;

-- Public read, filtered at the API boundary. Never exposes user IDs.
create or replace function public.public_catalog(p_browser uuid default null) returns jsonb
language sql stable security definer set search_path = '' as $$
select jsonb_build_object(
  'settings', (select to_jsonb(s)-'id' from public.site_settings s where s.id=1),
  'drinks', coalesce((select jsonb_agg(jsonb_build_object(
    'code',d.code,'name',d.name,'category',d.category,'category_order',d.category_order,'item_order',d.item_order,
    'is_visible',d.is_visible,'votes_enabled',d.votes_enabled,'show_results',d.show_results,
    'comments_enabled',d.comments_enabled,'comments_visible',d.comments_visible,
    'my_vote',coalesce((select v.value from public.votes v where v.browser_id=p_browser and v.drink_code=d.code),0),
    'likes',case when s.polls_visible and s.results_visible and d.show_results then (select count(*) from public.votes v where v.drink_code=d.code and v.value=1) else null end,
    'dislikes',case when s.polls_visible and s.results_visible and d.show_results then (select count(*) from public.votes v where v.drink_code=d.code and v.value=-1) else null end,
    'total',case when s.polls_visible and s.results_visible and d.show_results then (select count(*) from public.votes v where v.drink_code=d.code) else null end
  ) order by d.category_order,d.item_order) from public.drinks d where d.is_visible), '[]'::jsonb)
) from public.site_settings s where s.id=1
$$;

create or replace function public.get_public_comments(p_code integer)
returns table(name text, body text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select c.display_name,c.body,c.created_at
 from public.comments c join public.drinks d on d.code=c.drink_code cross join public.site_settings s
 where c.drink_code=p_code and c.status='approved'
   and d.is_visible and d.comments_visible and s.comments_visible and s.id=1
 order by c.created_at desc limit 100
$$;

create or replace function public.vote_drink(p_code integer,p_value integer,p_browser uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if p_browser is null then raise exception 'Browser identifier required'; end if;
 if p_value is null or p_value not in (-1,0,1) then raise exception 'Invalid rating'; end if;
 if not exists(select 1 from public.drinks d cross join public.site_settings s
   where d.code=p_code and d.is_visible and d.votes_enabled and s.polls_visible and s.votes_enabled and s.id=1)
 then raise exception 'Voting unavailable'; end if;
 if p_value=0 then
   delete from public.votes where browser_id=p_browser and drink_code=p_code;
 else
   insert into public.votes(browser_id,drink_code,value) values(p_browser,p_code,p_value)
   on conflict(browser_id,drink_code) do update set value=excluded.value,updated_at=now();
 end if;
end $$;

create or replace function public.send_comment(p_code integer,p_name text,p_body text,p_browser uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if p_browser is null then raise exception 'Browser identifier required'; end if;
 p_body := btrim(coalesce(p_body,'')); p_name := btrim(coalesce(p_name,''));
 if char_length(p_body) not between 3 and 700 or char_length(p_name)>40 then raise exception 'Invalid comment'; end if;
 if not exists(select 1 from public.drinks d cross join public.site_settings s
   where d.code=p_code and d.is_visible and d.comments_enabled and s.comments_enabled and s.id=1)
 then raise exception 'Comments disabled'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_browser::text, 1));
 if exists(select 1 from public.comments where browser_id=p_browser and created_at>now()-interval '20 seconds')
 then raise exception 'Please wait before commenting again'; end if;
 insert into public.comments(browser_id,drink_code,display_name,body,status) values(p_browser,p_code,p_name,p_body,'pending');
end $$;

create or replace function public.send_message(p_body text,p_browser uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if p_browser is null then raise exception 'Browser identifier required'; end if;
 p_body := btrim(coalesce(p_body,''));
 if char_length(p_body) not between 5 and 1000 then raise exception 'Invalid message'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_browser::text, 2));
 if exists(select 1 from public.anonymous_messages where browser_id=p_browser and created_at>now()-interval '40 seconds')
 then raise exception 'Please wait before sending again'; end if;
 insert into public.anonymous_messages(browser_id,body) values(p_browser,p_body);
end $$;

-- Always returns the same receipt; never exposes whether a phone is registered.
create or replace function public.join_club(p_name text,p_phone text,p_telegram text,p_consent boolean,p_browser uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare inserted integer;
begin
 if p_browser is null then raise exception 'Browser identifier required'; end if;
 if p_consent is distinct from true then raise exception 'Consent required'; end if;
 if not (select club_enabled from public.site_settings where id=1) then raise exception 'Club signup closed'; end if;
 p_name:=btrim(coalesce(p_name,'')); p_phone:=btrim(coalesce(p_phone,'')); p_telegram:=btrim(coalesce(p_telegram,''));
 if char_length(p_name) not between 2 and 80 or p_phone !~ '^09[0-9]{9}$' then raise exception 'Invalid member details'; end if;
 if p_telegram<>'' and p_telegram !~ '^@?[A-Za-z0-9_]{5,32}$' then raise exception 'Invalid Telegram ID'; end if;
 if p_telegram<>'' and left(p_telegram,1)<>'@' then p_telegram:='@'||p_telegram; end if;
 insert into public.club_members(browser_id,full_name,phone,telegram_id)
 values(p_browser,p_name,p_phone,nullif(p_telegram,''))
 on conflict(phone) do nothing;
 get diagnostics inserted = row_count;
 return true;
end $$;

-- The following operations ALL verify the trusted allowlist server-side.
create or replace function public.admin_data() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 return (select jsonb_build_object(
   'settings',(select to_jsonb(s)-'id' from public.site_settings s where id=1),
   'stats',jsonb_build_object(
     'votes',(select count(*) from public.votes),
     'comments_pending',(select count(*) from public.comments where status='pending'),
     'members',(select count(*) from public.club_members),
     'messages',(select count(*) from public.anonymous_messages)),
   'drinks',coalesce((select jsonb_agg(to_jsonb(d) || jsonb_build_object(
       'likes',(select count(*) from public.votes v where v.drink_code=d.code and v.value=1),
       'dislikes',(select count(*) from public.votes v where v.drink_code=d.code and v.value=-1),
       'total',(select count(*) from public.votes v where v.drink_code=d.code))
       order by d.category_order,d.item_order) from public.drinks d),'[]'::jsonb),
   'comments',coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc) from
     (select id,drink_code as code,display_name as name,body,status,created_at from public.comments order by created_at desc limit 150) c),'[]'::jsonb),
   'messages',coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at desc) from
     (select id,body,created_at from public.anonymous_messages order by created_at desc limit 100) m),'[]'::jsonb),
   'members',coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc) from
     (select id,full_name,phone,telegram_id,created_at from public.club_members order by created_at desc limit 1000) c),'[]'::jsonb),
   'draws',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'full_name',coalesce(m.full_name,'عضو حذف‌شده'),
     'phone',coalesce(m.phone,''),'drawn_at',r.drawn_at,'eligible_count',r.eligible_count) order by r.drawn_at desc)
     from public.raffle_draws r left join public.club_members m on m.id=r.winner_id),'[]'::jsonb)
 ));
end $$;

create or replace function public.admin_set_drink(p_code integer,p_key text,p_enabled boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 if p_enabled is null or p_key not in ('is_visible','votes_enabled','show_results','comments_enabled','comments_visible') then raise exception 'Invalid field'; end if;
 update public.drinks set
  is_visible=case when p_key='is_visible' then p_enabled else is_visible end,
  votes_enabled=case when p_key='votes_enabled' then p_enabled else votes_enabled end,
  show_results=case when p_key='show_results' then p_enabled else show_results end,
  comments_enabled=case when p_key='comments_enabled' then p_enabled else comments_enabled end,
  comments_visible=case when p_key='comments_visible' then p_enabled else comments_visible end
 where code=p_code;
 if not found then raise exception 'Drink not found'; end if;
end $$;

create or replace function public.admin_set_setting(p_key text,p_value text)
returns void language plpgsql security definer set search_path = '' as $$
declare b boolean;
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 if p_key in ('polls_visible','votes_enabled','results_visible','comments_visible','comments_enabled','club_enabled','leaderboard_enabled') then
   if p_value not in ('true','false') then raise exception 'Invalid boolean'; end if;
   b := p_value::boolean;
   update public.site_settings set
    polls_visible=case when p_key='polls_visible' then b else polls_visible end,
    votes_enabled=case when p_key='votes_enabled' then b else votes_enabled end,
    results_visible=case when p_key='results_visible' then b else results_visible end,
    comments_visible=case when p_key='comments_visible' then b else comments_visible end,
    comments_enabled=case when p_key='comments_enabled' then b else comments_enabled end,
    club_enabled=case when p_key='club_enabled' then b else club_enabled end,
    leaderboard_enabled=case when p_key='leaderboard_enabled' then b else leaderboard_enabled end
   where id=1;
 elsif p_key in ('support_phone','support_whatsapp','support_hours') then
   if char_length(coalesce(p_value,'')) > (case when p_key='support_hours' then 100 else 35 end) then raise exception 'Too long'; end if;
   update public.site_settings set
    support_phone=case when p_key='support_phone' then coalesce(p_value,'') else support_phone end,
    support_whatsapp=case when p_key='support_whatsapp' then coalesce(p_value,'') else support_whatsapp end,
    support_hours=case when p_key='support_hours' then coalesce(p_value,'') else support_hours end
   where id=1;
 else raise exception 'Unknown setting';
 end if;
end $$;

create or replace function public.admin_moderate_comment(p_id uuid,p_action text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 if p_action='delete' then
  delete from public.comments where id=p_id;
 elsif p_action in ('pending','approved','rejected') then
  update public.comments set status=p_action where id=p_id;
 else raise exception 'Invalid action'; end if;
end $$;

-- Actual uniform random selection within the eligible set, with persistent history.
create or replace function public.admin_draw_winner() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare winner public.club_members%rowtype; eligible integer;
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 -- Serializes draws to avoid two concurrent selections of the same winner.
 perform pg_advisory_xact_lock(92719352);
 select count(*) into eligible from public.club_members m
  where not exists(select 1 from public.raffle_draws r where r.winner_id=m.id);
 if eligible=0 then raise exception 'No eligible members'; end if;
 select m.* into winner from public.club_members m
  where not exists(select 1 from public.raffle_draws r where r.winner_id=m.id)
  order by random() limit 1;
 insert into public.raffle_draws(winner_id,drawn_by,eligible_count) values(winner.id,auth.uid(),eligible);
 return jsonb_build_object('full_name',winner.full_name,'phone',winner.phone,'telegram_id',winner.telegram_id,'eligible_count',eligible);
end $$;

create or replace function public.admin_delete_member(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 delete from public.club_members where id=p_id;
end $$;

-- Explicit function permissions: public reads, visitor writes, admin actions.
revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.public_catalog(uuid) from public, anon, authenticated;
grant execute on function public.public_catalog(uuid) to anon, authenticated;
revoke execute on function public.get_public_comments(integer) from public, anon, authenticated;
grant execute on function public.get_public_comments(integer) to anon, authenticated;
revoke execute on function public.vote_drink(integer,integer,uuid) from public, anon, authenticated;
grant execute on function public.vote_drink(integer,integer,uuid) to anon, authenticated;
revoke execute on function public.send_comment(integer,text,text,uuid) from public, anon, authenticated;
grant execute on function public.send_comment(integer,text,text,uuid) to anon, authenticated;
revoke execute on function public.send_message(text,uuid) from public, anon, authenticated;
grant execute on function public.send_message(text,uuid) to anon, authenticated;
revoke execute on function public.join_club(text,text,text,boolean,uuid) from public, anon, authenticated;
grant execute on function public.join_club(text,text,text,boolean,uuid) to anon, authenticated;
revoke execute on function public.admin_data() from public, anon, authenticated;
grant execute on function public.admin_data() to authenticated;
revoke execute on function public.admin_set_drink(integer,text,boolean) from public, anon, authenticated;
grant execute on function public.admin_set_drink(integer,text,boolean) to authenticated;
revoke execute on function public.admin_set_setting(text,text) from public, anon, authenticated;
grant execute on function public.admin_set_setting(text,text) to authenticated;
revoke execute on function public.admin_moderate_comment(uuid,text) from public, anon, authenticated;
grant execute on function public.admin_moderate_comment(uuid,text) to authenticated;
revoke execute on function public.admin_draw_winner() from public, anon, authenticated;
grant execute on function public.admin_draw_winner() to authenticated;
revoke execute on function public.admin_delete_member(uuid) from public, anon, authenticated;
grant execute on function public.admin_delete_member(uuid) to authenticated;

-- ADMIN BOOTSTRAP, run MANUALLY AFTER creating an email/password user in Supabase Auth:
-- insert into public.admin_users(user_id) values ('REPLACE_WITH_REAL_AUTH_USER_UUID');

notify pgrst, 'reload schema';
commit;
