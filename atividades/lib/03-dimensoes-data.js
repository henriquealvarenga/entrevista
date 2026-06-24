/* =============================================================================
   BANCO DE CASOS — Rodada 3 (Dimensões do delírio)
   Orientado a dados. FONTE ÚNICA: consumido pela atividade do aluno
   (03-dimensoes.html) e pelo painel do professor (lib/painel-03-dimensoes.js).
   Adaptado do _ProjetoR_DelusionDimension. Vinhetas fiéis aos textos originais do
   formulário (não os resumos do CSV); originais preservados em
   docs-internos/projetoR-backup/casos-originais-do-form.txt.

   O grupo classifica cada caso em 5 DIMENSÕES, escala Baixa/Média/Alta. Três
   dimensões (Convicção, Desorganização, Preocupação) PONTUAM por BANDA DE
   REFERÊNCIA do professor (lista de níveis que valem ponto). Bizarrice e Extensão
   NÃO pontuam — ficam para discussão (não há gabarito cultural). O telão mostra a
   DIVERGÊNCIA da turma por dimensão. Expõe window.DIMENSOES_DATA.

   Para ajustar uma banda: edite `banda` do caso (lista de chaves de nível que
   valem +1). Dimensão sem `banda` no caso = não pontua naquele caso.
   ============================================================================= */
