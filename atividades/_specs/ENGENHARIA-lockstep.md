# Engenharia — modo aula lockstep

Arquitetura, mecanismos, decisões e pendências das atividades. Para a visão e o estado das rodadas, ver [`DESIGN.md`](DESIGN.md).

Atualizado em 2026-06-24. Substitui o antigo `docs-internos/lockstep-engenharia.md` (que cobria só o piloto da R1).

---

## 1. Dois sistemas de painel (não confundir)

1. **Painel multi-atividade (original):** `painel.html` + `lib/painel-core.js` + `lib/painel-0X-*.js`. É um **monitor agregado**, não lockstep: mostra progresso ao vivo e tem um **revelar em 4 fases** (monitor → gabarito → pódio da rodada → pódio geral acumulado) com medalhas, setas ↑↓, confete e fanfarra. Herdado do Intencionalidade. O **pódio original mora aqui**.
2. **Painéis-piloto (lockstep):** `painel-{nomear,fronteiras,dimensoes}.html` + `lib/painel-mc.js` / `lib/painel-dimensoes.js`. Condução **questão a questão** (Peer Instruction): Iniciar → Votação → Resultado → … → fim/pódio. São páginas à parte para não desestabilizar o painel original.

Os dois falam com o mesmo Supabase. O pódio dos painéis-piloto reusa o **visual e os sons** do pódio original via `lib/podio.js` (extraído, sem tocar no `painel-core.js`).

---

## 2. O ponteiro de sessão (sincronização) + Realtime

Estado compartilhado mínimo: **em que questão e fase a turma está**. O professor escreve; os alunos leem.

```
estado = { item: índice 0-based, fase, epoca }
fases  = "responder" | "resultado" | "reset" | "fim"
```

`lib/ponteiro.js` — abstração com backend escolhido por `usaSupabase()`:

- **Supabase REALTIME** (entre dispositivos, instantâneo): `observarRealtime` é um **cliente Phoenix WebSocket mínimo na unha** (sem `supabase-js`), que assina `postgres_changes` da tabela `sessao_estado` filtrada pela sessão. Mantém um **poll de segurança de 1,5s** — se o WS cair ou o Realtime não estiver habilitado, continua funcionando (nunca regride). Os dois caminhos passam por um `emitir()` que deduplica.
- **Local** (mesma máquina, para testar): `BroadcastChannel` + `localStorage`, com poll de segurança de 800ms.

Escrita do ponteiro: sempre via REST (`SB.definirEstado` → RPC). Só a **leitura** virou push.

A mesma técnica vale para a **contagem de votos**: `lib/realtime.js` (`RT.assinar({table, sessao, topico, onChange})`) é um cliente Phoenix WS **genérico** (irmão do do ponteiro, sem tocá-lo) que assina `postgres_changes` de uma tabela filtrada por sessão. Os painéis assinam `respostas` (o filtro `sessao=eq.<sessao>` pega votos **e** entradas no `_lobby`, mesma tabela) e, a cada mudança, disparam um **refresh debounced (250ms)** do poll — que continua de 1,5s como **rede de segurança**. Sub re-assinada quando o código da sessão muda.

API: `PONTEIRO.observar(sessao, atividade, cb)`, `PONTEIRO.definir(sessao, atividade, estado)`, `PONTEIRO.ler(sessao, atividade)` (leitura única, Promise — o painel retoma a rodada após reload), `PONTEIRO.proxima(estado, total)` (avança fase/questão, preserva `epoca`), `PONTEIRO.modo()`.

⚠️ O Realtime exige que as tabelas estejam na publicação `supabase_realtime` (seção 7). Sem isso, o sistema cai no poll de 1,5s.

---

## 3. Os libs generalizados (a decisão central)

Em vez de duplicar a lógica por rodada, ela foi extraída para libs reaproveitáveis; cada página vira uma **casca fina** (esqueleto HTML + uma chamada `init(cfg)`).

### 3.1 Múltipla escolha — R1, R2

