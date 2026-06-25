# Entrevista Psiquiátrica e Exame do Estado Mental

Livro Quarto (**type: book**) com material didático resumido sobre a **Entrevista
Psiquiátrica** e o **Exame do Estado Mental (EEM)**, para estudantes de medicina.
Organizado em três partes: a entrevista (teoria), o roteiro detalhado dos 20 itens
do EEM (referência) e casos clínicos (prática).

Publicado em: **https://henriquealvarenga.com/entrevista/**

> Estética, tipografia e organização de pastas seguem o **Quarto_Book_Template**
> (tema editorial, fontes Inter/Playfair/JetBrains self-hosted, `_language-pt.yml`).

---

## Fluxo de publicação

Publicado **via GitHub Actions** (`.github/workflows/publish.yml`), NÃO via
"Deploy from a branch". A cada `git push` para `main`, o CI valida a bibliografia,
renderiza o HTML (saída em `docs/`) e publica. **Não precisa rodar `quarto render`
localmente** — não há chunks de código executável.

```bash
git add -A && git commit -m "sua mensagem" && git push
# (opcional) preview local: quarto preview
```

## Estrutura do projeto

```
.
├── _quarto.yml                  # config do livro (type: book, output-dir: docs)
├── _language-pt.yml             # localização pt-BR (do template)
├── theme-editorial.scss         # tema editorial (do template)
├── styles.css                   # @font-face + classes da página de créditos
├── fonts/                       # fontes self-hosted (.woff2)
├── images/                      # capa.jpg + favicon.jpg  (⚠ placeholders — substituir)
│
├── index.qmd                    # prefácio
├── apresentacao.qmd             # objetivos / como usar
├── creditos.qmd                 # autor, licença, como citar
├── references.qmd               # lista de referências (gerada do .bib)
│
├── capitulos/
│   ├── parte-1-entrevista/      # Parte I — A Entrevista (6 capítulos)
│   └── parte-2-roteiro/         # Parte II — Roteiro do EEM (20 itens + súmula)
├── casos/galeria/              # Casos clínicos — fictícios e figuras reais
├── atividade-eem.qmd            # Exercício do EEM (escrever o exame de um caso)
│
├── references/
│   ├── references.bib           # bibliografia (estilo ABNT)
│   ├── csl_styles/              # ABNT, Vancouver
│   └── _PDFs/                   # PDFs de referência (NÃO versionados)
│
├── code/                        # validadores de bibliografia (usados pelo CI)
├── docs-internos/               # andaime/notas — FORA do render do livro
│
├── .github/workflows/publish.yml
└── docs/                        # GERADO pelo CI — gitignored, não editar à mão
```

## ⚠️ PDFs e `docs/` não são versionados

`PDF_version/`, `references/_PDFs/` e `docs/` estão no `.gitignore`. O site é
regerado pelo CI a cada push.

## Como editar

- **Adicionar/remover capítulo:** crie o `.qmd` na pasta da parte e registre-o
  em `chapters:` no `_quarto.yml`.
- **Capa/favicon:** substitua `images/capa.jpg` (1600×2500) e `images/favicon.jpg`
  (512×512) — hoje são placeholders herdados do template.
- **Numeração:** o livro usa `number-sections: false`; a numeração dos 20 itens
  do EEM é mantida manualmente nos títulos (identidade pedagógica canônica).
