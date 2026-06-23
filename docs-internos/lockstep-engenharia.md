# Atividades em sala — modelo lockstep (Peer Instruction)

Documento técnico do **piloto da Rodada 1 ("Nomear o fenômeno")**: arquitetura, decisões de design, mecanismos, bugs resolvidos e o que falta. Serve de **spec** para replicar o modelo nas Rodadas 2–5.

Iniciado em 2026-06. Engenharia portada do `Intencionalidade_Project` (Quarto + JS puro, sem framework, sem CDN, fontes self-hosted) e estendida com o modo aula lockstep.

---

## 1. Visão geral e objetivo

As atividades são um campeonato em grupos jogado em sala. Cada grupo usa um aparelho; o professor projeta um código e conduz no telão. O **modo aula** segue o método **Peer Instruction / ConcepTest (Eric Mazur)**: o professor abre uma questão, todos os grupos votam, e a discussão acontece **no calor da decisão** — não no fim da rodada. O insight pedagógico do usuário: "a discussão no fim perde o clímax; os alunos só querem ir para a próxima". Por isso o ciclo é por questão.

Há **dois modos**, e isso é o que salva a complexidade:

- **aula** (lockstep): a turma anda junta, questão a questão, **dirigida pelo professor**. Sincronização via backend (Supabase) ou local (mesma máquina).
- **treino** (self-paced): aluno sozinho, no seu ritmo, com gabarito imediato. **Inalterado** — é o fluxo original das atividades.

O aluno só entra em lockstep no modo aula; o treino continua exatamente como nas outras atividades.

---

## 2. O ciclo de cada questão (versão final, simplificada)

Começamos com 4 fases (Mazur completo, com re-voto), mas o usuário achou **cansativo**. Simplificamos para **2 fases**:

1. **Votação** (`responder`): o grupo vota **uma vez**. O professor vê "X/N votaram" subindo. Quando todos votam: **sinal sonoro + ✓ verde** no painel.
2. **Resultado** (`resultado`): o professor revela quando quiser → o telão mostra a **distribuição da turma com a resposta certa** + a fronteira; cada aluno vê o **próprio veredito** (verde/vermelho) + som de acerto/erro.

Decisões fechadas com o usuário ao longo do caminho:

- **Pontua o VOTO 1** (a escolha independente). O re-voto (segredo do Mazur) foi **removido** na simplificação — a discussão acontece olhando o resultado, sem nova votação.
- **Sem spoiler:** na votação, o aparelho NÃO mostra a resposta certa; só no resultado.
- **Botão do painel diz a próxima ação** (não um "Avançar" genérico): "Mostrar os resultados ▸" → "Próxima questão ▸" (→ "Encerrar rodada ▸" na última). O `faseTag` diz onde está; o botão diz para onde vai.
- **Opções embaralhadas** (a correta não fica sempre na 1ª posição), estáveis dentro da questão e por grupo, reembaralhadas a cada rodada.
- **Veredito por grupo** (não só no telão): banner verde "✓ Vocês acertaram!" / vermelho "✗ … a resposta certa era X", + opção certa em verde e a escolha errada do grupo em vermelho, + som (`SFX.acerto`/`SFX.erro`) tocado **uma vez** ao revelar.

---

## 3. Arquitetura

### 3.1 O ponteiro de sessão (a sincronização)

O estado compartilhado é mínimo: **em que questão e fase a turma está**. O professor escreve; os alunos leem.

```
estado do ponteiro = { item: índice 0-based, fase, epoca }
fases = "responder" | "resultado" | "reset" | "fim"
```

`lib/ponteiro.js` — abstração com **backend duplo**, escolhido automaticamente por `usaSupabase()`:

- **Supabase** (real, entre dispositivos): leitura por polling de `SB.lerEstado` (1,5s); escrita por `SB.definirEstado` (RPC).
- **Local** (mesma máquina, para desenvolver/testar): `BroadcastChannel` + `localStorage`, com **poll de segurança de 800ms** (relê o localStorage mesmo se os eventos não dispararem entre abas).

API: `PONTEIRO.observar(sessao, atividade, cb)` (assina; devolve cancelador), `PONTEIRO.definir(sessao, atividade, estado)`, `PONTEIRO.proxima(estado, total)` (avança fase/questão, preserva `epoca`), `PONTEIRO.FASES`, `PONTEIRO.modo()`.

