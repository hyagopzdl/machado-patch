# Migração Firebase Realtime Database → Supabase

Esta entrega remove a dependência ativa do Firebase. O frontend continua estático no GitHub Pages e utiliza apenas `SUPABASE_URL` e `SUPABASE_ANON_KEY`. A `service_role` aparece somente nos scripts locais de migração e validação administrativa.

## 1. Criar o projeto Supabase

1. Crie um projeto vazio no Supabase.
2. Em **Project Settings → API**, copie a URL, a chave `anon` e, apenas para uso local, a chave `service_role`.
3. Não coloque a `service_role` em nenhum arquivo publicado no GitHub Pages.

## 2. Executar os SQLs

No SQL Editor, execute exatamente nesta ordem:

1. `supabase/schema.sql`
2. `supabase/indexes.sql`
3. `supabase/functions.sql`
4. `supabase/rls.sql`

Depois, em **Database → Replication**, habilite Realtime somente para `sync_events`. O frontend assina apenas essa tabela e recarrega o estado quando uma nova revisão é publicada.

## 3. Preparar o backup

Mantenha o backup original intacto. Faça uma cópia ao lado dos scripts com o nome `firebase-backup.json`, ou passe o caminho original via `--input`.

## 4. Testar o parser sem gravar

```bash
node scripts/migrate-firebase-to-supabase.mjs --input /caminho/backup.json --dry-run
```

O comando valida o JSON e imprime as quantidades detectadas por entidade.

## 5. Importar os dados

No terminal local:

```bash
export SUPABASE_URL="https://SEU-PROJETO.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE"
node scripts/migrate-firebase-to-supabase.mjs --input /caminho/backup.json
```

O script é idempotente: lê a revisão atual e substitui o snapshot e as tabelas normalizadas dentro de uma única transação PostgreSQL. IDs originais são mantidos.

## 6. Validar a migração

```bash
export SUPABASE_URL="https://SEU-PROJETO.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE"
node scripts/validate-migration.mjs --input /caminho/backup.json
```

A validação compara as quantidades do Firebase com as tabelas normalizadas no Supabase e encerra com código 1 se houver divergência.

## 7. Configurar o frontend

Edite `js/config.js`:

```js
window.__SUPABASE_CONFIG__ = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_SUPABASE_ANON_KEY"
};
```

Somente esses dois valores públicos devem existir no GitHub Pages. O sistema de perfis e PIN foi preservado nesta etapa.

## 8. Testes antes da virada

Execute:

```bash
npm run check
```

Depois abra o app em um servidor estático local e teste, com dois navegadores/perfis:

- login por perfil e PIN;
- troca de campeonato;
- paginação/listas extensas;
- compra e venda no mercado;
- proposta, contraproposta, aceite e recusa;
- registro/edição de partidas e recompensas;
- escalações e favoritos;
- revisão de jogadores e votação;
- rollback administrativo;
- sincronização entre duas abas.

## 9. Virada final

1. Faça um último export do Firebase e não o altere.
2. Coloque o app em manutenção ou impeça novas gravações no Firebase.
3. Rode novamente o script de importação com o export final.
4. Rode a validação e exija todas as linhas como `OK`.
5. Publique os arquivos alterados no GitHub Pages.
6. Confirme operações críticas em produção.
7. Somente depois, desative as regras/escritas do Firebase. Não apague o backup.

## Arquitetura da adaptação

`js/supabase.js` implementa a interface usada pelo app (`ref`, `set`, `update`, `transaction`, listeners), porém toda persistência ocorre no Supabase. Cada gravação usa revisão otimista e chama `commit_legacy_snapshot`, que atualiza o snapshot compatível e todas as tabelas normalizadas na mesma transação. As funções SQL específicas (`market_purchase`, `market_sale`, `create_trade_offer`, `counter_trade_offer`, `accept_trade_offer`, `apply_match_rewards`, `rollback_operation`) ficam disponíveis para evolução gradual do frontend sem perder atomicidade.

## Segurança

As tabelas têm RLS habilitado. A anon key possui leitura do conjunto necessário ao app, mas não recebe permissões de escrita direta. Escritas são feitas por RPCs `SECURITY DEFINER`. Como o app ainda não usa Supabase Auth, a autorização continua baseada no perfil/PIN legado; isso mantém o comportamento atual, mas não equivale à segurança forte de identidade do Supabase Auth. Uma fase futura deve migrar autenticação e restringir as RPCs por `auth.uid()`.
