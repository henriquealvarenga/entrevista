# Atividades do EEM — Design e estado

Ponto de partida para entender as atividades gamificadas do livro do Exame do Estado Mental (EEM). Leia este arquivo primeiro; a engenharia detalhada está em [`ENGENHARIA-lockstep.md`](ENGENHARIA-lockstep.md).

Engenharia portada do `Intencionalidade_Project` (Quarto + JS puro, sem framework, sem CDN, fontes self-hosted) e estendida com o modo aula lockstep. O Intencionalidade é **só referência** — não se altera nada lá.

Atualizado em 2026-06-24.

---

## 1. O que são

Um **campeonato em grupos** jogado em sala. Cada grupo usa um aparelho; o professor projeta um código e conduz pelo telão. São **5 rodadas pontuadas**, em sequência, com classificação (pódio) ao fim de cada uma.

Arco pedagógico (do fenômeno isolado ao paciente inteiro):

1. **Nomear o fenômeno** — reconhecer e nomear o achado (semiologia).
2. **Fronteiras** — discriminar termos confundíveis (o critério que decide).
3. **Dimensões do delírio** — graduar o delírio em 5 dimensões (não é tudo-ou-nada).
4. **Síndrome no EEM** — da constelação de achados ao quadro provável (o porquê).
5. **O caso completo** — sprint final com os casos inteiros + pódio do campeonato.

---

## 2. Dois modos

- **aula** (lockstep): a turma anda junta, questão a questão, **dirigida pelo professor** (método Peer Instruction / ConcepTest, de Eric Mazur). Sincroniza via Supabase (entre dispositivos) ou local (mesma máquina, para testar).
- **treino** (self-paced): o aluno sozinho, no seu ritmo, com gabarito imediato. Nada é enviado ao backend.

A identidade (modo + sessão + grupo) é escolhida **uma vez** no hub e lida por todas as rodadas (sem re-login).

---

## 3. Princípio pedagógico central: discutir POR CASO, não no fim

No lockstep, a discussão acontece **no calor de cada questão/caso** — logo após o resultado daquele item —, nunca empilhada num bloco no fim. ("A discussão no fim perde o clímax; os alunos só querem ir para a próxima.") Por isso:

- Cada questão de múltipla escolha revela a sua **fronteira** (o critério que decide) no resultado.
- Cada caso das Dimensões tem o seu **ponto de discussão próprio** (`discussao` no data file), mostrado no resultado daquele caso — no aparelho do aluno e no telão.
- As sínteses de fim de rodada **recapitulam**, mas não concentram a discussão.

---

## 4. O fluxo de uma aula (campeonato)

1. O professor abre o **painel** da rodada e projeta o **código**.
2. Os alunos entram no **hub** → "Entrar na aula" → digitam o código → escolhem o grupo → caem no **mapa do campeonato**.
3. **Presença de sessão:** ao escolher o grupo, o painel **já mostra o grupo** — mesmo antes de entrar em qualquer rodada (resolve o "painel zerado" enquanto estão no mapa).
4. O professor anuncia a rodada; os alunos tocam nela no mapa (as próximas ficam 🔒 até concluir a anterior) → sala de espera.
5. O professor **conduz**: Iniciar → cada questão/caso passa por **Votação → Resultado** (o telão mostra a distribuição/divergência + o ponto de discussão; o aluno vê o próprio veredito + som).
6. No fim da rodada: **"Ver a classificação ▸"** → **pódio** da rodada (barras animadas, medalhas, confete, fanfarra).
7. Do pódio, o professor segue por **"Próxima rodada ▸"** (vai direto ao painel da rodada seguinte) ou **"Mapa das rodadas"** (hub do professor: código único + lista das rodadas + **classificação geral acumulada**). Um **código único** vale o campeonato inteiro — os alunos digitam uma vez; cada rodada se distingue pelo `atividade`. A classificação geral **normaliza cada rodada /100** (R1=/10, R2=/8, R3=/24) e soma, então todas pesam igual. O mapa do professor espelha a **trava sequencial** do mapa do aluno (uma rodada só abre quando a anterior tem respostas).

