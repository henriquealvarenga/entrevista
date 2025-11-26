# Instruções para Renderização com Quarto/Positron

## Pré-requisitos

Você precisará ter instalado:
- **Quarto CLI** (https://quarto.org/docs/get-started/)
- **RStudio** ou **Positron** (opcional, mas recomendado)

## Método 1: Renderizar pelo Terminal

### Passo 1: Organizar os Arquivos

Coloque todos os arquivos (.qmd, .bib, .yml) na mesma pasta:

```
meu_material/
├── index.qmd
├── entrevista_psiquiatrica.qmd
├── roteiro_eem.qmd
├── casos_clinicos_eem.qmd
├── referencias.bib
└── _quarto.yml
```

### Passo 2: Abrir o Terminal

Navegue até a pasta:

```bash
cd caminho/para/meu_material
```

### Passo 3: Renderizar

#### Para renderizar todo o website:
```bash
quarto render
```

Isso criará uma pasta `docs/` com todo o website HTML.

#### Para renderizar apenas um documento:
```bash
quarto render entrevista_psiquiatrica.qmd
```

Isso criará apenas o arquivo `entrevista_psiquiatrica.html`.

## Método 2: Renderizar pelo Positron/RStudio

### Passo 1: Abrir o Projeto

1. Abra o Positron ou RStudio
2. File → Open Project → Selecione a pasta com os arquivos
3. Ou simplesmente abra qualquer arquivo .qmd

### Passo 2: Renderizar

#### Para um documento individual:
- Abra o arquivo .qmd
- Clique no botão **"Render"** (geralmente no topo do editor)
- Ou use o atalho: `Ctrl+Shift+K` (Windows/Linux) ou `Cmd+Shift+K` (Mac)

#### Para todo o website:
- No terminal do RStudio/Positron (aba "Terminal"):
```bash
quarto render
```

## Método 3: Preview ao Vivo

Para ver mudanças em tempo real enquanto edita:

```bash
quarto preview
```

Isso abrirá um servidor local e seu navegador mostrará o site. Toda vez que salvar um arquivo, ele será automaticamente atualizado!

## Visualizando os Resultados

### Arquivos Gerados

Após renderizar, você terá:

```
docs/
├── index.html
├── entrevista_psiquiatrica.html
├── roteiro_eem.html
├── casos_clinicos_eem.html
├── search.json
└── [outros arquivos de suporte]
```

### Abrir no Navegador

- Simplesmente clique duas vezes em qualquer arquivo `.html` na pasta `docs/`
- Ou, se usou `quarto preview`, já estará aberto automaticamente

## Publicação Online

### Opção 1: GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de TODOS os arquivos
3. Vá em Settings → Pages
4. Em "Source", selecione "Deploy from a branch"
5. Em "Branch", selecione "main" e "/docs"
6. Salve e aguarde alguns minutos
7. Seu site estará em: `https://seu-usuario.github.io/nome-repositorio/`

### Opção 2: Quarto Pub (Grátis e Fácil)

```bash
quarto publish quarto-pub
```

Siga as instruções no terminal para criar uma conta e publicar.

### Opção 3: Netlify Drop

1. Renderize localmente: `quarto render`
2. Vá em https://app.netlify.com/drop
3. Arraste a pasta `docs/` para o navegador
4. Pronto! Site publicado instantaneamente

## Personalizações do YAML

### Mudar o Tema

No `_quarto.yml`, você pode mudar o tema:

```yaml
format:
  html:
    theme: 
      - cosmo  # tente: flatly, journal, lumen, minty, pulse, etc.
```

### Adicionar Logo

```yaml
website:
  title: "Seu Título"
  navbar:
    logo: caminho/para/logo.png
```

### Mudar Cores

Crie um arquivo `custom.scss`:

```scss
/*-- scss:defaults --*/
$primary: #2c5282;
$secondary: #48bb78;
```

E referencie no `_quarto.yml`:

```yaml
format:
  html:
    theme: 
      - cosmo
      - custom.scss
```

## Resolução de Problemas

### Erro: "quarto: command not found"

Você precisa instalar o Quarto CLI:
- Baixe em: https://quarto.org/docs/get-started/

### Erro nas Referências

Certifique-se de que:
- O arquivo `referencias.bib` está na mesma pasta
- O campo `bibliography: referencias.bib` está no YAML header

### Renderização Lenta

Para websites grandes, use:

```bash
quarto render --no-execute-daemon
```

### Erros de Formatação

Verifique se:
- Todos os blocos de código estão fechados corretamente
- Os headers (YAML) começam e terminam com `---`
- Não há caracteres especiais mal escapados

## Dicas Úteis

### Ver Todas as Opções de Formato

```bash
quarto render --help
```

### Renderizar para PDF

Adicione no header do .qmd:

```yaml
format:
  html: default
  pdf: default
```

Então:
```bash
quarto render documento.qmd --to pdf
```

### Limpar Arquivos Temporários

```bash
quarto clean
```

## Comandos Rápidos

```bash
# Renderizar tudo
quarto render

# Preview interativo
quarto preview

# Publicar no Quarto Pub
quarto publish

# Verificar instalação
quarto check

# Ver versão
quarto --version

# Ajuda
quarto --help
```

## Recursos Adicionais

- **Documentação Oficial:** https://quarto.org/docs/guide/
- **Galeria de Exemplos:** https://quarto.org/docs/gallery/
- **Temas Disponíveis:** https://quarto.org/docs/output-formats/html-themes.html

---

**Pronto para começar!** 🚀

Se encontrar qualquer problema, consulte a documentação oficial ou peça ajuda!
