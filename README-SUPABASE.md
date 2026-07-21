# Arquivos da migração

- `supabase/schema.sql`: schema normalizado e constraints.
- `supabase/indexes.sql`: índices de consulta e paginação.
- `supabase/functions.sql`: importação transacional, compatibilidade, mercado, propostas, recompensas e rollback.
- `supabase/rls.sql`: RLS e permissões.
- `scripts/migrate-firebase-to-supabase.mjs`: importação idempotente.
- `scripts/validate-migration.mjs`: comparação de quantidades.
- `js/supabase.js`: substituto do Firebase no frontend.
- `js/config.js`: configuração pública do GitHub Pages.
- `MIGRATION.md`: execução passo a passo.