---

## 5. Status das rodadas

| # | Rodada | Mecânica | Treino | Aula (lockstep) | Painel-piloto | Estado |
|---|---|---|---|---|---|---|
| 1 | Nomear o fenômeno | Múltipla escolha (com evocação) | ✅ | ✅ | `painel-nomear.html` | **Feita + verificada** |
| 2 | Fronteiras | Múltipla escolha (lightning, sem evocação) | ✅ | ✅ | `painel-fronteiras.html` | **Feita + verificada** |
| 3 | Dimensões do delírio | Grade 5 dimensões × Baixa/Média/Alta | ✅ | ✅ | `painel-dimensoes.html` | **Feita + verificada** |
| 4 | Síndrome no EEM | Múltipla escolha (constelação → quadro + discriminador) | ✅ | ✅ | `painel-sindrome.html` | **Feita + verificada** |
| 5 | O caso completo | Sprint de MC + pódio final | — | — | — | **A construir** |

Verificação de R1–R3: feita no preview (treino + aula end-to-end via Supabase Realtime + painel com lobby/condução/pódio). R4 verificada no preview (treino + painel + integração no mapa); o modo aula herda o motor já verificado de R1/R2.

Reservas de conteúdo:
- **R4 (feita):** 12 casos de múltipla escolha em linguagem **psicopatológica** (constelação de achados → quadro/fenômeno + discriminador no campo "Como diferenciar"). Cobre o **parkinsonismo induzido por neuroléptico** (R1 = o QUÊ; R4 = o PORQUÊ), depressão/pseudodemência, mania, delírio, delirium, pânico, catatonia, trema, despersonalização, 1ª ordem (Schneider), TEPT/revivência e obsessivo-compulsivo. Sem palpite; sem negrito; pacientes com nome.
- **R5** = os 6 casos do livro (Maria/depressão, João/mania, Carlos/transt. delirante, Ana/psicose, Roberto/demência+parkinsonismo, Ranier/esquizofrenia incipiente) como sprint pontuado, com o EEM escrito completo + súmula como entrega pós-aula.

---

## 6. Galeria de casos (relacionada, mas separada)

Os 14 casos do `_ProjetoR_DelusionDimension` viraram **capítulos na seção de Casos** do livro: `casos/galeria/ficticios/` (7) e `casos/galeria/reais/` (7 figuras históricas: Schreber, Nash, van Gogh, Nietzsche, Schumann, Syd Barrett, Philip K. Dick). Os 8 casos da R3 linkam ao capítulo correspondente ("ler o caso completo"). Referências verificadas no `references/references.bib`.

---

## 7. O que falta

- **Construir R5 (O caso completo)** — sprint dos 6 casos do livro + pódio final.
- **Produção: ✅ concluída.** Login do professor por **senha**, RLS apertado e Realtime; banco e código publicados em `henriquealvarenga.com/entrevista`. Reset de senha pelo dashboard (Authentication → Users → recriar com o mesmo e-mail). Detalhes na seção 6 de [`ENGENHARIA-lockstep.md`](ENGENHARIA-lockstep.md).

---

## 8. Onde fica cada coisa (visão rápida)

- **Hub do aluno:** `atividades/index.html` (mapa, presença de sessão).
- **Hub do professor:** `atividades/painel-mapa.html` (código único, lista de rodadas com trava sequencial, classificação geral acumulada). Protegido por login.
- **Alunos:** `atividades/0X-*.html` (cascas finas sobre os libs).
- **Painéis-piloto (lockstep):** `atividades/painel-{nomear,fronteiras,dimensoes}.html`.
- **Painel multi-atividade (original, agregado):** `atividades/painel.html` + `lib/painel-core.js` — outro sistema, com o pódio original; ver a engenharia.
- **Libs, dados, backend:** `atividades/lib/`, `supabase/setup.sql`, `code/devserver.py`.

Mapa de arquivos completo e comentado: [`ENGENHARIA-lockstep.md`](ENGENHARIA-lockstep.md).
