/* =============================================================================
   BANCO DE ITENS — Rodada 2 (Fronteiras)
   Orientado a dados. FONTE ÚNICA: consumido pela atividade do aluno
   (02-fronteiras.html) e pelo painel do professor (lib/painel-02-fronteiras.js).

   Cada item é um caso EM CIMA DA FRONTEIRA entre termos confundíveis. O que se
   pontua é reconhecer o termo certo; o que se aprende é O CRITÉRIO QUE DECIDE
   entre ele e o vizinho (a `fronteira` sempre abre com "Como diferenciar:").
   `vinheta` e `fronteira` são HTML confiável. As `opcoes` listam o termo certo
   primeiro; a ORDEM é EMBARALHADA no render. Expõe window.FRONTEIRAS_DATA.
   ============================================================================= */
(function (global) {
  "use strict";

  var R = "https://henriquealvarenga.com/entrevista/capitulos/parte-2-roteiro/";

  var NOTA_REVELACAO = "Em casos reais as fronteiras são ainda mais tênues; o objetivo aqui é treinar o critério que separa um termo do vizinho.";

  var ITENS = [
    {
      id: 1, grupo_eem: "Sensopercepção (§6)", correta: "ilusao",
      roteiro: R + "06-sensopercepcao.html",
      opcoes: [
        { chave: "ilusao",    label: "Ilusão" },
        { chave: "aluc",      label: "Alucinação" },
        { chave: "alucinose", label: "Alucinose" }
      ],
      vinheta: `Ao entardecer, num quarto mal iluminado, um paciente olha para o casaco pendurado na cadeira e, por um instante, vê nele <b>um homem agachado, à espreita</b>. Acende a luz e percebe na hora: é o casaco. Havia, ali, <b>um objeto real</b> que sua percepção deformou.`,
      fronteira: `<b>Como diferenciar:</b> havia um <b>objeto real</b> (o casaco) que foi <i>deformado</i> → <b>ilusão</b>. A <b>alucinação</b> seria percepção <i>sem objeto</i>. A <b>alucinose</b> também não tem objeto, mas a pessoa <i>reconhece</i> que não é real — aqui, além de existir objeto, ele logo se corrige.`
    },
    {
      id: 2, grupo_eem: "Pensamento — conteúdo (§7) · Juízo (§10)", correta: "obsessao",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "obsessao",     label: "Pensamento obsessivo" },
        { chave: "delirio",      label: "Ideia delirante" },
        { chave: "sobrevalorada", label: "Ideia sobrevalorada" }
      ],
      vinheta: `Uma paciente é assolada, dezenas de vezes ao dia, pela ideia de que pode ter se contaminado. Ela <b>acha a ideia exagerada e absurda</b>, luta contra ela, sente-a como <b>intrusa e indesejada</b> — mas não consegue afastá-la, e isso a angustia.`,
      fronteira: `<b>Como diferenciar:</b> a ideia é <b>egodistônica</b> — vivida como intrusa, absurda, <i>resistida</i>, com crítica preservada → <b>pensamento obsessivo</b>. Na <b>ideia delirante</b> há convicção plena e irredutível, <i>sem</i> crítica. A <b>ideia sobrevalorada</b> é aceita como própria e razoável (egossintônica), investida de valor excessivo, mas não combatida.`
    },
    {
      id: 3, grupo_eem: "Nível de consciência (§2) · Atenção (§3)", correta: "delirium",
      roteiro: R + "02-nivel-de-consciencia.html",
      opcoes: [
        { chave: "delirium", label: "Delirium (estado confusional agudo)" },
        { chave: "demencia", label: "Demência" },
        { chave: "amnestica", label: "Síndrome amnéstica" }
      ],
      vinheta: `Um paciente internado há dois dias <b>oscila, no mesmo dia</b>, entre torpor e agitação. À tarde não sustenta a atenção, desconhece onde está e vê vultos; à noite piora. O quadro <b>instalou-se em horas</b>.`,
      fronteira: `<b>Como diferenciar:</b> <b>rebaixamento e flutuação do nível de consciência</b>, atenção comprometida e <i>início agudo</i> → <b>delirium</b>. A <b>demência</b> cursa com consciência <i>clara</i> e instalação crônica e progressiva. A <b>síndrome amnéstica</b> é déficit seletivo de memória, com consciência e atenção preservadas.`
    },
    {
      id: 4, grupo_eem: "Vida afetiva (§11)", correta: "incontinencia",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "incontinencia", label: "Incontinência afetiva" },
        { chave: "labilidade",    label: "Labilidade afetiva" },
        { chave: "hipertimia",    label: "Hipertimia" }
      ],
      vinheta: `A qualquer comentário um pouco tocante, um paciente <b>desaba em choro intenso</b>, que irrompe de forma abrupta e que ele <b>não consegue conter</b>, ainda que o estímulo seja mínimo e ele próprio ache a reação desproporcional. Cessa tão bruscamente quanto começou. <i>(Quadro após AVC.)</i>`,
      fronteira: `<b>Como diferenciar:</b> a descarga é <b>explosiva, incontrolável e desproporcional</b> ao estímulo, com pouca modulação → <b>incontinência afetiva</b> (frequente em lesões orgânicas). A <b>labilidade afetiva</b> é a mudança <i>rápida</i> do humor, mas ainda modulável e ligada ao contexto. A <b>hipertimia</b> é elevação <i>sustentada</i> do humor.`
    },
    {
      id: 5, grupo_eem: "Vida afetiva (§11)", correta: "embotamento",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "embotamento", label: "Embotamento afetivo" },
        { chave: "hipotimia",   label: "Hipotimia" },
        { chave: "apatia",      label: "Apatia" }
      ],
      vinheta: `Em voz monótona e com o rosto quase sem expressão, uma paciente relata que ouve vozes dizendo que ela é suja e que as formigas vão devorá-la. Chama atenção que narra algo tão aterrorizante <b>sem a angústia que se esperaria</b> — a ressonância afetiva parece achatada.`,
      fronteira: `<b>Como diferenciar:</b> o que está achatado é a <b>expressão e a ressonância</b> — o afeto <i>não acompanha</i> o conteúdo (incongruência), sem tristeza nem dor → <b>embotamento afetivo</b> (típico da esquizofrenia). A <b>hipotimia</b> é tristeza, dor moral — há sofrimento. A <b>apatia</b> é falta de interesse e iniciativa, sem esse descolamento entre afeto e conteúdo.`
    },
    {
      id: 6, grupo_eem: "Pensamento — forma (§7)", correta: "desagregacao",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "desagregacao", label: "Desagregação (afrouxamento associativo)" },
        { chave: "fuga",         label: "Fuga de ideias" },
        { chave: "prolixidade",  label: "Prolixidade" }
      ],
      vinheta: `Perguntada sobre a família, a paciente responde: <i>"Família… pássaros… voando… preciso voar também."</i> As ideias se sucedem <b>sem nexo lógico</b> que as ligue; não é que ela <i>acelere</i> o pensamento — é que o fio que conecta uma ideia à outra <b>se rompeu</b>.`,
      fronteira: `<b>Como diferenciar:</b> perde-se o <b>nexo lógico</b> entre as ideias — o discurso fica incompreensível → <b>desagregação</b> (afrouxamento das associações). Na <b>fuga de ideias</b> o curso é acelerado, mas as associações ainda são <i>rastreáveis</i> (por som, contiguidade). A <b>prolixidade</b> é lenta e detalhista, <i>sem</i> perder o nexo.`
    },
    {
      id: 7, grupo_eem: "Pensamento — curso (§7)", correta: "bloqueio",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "bloqueio",     label: "Bloqueio do pensamento" },
        { chave: "lentificacao", label: "Lentificação (bradipsiquismo)" },
        { chave: "mutismo",      label: "Mutismo" }
      ],
      vinheta: `No meio de uma frase, o pensamento do paciente parece <b>sumir</b>: ele para de falar de forma <b>abrupta</b>, fica em silêncio alguns segundos e, ao retomar, segue por outro assunto, sem lembrar onde havia parado. Não estava falando devagar — houve uma <b>interrupção súbita</b>.`,
      fronteira: `<b>Como diferenciar:</b> <b>interrupção súbita</b> e involuntária do curso, com retomada noutro ponto → <b>bloqueio do pensamento</b>. A <b>lentificação</b> (bradipsiquismo) é o pensamento globalmente mais <i>lento</i>, sem a parada abrupta. O <b>mutismo</b> é a ausência de fala, não uma interrupção do fluxo do pensar.`
    },
    {
      id: 8, grupo_eem: "Memória (§5)", correta: "evocacao",
      roteiro: R + "05-memoria.html",
      opcoes: [
        { chave: "evocacao", label: "Déficit de evocação (recuperação)" },
        { chave: "retencao", label: "Déficit de retenção (armazenamento)" },
        { chave: "remota",   label: "Déficit de memória remota" }
      ],
      vinheta: `Um paciente repete três palavras na hora. Minutos depois, não as diz espontaneamente — mas, quando o examinador oferece uma <b>pista</b> ("era um meio de transporte…"), ele recupera: <i>"Ah, carro!"</i>. O traço <b>estava lá</b>; faltava o acesso.`,
      fronteira: `<b>Como diferenciar:</b> a <b>pista resgata</b> a lembrança → o material foi armazenado, o que falha é o <i>acesso</i>: <b>déficit de evocação</b> (recuperação), padrão mais subcortical. Se a pista <b>não</b> ajudasse, o material não teria sido retido — <b>déficit de retenção</b> (armazenamento), o caso da Ana na Rodada 1. A <b>memória remota</b> é a do passado consolidado, aqui preservada.`
    }
  ];

  global.FRONTEIRAS_DATA = { ITENS: ITENS, NOTA_REVELACAO: NOTA_REVELACAO };
})(window);