- **`lib/atividade-mc.js`** (`AtividadeMC.init(cfg)`) — motor do aluno: roda treino **e** aula lockstep. `cfg = { data, atividade, unidade, rotuloProximo, medalha, palpite }`.
  - `palpite: true` (R1) → o treino tem a fase de **evocação** (o grupo digita um palpite antes das opções).
  - `palpite: false` (R2) → **lightning**: o treino vai direto às opções.
  - O modo **aula é idêntico** nos dois (sem palpite; vota → resultado).
  - `respostas[i] = { item_id, escolha1, correto1 }`. Pontua `correto1`.
- **`lib/painel-mc.js`** (`PainelMC.init({ data, atividade, unidade })`) — condução do professor.

Contrato de dados (`data.ITENS[i]`): `{ id, correta, roteiro, opcoes:[{chave,label}], vinheta(HTML), fronteira(HTML) }` + `data.NOTA_REVELACAO`.

### 3.2 Dimensional — R3

R3 tem mecânica própria (não MC), então tem o seu par de libs:

- **`lib/atividade-dimensoes.js`** (`AtividadeDimensoes.init()`) — por caso, o grupo classifica 5 dimensões (B/M/A); 3 pontuam por **banda de referência**. Aula: classifica → **Confirmar classificação** (voto) → resultado com veredito por dimensão (✓/✗ vs banda; "discussão" nas outras) + o **ponto de discussão do caso**.
- **`lib/painel-dimensoes.js`** (`PainelDimensoes.init({ data })`) — condução; no resultado mostra a **divergência da turma** (barras B/M/A por dimensão + banda sobreposta) + o ponto de discussão.

Contrato (`data.CASOS[i]`): `{ id, nome, vinheta(HTML), banda:{dim:[níveis]}, discussao(HTML), caso_completo }` + `data.DIMENSOES`, `data.NIVEIS`, `data.NOTA`.

### 3.3 Pódio — compartilhado

- **`lib/podio.js`** (`Podio.render(container, { grupos:[{grupo,pontos}], max, titulo, sub, festa })`) — desenha a classificação no fim da rodada: barras em cascata, medalhas 🥇🥈🥉, e (com `festa:true`) confete + fanfarra. Mesmo visual/sons do pódio original. Os painéis-piloto calculam o placar de cada grupo (`rankingDados()`, que une o roster do lobby + os votos; quem não votou = 0) e chamam `Podio.render` **uma vez** ao entrar no fim.

---

## 4. O ciclo de cada questão (2 fases)

Começou com 4 fases (Mazur completo, com re-voto), mas o usuário achou cansativo. Simplificado para **2 fases**:

1. **Votação** (`responder`): o grupo vota uma vez. O painel vê "X/N votaram" (ou "classificaram", na R3) subir; quando todos votam, **sinal sonoro + ✓ verde**.
2. **Resultado** (`resultado`): o professor revela → telão mostra a distribuição/divergência + o ponto de discussão; cada aluno vê o **próprio veredito** + som.

Decisões: pontua o **voto** (a escolha independente); sem spoiler na votação; o botão do painel diz a **próxima ação** ("Mostrar os resultados ▸" / "Próxima questão ▸" / "Ver a classificação ▸"); opções **embaralhadas** (estáveis na questão, reembaralhadas por rodada).

---

## 5. Presença de SESSÃO + mapa do campeonato

Problema histórico: a presença era registrada só quando o aparelho estava **dentro** de uma rodada, então o painel ficava zerado enquanto os grupos estavam no mapa — o que levou (errado) a tirar o mapa.

Solução atual: o grupo registra **presença de sessão** assim que é escolhido no hub, antes de qualquer rodada.

- `index.html` → `registrarPresenca(sessao, grupo)` (chamada em `irMapa()`): grava uma linha com `atividade:"_lobby"` no Supabase (ou chave `_lobby:estado:<sessao>:<grupo>` no localStorage).
- Os painéis lêem esse roster via `gruposLobby()` — usado no placar do lobby **e** como o **N** de "X/N votaram". Como o `painel-mc.js`/`painel-dimensoes.js` compartilham isso, **todas** as rodadas mostram os grupos antes mesmo de entrarem.
- O mapa (`irMapa`) joga em sequência: a rodada atual é ▶; as próximas ficam 🔒 até concluir a anterior (`AULA.concluidas`).

