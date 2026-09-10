-- Mahjong Rating: initial schema
-- Run this whole file in the Supabase SQL editor (Database -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create type public.mahjong_variant as enum ('taiwanese', 'cantonese');

-- ---------------------------------------------------------------------------
-- Players: one row per person who has ever appeared at a table.
-- profile_id links to auth.users once that person signs up with the same email.
-- ---------------------------------------------------------------------------
create table public.players (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid unique references auth.users (id) on delete set null,
  email         text unique not null check (email = lower(email)),
  display_name  text not null check (length(display_name) between 1 and 40),
  rating        numeric(8,2) not null default 1500,
  peak_rating   numeric(8,2) not null default 1500,
  games_played  integer not null default 0,
  created_at    timestamptz not null default now()
);

create table public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  created_at  timestamptz not null default now()
);
create unique index venues_name_city_key on public.venues (lower(name), lower(coalesce(city, '')));

create table public.games (
  id          uuid primary key default gen_random_uuid(),
  played_at   timestamptz not null,
  variant     public.mahjong_variant not null,
  venue_id    uuid references public.venues (id),
  stake_base  integer not null check (stake_base >= 0),   -- 底
  stake_unit  integer not null check (stake_unit >= 0),   -- 台 (Taiwanese) / 番 (Cantonese)
  currency    text not null default 'TWD',
  notes       text,
  logged_by   uuid references public.players (id),
  created_at  timestamptz not null default now()
);
create index games_played_at_idx on public.games (played_at desc);

create table public.game_players (
  id             uuid primary key default gen_random_uuid(),
  game_id        uuid not null references public.games (id) on delete cascade,
  player_id      uuid not null references public.players (id),
  seat           smallint not null check (seat between 0 and 3),    -- 0 East, 1 South, 2 West, 3 North
  net_result     numeric(12,2) not null,
  placement      smallint not null check (placement between 1 and 4),
  rating_before  numeric(8,2) not null,
  rating_after   numeric(8,2) not null,
  unique (game_id, player_id),
  unique (game_id, seat)
);
create index game_players_player_idx on public.game_players (player_id);

-- ---------------------------------------------------------------------------
-- Link a player row to a new auth user (or create one) on sign-up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(new.email);
  v_name  text := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(v_email, '@', 1));
begin
  insert into public.players (profile_id, email, display_name)
  values (new.id, v_email, v_name)
  on conflict (email) do update set profile_id = excluded.profile_id;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Elo: pairwise comparison among the four seats, K = 32 spread over 3 opponents.
