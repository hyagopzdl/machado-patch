# Manchado Patch — estrutura refatorada

A aplicação continua buildless e pode ser servida por qualquer servidor HTTP estático.

## Execução local

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`. Não abra o HTML diretamente via `file://`, pois o navegador bloqueia o carregamento de `players.json`.

## Organização

- `index.html`: dependências e ordem de inicialização.
- `css/`: tokens, base, layout, componentes, funcionalidades e responsividade.
- `js/app.js`: ponto único de inicialização do React.
- `js/state.js`: persistência e defaults globais de estado.
- `js/firebase.js`: inicialização, leitura, escrita e migração do Firebase.
- `js/utils.js`: utilitários puros.
- `js/components/`: componentes visuais compartilhados.
- `js/features/`: regras puras por domínio.

## Escalacoes e formacoes - v1

- Segmented control entre Elenco e Formacao.
- Presets: 4-3-3, 4-2-3-1, 4-4-2, 4-1-2-1-2, 3-5-2, 5-4-1, 5-3-2 e 3-4-3.
- Auto-organizacao por compatibilidade de posicao e overall.
- Troca de titulares tocando em um slot do campo.
- Banco de reservas calculado automaticamente.
- Persistencia em `team.lineup`, dentro do contexto atual do campeonato.
- Drag and drop e formacao personalizada ficam fora desta primeira iteracao.
