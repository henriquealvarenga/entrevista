# Material Didático: Entrevista Psiquiátrica e Exame do Estado Mental

## Conteúdo do Material

Este conjunto de materiais didáticos foi desenvolvido para estudantes de psiquiatria e inclui:

### 1. **entrevista_psiquiatrica.qmd**
Texto completo e denso sobre:
- A importância da entrevista psiquiátrica
- Técnicas de entrevista
- As três regras de ouro
- Estrutura da avaliação psiquiátrica completa
- Exame do Estado Mental detalhado com todos os 20 itens
- Aspectos práticos da documentação

### 2. **roteiro_eem.qmd**
Roteiro completo do Exame do Estado Mental contendo:
- Todos os 20 itens do EEM
- Descritores específicos para cada item
- Termos técnicos apropriados para descrever cada fenômeno
- Guia prático para uso durante entrevistas

### 3. **casos_clinicos_eem.qmd**
Cinco casos clínicos detalhados para prática:
- **Caso 1 - Maria:** Quadro depressivo grave
- **Caso 2 - João:** Episódio maníaco
- **Caso 3 - Carlos:** Transtorno delirante paranoide
- **Caso 4 - Ana:** Quadro psicótico
- **Caso 5 - Roberto:** Demência em estágio inicial

### 4. **referencias.bib**
Arquivo BibTeX com todas as referências bibliográficas utilizadas

## Como Usar Este Material

### Para Renderizar os Documentos com Quarto

Os arquivos estão em formato Quarto Markdown (.qmd) e podem ser renderizados com o Positron ou RStudio:

```bash
# Para renderizar um documento individual
quarto render entrevista_psiquiatrica.qmd

# Para renderizar todos os documentos
quarto render
```

### Para Criar um Website

Você pode criar um website com todos os materiais usando Quarto:

1. Crie um arquivo `_quarto.yml` com a seguinte configuração:

```yaml
project:
  type: website

website:
  title: "Entrevista Psiquiátrica e EEM"
  navbar:
    left:
      - href: entrevista_psiquiatrica.qmd
        text: "Conteúdo Teórico"
      - href: roteiro_eem.qmd
        text: "Roteiro do EEM"
      - href: casos_clinicos_eem.qmd
        text: "Casos Clínicos"

format:
  html:
    theme: cosmo
    toc: true
```

2. Renderize o website:

```bash
quarto render
```

### Sugestões de Uso Didático

#### Para Professores:

1. **Aula Expositiva:** Use o material teórico como base
2. **Atividade Prática:** Peça aos alunos que escolham um caso clínico e elaborem o EEM completo
3. **Discussão em Grupo:** Revise os casos clínicos em sala, discutindo os achados
4. **Avaliação:** Os casos podem ser usados em provas práticas

#### Para Estudantes:

1. **Estudo Individual:** Leia o material teórico completo
2. **Memorização:** Use o roteiro de descritores como guia de estudo
3. **Prática:** Elabore o EEM de cada um dos 5 casos clínicos
4. **Autoavaliação:** Compare suas respostas com colegas
5. **Aplicação Clínica:** Use o roteiro durante entrevistas reais (sob supervisão)

## Atividade Sugerida para Estudantes

### Exercício Prático

1. Escolha **UM** dos cinco casos clínicos
2. Leia atentamente toda a descrição
3. Elabore um Exame do Estado Mental completo usando o roteiro fornecido
4. Redija uma súmula concisa dos achados principais
5. Liste 2-3 hipóteses diagnósticas baseadas no EEM

### Critérios de Avaliação

Um bom EEM deve:
- Ser completo (todos os 20 itens)
- Usar terminologia técnica apropriada
- Ser objetivo e descritivo (não interpretativo)
- Incluir observações concretas do caso
- Ter uma súmula concisa e bem escrita

### Para Aprofundamento

Após dominar os casos escritos:
- Pratique com vídeos de entrevistas psiquiátricas
- Observe entrevistas reais (com supervisão)
- Compare seus EEMs com os de colegas
- Solicite feedback de professores/supervisores

## Referências Principais

Os dois principais livros-texto usados como base foram:

1. **Dalgalarrondo, P.** (2019). *Psicopatologia e semiologia dos transtornos mentais* (3ª ed.). Artmed.
   - Capítulo 8: A entrevista com o paciente

2. **Sadock, B. J., Sadock, V. A., & Ruiz, P.** (2017). *Compêndio de Psiquiatria* (11ª ed.). Artmed.
   - Capítulo 5: Exame e diagnóstico em psiquiatria

Todas as referências completas estão no arquivo `referencias.bib`.

## Contato e Feedback

Este material foi desenvolvido como recurso educacional. Sugestões de melhorias são bem-vindas.

## Licença

Este material é destinado a uso educacional em psiquiatria.

---

**Última atualização:** Novembro de 2024