### 3.2 O aluno (`atividades/01-nomear.html`, ramo aula)

Ramifica no boot por `MODO`: aula → `aulaBoot()` (lockstep); treino → `bootAtividade()` (original, intacto). O ramo aula: registra presença, mostra a sala de espera, e o `aulaRender(p)` desenha a tela conforme `{item, fase, epoca}` do ponteiro. `respostas[i] = { item_id, escolha1, correto1 }`. Pontua `correto1`.

### 3.3 O painel piloto (`atividades/painel-nomear.html`)

Página dedicada ao piloto (isolada do `painel.html` multi-atividade, para não desestabilizá-lo). Faz: gerar/exibir código, **sala de espera** (conta os grupos), controle de fase (Iniciar → Mostrar resultados → Próxima), sinal de "todos votaram" (som + verde), render do resultado (distribuição + fronteira) e o **encerrar sessão** (teardown). Lê os grupos do **localStorage** (modo local) ou do **Supabase** (cache do poll de 1,5s), conforme `SB_ON`.

### 3.4 Backend Supabase (genérico, multi-atividade)

`supabase/setup.sql` — **uma vez, serve as 5 rodadas**. O discriminador é a coluna `atividade`.

- `respostas (sessao, atividade, grupo, pontuacao, dados jsonb, criado_em)` — chave única `(sessao, atividade, grupo)`; upsert via RPC `enviar_resposta` (SECURITY DEFINER, anon).
- `sessao_estado (sessao, atividade, item_atual, fase, epoca, atualizado_em)` — o ponteiro; chave `(sessao, atividade)`; escrita via RPC `definir_estado`.
- `faxina_respostas` (pg_cron) — apaga respostas > 30 dias.
- **Por rodada NÃO muda nada no banco** — só o `atividade` id ("nomear", "fronteiras", "dimensoes", "sindrome", "casos").

---

## 4. Mecanismos-chave (as "questões" que resolvemos)

### 4.1 Época (carimbo de início de rodada)

Problema: distinguir **reinício** (zerar votos) de **reload no meio** (retomar). Solução: cada Iniciar/Reiniciar gera uma `epoca` nova (`Date.now()`). O aluno guarda a sua; se a do ponteiro mudou → rodada nova → zera os próprios votos + reembaralha opções; se é a mesma → retoma sem perder nada. A `epoca` entra na comparação `igual()` do ponteiro e é preservada por `proxima()`.

### 4.2 Sala de espera + captura do nº de grupos

No modo aula, **escolher o grupo leva direto para a sala de espera da atividade** (o hub pula o mapa do campeonato — em lockstep quem dirige é o professor). Ao entrar, o aluno **registra presença** (grava o estado, mesmo vazio). O painel conta os grupos presentes. Ao clicar em **Iniciar**, o painel **captura N = nº de grupos da sala de espera** (não há mais campo manual). O sinal "todos votaram" usa esse N.

### 4.3 Encerrar sessão (teardown destrutivo)

UX: ação pesada → **renomeada** ("Reiniciar" → "Encerrar sessão e recomeçar do zero"), **de-enfatizada** (link vermelho no rodapé, fora do topo), com **confirmação forte**. Mecanismo: o painel grava o ponteiro da sessão antiga com `fase: "reset"`; o aluno, ao ler `reset`, faz `AULA.limpar()` + volta para a **tela inicial** (`index.html`, cards aula/treino). O painel gera um **código novo** e volta ao lobby. (No Supabase, dados antigos ficam órfãos — limpos pela faxina; o anon não deleta, o que é bom: o RLS protege.)

### 4.4 Embaralhamento estável

Ordem das opções sorteada **uma vez por item** (cacheada por `it.id`), reusada entre votar e resultado (não "pula"). Cada grupo vê a sua ordem. Reembaralha a cada rodada (limpa o cache na troca de época).

---

## 5. Bugs encontrados e corrigidos (lições)

