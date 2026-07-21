# Correção de carregamento do frontend

Esta correção não reimporta nem apaga os dados já migrados.

## Aplicação

1. No Supabase, abra o SQL Editor.
2. Execute todo o arquivo `supabase/runtime-compat.sql`.
3. No projeto do GitHub Pages, substitua `js/supabase.js` pelo arquivo deste pacote.
4. Publique e aguarde a atualização do GitHub Pages.
5. Faça recarregamento forçado no navegador (`Cmd + Shift + R` no Mac).

## Teste seguro

1. A tela inicial deve mostrar a seleção de campeonato e perfil.
2. Confirme os cinco campeonatos e os seis perfis.
3. Entre em um perfil e navegue sem editar nada.
4. Faça uma alteração pequena e reversível, como favoritar um jogador.
5. Recarregue a página e confirme que a alteração permaneceu.

A tabela `runtime_documents` guarda somente os documentos alterados pelo app. A base inicial continua sendo reconstruída a partir das tabelas normalizadas já importadas. O frontend não usa Firebase e não envia o backup completo a cada alteração.
