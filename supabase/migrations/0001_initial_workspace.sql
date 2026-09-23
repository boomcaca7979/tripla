-- ═══════════════════════════════════════════════════════════════════════════
-- UTRIPLA — initial user-data schema (Supabase / PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Scope: USER DATA ONLY. Public travel content (destinations, guides, climate
-- data, travel styles, POIs, static images, destination metadata) stays in the
-- existing file/TS data layer and is NOT migrated here.
--
-- Derivation: every column maps to an existing TypeScript type in the repo —
--   src/components/trips/workspace/types.ts          (Trip, Place, Hotel,
--     RouteDay, RouteStop, Expense, Traveler, ChecklistItem, SavedItem,
--     InboxItem, ActivityItem, WorkspaceState)
--   src/components/trips/workspace/expenses/types.ts (Transaction, MerchantRule)
-- No speculative fields are added.
--
-- ID strategy: the client generates opaque string ids ("t-…", "p-…", "h-…",
-- "sv-…", "in-…", "tx-…"). We keep `text` primary keys so ids stay stable and
-- client code keeps working unchanged, and so device-local data could be
-- uploaded later without re-keying.
--
-- ⚠ No secrets belong in this file. It is safe to commit.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Helpers ────────────────────────────────────────────────────────────

-- Shared updated_at maintenance for every mutable table.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. profiles ───────────────────────────────────────────────────────────
-- One row per authenticated user. Created automatically on signup so the
-- client never has to insert it (and can never create a row for someone else).

create table if not exists public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-provision the profile row for a new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. trips ──────────────────────────────────────────────────────────────
-- Trip.destinationId / destinationSlug keep the real UTRIPLA Destination link
-- (free-text trips leave them null — they are NOT converted to live links).

create table if not exists public.trips (
  id                text primary key,
  user_id           uuid not null references auth.users (id) on delete cascade,
  destination       text not null,
  name              text,
  destination_id    text,
  destination_slug  text,
  destination_image text,
  country           text,
  status            text not null default 'upcoming'
                      check (status in ('current', 'upcoming', 'past')),
  start_date        date,
  end_date          date,
  currency          text not null default 'CNY',
  -- FlightInfo | null — small nested object, not worth its own table.
  flight            jsonb,
  budget_planned    numeric not null default 0,
  flight_booked     boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists trips_user_id_idx     on public.trips (user_id);
create index if not exists trips_user_status_idx on public.trips (user_id, status);

drop trigger if exists trips_touch_updated_at on public.trips;
create trigger trips_touch_updated_at
  before update on public.trips
  for each row execute function public.touch_updated_at();

-- ── 3. places ─────────────────────────────────────────────────────────────
-- Trip.places

create table if not exists public.places (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  trip_id    text not null references public.trips (id) on delete cascade,
  name       text not null,
  kind       text not null default 'sight'
               check (kind in ('sight', 'food', 'activity', 'nature', 'shopping')),
  area       text,
  note       text,
  status     text not null default 'want'
               check (status in ('want', 'must', 'done', 'skipped')),
  from_saved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_user_id_idx on public.places (user_id);
create index if not exists places_trip_id_idx on public.places (trip_id);

drop trigger if exists places_touch_updated_at on public.places;
create trigger places_touch_updated_at
  before update on public.places
  for each row execute function public.touch_updated_at();

-- ── 4. stays ──────────────────────────────────────────────────────────────
-- Trip.hotels — the comparison list (considering / preferred / booked).

create table if not exists public.stays (
  id               text primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  trip_id          text not null references public.trips (id) on delete cascade,
  name             text not null,
  price_per_night  numeric not null default 0,
  rating           numeric,
  distance_km      numeric,
  breakfast        boolean,
  free_cancellation boolean,
  preferred        boolean not null default false,
  booked           boolean not null default false,
  nights           integer,
  area             text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists stays_user_id_idx on public.stays (user_id);
create index if not exists stays_trip_id_idx on public.stays (trip_id);

drop trigger if exists stays_touch_updated_at on public.stays;
create trigger stays_touch_updated_at
  before update on public.stays
  for each row execute function public.touch_updated_at();

-- ── 5. itinerary_days / itinerary_stops ──────────────────────────────────
-- Trip.routeDays / RouteDay.stops

create table if not exists public.itinerary_days (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  trip_id     text not null references public.trips (id) on delete cascade,
  title       text not null,
  distance_km numeric not null default 0,
  transit_min integer not null default 0,
  -- stable user-defined ordering of days
  day_index   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists itinerary_days_user_id_idx on public.itinerary_days (user_id);
create index if not exists itinerary_days_trip_idx    on public.itinerary_days (trip_id, day_index);

drop trigger if exists itinerary_days_touch_updated_at on public.itinerary_days;
create trigger itinerary_days_touch_updated_at
  before update on public.itinerary_days
  for each row execute function public.touch_updated_at();

create table if not exists public.itinerary_stops (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  trip_id    text not null references public.trips (id) on delete cascade,
  day_id     text not null references public.itinerary_days (id) on delete cascade,
  name       text not null,
  time       text,
  note       text,
  area       text,
  -- reference to public.places.id when the stop came from a Place (no FK: a
  -- stop may outlive the place, and it is intentionally denormalised by name)
  place_id   text,
  kind       text check (kind in ('activity', 'meal', 'custom')),
  stop_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists itinerary_stops_user_id_idx on public.itinerary_stops (user_id);
create index if not exists itinerary_stops_day_idx     on public.itinerary_stops (day_id, stop_index);

drop trigger if exists itinerary_stops_touch_updated_at on public.itinerary_stops;
create trigger itinerary_stops_touch_updated_at
  before update on public.itinerary_stops
  for each row execute function public.touch_updated_at();

-- ── 6. expenses ───────────────────────────────────────────────────────────
-- The single real ledger: WorkspaceState.transactions (Transaction).
--
-- NOTE: Trip.expenses (v5 and older) is legacy — it is migrated into
-- transactions client-side and is deliberately NOT given its own table.
--
-- trip_id is nullable on purpose: Unassigned transactions are a first-class
-- state (deleting a Trip must not delete real spending — it detaches instead,
-- hence `on delete set null`).

create table if not exists public.expenses (
  id                    text primary key,
  user_id               uuid not null references auth.users (id) on delete cascade,
  trip_id               text references public.trips (id) on delete set null,
  source                text not null default 'manual'
                          check (source in ('manual', 'csv', 'xlsx', 'receipt', 'connected_account')),
  source_transaction_id text,
  merchant              text not null default '',
  raw_merchant          text,
  occurred_at           date,
  original_amount       numeric,
  original_currency     text not null default 'CNY',
  converted_amount      numeric,
  converted_currency    text,
  conversion_rate       numeric,
  category              text,
  subcategory           text,
  category_confidence   numeric,
  trip_confidence       numeric,
  status                text not null default 'draft'
                          check (status in ('draft', 'imported', 'needs_review', 'confirmed', 'ignored')),
  paid_by               text,
  split_between         text[] not null default '{}',
  split_mode            text check (split_mode in ('equal', 'amount', 'percentage')),
  -- Record<travelerId, share> — variable-key map, jsonb is the right shape.
  split_shares          jsonb,
  note                  text,
  receipt_url           text,
  receipt_id            text,
  payment_method        text check (payment_method in ('card', 'cash', 'alipay', 'wechat_pay', 'other')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists expenses_user_id_idx     on public.expenses (user_id);
create index if not exists expenses_trip_id_idx     on public.expenses (trip_id);
create index if not exists expenses_user_status_idx on public.expenses (user_id, status);
create index if not exists expenses_dedupe_idx      on public.expenses (user_id, source, source_transaction_id);

drop trigger if exists expenses_touch_updated_at on public.expenses;
create trigger expenses_touch_updated_at
  before update on public.expenses
  for each row execute function public.touch_updated_at();

-- ── 7. trip_people ────────────────────────────────────────────────────────
-- Trip.travelers — also the id namespace referenced by expenses.paid_by and
-- expenses.split_between.

create table if not exists public.trip_people (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  trip_id    text not null references public.trips (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index if not exists trip_people_user_id_idx on public.trip_people (user_id);
create index if not exists trip_people_trip_id_idx on public.trip_people (trip_id);

-- ── 8. checklist_items ────────────────────────────────────────────────────
-- Trip.checklist

create table if not exists public.checklist_items (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  trip_id    text not null references public.trips (id) on delete cascade,
  label      text not null,
  phase      text not null default 'before'
               check (phase in ('before', 'during', 'after')),
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklist_items_user_id_idx on public.checklist_items (user_id);
create index if not exists checklist_items_trip_id_idx on public.checklist_items (trip_id);

drop trigger if exists checklist_items_touch_updated_at on public.checklist_items;
create trigger checklist_items_touch_updated_at
  before update on public.checklist_items
  for each row execute function public.touch_updated_at();

-- ── 9. saved_items / saved_item_trips ────────────────────────────────────
-- Saved is a standalone library (NOT a projection of Trips). saved_item_trips
-- records "which trips did I already add this to" while keeping the save.

create table if not exists public.saved_items (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('place', 'hotel', 'activity', 'guide')),
  title      text not null,
  meta       text,
  saved_at   timestamptz,
  source     text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_items_user_id_idx  on public.saved_items (user_id);
create index if not exists saved_items_user_kind_idx on public.saved_items (user_id, kind);
-- idempotent upsert key used by lib/travel-workspace.ts (title casefold + kind)
create unique index if not exists saved_items_user_title_kind_key
  on public.saved_items (user_id, lower(title), kind);

drop trigger if exists saved_items_touch_updated_at on public.saved_items;
create trigger saved_items_touch_updated_at
  before update on public.saved_items
  for each row execute function public.touch_updated_at();

create table if not exists public.saved_item_trips (
  saved_item_id text not null references public.saved_items (id) on delete cascade,
  trip_id       text not null references public.trips (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (saved_item_id, trip_id)
);

create index if not exists saved_item_trips_user_id_idx on public.saved_item_trips (user_id);
create index if not exists saved_item_trips_trip_idx    on public.saved_item_trips (trip_id);

-- ── 10. inbox_items ───────────────────────────────────────────────────────
-- Travel Inbox — unorganised inspiration, independent of Saved (never a
-- projection of it).

create table if not exists public.inbox_items (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('place', 'hotel', 'activity', 'guide')),
  title      text not null,
  meta       text,
  saved_at   timestamptz,
  source     text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inbox_items_user_id_idx on public.inbox_items (user_id);

drop trigger if exists inbox_items_touch_updated_at on public.inbox_items;
create trigger inbox_items_touch_updated_at
  before update on public.inbox_items
  for each row execute function public.touch_updated_at();

-- ── 11. activity ──────────────────────────────────────────────────────────
-- WorkspaceState.activity (Recent activity feed). `text` and `at` are
-- pre-formatted at write time by the client to avoid hydration drift.

create table if not exists public.activity (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  text       text not null,
  at         text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_user_id_idx on public.activity (user_id, created_at desc);

-- ── 12. merchant_rules ────────────────────────────────────────────────────
-- WorkspaceState.merchantRules: key = normalised merchant string.

create table if not exists public.merchant_rules (
  user_id     uuid not null references auth.users (id) on delete cascade,
  merchant_key text not null,
  category    text not null,
  subcategory text,
  updated_at  timestamptz not null default now(),
  primary key (user_id, merchant_key)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTS — the FIRST of two independent gates
-- ═══════════════════════════════════════════════════════════════════════════
-- Table privileges and RLS are separate gates. If a GRANT is missing, every
-- query fails with `42501 permission denied` — which reads exactly like "my
-- RLS policy is broken" and sends you debugging the wrong layer. Granting
-- explicitly here makes the intent reviewable and the failure mode unambiguous.
--
-- MINIMUM PRIVILEGE, ENUMERATED BY NAME.
-- Nothing below uses a wildcard and nothing below sets a default. Every
-- statement names the 14 tables this migration creates — and only those:
--
--   profiles, trips, places, stays, itinerary_days, itinerary_stops, expenses,
--   trip_people, checklist_items, saved_items, saved_item_trips, inbox_items,
--   activity, merchant_rules
--
-- Why `grant ... on all tables in schema public` and `alter default
-- privileges` are NOT used: both reach beyond this migration's intent. The
-- first would hand privileges to every table already sitting in `public`
-- (Supabase maintains its own objects there); the second would do it for every
-- table any future migration ever adds, including tables that are not private
-- user data. A privilege belongs to a specific object, attached at the moment
-- that object is created.
--
-- Who ends up with what:
--   authenticated → SELECT / INSERT / UPDATE / DELETE on the 14 tables and
--                   nothing else (no TRUNCATE / REFERENCES / TRIGGER). RLS
--                   then narrows that further to the caller's own rows.
--   anon          → no table privilege at all. Supabase's project bootstrap
--                   runs `alter default privileges in schema public grant all
--                   on tables to anon, ...`, so a table created in `public`
--                   starts out reachable by anonymous visitors. These 14 tables
--                   hold private per-user data, so that inherited grant is
--                   revoked explicitly here rather than assumed absent. With
--                   no table privilege, there is nothing for RLS to evaluate.
--   public        → never granted anything by this file. The PUBLIC
--                   pseudo-role receives no privilege on these tables.
--   service_role  → untouched; that is the server-side / admin path.
--
-- Consequence to remember: a future migration that adds a table must add its
-- own explicit GRANT for it. Nothing is inherited from here any more.

grant usage on schema public to authenticated;

-- REVOKE before GRANT so the end state is exactly the four DML privileges,
-- whatever project-level default privileges were in force when the tables were
-- created above. Revoking a privilege that was never granted is a no-op, so
-- this block stays idempotent on re-run.
revoke all privileges on table
  public.profiles,
  public.trips,
  public.places,
  public.stays,
  public.itinerary_days,
  public.itinerary_stops,
  public.expenses,
  public.trip_people,
  public.checklist_items,
  public.saved_items,
  public.saved_item_trips,
  public.inbox_items,
  public.activity,
  public.merchant_rules
from anon, authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.trips,
  public.places,
  public.stays,
  public.itinerary_days,
  public.itinerary_stops,
  public.expenses,
  public.trip_people,
  public.checklist_items,
  public.saved_items,
  public.saved_item_trips,
  public.inbox_items,
  public.activity,
  public.merchant_rules
to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- RLS is the security boundary — never rely on client-side filtering.
-- Every private table: SELECT / INSERT / UPDATE / DELETE, keyed on auth.uid().
-- Child tables must ALSO prove the parent trip belongs to the caller, so a
-- tampered trip_id cannot read or write another user's trip contents.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: does the caller own this trip?
create or replace function public.owns_trip(p_trip_id text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.trips t
    where t.id = p_trip_id and t.user_id = auth.uid()
  );
$$;

-- ── profiles ──
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete to authenticated using (user_id = auth.uid());

-- ── trips (owner-only) ──
alter table public.trips enable row level security;

drop policy if exists trips_select_own on public.trips;
create policy trips_select_own on public.trips
  for select to authenticated using (user_id = auth.uid());

drop policy if exists trips_insert_own on public.trips;
create policy trips_insert_own on public.trips
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists trips_update_own on public.trips;
create policy trips_update_own on public.trips
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists trips_delete_own on public.trips;
create policy trips_delete_own on public.trips
  for delete to authenticated using (user_id = auth.uid());

-- ── child tables of trips: ownership AND trip ownership ──
-- Applied identically to places / stays / itinerary_days / itinerary_stops /
-- checklist_items / trip_people.

alter table public.places enable row level security;

drop policy if exists places_select_own on public.places;
create policy places_select_own on public.places
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists places_insert_own on public.places;
create policy places_insert_own on public.places
  for insert to authenticated with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists places_update_own on public.places;
create policy places_update_own on public.places
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists places_delete_own on public.places;
create policy places_delete_own on public.places
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

alter table public.stays enable row level security;

drop policy if exists stays_select_own on public.stays;
create policy stays_select_own on public.stays
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists stays_insert_own on public.stays;
create policy stays_insert_own on public.stays
  for insert to authenticated with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists stays_update_own on public.stays;
create policy stays_update_own on public.stays
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists stays_delete_own on public.stays;
create policy stays_delete_own on public.stays
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

alter table public.itinerary_days enable row level security;

drop policy if exists itinerary_days_select_own on public.itinerary_days;
create policy itinerary_days_select_own on public.itinerary_days
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists itinerary_days_insert_own on public.itinerary_days;
create policy itinerary_days_insert_own on public.itinerary_days
  for insert to authenticated with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists itinerary_days_update_own on public.itinerary_days;
create policy itinerary_days_update_own on public.itinerary_days
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists itinerary_days_delete_own on public.itinerary_days;
create policy itinerary_days_delete_own on public.itinerary_days
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

alter table public.itinerary_stops enable row level security;

drop policy if exists itinerary_stops_select_own on public.itinerary_stops;
create policy itinerary_stops_select_own on public.itinerary_stops
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists itinerary_stops_insert_own on public.itinerary_stops;
create policy itinerary_stops_insert_own on public.itinerary_stops
  for insert to authenticated with check (
    user_id = auth.uid()
    and public.owns_trip(trip_id)
    and exists (
      select 1 from public.itinerary_days d
      where d.id = day_id and d.user_id = auth.uid() and d.trip_id = itinerary_stops.trip_id
    )
  );

drop policy if exists itinerary_stops_update_own on public.itinerary_stops;
create policy itinerary_stops_update_own on public.itinerary_stops
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (
    user_id = auth.uid()
    and public.owns_trip(trip_id)
    and exists (
      select 1 from public.itinerary_days d
      where d.id = day_id and d.user_id = auth.uid() and d.trip_id = itinerary_stops.trip_id
    )
  );

drop policy if exists itinerary_stops_delete_own on public.itinerary_stops;
create policy itinerary_stops_delete_own on public.itinerary_stops
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

alter table public.checklist_items enable row level security;

drop policy if exists checklist_items_select_own on public.checklist_items;
create policy checklist_items_select_own on public.checklist_items
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists checklist_items_insert_own on public.checklist_items;
create policy checklist_items_insert_own on public.checklist_items
  for insert to authenticated with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists checklist_items_update_own on public.checklist_items;
create policy checklist_items_update_own on public.checklist_items
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists checklist_items_delete_own on public.checklist_items;
create policy checklist_items_delete_own on public.checklist_items
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

alter table public.trip_people enable row level security;

drop policy if exists trip_people_select_own on public.trip_people;
create policy trip_people_select_own on public.trip_people
  for select to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists trip_people_insert_own on public.trip_people;
create policy trip_people_insert_own on public.trip_people
  for insert to authenticated with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists trip_people_update_own on public.trip_people;
create policy trip_people_update_own on public.trip_people
  for update to authenticated
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

drop policy if exists trip_people_delete_own on public.trip_people;
create policy trip_people_delete_own on public.trip_people
  for delete to authenticated using (user_id = auth.uid() and public.owns_trip(trip_id));

-- ── expenses: trip_id may be NULL (Unassigned) ──
-- NULL must be allowed, but a non-null trip_id must belong to the caller.

alter table public.expenses enable row level security;

drop policy if exists expenses_select_own on public.expenses;
create policy expenses_select_own on public.expenses
  for select to authenticated
  using (user_id = auth.uid() and (trip_id is null or public.owns_trip(trip_id)));

drop policy if exists expenses_insert_own on public.expenses;
create policy expenses_insert_own on public.expenses
  for insert to authenticated
  with check (user_id = auth.uid() and (trip_id is null or public.owns_trip(trip_id)));

drop policy if exists expenses_update_own on public.expenses;
create policy expenses_update_own on public.expenses
  for update to authenticated
  using (user_id = auth.uid() and (trip_id is null or public.owns_trip(trip_id)))
  with check (user_id = auth.uid() and (trip_id is null or public.owns_trip(trip_id)));

drop policy if exists expenses_delete_own on public.expenses;
create policy expenses_delete_own on public.expenses
  for delete to authenticated
  using (user_id = auth.uid() and (trip_id is null or public.owns_trip(trip_id)));

-- ── saved_items / inbox_items / activity / merchant_rules: owner-only ──

alter table public.saved_items enable row level security;

drop policy if exists saved_items_select_own on public.saved_items;
create policy saved_items_select_own on public.saved_items
  for select to authenticated using (user_id = auth.uid());

drop policy if exists saved_items_insert_own on public.saved_items;
create policy saved_items_insert_own on public.saved_items
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists saved_items_update_own on public.saved_items;
create policy saved_items_update_own on public.saved_items
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists saved_items_delete_own on public.saved_items;
create policy saved_items_delete_own on public.saved_items
  for delete to authenticated using (user_id = auth.uid());

alter table public.saved_item_trips enable row level security;

drop policy if exists saved_item_trips_select_own on public.saved_item_trips;
create policy saved_item_trips_select_own on public.saved_item_trips
  for select to authenticated using (user_id = auth.uid());

-- Both endpoints must belong to the caller: the saved item AND the trip.
drop policy if exists saved_item_trips_insert_own on public.saved_item_trips;
create policy saved_item_trips_insert_own on public.saved_item_trips
  for insert to authenticated with check (
    user_id = auth.uid()
    and public.owns_trip(trip_id)
    and exists (
      select 1 from public.saved_items s
      where s.id = saved_item_id and s.user_id = auth.uid()
    )
  );

-- UPDATE hardening.
-- `user_id = auth.uid()` alone is NOT sufficient here: on an UPDATE the row
-- being written is the NEW row, and saved_item_id / trip_id are both
-- retargetable columns. Without the checks below a caller could keep their own
-- user_id while repointing saved_item_id (or trip_id) at ANOTHER user's row,
-- silently attaching themselves to foreign data.
--
-- USING  → the OLD row must already be fully owned by the caller.
-- WITH CHECK → the NEW row must STILL be fully owned, so moving either
--   endpoint to a row the caller does not own is rejected at the database.
drop policy if exists saved_item_trips_update_own on public.saved_item_trips;
create policy saved_item_trips_update_own on public.saved_item_trips
  for update to authenticated
  using (
    user_id = auth.uid()
    and public.owns_trip(trip_id)
    and exists (
      select 1 from public.saved_items s
      where s.id = saved_item_id and s.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and public.owns_trip(trip_id)
    and exists (
      select 1 from public.saved_items s
      where s.id = saved_item_id and s.user_id = auth.uid()
    )
  );

drop policy if exists saved_item_trips_delete_own on public.saved_item_trips;
create policy saved_item_trips_delete_own on public.saved_item_trips
  for delete to authenticated using (user_id = auth.uid());

alter table public.inbox_items enable row level security;

drop policy if exists inbox_items_select_own on public.inbox_items;
create policy inbox_items_select_own on public.inbox_items
  for select to authenticated using (user_id = auth.uid());

drop policy if exists inbox_items_insert_own on public.inbox_items;
create policy inbox_items_insert_own on public.inbox_items
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists inbox_items_update_own on public.inbox_items;
create policy inbox_items_update_own on public.inbox_items
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists inbox_items_delete_own on public.inbox_items;
create policy inbox_items_delete_own on public.inbox_items
  for delete to authenticated using (user_id = auth.uid());

alter table public.activity enable row level security;

drop policy if exists activity_select_own on public.activity;
create policy activity_select_own on public.activity
  for select to authenticated using (user_id = auth.uid());

drop policy if exists activity_insert_own on public.activity;
create policy activity_insert_own on public.activity
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists activity_update_own on public.activity;
create policy activity_update_own on public.activity
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists activity_delete_own on public.activity;
create policy activity_delete_own on public.activity
  for delete to authenticated using (user_id = auth.uid());

alter table public.merchant_rules enable row level security;

drop policy if exists merchant_rules_select_own on public.merchant_rules;
create policy merchant_rules_select_own on public.merchant_rules
  for select to authenticated using (user_id = auth.uid());

drop policy if exists merchant_rules_insert_own on public.merchant_rules;
create policy merchant_rules_insert_own on public.merchant_rules
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists merchant_rules_update_own on public.merchant_rules;
create policy merchant_rules_update_own on public.merchant_rules
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists merchant_rules_delete_own on public.merchant_rules;
create policy merchant_rules_delete_own on public.merchant_rules
  for delete to authenticated using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTE ON STORAGE
-- Transaction.receiptUrl currently holds a client-compressed data URL or a
-- filename — receipts are NOT uploaded to Supabase Storage yet. If/when they
-- are, add a private `receipts` bucket plus an object policy keyed on the
-- first path segment being the owner's uid. No bucket is created here.
-- ═══════════════════════════════════════════════════════════════════════════
