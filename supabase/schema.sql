begin;

create extension if not exists pgcrypto;

create table if not exists public.app_meta (
  id boolean primary key default true check (id),
  current_tournament_id text,
  identity_schema_version integer not null default 0,
  identity_migrated_at timestamptz,
  season_counter integer not null default 0,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_security (
  id boolean primary key default true check (id),
  password_hash text,
  updated_at timestamptz,
  updated_by_profile_id text
);

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  color text,
  avatar text,
  role text not null default 'player' check (role in ('player','admin')),
  active boolean not null default true,
  pin_hash text,
  pin_updated_at timestamptz,
  recovered_from_tournament boolean not null default false,
  recovered_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_order integer not null default 0
);

alter table public.admin_security
  drop constraint if exists admin_security_updated_by_profile_id_fkey;
alter table public.admin_security
  add constraint admin_security_updated_by_profile_id_fkey foreign key (updated_by_profile_id) references public.profiles(id) on delete set null;

create table if not exists public.tournaments (
  id text primary key,
  name text not null,
  format text,
  type text,
  status text not null default 'draft',
  champion text,
  cup_stage text,
  groups_data jsonb,
  cup_snapshot jsonb,
  final_standings jsonb,
  economy_settings jsonb,
  final_prize_settings jsonb,
  market_balance_settings jsonb,
  market_settings jsonb,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz,
  finished_at timestamptz,
  reset_at timestamptz,
  reset_by_profile_id text references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  source_order integer not null default 0
);

alter table public.app_meta
  drop constraint if exists app_meta_current_tournament_id_fkey;
alter table public.app_meta
  add constraint app_meta_current_tournament_id_fkey foreign key (current_tournament_id) references public.tournaments(id) on delete set null deferrable initially deferred;

create table if not exists public.tournament_participants (
  tournament_id text not null references public.tournaments(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  position integer,
  primary key (tournament_id, profile_id)
);

create table if not exists public.teams (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  profile_id text references public.profiles(id) on delete set null,
  name text not null,
  color text,
  budget numeric(14,2) not null default 0,
  active boolean not null default true,
  historical boolean not null default false,
  lineup jsonb,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_order integer not null default 0,
  unique (tournament_id, profile_id)
);

create table if not exists public.matches (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  home_team_id text references public.teams(id) on delete set null,
  away_team_id text references public.teams(id) on delete set null,
  home_profile_id text references public.profiles(id) on delete set null,
  away_profile_id text references public.profiles(id) on delete set null,
  stage text,
  round integer,
  leg integer,
  status text,
  played boolean not null default false,
  home_score integer,
  away_score integer,
  played_at timestamptz,
  created_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  source_order integer not null default 0
);

create table if not exists public.player_ownership (
  tournament_id text not null references public.tournaments(id) on delete cascade,
  player_id text not null,
  team_id text references public.teams(id) on delete set null,
  initial_team_id text references public.teams(id) on delete set null,
  squad_role text,
  acquisition_source text,
  acquired_at timestamptz,
  for_sale boolean not null default false,
  raw_data jsonb not null default '{}'::jsonb,
  primary key (tournament_id, player_id)
);

create table if not exists public.global_player_ownership (
  player_id text primary key,
  team_id text,
  for_sale boolean not null default false,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.player_stats (
  tournament_id text not null references public.tournaments(id) on delete cascade,
  player_id text not null,
  team_id text references public.teams(id) on delete set null,
  player_name_snapshot text,
  goals integer not null default 0,
  red_cards integer not null default 0,
  updated_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  primary key (tournament_id, player_id)
);

create table if not exists public.trade_offers (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  player_id text not null,
  player_name text,
  buyer_team_id text not null references public.teams(id) on delete cascade,
  seller_team_id text not null references public.teams(id) on delete cascade,
  buyer_profile_id text references public.profiles(id) on delete set null,
  seller_profile_id text references public.profiles(id) on delete set null,
  current_amount numeric(14,2) not null check (current_amount >= 0),
  market_value_at_creation numeric(14,2),
  last_actor_team_id text references public.teams(id) on delete set null,
  status text not null,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.trade_offer_history (
  id text primary key,
  offer_id text not null references public.trade_offers(id) on delete cascade,
  actor_team_id text references public.teams(id) on delete set null,
  action_type text not null,
  amount numeric(14,2),
  created_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.transfers (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  player_id text not null,
  player_name text,
  transfer_type text not null,
  from_team_id text references public.teams(id) on delete set null,
  to_team_id text references public.teams(id) on delete set null,
  offer_id text references public.trade_offers(id) on delete set null,
  price numeric(14,2) not null default 0,
  market_value numeric(14,2),
  depreciation_pct numeric(6,2),
  transfer_date text,
  created_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.financial_transactions (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  team_id text not null references public.teams(id) on delete cascade,
  transaction_type text not null,
  amount numeric(14,2) not null,
  balance_before numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  label text,
  reference_id text,
  operation_id uuid,
  created_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  check (balance_after = balance_before + amount)
);

create table if not exists public.player_reviews (
  id text primary key,
  player_id text not null,
  player_name_snapshot text,
  created_by_profile_id text references public.profiles(id) on delete set null,
  created_by_name_snapshot text,
  original jsonb not null default '{}'::jsonb,
  proposed jsonb not null default '{}'::jsonb,
  status text not null,
  applying_by_profile_id text references public.profiles(id) on delete set null,
  applying_at timestamptz,
  resolved_by_profile_id text references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_reason text,
  created_at timestamptz,
  updated_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.player_review_votes (
  review_id text not null references public.player_reviews(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('approve','reject')),
  avatar_snapshot text,
  name_snapshot text,
  created_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  primary key (review_id, profile_id)
);

create table if not exists public.player_catalog_overrides (
  player_id text primary key,
  overall integer,
  market_value numeric(14,2),
  updated_by_profile_id text references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.profile_favorites (
  tournament_id text not null references public.tournaments(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  player_id text not null,
  created_at timestamptz not null default now(),
  primary key (tournament_id, profile_id, player_id)
);

create table if not exists public.presence (
  profile_id text primary key references public.profiles(id) on delete cascade,
  online boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_imports (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  imported_by_profile_id text references public.profiles(id) on delete set null,
  import_type text,
  mode text,
  player_count integer,
  team_count integer,
  imported_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.operation_journal (
  id uuid primary key default gen_random_uuid(),
  tournament_id text references public.tournaments(id) on delete cascade,
  operation_type text not null,
  actor_profile_id text references public.profiles(id) on delete set null,
  before_state jsonb not null,
  after_state jsonb not null,
  rolled_back_at timestamptz,
  rolled_back_by_profile_id text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_state (
  id boolean primary key default true check (id),
  snapshot jsonb not null default '{}'::jsonb,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_events (
  id bigint generated always as identity primary key,
  revision bigint not null,
  event_type text not null,
  tournament_id text,
  actor_profile_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.app_meta (id) values (true) on conflict (id) do nothing;
insert into public.admin_security (id) values (true) on conflict (id) do nothing;
insert into public.legacy_state (id) values (true) on conflict (id) do nothing;

commit;