---

## 6. Backend Supabase (genérico, multi-atividade)

`supabase/setup.sql` roda **uma vez** e serve as 5 rodadas — o discriminador é a coluna `atividade`.

- `respostas (sessao, atividade, grupo, pontuacao, dados jsonb, criado_em)` — chave `(sessao, atividade, grupo)`; upsert via RPC `enviar_resposta` (SECURITY DEFINER). A presença de sessão usa `atividade = "_lobby"`.
- `sessao_estado (sessao, atividade, item_atual, fase, epoca, atualizado_em)` — o ponteiro; chave `(sessao, atividade)`; escrita via RPC `definir_estado`.
- `faxina_respostas` (pg_cron) — apaga linhas antigas.
- **Realtime:** seção 6 do `setup.sql` adiciona `sessao_estado` e `respostas` à publicação `supabase_realtime` (guardado para re-rodar sem erro).
- **Por rodada não muda nada no banco** — só o `atividade` id ("nomear", "fronteiras", "dimensoes", "sindrome", "casos", "_lobby").

**Modelo de PRODUÇÃO (código pronto):** os painéis têm **login do professor por e-mail+senha** (portão `painel-auth.js`; `grant_type=password`) e o RLS está apertado:

- `definir_estado` (escrever o ponteiro) → grant só a `authenticated` **e** a função checa o e-mail do professor (`henriquealvarenga@gmail.com`). Aluno anônimo ou outro usuário logado não mexe no ponteiro.
- `respostas` → **sem leitura anônima** (policy `anon_select_piloto` removida). Só o professor logado lê (policy `owner_select_respostas`, por e-mail). Alunos **escrevem** por RPC `SECURITY DEFINER` (`enviar_resposta`, grant anon) sem poder ler.
- `sessao_estado` → leitura anônima continua liberada (alunos precisam acompanhar o ponteiro; nada sensível: só índice + fase).
- **Realtime de `respostas`** exige o token do professor: `RT.assinar({..., tokenFn: SB.getAuthToken})` passa o `access_token` no join do WS (lido fresco a cada (re)conexão), senão o RLS filtra as mudanças. O ponteiro (`sessao_estado`) não precisa de token (leitura anon). O poll autenticado de 1,5s é a rede de segurança.
- **Modo LOCAL** (config do Supabase vazia): os painéis **dispensam o login** e rodam direto (`<script>` de boot: `if (SB.configValida() && PAINEL_AUTH) proteger(boot); else boot()`), para testar numa máquina só.

A chave **publishable** é pública (ok no cliente); segredos ficam no `.env` (fora do git).

**Para ativar a produção (passos do dono no dashboard do Supabase):**

1. **SQL Editor → rodar o `supabase/setup.sql` atualizado** (idempotente; remove as concessões de piloto e cria o guard de e-mail no `definir_estado`). ✅ feito.
2. **Authentication → Users → Add user → Create new user:** e-mail = `henriquealvarenga@gmail.com`, definir a **senha**, e marcar **Auto Confirm User** (senão a conta fica pendente de confirmação por e-mail). É o único usuário; criado uma vez.
3. **Conferir** que o e-mail autorizado nas policies/função (`henriquealvarenga@gmail.com`) é o mesmo do usuário criado — trocar nos 2 lugares do `setup.sql` se mudar (e re-rodar).
4. Entrar num painel → e-mail + senha → **Entrar** → conduzir. (Em outra aba/aparelho, abrir uma rodada de aluno e confirmar voto → contagem ao vivo no painel.)

> O login por senha **não usa** Redirect URLs nem e-mail/SMTP (aquilo era do magic link). O **Site URL** / **Redirect URLs** já configurados (`…/entrevista/atividades/**` + localhost) são inofensivos e ficam prontos caso um dia se volte ao magic link. A sessão se renova sozinha (`agendarRefresh`), então o login é raro.

---

## 7. Mecanismos-chave

