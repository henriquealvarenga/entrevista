/* =============================================================================
   REGISTRY DO HUB — ordem do campeonato (5 rodadas do EEM)
   A ordem vive AQUI, não no número do arquivo: este array é a fonte única da
   sequência (o hub desenha o mapa nesta ordem). Carregado pelo hub (index.html).

   Cada entrada:
     id      → discriminador da atividade (casa com a coluna `atividade` e com
               o ATIVIDADE de cada .html e o id do painel-*.js)
     arquivo → página .html da atividade
     titulo  → rótulo exibido no hub
     pontua  → entra na classificação acumulada? (todas as 5 pontuam)

   Arco pedagógico: fenômeno → fronteira → dimensão → síndrome → paciente.
   Sem CDN, sem framework. Expõe window.HUB_ATIVIDADES.
   ============================================================================= */
window.HUB_ATIVIDADES = [
  { id:"nomear",    arquivo:"01-nomear.html",    titulo:"Nomear o fenômeno",   pontua:true },
  { id:"fronteiras", arquivo:"02-fronteiras.html", titulo:"Fronteiras",         pontua:true },
  { id:"dimensoes", arquivo:"03-dimensoes.html", titulo:"Dimensões do delírio", pontua:true },
  { id:"sindrome",  arquivo:"04-sindrome.html",  titulo:"Síndrome no EEM",      pontua:true },
  { id:"casos",     arquivo:"05-casos.html",     titulo:"O caso completo",      pontua:true },
];
