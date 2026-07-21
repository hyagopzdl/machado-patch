-- Remove imagens Base64 duplicadas dos snapshots históricos e dos votos.
-- Execute uma vez no SQL Editor do Supabase depois de publicar o patch.

update public.tournaments
set final_standings = (
  select coalesce(jsonb_agg(item - 'avatarSnapshot'), '[]'::jsonb)
  from jsonb_array_elements(final_standings::jsonb) as item
)
where final_standings is not null
  and jsonb_typeof(final_standings::jsonb) = 'array';

update public.player_review_votes
set avatar_snapshot = null
where avatar_snapshot is not null;

-- Verificação rápida dos tamanhos após a limpeza.
select
  'tournaments.final_standings' as resource,
  coalesce(sum(pg_column_size(final_standings)), 0) as bytes
from public.tournaments
union all
select
  'player_review_votes.avatar_snapshot' as resource,
  coalesce(sum(pg_column_size(avatar_snapshot)), 0) as bytes
from public.player_review_votes;
