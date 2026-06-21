# Revisão psicopatológica do livro — Handoff / Estado do trabalho

> Documento de continuidade para retomar a revisão em outra sessão. Resume objetivo, fontes,
> convenções, progresso e pendências. Atualizar ao fim de cada capítulo.

## 1. Objetivo da tarefa
Revisar **cada capítulo** do livro (Entrevista Psiquiátrica e Exame do Estado Mental, projeto Quarto),
conferindo se as afirmações estão **de acordo com as fontes**, capítulo por capítulo, discutindo cada
ponto com o autor antes de aplicar. Corrigir o livro (não só apontar).

## 2. Hierarquia de fontes (quando há conflito)
1. **Sims — *Sintomas da Mente* / *Symptoms in the Mind*** (Oyebode) — `@sims2018` · **fonte principal**
2. **Dalgalarrondo — *Psicopatologia e Semiologia***  — `@dalgalarrondo2019`
3. **Kaplan & Sadock — *Compêndio de Psiquiatria*** — `@kaplan2017` · referência complementar
- Fontes especializadas: **Plum & Posner** (neurologia, nível de consciência) `@plum2019`;
  **Berrios**, *History of Mental Symptoms* `@berrios1996`; e artigos (ver §6).
- Todos os PDFs ficam em `references/PDF/` (**gitignored**). Há `.txt` extraídos lá (sims.txt,
  dalgalarrondo.txt, kaplan.txt, berrios.txt) para busca com grep. Também `_pp_extract/` (EPUB do P&P).

## 3. Convenções estabelecidas (IMPORTANTES)
- **Citações usam a página IMPRESSA do livro, não a do PDF.**
- **Dois tipos de problema:**
  - **Divergência entre fontes** (as fontes discordam entre si) → vira entrada **D#** no apêndice
    *Discrepâncias entre as Fontes* (`capitulos/apendices/discrepancias.qmd`), com `callout-warning`
    no capítulo + **cross-link** para a âncora `#sec-dN-...`.
  - **Correção pontual** (as fontes concordam; o livro se afastou) → corrige **no próprio capítulo**,
    sem entrada no apêndice.
- **Cross-refs**: usar **link markdown** para `../apendices/discrepancias.qmd#sec-...` (NÃO usar
  `@sec-` porque o livro está com `number-sections: false` e o `@sec-` não resolve bem).
- **Tese pedagógica do livro**: *descrever o fenômeno é melhor que decorar/usar rótulos imprecisos*
  (apoiada por Sims, Plum & Posner). Manter capítulos **enxutos**.
- **Estilo (preferências do autor):**
  - Evitar frases "de IA": nada de "não estamos sós", "feliz divisão de trabalho", "seguindo o
    próprio X, não nos prendemos ao rótulo" etc. Tom **sóbrio e factual**.
  - Evitar vocabulário rebuscado/inflado desnecessário (ex.: foram **removidos** "ataraxia" e
    "hiperbulia" a pedido do autor).
  - Reconhecer subjetividade quando existe (ex.: descritores de aparência/atitude; amplitude do afeto).
- **Build/validação**: `quarto render --to html`; conferir que não sobra `[@...]` literal, que âncoras
  `sec-dN` existem e que cross-links resolvem para `.html`. `docs/` é **gitignored**.

## 4. Estrutura do livro (`_quarto.yml`)
- Parte I — A Entrevista (caps 01–06, em `capitulos/parte-1-entrevista/`)
- Parte II — Roteiro do EEM (caps 00–21, em `capitulos/parte-2-roteiro/`) ← foco da revisão
- Parte III — Casos Clínicos (`casos/`)
- **Apêndices** (criado nesta revisão) → `capitulos/apendices/discrepancias.qmd`
- Créditos, Referências.