- **Época** (`epoca = Date.now()`): distingue **reinício** (zerar votos) de **reload no meio** (retomar). Cada Iniciar gera uma época nova; o aluno zera os próprios votos só quando a época muda. Entra na comparação `igual()` e é preservada por `proxima()`.
- **Embaralhe estável:** ordem das opções sorteada uma vez por item (cache por `id`), reusada entre votar e resultado; reembaralha na troca de época.
- **Encerrar sessão (teardown):** o painel grava o ponteiro antigo com `fase:"reset"`; o aluno, ao ler `reset`, faz `AULA.limpar()` + volta à tela inicial. O painel gera código novo e limpa as chaves locais (`<atividade>:estado`, `_lobby:estado`, `ponteiro:`).
- **Sinal "todos votaram":** N vem do roster de sessão (`gruposLobby`); quando os votos chegam a N, toca um bip e o `faseTag` fica verde.
- **Discussão por caso (R3):** cada caso tem `discussao` no data file, mostrado no resultado (aluno + telão); o bloco de debate do fim foi removido.
- **Pódio render-once:** flag `fimRenderizado` evita re-animar/re-tocar o pódio a cada poll; resetada ao sair do fim.
- **Campeonato multi-rodada (código único + mapa do professor + placar acumulado):** o código de sessão é **um só para a aula inteira** — todos os painéis usam a mesma chave `localStorage["painel-aula-sessao"]` (antes era por rodada, o que quebrava o lockstep da R2+ porque o aluno entra com UM código no hub). As rodadas se distinguem pelo `atividade`; o roster `_lobby` persiste entre rodadas. No pódio de cada rodada, `navRodadas()` mostra **"Próxima rodada ▸"** (próxima entrada de `HUB_ATIVIDADES` cujo `painel` ≠ null) e **"Mapa das rodadas"**. O **mapa do professor** (`painel-mapa.html`, protegido por login) lista as rodadas com **trava sequencial** (uma abre quando a anterior tem respostas — espelha a trava do aluno, evitando pular na frente e dessincronizar) e mostra a **classificação geral acumulada**: lê `SB.consultarSessaoTudo`, **normaliza cada rodada /100** (`pontuacao / maxPontos × 100`, clamp) e soma por grupo (mesma técnica do agregador do `painel-core.js`). `maxPontos` por rodada vive no `hub-config.js` (R1=10, R2=8, R3=24) — normalizar é essencial porque as escalas diferem.
- **Retomar após reload (painel):** `PONTEIRO.ler(sessao, atividade)` é uma **leitura única** do ponteiro (backend-aware: Supabase ou local). No boot, os painéis (`painel-mc.js`/`painel-dimensoes.js`) chamam `restaurar()` — se há um estado persistido (`fase` ≠ `reset`) e `estadoP` ainda é `null`, retomam a rodada em curso em vez de cair no lobby (a fase `fim` reabre o pódio). Como `nGrupos` é capturado no Iniciar e zera no reload, o `N` de "X/N votaram" cai para `gruposLobby().length` (roster vivo) quando `nGrupos` é 0.

---

## 8. Bugs encontrados e lições

- **TDZ:** variáveis `let`/`var` tocadas por `aulaRender` antes da declaração → tela em branco. Declarar antes do boot.
- **1ª emissão engolida:** `igual(null,null)===true` deduplicava o estado inicial. Sentinela `undefined` no `ultimo`.
- **Cache (recorrente):** `python -m http.server` cacheia → servia HTML/JS antigos (sintoma: painel "supabase" × aluno "local"). Usar `code/devserver.py` (no-store) + cache-buster `?v=N` nos libs que mudam.
- **Painel zerado no mapa:** presença era por-rodada. Resolvido com a presença de sessão (seção 5).
- **Pódio "fantasma":** os painéis-piloto diziam "projete a classificação geral" mas não desenhavam nada — o pódio já existia no `painel-core.js`. **Lição: conferir o que já foi feito (aqui e no Intencionalidade) antes de reimplementar.**

---

## 9. Servidor de desenvolvimento