-- ---------------------------------------------------------------------------
create or replace function public.record_game(
  p_logged_by   uuid,
  p_played_at   timestamptz,
  p_variant     public.mahjong_variant,
  p_venue_name  text,
  p_venue_city  text,
  p_stake_base  integer,
  p_stake_unit  integer,
  p_currency    text,
  p_notes       text,
  p_players     jsonb   -- [{ "email", "display_name", "seat", "net_result" }] x4
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  k_factor   constant numeric := 32;
  v_game_id  uuid;
  v_venue    uuid;
  v_sum      numeric;
  v_ids      uuid[]    := '{}';
  v_nets     numeric[] := '{}';
  v_before   numeric[] := '{}';
  v_seats    int[]     := '{}';
  v_delta    numeric;
  v_expected numeric;
  v_score    numeric;
  v_after    numeric;
  v_place    int;
  rec        jsonb;
  i int; j int;
  v_email text; v_name text; v_pid uuid;
begin
  if jsonb_typeof(p_players) <> 'array' or jsonb_array_length(p_players) <> 4 then
    raise exception 'Exactly four players are required';
  end if;

  select coalesce(sum((e ->> 'net_result')::numeric), 0) into v_sum
  from jsonb_array_elements(p_players) e;
  if abs(v_sum) > 0.005 then
    raise exception 'Net results must sum to zero (got %)', v_sum;
  end if;

  if nullif(trim(p_venue_name), '') is not null then
    insert into public.venues (name, city)
    values (trim(p_venue_name), nullif(trim(p_venue_city), ''))
    on conflict (lower(name), lower(coalesce(city, ''))) do update set name = excluded.name
    returning id into v_venue;
  end if;

  for rec in select * from jsonb_array_elements(p_players) loop
    v_email := lower(trim(rec ->> 'email'));
    v_name  := coalesce(nullif(trim(rec ->> 'display_name'), ''), split_part(v_email, '@', 1));
    if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      raise exception 'Invalid email: %', v_email;
    end if;

    insert into public.players (email, display_name)
    values (v_email, v_name)
    on conflict (email) do update set email = excluded.email
    returning id into v_pid;

    if v_pid = any (v_ids) then
      raise exception 'Duplicate player at table: %', v_email;
    end if;

    v_ids    := v_ids    || v_pid;
    v_nets   := v_nets   || (rec ->> 'net_result')::numeric;
    v_seats  := v_seats  || (rec ->> 'seat')::int;
    v_before := v_before || (select rating from public.players where id = v_pid);
  end loop;

  insert into public.games (played_at, variant, venue_id, stake_base, stake_unit, currency, notes, logged_by)
  values (p_played_at, p_variant, v_venue, p_stake_base, p_stake_unit,
          coalesce(nullif(p_currency, ''), 'TWD'), nullif(trim(p_notes), ''), p_logged_by)
  returning id into v_game_id;

  for i in 1..4 loop
    v_delta := 0;
    v_place := 1;
    for j in 1..4 loop
      continue when i = j;
      v_expected := 1 / (1 + power(10, (v_before[j] - v_before[i]) / 400));
      v_score := case when v_nets[i] > v_nets[j] then 1
                      when v_nets[i] = v_nets[j] then 0.5
                      else 0 end;
      v_delta := v_delta + (k_factor / 3) * (v_score - v_expected);
      if v_nets[j] > v_nets[i] then v_place := v_place + 1; end if;
    end loop;
    v_after := round(v_before[i] + v_delta, 2);

    insert into public.game_players (game_id, player_id, seat, net_result, placement, rating_before, rating_after)
    values (v_game_id, v_ids[i], v_seats[i], v_nets[i], v_place, v_before[i], v_after);

    update public.players
      set rating       = v_after,
          peak_rating  = greatest(peak_rating, v_after),
          games_played = games_played + 1
    where id = v_ids[i];
  end loop;

  return v_game_id;
end;
$$;

revoke all on function public.record_game(uuid, timestamptz, public.mahjong_variant, text, text, integer, integer, text, text, jsonb) from public;

-- Public RPC: resolves the caller's player row and delegates to record_game.
create or replace function public.log_game(
  p_played_at   timestamptz,
  p_variant     public.mahjong_variant,
  p_venue_name  text,
  p_venue_city  text,
  p_stake_base  integer,
  p_stake_unit  integer,
  p_currency    text,
  p_notes       text,
  p_players     jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
begin
  select id into v_me from public.players where profile_id = auth.uid();
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  return public.record_game(v_me, p_played_at, p_variant, p_venue_name, p_venue_city,
                            p_stake_base, p_stake_unit, p_currency, p_notes, p_players);
end;
$$;

grant execute on function public.log_game(timestamptz, public.mahjong_variant, text, text, integer, integer, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security: any signed-in player can read the community's history;
-- writes only happen through log_game, except editing your own display name.
-- ---------------------------------------------------------------------------
alter table public.players      enable row level security;
alter table public.venues       enable row level security;
alter table public.games        enable row level security;
alter table public.game_players enable row level security;

create policy "players are readable by signed-in users"
  on public.players for select to authenticated using (true);
create policy "players can rename themselves"
  on public.players for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "venues are readable by signed-in users"
  on public.venues for select to authenticated using (true);
create policy "games are readable by signed-in users"
  on public.games for select to authenticated using (true);
create policy "game_players are readable by signed-in users"
  on public.game_players for select to authenticated using (true);