(function (global) {
  "use strict";

  /* As 5 dimensões. `pontua` = entra no placar (por banda de referência). */
  var DIMENSOES = [
    { chave: "conviccao",      nome: "Convicção",      pontua: true,
      desc: "O quanto acredita que é real — com que grau de certeza, e o quanto resiste a ser contestado." },
    { chave: "extensao",       nome: "Extensão",       pontua: false,
      desc: "O quanto da vida e de quantas pessoas/áreas o delírio abrange (de um tema isolado ao mundo todo)." },
    { chave: "bizarrice",      nome: "Bizarrice",      pontua: false,
      desc: "O quanto a crença foge do culturalmente plausível (impossível × só improvável)." },
    { chave: "desorganizacao", nome: "Desorganização", pontua: true,
      desc: "O quanto a crença é fragmentada e incoerente — versus internamente lógica e sistematizada." },
    { chave: "preocupacao",    nome: "Preocupação",    pontua: true,
      desc: "O quanto sofre e se ocupa com o delírio (do quase indiferente ao tomado por ele)." }
  ];

  /* Os 3 níveis ordinais. */
  var NIVEIS = [
    { chave: "baixa", label: "Baixa" },
    { chave: "media", label: "Média" },
    { chave: "alta",  label: "Alta"  }
  ];

  /* Os 8 casos (ids locais 1–8). `banda`: por dimensão pontuada, os níveis que
     valem +1. Bizarrice/Extensão não aparecem em `banda` (não pontuam). */
  var CASOS = [
    {
      id: 1, nome: "Daniela", caso_completo: "../casos/galeria/ficticios/daniela.html",
      vinheta: `<b>Daniela</b>, 31 anos, bancária, encaminhada por preocupação crescente de que colegas comentam sua vida pessoal pelas costas. Ao ouvir risadas no corredor, pensa de imediato que falam dela — mas logo considera que pode ser "coisa da minha cabeça". Em algumas ocasiões tem quase certeza de uma conspiração; em outras, <b>convence-se de que é coincidência</b>. Dorme bem, mantém a rotina e continua saindo com amigos, ainda que às vezes traga o tema à tona. Não se isola e segue interessada em hobbies como corrida e leitura. Mostra ansiedade ao narrar, mas <b>ri de si mesma</b>: "sei que parece exagero, mas não consigo evitar a sensação".`,
      banda: { conviccao: ["baixa","media"], desorganizacao: ["baixa"], preocupacao: ["baixa","media"] },
      discussao: `Convicção baixa e <b>crítica preservada</b> ("sei que parece exagero"). Ainda é delírio? Discutam a fronteira com a <b>ideia sobrevalorada/prevalente</b> — e o que muda quando o juízo de realidade ainda oscila.`
    },
    {
      id: 2, nome: "Antônio", caso_completo: "../casos/galeria/ficticios/antonio.html",
      vinheta: `<b>Sr. Antônio</b>, 59 anos, aposentado do serviço público, há cerca de um ano passou a acreditar que vizinhos instalam câmeras ocultas em sua casa para espioná-lo. Ouve ruídos no teto e está convencido de que são cabos sendo movimentados; cobriu as janelas com papel-alumínio e pôs três fechaduras extras na porta. Ainda assim, participa das reuniões da associação de bairro e vai à missa aos domingos, embora menos que antes. A esposa conta que o tema da vigilância ocupa boa parte das conversas, mas que ele <b>ainda discute outros assuntos</b>. <b>Narra de forma organizada</b>, insiste que há "provas concretas" e diz ter visto "sombras" na parede. Não dorme tranquilo, com medo de estar sendo monitorado.`,
      banda: { conviccao: ["alta"], desorganizacao: ["baixa"], preocupacao: ["media","alta"] },
      discussao: `Persecutório <b>convicto e bem sistematizado</b>, mas a vida não foi toda tomada (mantém a associação de bairro, a missa). Reparem como <b>convicção alta</b> convive com <b>extensão ainda parcial</b>.`
    },
    {
      id: 3, nome: "Carla", caso_completo: "../casos/galeria/ficticios/carla.html",
      vinheta: `<b>Carla</b>, 27 anos, estudante de artes visuais, há alguns meses relata que o corpo está sendo gradualmente substituído por peças mecânicas invisíveis. Afirma que o coração já foi trocado por uma engrenagem e que seus olhos são câmeras que transmitem imagens a uma base secreta no Saara. Diz ainda que os professores foram substituídos por robôs e que a mãe foi "clonada" — quem vive com ela "não é a verdadeira mãe, mas uma cópia defeituosa". Perguntada como esses elementos se ligam, dá <b>respostas fragmentadas</b>, muda de tema rapidamente e mistura narrativas sem conexão lógica. Passa o dia trancada no quarto, pintando "mapas para decifrar a invasão das máquinas". Dorme pouco, sente-se vigiada e tem ansiedade intensa.`,
      banda: { conviccao: ["alta"], desorganizacao: ["alta"], preocupacao: ["media","alta"] },
      discussao: `Aqui a bizarrice vem <b>com</b> desorganização: respostas fragmentadas, sem nexo, mudando de tema. Segurem este caso — ele volta na comparação com <b>Schreber</b>.`
    },
    {
      id: 4, nome: "Daniel Paul Schreber", caso_completo: "../casos/galeria/reais/schreber.html",
      vinheta: `<b>Daniel Paul Schreber</b> (1842–1911), jurista alemão de alta hierarquia, ficou célebre por publicar as memórias da própria doença. Desenvolveu um sistema delirante em torno de "raios divinos" que liam seus pensamentos, impunham ideias e destruíam seus órgãos — mas também os recriavam por milagre (afirmava ter vivido anos "sem estômago, sem intestinos"). O eixo era a convicção de que sua missão de redimir a humanidade só se cumpriria se ele fosse <b>transformado em mulher e fecundado por Deus</b> através dos raios. Ouvia <b>vozes incessantes</b> ("linguagem dos nervos") que o humilhavam, e sentia o corpo mudar (retração dos genitais, seios em desenvolvimento). Apesar da bizarrice extrema, todo o sistema é <b>altamente sistematizado e coerente</b> — teologia, cosmologia e missão messiânica —, e dele permaneceu absolutamente convicto.`,
      banda: { conviccao: ["alta"], desorganizacao: ["baixa"], preocupacao: ["media","alta"] },
      discussao: `Comparem com a <b>Carla</b>: os dois são igualmente bizarros, mas Schreber é <b>altamente sistematizado e coerente</b> e Carla, desorganizada. <b>Bizarrice ≠ desorganização</b> — são eixos independentes.`
    },
    {
      id: 5, nome: "Helena", caso_completo: "../casos/galeria/ficticios/helena.html",
      vinheta: `<b>Helena</b>, 39 anos, professora de música, relata que há três anos descobriu se comunicar com anjos durante a madrugada. Eles lhe transmitem mensagens sobre a harmonia do universo e, pelo som do piano, ela "alinha as vibrações" do planeta. Conta que certa noite sentiu o corpo se expandir até ocupar toda a sala — para ela, "prova" da conexão celestial. Apesar da <b>firme convicção</b>, mantém o trabalho, segue ensinando e se apresentando, e não rompeu vínculos; evita comentar o tema fora da terapia "para não ser mal interpretada". <b>Narra de forma articulada, coerente e detalhada</b>, sem contradições. Refere <b>conforto e inspiração</b> com as mensagens — não ansiedade nem sofrimento.`,
      banda: { conviccao: ["media","alta"], desorganizacao: ["baixa"], preocupacao: ["baixa"] },
      discussao: `Convicção alta e organizada, mas <b>sem sofrimento</b> (refere conforto e inspiração) — o delírio pode não doer. E vejam como a <b>Bizarrice</b> dependeu da <b>cultura</b> de quem avaliou (os anjos, as vibrações).`
    },
    {
      id: 6, nome: "John Nash", caso_completo: "../casos/galeria/reais/nash.html",
      vinheta: `<b>John Forbes Nash Jr.</b> (1928–2015), matemático e Nobel de Economia, professor em Princeton e no MIT, passou a ter sintomas psicóticos no fim dos anos 1950. Escrevia por horas a embaixadas estrangeiras, convencido de participar de <b>missões secretas</b> de política internacional, e acreditava que mensagens codificadas lhe chegavam por jornais e revistas, a serem decifradas para salvar o mundo de conspirações comunistas. Tentou renunciar ao cargo em Princeton dizendo-se chamado a uma liderança mundial; por vezes se dizia o "Príncipe da Paz". Tinha também <b>delírios persecutórios</b> — sentia-se seguido por agentes que interceptavam suas comunicações. Apesar da estranheza, <b>articulava tudo de modo coerente</b>, com explicações lógicas internas. O impacto foi severo (crise no casamento, abandono de cargos, internações), embora preservasse, em intervalos, lampejos de raciocínio matemático sofisticado.`,
      banda: { conviccao: ["alta"], desorganizacao: ["baixa","media"], preocupacao: ["media","alta"] },
      discussao: `Persecutório + grandeza, articulado e <b>convicto</b>, com <b>extensão ampla</b> e impacto severo. Anos depois houve crítica — a convicção pode <b>mudar ao longo do tempo</b>.`
    },
    {
      id: 7, nome: "Syd Barrett", caso_completo: "../casos/galeria/reais/syd-barrett.html",
      vinheta: `<b>Syd Barrett</b> (1946–2006), guitarrista e fundador do Pink Floyd. No auge do sucesso, entre 1967 e 1968, passou a ter comportamentos imprevisíveis em ensaios e shows — às vezes ficava imóvel no palco tocando uma só nota, ou desafinava a guitarra de propósito. Relatava sentir-se constantemente observado e que <b>mensagens ocultas</b> lhe chegavam pela TV e pelo rádio. Em casa, pintou as paredes e cobriu as janelas com papel-alumínio para "bloquear ondas externas". Amigos o descreviam perdido em devaneios, com <b>fala incoerente</b> e dificuldade de manter um diálogo linear; ainda compunha, mas cada vez mais fragmentado. O sofrimento e a desorganização levaram ao abandono da carreira e ao isolamento quase completo.`,
      banda: { conviccao: ["media","alta"], desorganizacao: ["alta"], preocupacao: ["media","alta"] },
      discussao: `Desorganização crescente <b>com</b> sofrimento e deterioração — contraste direto com os delírios organizados (Antônio, Schreber, Helena).`
    },
    {
      id: 8, nome: "Vincent van Gogh", caso_completo: "../casos/galeria/reais/van-gogh.html",
      vinheta: `<b>Vincent van Gogh</b> (1853–1890), um dos pintores mais influentes da história, teve a vida marcada por intensa produção e crises psíquicas graves. Aos 36 anos, em Arles, passou a ter <b>episódios</b> de agitação intensa seguidos de apatia. Relatava ouvir vozes e sentir que vizinhos e estranhos o hostilizavam; em cartas ao irmão Theo, temia estar sendo envenenado e descrevia visões religiosas de uma missão divina pela pintura. Após discutir violentamente com Gauguin, <b>mutilou parte da própria orelha</b>. Internado em Saint-Rémy, descrevia ataques em que se sentia possuído por forças externas que controlavam seu corpo. Apesar da gravidade, seguia produzindo obras-primas nos intervalos de estabilidade.`,
      banda: { conviccao: ["media","alta"], desorganizacao: ["media","alta"], preocupacao: ["media","alta"] },
      discussao: `Quadro <b>episódico</b>, com forte componente afetivo (e possivelmente orgânico): o delírio <b>flutua</b> com as crises, não é estável. O <b>curso temporal</b> entra na leitura dimensional.`
    }
  ];

  var NOTA = "Não há gabarito único: o objetivo é perceber que o delírio é dimensional e que clínicos experientes divergem. O placar premia apenas as faixas mais defensáveis (Convicção, Desorganização, Preocupação); Bizarrice e Extensão ficam para a discussão.";

  global.DIMENSOES_DATA = { DIMENSOES: DIMENSOES, NIVEIS: NIVEIS, CASOS: CASOS, NOTA: NOTA };
})(window);