`code/devserver.py [porta]` (padrão 8000) — `Cache-Control: no-store`, serve a raiz. Cross-device na mesma rede: `http://<IP>:<porta>/atividades/index.html`. Config de preview em `.claude/launch.json` (porta 8011).

---

## 10. Pendências

- **R5 (O caso completo):** não existe — build novo (sprint de MC + pódio final). **R4 já feita** (reusa `atividade-mc.js`/`painel-mc.js`; 12 casos psicopatológicos, sem palpite, sem negrito).
- **Produção (código pronto, falta o dashboard):** o login do professor e o RLS apertado já estão no código; faltam os passos do dono no Supabase (rodar o `setup.sql`, Redirect URLs, SMTP) — ver seção 6.
- **Generalizar o shell de condução do painel:** `painel-mc.js` e `painel-dimensoes.js` duplicam a condução. Se vier um 3º tipo de painel, extrair um núcleo comum (hoje não vale o risco de mexer no já verificado).

---

## 11. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `atividades/index.html` | hub: cards aula/treino, **mapa** do campeonato, **presença de sessão** |
| `atividades/lib/aula.js` | identidade única (modo/sessão/grupo), progresso do campeonato |
| `atividades/lib/hub-config.js` | registro das 5 rodadas (ids, títulos, arquivos do aluno **e do painel**, `maxPontos` p/ normalização) |
| `atividades/painel-mapa.html` | **hub do professor**: código único, lista de rodadas (trava sequencial) e classificação geral acumulada (normalizada) — protegido por login |
| `atividades/lib/ponteiro.js` | sincronização do ponteiro: local + **Supabase Realtime** (WS) + poll de segurança |
| `atividades/lib/realtime.js` | cliente Phoenix WS **genérico** (`RT.assinar`): Realtime da contagem de votos (tabela `respostas`) |
| `atividades/lib/sfx.js` | sons (aluno: click/acerto/erro; painel: whoosh/fanfarra) |
| `atividades/lib/podio.js` | **pódio compartilhado** (barras, medalhas, confete, fanfarra) |
| `atividades/lib/supabase.js` / `supabase-config.js` | REST helper + URL/chave publishable |
| **R1/R2 (múltipla escolha)** | |
| `atividades/lib/atividade-mc.js` | motor do aluno (treino + aula), flag `palpite` |
| `atividades/lib/painel-mc.js` | condução do professor (lobby → fases → pódio) |
| `atividades/01-nomear.html` / `painel-nomear.html` | casca fina R1 (aluno / painel) |
| `atividades/02-fronteiras.html` / `painel-fronteiras.html` | casca fina R2 (aluno / painel) |
| `atividades/lib/01-nomear-data.js` / `02-fronteiras-data.js` | bancos de itens R1 / R2 |
| `atividades/04-sindrome.html` / `painel-sindrome.html` | casca fina R4 (aluno / painel) |
| `atividades/lib/04-sindrome-data.js` | banco de itens R4 (12 casos; linguagem psicopatológica; rótulo "Como diferenciar:") |
| **R3 (dimensional)** | |
| `atividades/lib/atividade-dimensoes.js` | motor do aluno R3 (grade B/M/A, treino + aula) |
| `atividades/lib/painel-dimensoes.js` | condução R3 (divergência + ponto de discussão) |
| `atividades/03-dimensoes.html` / `painel-dimensoes.html` | casca fina R3 (aluno / painel) |
| `atividades/lib/03-dimensoes-data.js` | 8 casos, 5 dimensões, bandas, `discussao` |
| **Painel multi-atividade (original, separado)** | |
| `atividades/painel.html` + `lib/painel-core.js` | monitor agregado + pódio original (4 fases) |
| `atividades/lib/painel-auth.js` | login do professor (Supabase Auth) — **senha** nos painéis-piloto (campo `#authPassword`), magic link no `painel.html` original |
| `atividades/lib/painel-0X-*.js` | módulos por rodada do painel original (legado p/ os pilotos) |
| **Backend / infra** | |
| `supabase/setup.sql` | tabelas, RPCs, RLS, faxina, **Realtime** — genérico p/ as 5 rodadas |
| `code/devserver.py` | servidor de dev sem cache |
