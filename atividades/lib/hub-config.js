/* =============================================================================
   REGISTRY DO HUB — ordem do campeonato (5 rodadas do EEM)
   A ordem vive AQUI, não no número do arquivo: este array é a fonte única da
   sequência (o hub desenha o mapa nesta ordem). Carregado pelo hub (index.html).

   Cada entrada:
     id        → discriminador da atividade (casa com a coluna `atividade` e com
                 o ATIVIDADE de cada .html e o id do painel-*.js)
     arquivo   → página .html do ALUNO
     painel    → página .html do PAINEL do professor (null = ainda não construída)
     titulo    → rótulo exibido no hub
     pontua    → entra na classificação acumulada? (todas as 5 pontuam)
     maxPontos → pontuação máxima daquela rodada — base da NORMALIZAÇÃO /100 do
                 placar acumulado do campeonato (R1=10 acertos, R2=8, R3=24 pontos
                 de banda). Sem isso, somar rodadas de escalas diferentes seria
                 injusto. null enquanto a rodada não existe.

   Arco pedagógico: fenômeno → fronteira → dimensão → síndrome → paciente.
   Sem CDN, sem framework. Expõe window.HUB_ATIVIDADES.
   ============================================================================= */
window.HUB_ATIVIDADES = [
  { id:"nomear",     arquivo:"01-nomear.html",     painel:"painel-nomear.html",     titulo:"Nomear o fenômeno",    pontua:true, maxPontos:10 },
  { id:"fronteiras", arquivo:"02-fronteiras.html", painel:"painel-fronteiras.html", titulo:"Fronteiras",           pontua:true, maxPontos:8  },
  { id:"dimensoes",  arquivo:"03-dimensoes.html",  painel:"painel-dimensoes.html",  titulo:"Dimensões do delírio", pontua:true, maxPontos:24 },
  { id:"sindrome",   arquivo:"04-sindrome.html",   painel:"painel-sindrome.html",   titulo:"Síndrome no EEM",      pontua:true, maxPontos:12 },
  { id:"casos",      arquivo:"05-casos.html",      painel:"painel-casos.html",      titulo:"O caso completo",      pontua:true, maxPontos:10 },
];
