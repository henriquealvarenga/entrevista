/* =============================================================================
   BANCO DE ITENS — Rodada 4 (Síndrome no EEM)
   Orientado a dados. FONTE ÚNICA: consumido pela atividade do aluno
   (04-sindrome.html) e pelo painel do professor (via lib/painel-mc.js).

   Cada item é uma CONSTELAÇÃO de achados (uma pequena história, com nome); as
   `opcoes` são quadros/fenômenos candidatos; a `fronteira` traz o discriminador
   e abre com "Como diferenciar:". Linguagem PSICOPATOLÓGICA (fenômenos e
   síndromes), não nosológica (diagnósticos). SEM negrito (decisão da R4).
   `vinheta` e `fronteira` são HTML confiável. As `opcoes` listam o quadro certo
   primeiro; a ORDEM é EMBARALHADA no render. Expõe window.SINDROME_DATA.
   ============================================================================= */
(function (global) {
  "use strict";

  var R = "https://henriquealvarenga.com/entrevista/capitulos/parte-2-roteiro/";

  var NOTA_REVELACAO = "Em psicopatologia, o objetivo é descrever o quadro — o fenômeno e a síndrome — e o critério que o separa dos vizinhos; o diagnóstico formal vem depois, com mais dados e o curso ao longo do tempo.";

  var ITENS = [
    {
      id: 1, grupo_eem: "Psicomotricidade (§16)", correta: "parkneuro",
      roteiro: R + "16-psicomotricidade.html",
      opcoes: [
        { chave: "parkneuro", label: "Parkinsonismo induzido por neuroléptico" },
        { chave: "parkidio",  label: "Doença de Parkinson idiopática" },
        { chave: "neg",       label: "Sintomas negativos da esquizofrenia" },
        { chave: "disc",      label: "Discinesia tardia" }
      ],
      vinheta: `Marcos, 40 anos, tem esquizofrenia e está em uso de haloperidol. Algumas semanas depois de começar a medicação, a família percebe que o rosto dele ficou parado, quase sem expressão, e que as mãos tremem quando estão paradas no colo. Ele anda mais devagar, em passos curtos e arrastados, e os braços parecem enrijecidos.`,
      fronteira: `Como diferenciar: a relação temporal com o haloperidol somada à tríade tremor de repouso, rigidez e bradicinesia aponta o parkinsonismo medicamentoso (impregnação). O Parkinson idiopático daria quadro parecido, mas sem o gatilho do remédio e em geral começando de um lado só. Os sintomas negativos podem achatar a mímica, mas não dão tremor de repouso nem rigidez em roda denteada. A discinesia tardia também vem dos neurolépticos, porém com movimentos hipercinéticos (caretas, mastigação), o oposto da lentidão vista aqui.`
    },
    {
      id: 2, grupo_eem: "Vida afetiva (§11)", correta: "depr",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "depr",      label: "Síndrome depressiva (com pseudodemência)" },
        { chave: "demencia",  label: "Síndrome demencial inicial" },
        { chave: "luto",      label: "Luto (reação normal)" },
        { chave: "hipotireo", label: "Quadro de hipotireoidismo" }
      ],
      vinheta: `Há cerca de dois meses, Dona Lúcia, de 68 anos, anda para baixo. Perdeu a vontade de fazer o que gostava, fala devagar e acorda de madrugada sem voltar a dormir. Reclama que está esquecida, mas, quando o examinador a encoraja e dá tempo, ela lembra bem mais do que dizia conseguir. Confessa, baixinho, que tem achado que não vale a pena continuar.`,
      fronteira: `Como diferenciar: o humor deprimido que toma o dia inteiro, a perda de prazer e a ideação de morte são o eixo; e a queixa de memória melhora com estímulo, marca da pseudodemência depressiva. Na síndrome demencial o declínio é insidioso, a pessoa tende a minimizar o esquecimento e não melhora com estímulo. O luto ancora-se numa perda concreta, vem em ondas e poupa a autoestima. O hipotireoidismo pode imitar a depressão e merece ser descartado, mas não explica sozinho a tristeza pervasiva com ideação de morte.`
    },
    {
      id: 3, grupo_eem: "Vida afetiva (§11)", correta: "mania",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "mania",       label: "Síndrome maníaca" },
        { chave: "psicose",     label: "Síndrome psicótica" },
        { chave: "estimulante", label: "Intoxicação por estimulante" },
        { chave: "hipotimia",   label: "Hipotimia" }
      ],
      vinheta: `Rafael, de 30 anos, está há uma semana com o humor entre eufórico e irritado, cheio de planos grandiosos. Tem dormido apenas duas ou três horas por noite e não se sente cansado. Anda desinibido e gastou boa parte das economias em poucos dias. Nunca usou drogas.`,
      fronteira: `Como diferenciar: o eixo é o humor elevado com energia aumentada — euforia, grandiosidade congruente e sono reduzido sem cansaço —, o que define a síndrome maníaca. Uma síndrome psicótica teria a desorganização e o afeto incongruente no centro, não a elevação do humor. A intoxicação por estimulante dá quadro parecido, mas atrelado ao uso, com sinais autonômicos, e ele nunca usou drogas. A hipotimia é o oposto: rebaixamento do humor.`
    },
    {
      id: 4, grupo_eem: "Pensamento e juízo (§7 · §10)", correta: "delirante",
      roteiro: R + "10-juizo-de-realidade.html",
      opcoes: [
        { chave: "delirante",    label: "Pensamento delirante" },
        { chave: "obsessivo",    label: "Pensamento obsessivo" },
        { chave: "sobrevalorada", label: "Ideia sobrevalorada" },
        { chave: "concreto",     label: "Pensamento concreto" }
      ],
      vinheta: `Há mais de um ano, Sérgio, de 50 anos, está convencido de que a esposa o trai. Cada detalhe do dia vira prova — um olhar, um atraso, uma roupa nova. Por mais que lhe mostrem o contrário, ele não recua nem por um instante; a certeza é inabalável. Fora desse assunto, trabalha e conversa normalmente.`,
      fronteira: `Como diferenciar: a convicção é plena, irredutível à evidência e sem crítica, o que caracteriza o pensamento delirante. No pensamento obsessivo a ideia é vivida como própria, absurda e indesejada, e a pessoa resiste a ela. A ideia sobrevalorada é aceita como razoável e investida de valor excessivo, sem o caráter absurdo e inabalável do delírio. O pensamento concreto é alteração da forma (perda da abstração), de natureza diferente do conteúdo da crença.`
    },
    {
      id: 5, grupo_eem: "Nível de consciência (§2)", correta: "delirium",
      roteiro: R + "02-nivel-de-consciencia.html",
      opcoes: [
        { chave: "delirium", label: "Delirium (estado confusional agudo)" },
        { chave: "demencia", label: "Síndrome demencial" },
        { chave: "psicose",  label: "Síndrome psicótica (consciência clara)" },
        { chave: "instab",   label: "Instabilidade emocional" }
      ],
      vinheta: `No segundo dia depois da cirurgia, o Sr. Osvaldo, idoso, oscila ao longo do mesmo dia entre a sonolência e a agitação. Não sustenta a atenção, não sabe direito onde está e diz ver vultos pelo quarto; à noite piora. Há dois dias estava perfeitamente lúcido, e tudo se instalou em poucas horas.`,
      fronteira: `Como diferenciar: o rebaixamento e a flutuação do nível de consciência, somados à desatenção e ao início agudo num contexto orgânico (pós-operatório), definem o delirium. A síndrome demencial cursa com consciência clara e instalação crônica. Uma síndrome psicótica também transcorre com consciência clara e atenção preservada, justo o que falta aqui. A instabilidade emocional é oscilação do humor, não do nível de consciência.`
    },
    {
      id: 6, grupo_eem: "Vida afetiva (§11)", correta: "panico",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "panico",    label: "Crise de pânico" },
        { chave: "dissoc",    label: "Crise dissociativa" },
        { chave: "obsessivo", label: "Pensamento obsessivo" },
        { chave: "delirante", label: "Pensamento delirante" }
      ],
      vinheta: `Beatriz, de 25 anos, tem crises repentinas de medo intenso, com o coração disparado, falta de ar, suor e a sensação de que vai morrer. Tudo chega ao auge em poucos minutos e depois passa. Entre as crises, vive com medo de ter a próxima e já evita sair sozinha. A investigação clínica e cardiológica não achou nada.`,
      fronteira: `Como diferenciar: as crises paroxísticas de medo intenso, que sobem ao pico em minutos, com sintomas autonômicos e medo antecipatório, caracterizam a crise de pânico. A crise dissociativa cursa com alteração da consciência, da identidade ou da memória, em geral com desencadeante psicológico, e não com essa descarga autonômica de medo. O pensamento obsessivo é uma ideia intrusiva reconhecida como própria e resistida, não uma crise de medo. O pensamento delirante é uma crença falsa mantida com convicção, ausente aqui.`
    },
    {
      id: 7, grupo_eem: "Psicomotricidade (§16)", correta: "catatonia",
      roteiro: R + "16-psicomotricidade.html",
      opcoes: [
        { chave: "catatonia",     label: "Síndrome catatônica" },
        { chave: "estupordepr",   label: "Estupor depressivo" },
        { chave: "parkinson",     label: "Parkinsonismo" },
        { chave: "estupordissoc", label: "Estupor dissociativo" }
      ],
      vinheta: `Tiago passa horas imóvel e calado, sem responder ao que lhe perguntam, resistindo de forma passiva ao que se pede. Quando o examinador levanta e dobra o braço dele numa posição qualquer, o braço fica ali, na postura imposta, como se fosse de cera.`,
      fronteira: `Como diferenciar: mutismo, negativismo e flexibilidade cerácea (as posturas impostas que se mantêm) definem a catatonia. O estupor depressivo é imobilidade por inibição, com humor visivelmente deprimido, sem a flexibilidade cerácea nem o negativismo ativo. O parkinsonismo traz rigidez e lentidão, mas não a flexibilidade cerácea nem o negativismo. O estupor dissociativo costuma ter desencadeante psicológico e não apresenta a flexibilidade cerácea.`
    },
    {
      id: 8, grupo_eem: "Juízo de realidade (§10)", correta: "trema",
      roteiro: R + "10-juizo-de-realidade.html",
      opcoes: [
        { chave: "trema",      label: "Humor delirante (trema)" },
        { chave: "ansiedade",  label: "Ansiedade (apreensão)" },
        { chave: "depressivo", label: "Humor depressivo" },
        { chave: "delsist",    label: "Delírio sistematizado" }
      ],
      vinheta: `Felipe, estudante de 19 anos, anda dizendo, nas últimas semanas, que sente o mundo diferente — tudo parece estranho e carregado de um significado que ele não consegue nomear —, e vive a tensão de que algo importante está para acontecer. Começou a achar que conversas e fatos banais, na rua, têm a ver com ele.`,
      fronteira: `Como diferenciar: o clima de estranhamento e significação difusa, com autorreferência incipiente e a tensão de que algo vai acontecer, é o humor delirante (trema, de Conrad). A ansiedade traz apreensão, sem transformar o significado do mundo. O humor depressivo tinge tudo de tristeza e vazio, não de estranheza significativa. No delírio sistematizado já existe uma crença falsa formada e organizada; aqui há apenas a atmosfera difusa que o antecede, sem delírio estruturado.`
    },
    {
      id: 9, grupo_eem: "Consciência do eu (§14)", correta: "desperson",
      roteiro: R + "14-consciencia-do-eu.html",
      opcoes: [
        { chave: "desperson",   label: "Despersonalização / desrealização" },
        { chave: "influencia",  label: "Vivência de influência (passividade)" },
        { chave: "delirtransf", label: "Delírio de transformação" },
        { chave: "panico",      label: "Crise de pânico" }
      ],
      vinheta: `Camila procura ajuda angustiada com uma sensação esquisita. É como se ela não fosse mais ela mesma, como se assistisse às próprias ações de fora do corpo. Às vezes o mundo ao redor parece irreal, distante, como num filme. Ela sabe que é uma sensação dela e que continua sendo quem é, e é justamente isso que a incomoda.`,
      fronteira: `Como diferenciar: a vivência se dá no registro do "como se", com crítica preservada — a estranheza é reconhecida como alteração interna, sem perder os limites do eu. Na vivência de influência o eu é sentido como invadido ou comandado de fora, e com convicção (sintoma psicótico). O delírio de transformação afirma, sem crítica, que de fato se transformou. A crise de pânico pode cursar com despersonalização, mas dentro do pico de medo agudo, não como queixa central e contínua.`
    },
    {
      id: 10, grupo_eem: "Consciência do eu (§14)", correta: "primeira",
      roteiro: R + "14-consciencia-do-eu.html",
      opcoes: [
        { chave: "primeira",  label: "Sintomas de primeira ordem (Schneider)" },
        { chave: "obsessivo", label: "Pensamento obsessivo" },
        { chave: "desperson", label: "Despersonalização" },
        { chave: "segunda",   label: "Sintomas de segunda ordem" }
      ],
      vinheta: `Gustavo relata que ouve os próprios pensamentos ecoarem em voz alta, fora da cabeça. Diz ainda que pensamentos que não são seus são colocados na sua mente por outra pessoa e que, por vezes, seus gestos são comandados de fora, por uma força alheia. Para ele, nada disso é impressão, é real.`,
      fronteira: `Como diferenciar: eco e sonorização do pensamento, inserção de pensamento e vivências de influência — a perda dos limites do eu vivida com convicção — são os sintomas de primeira ordem de Schneider. No pensamento obsessivo, a ideia é reconhecida como própria e combatida. Na despersonalização, tudo se passa no "como se", com crítica, enquanto aqui ele crê na influência externa. Os sintomas de segunda ordem têm menor peso e não envolvem essa ruptura dos limites do eu.`
    },
    {
      id: 11, grupo_eem: "Vida afetiva (§11)", correta: "reexp",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "reexp",        label: "Reexperiência traumática (revivência)" },
        { chave: "panico",       label: "Crise de pânico" },
        { chave: "agudaestresse", label: "Reação aguda ao estresse" },
        { chave: "ajustamento",  label: "Reação de ajustamento" }
      ],
      vinheta: `Há três meses, Renata sofreu um assalto violento. Desde então, revive a cena em flashbacks durante o dia e em pesadelos à noite. Passou a evitar o lugar e tudo que lhe lembre o ocorrido, vive em estado de alerta, sobressalta-se com qualquer ruído e dorme mal. Antes do episódio, era tranquila.`,
      fronteira: `Como diferenciar: um trauma definido seguido de revivências (flashbacks e pesadelos), evitação e hiperexcitabilidade, persistindo por mais de um mês, caracteriza a reexperiência traumática. A crise de pânico tem episódios sem gatilho traumático específico, centrados nos sintomas autonômicos. A reação aguda ao estresse responde ao mesmo gatilho, mas é breve, resolvendo-se em dias a poucas semanas. A reação de ajustamento traz sofrimento ligado a um estressor, sem o núcleo de revivência e hiperexcitabilidade.`
    },
    {
      id: 12, grupo_eem: "Pensamento — conteúdo (§7)", correta: "obsessivos",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "obsessivos", label: "Pensamentos obsessivos (com compulsões)" },
        { chave: "anancastico", label: "Traço anancástico (egossintônico)" },
        { chave: "delirante",  label: "Pensamento delirante" },
        { chave: "ansiedade",  label: "Ansiedade flutuante (generalizada)" }
      ],
      vinheta: `Bruno, de 22 anos, é tomado por pensamentos de contaminação que ele próprio acha absurdos, mas não consegue afastar. Para aliviar a angústia, lava as mãos dezenas de vezes e repete rituais que tomam horas do dia. Ele reconhece o exagero de tudo isso e sofre com a situação.`,
      fronteira: `Como diferenciar: ideias intrusivas reconhecidas como próprias, absurdas e resistidas (egodistônicas), acompanhadas de compulsões que aliviam a ansiedade e consomem tempo, são os pensamentos obsessivos com rituais compulsivos. O traço anancástico é egossintônico (perfeccionismo, rigidez), sem as obsessões intrusivas nem os rituais. No pensamento delirante há convicção sem crítica, enquanto aqui ele combate a ideia que considera absurda. A ansiedade flutuante é preocupação difusa com a vida real, sem o par obsessão-compulsão.`
    }
  ];

  global.SINDROME_DATA = { ITENS: ITENS, NOTA_REVELACAO: NOTA_REVELACAO };
})(window);
