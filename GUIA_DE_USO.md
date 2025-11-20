# Guia de Uso: Material sobre Entrevista Psiquiátrica e Exame do Estado Mental

## 📦 Arquivos Criados

Você recebeu 6 arquivos principais:

### 1. **index.qmd** - Página Inicial
- Apresentação geral do material
- Objetivos de aprendizagem
- Orientações de uso
- Links para todos os outros documentos

### 2. **entrevista_psiquiatrica.qmd** - Conteúdo Teórico Completo
- Texto denso e abrangente (27KB)
- Fundamentos da entrevista psiquiátrica
- As três regras de ouro
- Todos os 20 itens do Exame do Estado Mental detalhados
- Aspectos práticos da documentação
- Com citações bibliográficas apropriadas

### 3. **roteiro_eem.qmd** - Roteiro Prático
- Guia de referência rápida (18KB)
- Todos os 20 itens do EEM
- Descritores completos para cada item (como você solicitou)
- Exemplos: atitude frente ao examinador, alterações de consciência, pensamento, etc.
- Formatado para fácil consulta

### 4. **casos_clinicos_eem.qmd** - Exercícios Práticos
- 5 casos clínicos detalhados (17KB)
- Casos cobrem diferentes quadros psicopatológicos:
  - Depressão grave
  - Mania
  - Transtorno delirante paranoide
  - Psicose
  - Demência inicial
- Instruções para os estudantes
- Estrutura para resposta

### 5. **referencias.bib** - Bibliografia
- Arquivo BibTeX completo
- 24 referências bibliográficas
- Prontas para uso com Quarto/LaTeX
- Inclui Dalgalarrondo, Kaplan & Sadock, e outros

### 6. **_quarto.yml** - Configuração do Website
- Arquivo de configuração do Quarto
- Cria um website navegável com todos os materiais
- Com menu de navegação

## 🚀 Como Usar

### Opção 1: Renderizar Documento Individual

No RStudio ou Positron:

```bash
quarto render entrevista_psiquiatrica.qmd
```

Isso gera um arquivo HTML que pode ser visualizado no navegador.

### Opção 2: Criar Website Completo

Na pasta com todos os arquivos:

```bash
quarto render
```

Isso criará um website completo em `docs/` com:
- Página inicial
- Todo o conteúdo teórico
- Roteiro do EEM
- Casos clínicos
- Navegação entre páginas

### Opção 3: Postar na Internet

Após renderizar, você pode:

1. **GitHub Pages:**
   - Fazer upload da pasta `docs/` para um repositório
   - Ativar GitHub Pages
   - Seu material estará online!

2. **Quarto Pub:**
   ```bash
   quarto publish
   ```

3. **Servidor próprio:**
   - Fazer upload da pasta `docs/`

## 📚 Estrutura de Conteúdo

### Conteúdo Teórico Principal
O arquivo `entrevista_psiquiatrica.qmd` contém:

1. Introdução à entrevista psiquiátrica
2. A entrevista inicial (importância, primeira impressão)
3. As três regras de ouro
4. Estrutura da avaliação (5 componentes)
5. Aspectos práticos
6. **EXAME DO ESTADO MENTAL COMPLETO** com 20 itens:
   - Aspecto geral
   - Consciência
   - Orientação
   - Atenção
   - Memória
   - Sensopercepção
   - Pensamento (curso, forma, conteúdo)
   - Linguagem
   - Inteligência
   - Juízo de realidade
   - Vida afetiva (humor, afeto, emoções)
   - Volição
   - Psicomotricidade
   - Consciência do Eu
   - Vivência de tempo e espaço
   - Personalidade
   - Contratransferência
   - Crítica e insight
   - Desejo de ajuda
   - Voluntariedade

7. Documentação
8. Considerações especiais

### Roteiro com Descritores

O arquivo `roteiro_eem.qmd` lista todos os descritores para cada item, exatamente como você pediu.

**Exemplo do item "Atitude frente ao examinador":**
- Cooperativo
- Não cooperativo
- De oposição
- Hostil
- De fuga
- Suspicaz
- Querelante
- Reivindicativa
- Arrogante
- Evasiva
- Invasiva
- De esquiva
- Inibida
- Desinibida
- Jocosa
- Irônica
- Lamuriosa
- Dramática
- Teatral
- Sedutora
- Pueril
- Gliscroide
- Simuladora
- Dissimuladora
- Indiferente
- Manipuladora
- Submissa
- Expansiva
- Amaneirada
- Reação de último momento

E assim para TODOS os 20 itens!

### Casos Clínicos

5 casos completos com histórias detalhadas simulando entrevistas reais. Os estudantes podem:

1. Escolher um caso
2. Elaborar o EEM completo usando o roteiro
3. Escrever uma súmula
4. Propor hipóteses diagnósticas

## ✅ Checklist de Qualidade

O material inclui:

- ✅ Texto completo e denso sobre entrevista psiquiátrica
- ✅ Todos os 20 itens do EEM explicados
- ✅ Roteiro com TODOS os descritores (como você pediu)
- ✅ 5 casos clínicos detalhados para prática
- ✅ Instruções claras para os estudantes
- ✅ Referências bibliográficas em BibTeX
- ✅ Citações apropriadas ao longo do texto
- ✅ Formatação profissional em Quarto
- ✅ Pronto para publicação na internet

## 💡 Dicas para Estudantes

### Como Praticar:

1. **Leia primeiro** o conteúdo teórico completo
2. **Estude** o roteiro de descritores - memorize os termos
3. **Pratique** com os casos clínicos - faça um por dia
4. **Compare** suas respostas com colegas
5. **Use** o roteiro durante atendimentos supervisionados

### Exemplo de Exercício:

**Caso Maria (Depressão):**
- Leia o caso com atenção
- Vá item por item do roteiro
- Para cada item, escolha os descritores apropriados
- Ao final, escreva uma súmula como:

*"Paciente com apresentação descuidada, higiene precária, cooperativa, lentificada psicomotoramente. Consciente, orientada globalmente. Atenção hipoprósica. Memória de fixação preservada, evocação comprometida. Sem alterações sensoperceptivas. Pensamento com curso lentificado, forma preservada, conteúdo com ideias de ruína e culpa, ideação suicida sem plano definido. Linguagem hipofônica, bradilálica. Inteligência estimada na média. Juízo de realidade preservado. Humor deprimido, afeto embotado, anedonia presente. Hipobulia acentuada. Sem alterações da consciência do Eu. Insight parcial. Desejo de ajuda moderado. Tratamento voluntário."*

## 🔧 Personalizações Possíveis

Você pode:

- Adicionar mais casos clínicos
- Incluir imagens ou vídeos
- Criar exercícios interativos
- Adicionar quizzes
- Traduzir para outros idiomas
- Adaptar para outros contextos (enfermagem, psicologia, etc.)

## 📞 Próximos Passos

1. Renderize os documentos com Quarto
2. Revise o conteúdo
3. Teste com seus estudantes
4. Publique online se desejar
5. Solicite feedback dos alunos

## ❓ Sugestões de Melhorias Futuras

- Adicionar mais 5-10 casos clínicos
- Incluir casos pediátricos
- Criar versão interativa com vídeos
- Desenvolver aplicativo móvel
- Adicionar gabaritos comentados dos casos

---

**Sucesso com seu material didático!** 🎓

Se precisar de ajustes, modificações ou mais casos clínicos, é só pedir!
