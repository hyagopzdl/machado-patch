begin;

alter table public.app_meta enable row level security;
alter table public.admin_security enable row level security;
alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.player_ownership enable row level security;
alter table public.global_player_ownership enable row level security;
alter table public.player_stats enable row level security;
alter table public.trade_offers enable row level security;
alter table public.trade_offer_history enable row level security;
alter table public.transfers enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.player_reviews enable row level security;
alter table public.player_review_votes enable row level security;
alter table public.player_catalog_overrides enable row level security;
alter table public.profile_favorites enable row level security;
alter table public.presence enable row level security;
alter table public.admin_imports enable row level security;
alter table public.operation_journal enable row level security;
alter table public.sync_events enable row level security;

-- O app ainda usa perfis + PIN próprios, sem Supabase Auth. A anon key pode ler os dados
-- necessários, mas toda escrita passa por funções SECURITY DEFINER, nunca por INSERT/UPDATE direto.
do $$
declare t text;
begin
  foreach t in array array[
    'app_meta','profiles','tournaments','tournament_participants','teams','matches',
    'player_ownership','global_player_ownership','player_stats','trade_offers','trade_offer_history',
    'transfers','financial_transactions','player_reviews','player_review_votes',
    'player_catalog_overrides','profile_favorites','presence','admin_imports','sync_events'
  ] loop
    execute format('drop policy if exists anon_read on public.%I', t);
    execute format('create policy anon_read on public.%I for select to anon using (true)', t);
  end loop;
end $$;

-- Dados sensíveis e trilha de rollback não são legíveis pela anon key.
revoke all on public.admin_security from anon, authenticated;
revoke all on public.operation_journal from anon, authenticated;

-- Impede escrita direta em todas as tabelas; apenas RPCs autorizadas podem escrever.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
grant select on public.app_meta, public.profiles, public.tournaments, public.tournament_participants,
  public.teams, public.matches, public.player_ownership, public.global_player_ownership,
  public.player_stats, public.trade_offers, public.trade_offer_history, public.transfers,
  public.financial_transactions, public.player_reviews, public.player_review_votes,
  public.player_catalog_overrides, public.profile_favorites, public.presence,
  public.admin_imports, public.sync_events to anon, authenticated;

grant usage on schema public to anon, authenticated;

commit;