- **TDZ (Temporal Dead Zone):** `aulaBoot()` é chamado no topo e dispara `aulaRender`, que tocava variáveis `let` declaradas **depois** (no bloco aula) → "Cannot access 'X' before initialization", tela em branco. **Correção:** declarar `aulaUnsub`, `aulaEstadoAtual`, `ordemOpcoes`, `aulaSomItem` **antes** da chamada de boot. (Achado com o preview, que deu o erro com a linha exata.)
- **Primeira emissão engolida:** `observarLocal` deduplicava com `igual(null, null) === true`, então o estado nulo inicial não chamava o callback → o "Aguardando" nem aparecia. **Correção:** sentinela `undefined` no `ultimo` (força a 1ª emissão).
- **Reiniciar não limpava os votos:** o ponteiro reiniciava mas o voto antigo ficava no localStorage → o grupo aparecia "já votou". **Correção:** o mecanismo de época (4.1).
- **Presença só ao abrir a atividade:** o aluno parava no mapa do campeonato e o painel ficava em 0. **Correção:** aula pula o mapa e vai direto à sala de espera (4.2).
- **Cache (o mais recorrente):** o `python -m http.server` não manda no-cache → Safari servia HTML/JS antigos. Sintomas: "encerrar" não funcionava, e o painel ficava "supabase" enquanto o aluno ficava "local" (config/`supabase.js` antigos em cache → caía no modo local). **Correções:** (a) `code/devserver.py` — servidor de dev com `Cache-Control: no-store`; (b) cache-buster `?v=N` nos libs que mudam (`ponteiro.js`, `supabase.js`, `supabase-config.js`). Diagnóstico: comparar os **rodapés** (painel "supabase" × aluno "local") denuncia cache.

---

## 6. Servidor de desenvolvimento

`code/devserver.py [porta]` (padrão 8000) — `SimpleHTTPRequestHandler` com `Cache-Control: no-store`, servindo a raiz do projeto. Use sempre este no lugar de `python -m http.server` ao desenvolver as atividades. Teste cross-device na mesma rede: `http://<IP-da-máquina>:8000/atividades/index.html`.

---

## 7. Supabase: modelo do piloto × produção

Config em `atividades/lib/supabase-config.js` (URL + chave **publishable** pública; o `.env` com segredos fica fora do git). `SB.lerEstado`/`SB.definirEstado` falam REST direto (PostgREST). A chave publishable autentica no `apikey` + `Bearer`.

⚠️ **Modelo PILOTO = anon** (painel sem login): o `setup.sql` concede `definir_estado` a `anon` e tem a policy `anon_select_piloto` (leitura anônima das respostas). Ambos marcados `⚠️ PILOTO` no SQL. **Para produção:** restringir `definir_estado` a `authenticated` + checar e-mail do dono; remover `anon_select_piloto`; dar **login do professor** ao painel (o `painel-auth.js`, link mágico, já existe no painel multi-atividade). Dados de votos são pouco sensíveis, então para um teste de sala o anon é aceitável.

---

## 8. Pendências / próximos passos

- **Replicar o modelo** (sala de espera → 2 fases → veredito com som → encerrar) para as **Rodadas 2–5**. Cada uma só usa o seu `atividade` id e cai no backend pronto — **zero SQL novo**. A R3 (Dimensões) tem interação própria (grade B/M/A) e vai exigir adaptar a noção de "voto"/"resultado".
- **Realtime no lugar do polling:** trocar o poll de 1,5s por assinatura Realtime do Supabase (push instantâneo) na `sessao_estado` e nas respostas.
- **Produção:** login do professor no painel + apertar o RLS (seção 7).
- **Integrar** o painel piloto ao `painel.html` multi-atividade (hoje é página à parte).

---

## 9. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `atividades/lib/ponteiro.js` | sincronização lockstep (backend local + Supabase) |
| `atividades/01-nomear.html` | aluno: ramo aula (sala de espera, votar, resultado, veredito, som, embaralhe) + treino intacto |
| `atividades/painel-nomear.html` | painel piloto: lobby, controle de fase, sinal de todos votaram, resultado, encerrar |
| `atividades/lib/supabase.js` | REST helper (+ `lerEstado`/`definirEstado` do ponteiro) |
| `atividades/lib/supabase-config.js` | URL + chave publishable |
| `supabase/setup.sql` | tabelas, RPCs, RLS, faxina, ponteiro — genérico p/ as 5 rodadas |
| `code/devserver.py` | servidor de dev sem cache |
