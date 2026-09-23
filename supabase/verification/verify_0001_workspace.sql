-- ═══════════════════════════════════════════════════════════════════════════
-- UTRIPLA — database verification for supabase/migrations/0001_initial_workspace.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- READ ONLY. No DDL, no DML, no GRANT/REVOKE, no writes of any kind.
-- Run in Supabase SQL Editor (executes as `postgres`). Returns ONE grid.
--
-- How to read the result:
--   status = PASS  the measured value equals the expected value
--   status = FAIL  it does not — the `actual` column shows what was found
--   status = INFO  informational row, not a pass/fail criterion
--   expected = '—' means "nothing missing"; `actual` lists any offenders.
-- ═══════════════════════════════════════════════════════════════════════════

with
our_tables (name) as (
  values ('profiles'::text), ('trips'), ('places'), ('stays'), ('itinerary_days'),
         ('itinerary_stops'), ('expenses'), ('trip_people'), ('checklist_items'),
         ('saved_items'), ('saved_item_trips'), ('inbox_items'), ('activity'),
         ('merchant_rules')
),
privs (p) as (
  values ('SELECT'::text), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'),
         ('REFERENCES'), ('TRIGGER')
),
want_indexes (name) as (
  values ('trips_user_id_idx'::text), ('trips_user_status_idx'),
         ('places_user_id_idx'), ('places_trip_id_idx'),
         ('stays_user_id_idx'), ('stays_trip_id_idx'),
         ('itinerary_days_user_id_idx'), ('itinerary_days_trip_idx'),
         ('itinerary_stops_user_id_idx'), ('itinerary_stops_day_idx'),
         ('expenses_user_id_idx'), ('expenses_trip_id_idx'),
         ('expenses_user_status_idx'), ('expenses_dedupe_idx'),
         ('trip_people_user_id_idx'), ('trip_people_trip_id_idx'),
         ('checklist_items_user_id_idx'), ('checklist_items_trip_id_idx'),
         ('saved_items_user_id_idx'), ('saved_items_user_kind_idx'),
         ('saved_items_user_title_kind_key'),
         ('saved_item_trips_user_id_idx'), ('saved_item_trips_trip_idx'),
         ('inbox_items_user_id_idx'), ('activity_user_id_idx')
),
want_triggers (name) as (
  values ('profiles_touch_updated_at'::text), ('trips_touch_updated_at'),
         ('places_touch_updated_at'), ('stays_touch_updated_at'),
         ('itinerary_days_touch_updated_at'), ('itinerary_stops_touch_updated_at'),
         ('expenses_touch_updated_at'), ('checklist_items_touch_updated_at'),
         ('saved_items_touch_updated_at'), ('inbox_items_touch_updated_at'),
         ('on_auth_user_created')
),
found_tables as (
  select t.name from our_tables t
  where exists (
    select 1 from information_schema.tables i
    where i.table_schema = 'public' and i.table_type = 'BASE TABLE'
      and i.table_name = t.name
  )
),
rel as (
  select c.relname, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and c.relname in (select name from our_tables)
),
pol as (
  select tablename, policyname, cmd, qual, with_check, roles::text as roles_txt
  from pg_policies
  where schemaname = 'public' and tablename in (select name from our_tables)
),
gm as (
  select t.name, p.p,
         has_table_privilege('authenticated'::name, format('public.%I', t.name), p.p) as auth_has,
         has_table_privilege('anon'::name,          format('public.%I', t.name), p.p) as anon_has
  from our_tables t
  cross join privs p
  where exists (select 1 from found_tables f where f.name = t.name)
),
fk as (
  select cc.relname as child, pc.relname as parent, pn.nspname as parent_schema,
         con.confdeltype
  from pg_constraint con
  join pg_class cc     on cc.oid = con.conrelid
  join pg_namespace cn on cn.oid = cc.relnamespace
  join pg_class pc     on pc.oid = con.confrelid
  join pg_namespace pn on pn.oid = pc.relnamespace
  where con.contype = 'f' and cn.nspname = 'public'
    and cc.relname in (select name from our_tables)
),
idx as (
  select indexname, indexdef from pg_indexes
  where schemaname = 'public' and indexname in (select name from want_indexes)
),
fn as (
  select p.proname, pg_get_function_result(p.oid) as ret, p.prosecdef, p.provolatile
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('touch_updated_at', 'handle_new_user', 'owns_trip')
),
trg as (
  select tg.tgname, tg.tgenabled from pg_trigger tg
  where not tg.tgisinternal and tg.tgname in (select name from want_triggers)
),
metrics (grp, item, expected, actual) as (
  values

  ('A tables', 'the 14 tables exist in information_schema.tables',
   '14', (select count(*)::text from found_tables)),
  ('A tables', 'missing tables',
   '—', (select coalesce(string_agg(t.name, ', ' order by t.name), '—')
         from our_tables t
         where not exists (select 1 from found_tables f where f.name = t.name))),

  ('B RLS', 'tables with relrowsecurity = true',
   '14', (select count(*)::text from rel where relrowsecurity)),
  ('B RLS', 'tables with RLS NOT enabled',
   '—', (select coalesce(string_agg(r.relname, ', ' order by r.relname), '—')
         from rel r where not r.relrowsecurity)),

  ('C policies', 'total policies in pg_policies',
   '56', (select count(*)::text from pol)),
  ('C policies', 'tables carrying all four cmds (SELECT + INSERT + UPDATE + DELETE)',
   '14', (select count(*)::text from (
            select tablename from pol group by tablename
            having count(distinct cmd) = 4
               and bool_and(cmd in ('SELECT','INSERT','UPDATE','DELETE'))
          ) z)),
  ('C policies', 'policies whose roles <> {authenticated}',
   '0', (select count(*)::text from pol where roles_txt <> '{authenticated}')),
  ('C policies', 'saved_item_trips_update_own hardened: USING and WITH CHECK each carry auth.uid() + owns_trip + saved_items',
   '1', (select count(*)::text from pol
         where policyname = 'saved_item_trips_update_own' and cmd = 'UPDATE'
           and coalesce(qual, '')       like '%auth.uid()%'
           and coalesce(qual, '')       like '%owns_trip%'
           and coalesce(qual, '')       like '%saved_items%'
           and coalesce(with_check, '') like '%auth.uid()%'
           and coalesce(with_check, '') like '%owns_trip%'
           and coalesce(with_check, '') like '%saved_items%')),
  ('C policies', 'expenses policies that allow trip_id IS NULL (Unassigned)',
   '4', (select count(*)::text from pol
         where tablename = 'expenses'
           and upper(coalesce(qual, with_check, '')) like '%TRIP_ID IS NULL%')),
  ('C policies', 'child-table policies containing owns_trip(trip_id)',
   '28', (select count(*)::text from pol
          where tablename in ('places', 'stays', 'itinerary_days', 'itinerary_stops',
                              'checklist_items', 'trip_people', 'expenses')
            and (coalesce(qual, '') like '%owns_trip%'
                 or coalesce(with_check, '') like '%owns_trip%'))),
  ('C policies', 'itinerary_stops policies validating day_id belongs to the same trip',
   '2', (select count(*)::text from pol
         where tablename = 'itinerary_stops'
           and coalesce(with_check, '') like '%itinerary_days%')),

  ('D functions', 'the 3 helper functions exist in public',
   '3', (select count(*)::text from fn)),
  ('D functions', 'handle_new_user() -> trigger, SECURITY DEFINER',
   '1', (select count(*)::text from fn
         where proname = 'handle_new_user' and ret = 'trigger' and prosecdef)),
  ('D functions', 'owns_trip(text) -> boolean, STABLE',
   '1', (select count(*)::text from fn
         where proname = 'owns_trip' and ret = 'boolean' and provolatile = 's')),
  ('D functions', 'touch_updated_at() -> trigger',
   '1', (select count(*)::text from fn
         where proname = 'touch_updated_at' and ret = 'trigger')),

  ('E triggers', 'the 11 triggers exist and are enabled (tgenabled = O)',
   '11', (select count(*)::text from trg where tgenabled = 'O')),
  ('E triggers', 'missing triggers',
   '—', (select coalesce(string_agg(w.name, ', ' order by w.name), '—')
         from want_triggers w
         where not exists (select 1 from trg g where g.tgname = w.name))),

  ('F FKs', 'foreign keys on the tables from this migration',
   '24', (select count(*)::text from fk)),
  ('F FKs', 'FKs -> auth.users ON DELETE CASCADE',
   '14', (select count(*)::text from fk
          where parent_schema = 'auth' and parent = 'users' and confdeltype = 'c')),
  ('F FKs', 'FKs -> trips ON DELETE CASCADE (child rows)',
   '7', (select count(*)::text from fk
         where parent = 'trips' and confdeltype = 'c')),
  ('F FKs', 'expenses.trip_id -> trips ON DELETE SET NULL (deleting a trip keeps the expense)',
   '1', (select count(*)::text from fk
         where child = 'expenses' and parent = 'trips' and confdeltype = 'n')),
  ('F FKs', 'saved_item_trips FKs, all ON DELETE CASCADE',
   '3', (select count(*)::text from fk
         where child = 'saved_item_trips' and confdeltype = 'c')),
  ('F FKs', 'itinerary_stops.day_id -> itinerary_days ON DELETE CASCADE',
   '1', (select count(*)::text from fk
         where child = 'itinerary_stops' and parent = 'itinerary_days' and confdeltype = 'c')),

  ('G indexes', 'the 25 indexes created by the migration exist',
   '25', (select count(*)::text from idx)),
  ('G indexes', 'missing indexes',
   '—', (select coalesce(string_agg(w.name, ', ' order by w.name), '—')
         from want_indexes w
         where not exists (select 1 from idx i where i.indexname = w.name))),
  ('G indexes', 'saved_items UNIQUE (user_id, lower(title), kind)',
   '1', (select count(*)::text from idx
         where indexname = 'saved_items_user_title_kind_key'
           and indexdef like '%UNIQUE%' and indexdef like '%lower(title)%')),

  ('H grants', 'authenticated holds SELECT/INSERT/UPDATE/DELETE (14 tables x 4)',
   '56', (select count(*)::text from gm
          where auth_has and p in ('SELECT', 'INSERT', 'UPDATE', 'DELETE'))),
  ('H grants', 'authenticated holds TRUNCATE / REFERENCES / TRIGGER (must be none)',
   '0', (select count(*)::text from gm
         where auth_has and p in ('TRUNCATE', 'REFERENCES', 'TRIGGER'))),
  ('H grants', 'anon holds table privileges (14 tables x 7 privileges, must be none)',
   '0', (select count(*)::text from gm where anon_has)),
  ('H grants', 'PUBLIC pseudo-role holds table privileges (must be none)',
   '0', (select count(*)::text from information_schema.role_table_grants
         where table_schema = 'public' and grantee = 'PUBLIC'
           and table_name in (select name from our_tables))),
  ('H grants', 'authenticated has schema USAGE on public (schema-level, NOT a table privilege)',
   'true', has_schema_privilege('authenticated'::name, 'public', 'USAGE')::text),
  ('H grants', 'anon has schema USAGE on public (INFO only: presence here is not a table privilege)',
   '-', has_schema_privilege('anon'::name, 'public', 'USAGE')::text),

  ('I signup', 'on_auth_user_created trigger on auth.users, enabled',
   '1', (select count(*)::text from trg
         where tgname = 'on_auth_user_created' and tgenabled = 'O')),
  ('I signup', 'function bound to on_auth_user_created',
   'handle_new_user', (select coalesce(p.proname, '—')
         from pg_trigger tg
         join pg_proc p      on p.oid = tg.tgfoid
         join pg_class c     on c.oid = tg.tgrelid
         join pg_namespace n on n.oid = c.relnamespace
         where tg.tgname = 'on_auth_user_created'
           and n.nspname = 'auth' and c.relname = 'users')),
  ('I signup', 'profiles rows vs auth.users rows (1:1 means the trigger provisioned every user)',
   (select count(*)::text from auth.users), (select count(*)::text from public.profiles))
)
select grp as check_group, item, expected, actual,
       case when expected = '-'           then 'INFO'
            when actual = expected        then 'PASS'
            else 'FAIL' end as status
from metrics
order by grp, item;
