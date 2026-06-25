/* =============================================================================
   BANCO DE ITENS — Rodada 5 (O caso completo)
   Orientado a dados. FONTE ÚNICA: consumido pela atividade do aluno
   (05-casos.html) e pelo painel do professor (via lib/painel-mc.js).

   O capstone do campeonato: cada item é um CASO COMPLETO do livro (vinheta
   condensada; o caso inteiro está no capítulo linkado em `roteiro`). As `opcoes`
   são HIPÓTESES diagnósticas/sindrômicas; a `fronteira` traz o discriminador e
   abre com "Como diferenciar:". A síntese escrita (EEM + súmula) é feita FORA do
   app, em grupo, com devolutiva de uma IA (ver a tela final de 05-casos.html).
   SEM negrito (mesma decisão da R4). `vinheta` e `fronteira` são HTML confiável.
   As `opcoes` listam a hipótese certa primeiro; a ORDEM é EMBARALHADA no render.
   Expõe window.CASOS_DATA.
   ============================================================================= */
(function (global) {
  "use strict";

  var C = "https://henriquealvarenga.com/entrevista/casos/galeria/";

  var NOTA_REVELACAO = "Aqui não se trata de cravar um diagnóstico: o EEM é um recorte transversal. O objetivo é a hipótese sindrômica mais provável e o critério que a separa dos quadros vizinhos — o diagnóstico formal exige o curso ao longo do tempo, exames e mais dados.";

  var ITENS = [
    {
      id: 1, grupo_eem: "Vida afetiva (§11)", correta: "depr", roteiro: C + "ficticios/maria.html",
      opcoes: [
        { chave: "depr",     label: "Síndrome depressiva (com pseudodemência)" },
        { chave: "demencia", label: "Síndrome demencial inicial" },
        { chave: "distimia", label: "Distimia" },
        { chave: "neg",      label: "Esquizofrenia (sintomas negativos)" }
      ],
      vinheta: `Maria é trazida pela irmã, há três semanas em declínio. Fala devagar, voz quase inaudível, pouca mímica; sente-se "vazia, sem sentido", perdeu o prazer em tudo, acorda de madrugada ruminando ser "um peso". Guarda comprimidos "caso não aguente mais". Queixa-se de memória, mas com tempo e estímulo lembra melhor do que diz.`,
      fronteira: `Como diferenciar: humor deprimido pervasivo, anedonia e ideação de morte estruturada são o eixo; a queixa de memória melhora com estímulo (pseudodemência), o que afasta a demência, em que o declínio é insidioso e não melhora. A distimia é crônica e mais leve, sem esse peso e risco. Os sintomas negativos achatam o afeto, mas não trazem a tristeza vital nem a ideação suicida.`
    },
    {
      id: 2, grupo_eem: "Vida afetiva (§11)", correta: "mania", roteiro: C + "ficticios/joao.html",
      opcoes: [
        { chave: "mania",       label: "Síndrome maníaca" },
        { chave: "esquizo",     label: "Esquizofrenia" },
        { chave: "estimulante", label: "Intoxicação por estimulante" },
        { chave: "grandeza",    label: "Transtorno delirante de grandeza" }
      ],
      vinheta: `João entra falando sem parar, roupas chamativas, eufórico e irritável. Pula de um plano grandioso a outro (abrir quatro empresas, compor uma sinfonia), dorme 2–3 h sem cansaço, gastou R$ 15 mil em três dias. Sente-se "no topo do mundo", com uma "missão", e não reconhece nenhum problema.`,
      fronteira: `Como diferenciar: o eixo é o humor elevado com energia aumentada — euforia/irritabilidade, grandiosidade, sono reduzido sem fadiga e desinibição com gastos —, definindo a mania. Na esquizofrenia o centro seria a desorganização e o afeto incongruente. A intoxicação por estimulante imita o quadro, mas atrela-se ao uso (ele nega). No delírio de grandeza isolado falta a elevação global do humor e da energia.`
    },
    {
      id: 3, grupo_eem: "Sensopercepção (§6 · §7)", correta: "esquizo", roteiro: C + "ficticios/ana.html",
      opcoes: [
        { chave: "esquizo",   label: "Esquizofrenia (primeiro episódio psicótico)" },
        { chave: "delirante", label: "Transtorno delirante" },
        { chave: "delirium",  label: "Delirium" },
        { chave: "deprpsi",   label: "Depressão com sintomas psicóticos" }
      ],
      vinheta: `Ana, 19 anos, antes estudante brilhante, mudou nos últimos seis meses. Vê uma mulher "de vestido branco" que outros não veem, ouve vozes que a chamam de suja e sente formigas "caminhando nas veias". O afeto é embotado, as respostas às vezes não têm nexo ("família… pássaros… voando"), e não fixa três palavras após dois minutos.`,
      fronteira: `Como diferenciar: vários domínios alterados ao mesmo tempo — alucinações em mais de uma modalidade, delírio, desorganização e embotamento afetivo — com início subagudo em jovem e queda do funcionamento apontam a esquizofrenia. O transtorno delirante exigiria delírio isolado com o resto preservado. O delirium traria rebaixamento e flutuação da consciência, ausentes aqui. A depressão psicótica teria o humor deprimido como eixo.`
    },
    {
      id: 4, grupo_eem: "Memória (§5 · §9)", correta: "demencia", roteiro: C + "ficticios/roberto.html",
      opcoes: [
        { chave: "demencia", label: "Síndrome demencial (com parkinsonismo)" },
        { chave: "pseudo",   label: "Pseudodemência depressiva" },
        { chave: "delirium", label: "Delirium" },
        { chave: "tncleve",  label: "Transtorno neurocognitivo leve" }
      ],
      vinheta: `Roberto, aposentado, há meses esquece compromissos, repete perguntas e se perdeu voltando de lugar conhecido; minimiza ("é a idade"). Erra a data e o serial 7, distribui mal os números no desenho do relógio. A filha nota mudança de personalidade. Há tremor de repouso, face em máscara, lentidão e marcha em passos curtos.`,
      fronteira: `Como diferenciar: declínio cognitivo insidioso e progressivo — memória, funções executivas, praxia construtiva — que a pessoa minimiza e não melhora com estímulo, com prejuízo do funcionamento, caracteriza a síndrome demencial. A pseudodemência melhoraria com estímulo e teria o humor no centro. O delirium seria agudo e flutuante, com rebaixamento da consciência. No transtorno neurocognitivo leve não há o prejuízo funcional visto aqui. O parkinsonismo associado orienta a etiologia.`
    },
    {
      id: 5, grupo_eem: "Juízo de realidade (§10)", correta: "delirante", roteiro: C + "ficticios/carlos.html",
      opcoes: [
        { chave: "delirante", label: "Transtorno delirante persecutório" },
        { chave: "esquizo",   label: "Esquizofrenia paranoide" },
        { chave: "person",    label: "Personalidade paranoide" },
        { chave: "ansiedade", label: "Transtorno de ansiedade" }
      ],
      vinheta: `Carlos, há seis meses, tem certeza de que é vigiado: um carro que troca de cor é "o mesmo grupo", o computador foi hackeado, o chefe fala dele. Mantém um caderno de "provas". O pensamento é organizado, memória e orientação preservadas; nega ouvir vozes ou ver coisas. Não se acha doente e veio só por pressão da esposa.`,
      fronteira: `Como diferenciar: delírio persecutório sistematizado e isolado, com pensamento organizado, sem alucinações e com funcionamento relativamente preservado, caracteriza o transtorno delirante. A esquizofrenia traria alucinações e/ou desorganização e maior prejuízo. A personalidade paranoide é um padrão desconfiado estável, sem delírio franco e irredutível. A ansiedade não cursa com certeza delirante inabalável.`
    },
    {
      id: 6, grupo_eem: "Juízo de realidade (§10)", correta: "ciume", roteiro: C + "ficticios/marcos.html",
      opcoes: [
        { chave: "ciume",     label: "Transtorno delirante ciumento (Otelo)" },
        { chave: "naodelir",  label: "Ciúme não-delirante (ideia sobrevalorada)" },
        { chave: "esquizo",   label: "Esquizofrenia" },
        { chave: "toc",       label: "Transtorno obsessivo-compulsivo" }
      ],
      vinheta: `Marcos, casado há 15 anos, está convencido de que a esposa o trai. Cada detalhe vira prova — um emoji, um perfume novo, uma roupa. Vigia o celular, segue-a, confronta vizinhos; as negativas dela são "parte do disfarce". Descreve tudo de forma lógica e organizada, mas perdeu prazos no trabalho e vive irritado e sem dormir.`,
      fronteira: `Como diferenciar: certeza inabalável de traição, sustentada pela interpretação de detalhes neutros e irredutível à evidência, isolada e sistematizada, é o delírio de ciúme (síndrome de Otelo). O ciúme não-delirante admite dúvida e cede à evidência. A esquizofrenia traria alucinações ou desorganização. No TOC a ideia seria egodistônica, vivida como absurda e resistida — o oposto da convicção delirante.`
    },
    {
      id: 7, grupo_eem: "Juízo de realidade (§10)", correta: "ekbom", roteiro: C + "ficticios/ingrid.html",
      opcoes: [
        { chave: "ekbom",   label: "Delírio de parasitose (síndrome de Ekbom)" },
        { chave: "esquizo", label: "Esquizofrenia" },
        { chave: "toc",     label: "Transtorno obsessivo-compulsivo" },
        { chave: "derma",   label: "Prurido dermatológico com escoriação" }
      ],
      vinheta: `Ingrid, 55 anos, no período pós-menopausa, está convencida de que pequenos bichos andam sob a pele. Para matá-los, queima a pele com fósforos e traz "amostras" num papel — que são cascas de pele. Vários dermatologistas nada acharam, e ela rejeita as explicações. Fora disso, está lúcida e funcionante, sem outras alucinações, delírios ou desorganização.`,
      fronteira: `Como diferenciar: convicção delirante isolada de infestação por parasitas, com o "sinal da caixinha" (traz amostras) e automutilação para extraí-los, com o restante do exame preservado, define o delírio de parasitose (Ekbom), um transtorno delirante somático. A esquizofrenia teria outros sintomas. No TOC haveria dúvida e crítica, não certeza inabalável. Uma dermatose pruriginosa explicaria a coceira, mas não a convicção de bichos apesar dos exames normais.`
    },
    {
      id: 8, grupo_eem: "Consciência do eu (§14)", correta: "incipiente", roteiro: C + "reais/ranier.html",
      opcoes: [
        { chave: "incipiente", label: "Esquizofrenia incipiente (trema → referência)" },
        { chave: "delirante",  label: "Transtorno delirante" },
        { chave: "depr",       label: "Episódio depressivo" },
        { chave: "tept",       label: "Transtorno de estresse pós-traumático" }
      ],
      vinheta: `Ranier, 20 anos, recruta, começa sentindo que "há algo estranho" (um mal-estar sem objeto). Aos poucos, tudo passa a se referir a ele: rumores de que será chefe, colegas que o observam, sinais nas placas e no motor do carro. Por fim, sente que todos leem seus pensamentos. A tensão dá lugar à certeza de uma trama universal contra ele.`,
      fronteira: `Como diferenciar: a sequência descrita por Conrad — um clima de estranheza sem objeto (trema) que se cristaliza em delírio de referência ("tudo fala de mim") e em vivência de que leem seus pensamentos — é típica da esquizofrenia incipiente. O transtorno delirante não teria essa difusão referencial nem a transparência do pensamento. Depressão e TEPT têm outro eixo (humor, revivência), ausente como núcleo aqui.`
    },
    {
      id: 9, grupo_eem: "Consciência do eu (§14)", correta: "paranoide", roteiro: C + "reais/schreber.html",
      opcoes: [
        { chave: "paranoide", label: "Esquizofrenia paranoide" },
        { chave: "delirante", label: "Transtorno delirante" },
        { chave: "humor",     label: "Transtorno do humor com sintomas psicóticos" },
        { chave: "induzido",  label: "Delírio induzido (folie à deux)" }
      ],
      vinheta: `Schreber construiu um sistema delirante elaborado: "raios divinos" leem e impõem pensamentos e destroem/recriam seus órgãos; ele teria de ser transformado em mulher para redimir a humanidade. Ouve vozes incessantes ("linguagem dos nervos") que comentam e humilham, e percebe mudanças no corpo. Tudo é coerente e sistematizado, ainda que bizarro.`,
      fronteira: `Como diferenciar: delírios bizarros (influência e leitura/imposição de pensamentos, transformação corporal) com alucinações auditivas persistentes apontam a esquizofrenia, mesmo quando o sistema é altamente organizado. O transtorno delirante não admite delírio bizarro nem alucinações proeminentes. No transtorno do humor o eixo seria afetivo. O delírio induzido pressupõe uma crença compartilhada com outra pessoa.`
    },
    {
      id: 10, grupo_eem: "Juízo de realidade (§10)", correta: "grandioso", roteiro: C + "ficticios/helena.html",
      opcoes: [
        { chave: "grandioso", label: "Transtorno delirante (tipo grandioso/místico)" },
        { chave: "esquizo",   label: "Esquizofrenia" },
        { chave: "mania",     label: "Episódio maníaco" },
        { chave: "religiosa", label: "Experiência religiosa não-patológica" }
      ],
      vinheta: `Helena, 39 anos, professora de música. Há três anos diz comunicar-se com anjos durante a madrugada; eles lhe transmitem mensagens sobre a "harmonia do universo" e, ao piano, ela "alinha as vibrações do planeta". Mantém o trabalho, as aulas e as apresentações, não rompeu vínculos e evita comentar o tema "para não ser mal interpretada". Narra tudo de forma articulada e coerente, com conforto e inspiração — sem angústia nem desorganização.`,
      fronteira: `Como diferenciar: crença grandioso-mística firme e sistematizada, isolada, com pensamento organizado, afeto preservado e funcionamento intacto, caracteriza o transtorno delirante. A esquizofrenia traria alucinações proeminentes, desorganização ou queda do funcionamento. No episódio maníaco a grandiosidade viria acompanhada de humor elevado, aceleração e energia aumentada — ausentes aqui. Uma experiência religiosa não-patológica seria culturalmente compartilhada e revisável; aqui a convicção é idiossincrática e inabalável.`
    }
  ];

  global.CASOS_DATA = { ITENS: ITENS, NOTA_REVELACAO: NOTA_REVELACAO };
})(window);