## 5. Catálogo de Discrepâncias (apêndice) — estado atual
| ID | Tema | Capítulo | Resolução |
|----|------|----------|-----------|
| D1 | Catalepsia × flexibilidade cérea (invertidos entre tradições) | 1 (e 13) | Adotado Sims/Dalgalarrondo; Kaplan/DSM inverte |
| D2 | *Estupor* é nível de consciência? | 2 (e 1/13) | Não; é síndrome psicomotora (Sims/Dalga.) × nível (neuro/Kaplan); descrever |
| D3 | *Vigilância* (mobilidade × atenção sustentada) | 2, 3 | Dalga. = mudar foco; Sims/Kaplan = sustentada |
| D4 | *Déjà vu/jamais vu* (memória × reconhecimento) | 5 | Reconhecimento/familiaridade (Sims, Kaplan) |
| D5 | *Pseudoalucinação* (termo contestado) + colisão com alucinose | 6 | Descrever; dois sentidos (Jaspers/Kandinsky × Hare) |
| D6 | Gravidade da deficiência intelectual: QI × funcionamento adaptativo | 9 | DSM-5/CID-11 = adaptativo |
| D7 | Delírio é "crença falsa"? (definição em disputa) | 10 | Definição clássica é contestada; não se define por falsidade |
| D8 | Humor × afeto (DSM × taxonomia clássica) | 11 | Adotada definição DSM (afeto = expressão observável) |
| D9 | Transtornos da personalidade: categorias × dimensões | 17 | DSM-5 Seção II/CID-10 categorial × CID-11 dimensional |

## 6. Entradas adicionadas ao `references/references.bib`
`plum2019`, `who1993cid10`, `who2022cid11`, `salvadorcarulla2011` (autores completos + DOI),
`bertelli2016`, `kendler1983` (DOI + PMID), `berrios1996`, `tellescorreia2017`, `woodward2014`,
`haddock1999`. (Todos conferidos contra os PDFs; PSYRATS citado no Cap. 10 sem reproduzir a escala.)

## 7. Progresso por capítulo (Parte II)
- **00 Introdução** ✅ — parágrafo sobre falta de consenso terminológico + lembrete pedagógico +
  hierarquia de fontes (Sims principal). P&P citado como aliado do "descrever > rotular".
- **01 Aspectos Gerais** ✅ — D1 (catalepsia/flexibilidade) + correções (acatisia; maneirismo/
  estereotipia) + nota de enquadramento (termos de aparência/atitude são descritivos, subjetivos).
- **02 Nível de Consciência** ✅ — dissertação quantidade×qualidade (neurologia/GCS/FOUR); escala
  harmonizada (obnubilado→torporoso→comatoso); "confuso"→delirium; D2 (estupor); 2.2 enriquecida
  (estado crepuscular, onírico, dissociação); "vigilante" = arousal.
- **03 Atenção** ✅ — D3 (vigilância); resto conferido (tenacidade, prosexias, distração×distraibilidade).
- **04 Orientação** ✅ — add 4.3 Tipos de desorientação (mecanismos). Sem D.
- **05 Memória** ✅ — termos técnicos (ilusão/alucinação mnêmica); hipermnésia; criptomnésia; D4 (déjà vu).
- **06 Sensopercepção** ✅ — D5 (pseudoalucinação, nota curta). Funcional/extracampina ficaram **de fora**.
- **07 Pensamento** ✅ — corrigido "concreto" (era erro); prolixidade (circunstancial/tangencial). Sem D.
- **08 Linguagem** ✅ — abertura fala×linguagem; typo. Sem D.
- **09 Inteligência** ✅ — DI = intelectual+adaptativo; evolução terminológica (CID-10/DSM-IV→DSM-5→
  CID-11); QI→adaptativo; transtorno×deficiência + meta-síndrome (Salvador-Carulla, Bertelli); D6.
- **10 Juízo de Realidade** ✅ — reformulado: definição não-assentada (callout), ponto epistemológico
  (observador externo), primário×secundário + 4 experiências delirantes primárias, Kendler (5 dimensões,
  multidimensional) + 2 do Sims, PSYRATS citado; D7.
- **11 Vida Afetiva** ✅ — nota humor×afeto (DSM) + D8; gradação de amplitude (subjetiva) + nota sobre
  escalas (PANSS/SANS, sem equivalente à Glasgow).
- **12 Volição** ✅ — removida hiperbulia; abulia ≈ avolição + apatia/depressão; ressalva (indiferença
  buscada de propósito não é abulia). Sem D.
- **13 Controle de Impulsos** ✅ (revisado) — fiel ao Dalgalarrondo (ato impulsivo × compulsivo).
  Acrescentadas as **fases do ato voluntário** (intenção→deliberação→decisão→execução; p. 178) + frase
  sobre coordenar a ação no tempo, com **link para henriquealvarenga.com/intencionalidade** e citação de
  **Bratman** (`@bratman1987`). Sem D.
