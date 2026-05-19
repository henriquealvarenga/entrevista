# Entrevista Psiquiátrica e Exame do Estado Mental

Site Quarto com material didático sobre a **Entrevista Psiquiátrica** e o
**Exame do Estado Mental (EEM)**, destinado a estudantes de medicina e residentes
de psiquiatria. Inclui um roteiro detalhado dos 20 itens do EEM e casos clínicos
para prática.

Publicado em: **https://henriquealvarenga.com/entrevista/**

================================================================================

## ⚠️ ATENÇÃO — VOCÊ **NÃO** PRECISA RODAR `quarto render` ANTES DO `git push`

**LEIA ISTO COM ATENÇÃO. NO FUTURO VOCÊ VAI ESQUECER.**

Este repositório é publicado **via GitHub Actions**, NÃO via "Deploy from a branch".
O workflow [`.github/workflows/publish.yml`](.github/workflows/publish.yml) cuida de
toda a renderização **no servidor do GitHub**, automaticamente, a cada `git push`
para `main`.

### Por que aqui não precisa de `quarto render` local?

Porque este projeto **NÃO tem chunks de código executável**. Verifique:

- Não há nenhum chunk ```` ```{r} ```` ou ```` ```{python} ```` em nenhum `.qmd`.
- O conteúdo é 100% Markdown (sem mermaid, sem HTML cru, sem nada que precise de
  runtime externo).
- Não há chamadas a APIs/internet durante o render.

Como o conteúdo do site é 100% determinístico a partir dos `.qmd`/`.css`, o CI
consegue renderizar do zero em ~20 segundos no Ubuntu, sem precisar instalar R,
Python, nem versionar `_freeze/`.

### Quando precisaria de `quarto render` local?

**Outro tipo de projeto** (Estratégia A com `_freeze/` versionado): quando há chunks
`{r}` ou `{python}` no `.qmd`. Nesse caso, o CI **reusa** o `_freeze/` versionado
em vez de instalar R/Python, e você precisa rodar `quarto render` localmente antes
do push para atualizar o `_freeze/`. **Este repositório NÃO é esse caso.**

### Seu fluxo de publicação aqui é simplesmente:

```bash
# 1) Edita os .qmd como quiser
# 2) (Opcional) preview local: quarto preview
# 3) Publica:
git add -A
git commit -m "sua mensagem"
git push
```

O GitHub Actions renderiza e publica sozinho. Acompanhe a aba **Actions** do repo
para ver o build.

================================================================================

## ⚠️ ATENÇÃO — PDFs NÃO SÃO VERSIONADOS

As pastas [`PDF_version/`](PDF_version/) e [`references/_PDFs/`](references/_PDFs/)
estão no [`.gitignore`](.gitignore) e **NÃO sobem pro GitHub**. Os arquivos PDF
existem apenas no seu disco local. Se precisar repor em outra máquina, é um
backup à parte.

## Estrutura do projeto

```
.
├── _quarto.yml                 # config do site (type: website, output-dir: docs)
├── _metadata.yml               # metadados globais
├── index.qmd                   # página inicial
├── 01-entrevista_psiquiatrica.qmd
├── 02-roteiro_eem.qmd          # roteiro detalhado dos 20 itens do EEM
├── 03-casos_clinicos.qmd       # casos para prática
│
├── styles.css                  # estilos do site
│
├── extras/                     # materiais auxiliares em .md
│                               # (também renderizados pelo Quarto)
│
├── references/
│   ├── referencias.bib         # bibliografia
│   ├── csl_styles/             # estilos de citação
│   └── _PDFs/                  # PDFs de referência (NÃO versionados)
│
├── PDF_version/                # PDF compilado do material (NÃO versionado)
│
├── .github/workflows/
│   └── publish.yml             # CI: roda quarto render e publica no GitHub Pages
│
└── docs/                       # GERADO pelo CI — NÃO versionado, NÃO editar à mão
```

## Configuração do GitHub Pages

Em **Settings → Pages**, a *Source* deve estar como **GitHub Actions** (não como
"Deploy from a branch"). Se ainda estiver no modo antigo, basta mudar — o workflow
já está configurado.

## Estratégia de build adotada

**Workflow simples** (sem R/Python no CI, sem `_freeze/`):

- Sem chunks executáveis → CI só precisa do Quarto.
- Render do zero a cada push (~20s).
- Output `docs/` é **gerado pelo CI** e publicado, mas nunca versionado.
- `_freeze/` não existe e não é necessário.