- **16 Psicomotricidade** ✅ (revisado) — corrigidos os erros reincidentes do Cap. 1 (catalepsia×flexibilidade
  → cross-link D1; acatisia separada; maneirismos) + estupor com cross-link D2. **Redundância: opção (a)** —
  Cap. 1 §1.4 e Psicomotricidade mantidos, com links recíprocos. *Carfologia removida*.
- **14 Consciência do Eu** ✅ (revisado) — **renomeado** de "Consciência e Valoração do Eu" (o conteúdo
  cobre só a consciência do Eu de Jaspers; não há valoração/autoestima — se quiser, é possível ADICIONAR
  uma seção de valoração depois). Estrutura fiel a Jaspers/Dalgalarrondo. **Transitivismo removido e
  deixado de lado** (uso idiossincrático em Dalgalarrondo = licantropia × clássico Wernicke = atribuir
  vivências a outrem; **sem** entrada no apêndice, por decisão do autor). "Difusão de identidade" →
  "perda dos limites do Eu". Arquivo: `14-consciencia-do-eu.qmd`.
- **15 Vivência do Tempo e do Espaço** ✅ (revisado) — *déjà vu/jamais vu* removidos do tempo (são
  reconhecimento, ficam no Cap. 5/D4); **15.2 reclassificada**: saíram micropsia/macropsia/metamorfopsia/
  dismegalopsia (são distorções *perceptivas* → Cap. 6) e entrou a **vivência subjetiva do espaço**
  (mania/depressão/paranoide/agorafobia; Dalgalarrondo p. 117). Cross-refs aos caps. 5 e 6. Sem D.

> **Reordenação da Parte II (cluster vontade/Eu):** nova ordem = 12 Volição → 13 Controle de Impulsos →
> 14 Consciência e Valoração do Eu → 15 Vivência do Tempo e do Espaço → 16 Psicomotricidade. Arquivos
> renomeados (prefixo = ordem), títulos/seções renumerados, `_quarto.yml` e cross-links sincronizados.

## 8. PENDÊNCIAS (próximos passos)
1. ~~Parte II~~ — **CONCLUÍDA ✅** (caps. 00–21 todos revisados).
   - **20 Desejo de Ajuda e Motivação** ✅ — fiel ao roteiro de Dalgalarrondo; + entrevista motivacional
     (Kaplan); voluntariedade ancorada na **Lei 10.216/2001** (`brasil2001lei10216` no `.bib`). Sem D.
   - **21 Súmula** ✅ — definição de súmula (Dalgalarrondo); agrupamento em 3 sistemas mantido com ressalva
     de que é **recurso didático** (não regra rígida); "juízo de morbidade/insight" → "insight" (consistência
     com cap. 19). Sem D.
   - **18 Contratransferência** ✅ — frase de enquadramento (reação do examinador = informação clínica;
     clássico Freud/obstáculo → moderno/instrumento; Kaplan + Dalgalarrondo); "empatia" removida da lista. Sem D.
   - **17 Personalidade** ✅ — definição (temperamento+caráter); 17.1 clusters (DSM-5 Seção II/CID-10) +
     17.2 modelo dimensional da CID-11 (gravidade + 5 domínios + padrão borderline); **D9**.
   - **19 Insight** ✅ — renomeado de "Crítica e Insight" → só "insight" (arquivo `19-insight.qmd`);
     componentes de David (1990); insight como continuum; **ponto-chave: avaliação do insight é sempre
     juízo do observador externo** (não confundir com discordância). Sem D.
3. **Parte I** (entrevista), em especial **03 Exame do Estado Mental**. *(Já adicionada ao cap.
   "A Entrevista Inicial" a seção **Aliança Terapêutica e Rupturas** — Bordin 1979 [aliança = vínculo+
   objetivos+tarefas], Safran & Muran 1996 + Safran 2011 [rupturas: afastamento/confrontação + reparo],
   Mahoney & Granvold 2005 [co-construção]. Novos no `.bib`: `bordin1979`, `safranmuran1996`,
   `safran2011repairing`, `mahoney2005constructivism`.)*
4. **Seção de Atividades** — o autor vai fornecer o caminho de uma pasta de outro projeto para reaproveitar.
5. PSYRATS: decidido **não** fazer calculadora e **não** reproduzir a escala (evitar permissão); só citar.

## 9. Como retomar
Ler este doc → abrir o capítulo pendente → puxar as passagens das fontes (`grep` nos `.txt` de
`references/PDF/`) → discutir com o autor → aplicar → `quarto render --to html` e validar.
