/* =============================================================================
   BANCO DE ITENS — Rodada 1 (Nomear o fenômeno)
   Orientado a dados. FONTE ÚNICA: consumido pela atividade do aluno
   (01-nomear.html) e pelo painel do professor (lib/painel-01-nomear.js).

   Cada vinheta é tirada (verbatim ou levemente condensada) dos casos clínicos do
   livro (Maria, João, Ana, Roberto, Ranier). Todo item tem a MESMA forma: 4
   opções, 1 correta. `vinheta` e `fronteira` são HTML confiável (negrito/itálico
   preservados; renderizados via innerHTML). As `opcoes` listam o termo certo
   primeiro por legibilidade; a ORDEM é EMBARALHADA no render. Expõe window.NOMEAR_DATA.
   ============================================================================= */
(function (global) {
  "use strict";

  /* Base do roteiro publicado (Parte II — os 20 itens do EEM). */
  var R = "https://henriquealvarenga.com/entrevista/capitulos/parte-2-roteiro/";

  var NOTA_REVELACAO = "Os termos seguem o roteiro do Exame do Estado Mental; em casos reais, as fronteiras costumam ser mais tênues do que num relato de prova.";

  var ITENS = [
    {
      id: 1, grupo_eem: "Psicomotricidade (§16)", correta: "lentificacao",
      roteiro: R + "16-psicomotricidade.html",
      opcoes: [
        { chave: "lentificacao", label: "Lentificação psicomotora" },
        { chave: "estupor",      label: "Estupor" },
        { chave: "negativismo",  label: "Negativismo" },
        { chave: "catatonia",    label: "Catatonia" }
      ],
      vinheta: `Trazida para consulta com o médico de família no posto de saúde, uma paciente entra na sala lentamente, ombros caídos. Durante toda a entrevista <b>movimenta-se muito pouco</b>, com expressão facial mínima, e responde com voz baixa, quase inaudível, demorando vários segundos antes de cada fala. Não há rigidez nem tremor — e, estimulada, ela responde; só que tudo nela parece mais <b>devagar</b>.`,
      fronteira: `<b>A fronteira.</b> A redução é <b>global e a paciente permanece responsiva</b> — pensamento, fala e movimento mais lentos: <b>lentificação psicomotora</b> (retardo), típica da depressão. No <b>estupor</b> haveria imobilidade e mutismo, com a ação <i>bloqueada</i> apesar da consciência. O <b>negativismo</b> seria recusa <i>ativa</i> ao que se pede. A <b>catatonia</b> reúne uma síndrome (posturas, flexibilidade cérea, ecos), que aqui não aparece.`
    },
    {
      id: 2, grupo_eem: "Vida afetiva (§11)", correta: "hipotimia",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "hipotimia",   label: "Hipotimia" },
        { chave: "anedonia",    label: "Anedonia" },
        { chave: "embotamento", label: "Embotamento afetivo" },
        { chave: "apatia",      label: "Apatia" }
      ],
      vinheta: `Perguntada como se sente, a paciente demora cerca de vinte segundos e responde, com voz monótona: <i>"Vazia… sem sentido… nada importa mais."</i> Lágrimas escorrem e ela não as enxuga. Descreve um <b>peso constante</b>, um rebaixamento do humor que dura o dia inteiro, há semanas.`,
      fronteira: `<b>A fronteira.</b> O que está rebaixado é o <b>tônus do humor</b> — tristeza vital, vazio, dor moral sustentada: <b>hipotimia</b>. A <b>anedonia</b> é a perda do <i>prazer</i> (vizinha, mas distinta). O <b>embotamento afetivo</b> é o achatamento da <i>expressão e da ressonância</i>, sem a dor — mais próprio da esquizofrenia. A <b>apatia</b> é a indiferença, falta de tônus afetivo, sem o sofrimento que aqui é evidente.`
    },
    {
      id: 3, grupo_eem: "Vida afetiva (§11) · Volição (§12)", correta: "anedonia",
      roteiro: R + "11-vida-afetiva.html",
      opcoes: [
        { chave: "anedonia",  label: "Anedonia" },
        { chave: "abulia",    label: "Abulia" },
        { chave: "hipotimia", label: "Hipotimia" },
        { chave: "apatia",    label: "Apatia" }
      ],
      vinheta: `A paciente conta que, nos últimos meses, perdeu o interesse por tudo de que gostava — cozinhar, as séries, sair com as amigas. <i>"Nada me dá prazer mais."</i> Não é que não consiga <b>começar</b> as atividades: quando as faz, simplesmente <b>não sente mais o prazer</b> que sentia.`,
      fronteira: `<b>A fronteira.</b> A perda é especificamente a da <b>capacidade de sentir prazer</b> no que antes o dava: <b>anedonia</b>. Não é <b>abulia</b> — a <i>iniciativa</i> para agir não é o problema (ela faz; só não frui). Não é a tristeza em si (<b>hipotimia</b>), embora costumem andar juntas. Nem <b>apatia</b>, que é a indiferença afetiva ampla.`
    },
    {
      id: 4, grupo_eem: "Pensamento — curso (§7)", correta: "fuga",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "fuga",        label: "Fuga de ideias" },
        { chave: "desagregacao", label: "Desagregação" },
        { chave: "prolixidade", label: "Prolixidade" },
        { chave: "bloqueio",    label: "Bloqueio do pensamento" }
      ],
      vinheta: `<i>"Eu vou abrir três empresas — não, quatro! — uma de tecnologia, outra de moda, uma de culinária e… ah sim! Uma gravadora, porque eu componho agora. Aliás, o senhor gosta de música?"</i> Ele <b>salta de um assunto a outro</b> sem concluir nenhum; as conexões existem (uma palavra puxa a seguinte), mas o alvo se perde a cada frase.`,
      fronteira: `<b>A fronteira.</b> O curso está <b>acelerado</b> e as associações se dão por contiguidade ou assonância — ainda <i>rastreáveis</i>, mas o objetivo se perde: <b>fuga de ideias</b> (típica da mania). Na <b>desagregação</b> as conexões lógicas se <i>rompem</i> (incompreensível), não apenas se aceleram. A <b>prolixidade</b> é lenta e cheia de detalhes, <i>sem</i> perder o alvo. O <b>bloqueio</b> é a interrupção súbita do fluxo.`
    },
    {
      id: 5, grupo_eem: "Pensamento — conteúdo (§7)", correta: "grandeza",
      roteiro: R + "07-pensamento.html",
      opcoes: [
        { chave: "grandeza",     label: "Ideia de grandeza (grandiosidade)" },
        { chave: "autoestima",   label: "Autoestima elevada" },
        { chave: "mistico",      label: "Delírio místico" },
        { chave: "sobrevalorada", label: "Ideia sobrevalorada" }
      ],
      vinheta: `Sorrindo, ele se aproxima e baixa a voz: <i>"Descobri que tenho um propósito especial, uma missão. Vou mudar o mundo. Tenho conexões especiais — o universo se comunica comigo."</i> Gastou quinze mil reais em equipamento em três dias, <b>certo de que ganhará milhões</b>, e não admite qualquer limite às próprias capacidades.`,
      fronteira: `<b>A fronteira.</b> O conteúdo é a <b>superestimação de si</b> — poderes, missão, riqueza iminente: <b>ideia de grandeza / grandiosidade</b>, aqui em intensidade delirante. Difere da <b>autoestima elevada</b> (normal, proporcional). O <b>delírio místico</b> tem por eixo o religioso/sobrenatural — presente como <i>tema</i>, mas o núcleo é a grandeza do eu. A <b>ideia sobrevalorada</b> seria compreensível e menos expansiva.`
    },
    {
      id: 6, grupo_eem: "Sensopercepção (§6)", correta: "aluc_visual",
      roteiro: R + "06-sensopercepcao.html",
      opcoes: [
        { chave: "aluc_visual", label: "Alucinação visual" },
        { chave: "ilusao",      label: "Ilusão" },
        { chave: "alucinose",   label: "Alucinose" },
        { chave: "eidetica",    label: "Imagem eidética" }
      ],
      vinheta: `Durante a entrevista, a paciente olha fixamente para o canto da sala e aponta: <i>"Você está vendo aquela mulher ali? De vestido branco… ela fica me olhando."</i> Não há ninguém no canto, nem objeto que pudesse ser confundido com uma figura. Ela percebe a mulher com a <b>mesma nitidez de uma pessoa real</b> e a toma como real.`,
      fronteira: `<b>A fronteira.</b> É uma <b>percepção sem objeto</b>, projetada no <i>espaço externo</i> e vivida como real — <b>sem que ela perceba tratar-se de algo irreal</b>: <b>alucinação visual</b>. A <b>ilusão</b> exigiria um objeto real <i>deformado</i> (não há). Na <b>alucinose</b> também há percepção sem objeto, mas a pessoa <i>reconhece que não é real</i> (crítica preservada, frequente em quadros orgânicos) — não é o caso. A <b>imagem eidética</b> é representação voluntária, reconhecida como interna.`
    },
    {
      id: 7, grupo_eem: "Orientação (§4)", correta: "desor_temporal",
      roteiro: R + "04-orientacao.html",
      opcoes: [
        { chave: "desor_temporal",  label: "Desorientação temporal" },
        { chave: "desor_identidade", label: "Desorientação quanto à própria identidade" },
        { chave: "confabulacao",    label: "Confabulação" },
        { chave: "amnesia",         label: "Amnésia" }
      ],
      vinheta: `Perguntada sobre a data, a paciente hesita: <i>"É… setembro? Ou outubro?"</i> — estamos em junho. Sobre onde está: <i>"No… hospital? Acho que é um hospital."</i> <b>Sabe o próprio nome e a idade</b>, mas não situa o momento no tempo.`,
      fronteira: `<b>A fronteira.</b> Falha em <b>situar-se no tempo</b> (data, mês), com a <i>identidade preservada</i>: <b>desorientação temporal</b>. Não é <b>desorientação quanto à própria identidade</b> — ela sabe <i>quem é</i> (nome, idade). A <b>confabulação</b> preencheria a lacuna com um relato inventado e convicto, o que ela não faz (admite não saber). A <b>amnésia</b> é perda de memória, não da localização no tempo.`
    },
    {
      id: 8, grupo_eem: "Memória (§5)", correta: "recente",
      roteiro: R + "05-memoria.html",
      opcoes: [
        { chave: "recente",      label: "Déficit de memória recente" },
        { chave: "imediata",     label: "Déficit de memória imediata" },
        { chave: "remota",       label: "Déficit de memória remota" },
        { chave: "confabulacao", label: "Confabulação" }
      ],
      vinheta: `Pede-se à paciente que repita três palavras — gato, mesa, flor. Ela as <b>repete imediatamente, sem erro</b>. Dois minutos depois, perguntada de novo, <b>não recupera nenhuma</b>: <i>"Não me lembro… havia palavras?"</i>`,
      fronteira: `<b>A fronteira.</b> Ela <b>registra na hora</b> (repete sem erro — memória imediata preservada) e <b>mantém o passado</b> (nome, idade — memória remota intacta); o que falha é <b>reter, após um intervalo, o que acabou de aprender</b>: <b>déficit de memória recente</b>. Não é déficit de <b>memória imediata</b> (ela repete na hora), nem de <b>memória remota</b> (lembra dados antigos de si). A <b>confabulação</b> preencheria o vazio com um relato inventado — ela apenas não recupera.`
    },
    {
      id: 9, grupo_eem: "Psicomotricidade (§16)", correta: "parkinsonismo",
      roteiro: R + "16-psicomotricidade.html",
      opcoes: [
        { chave: "parkinsonismo", label: "Parkinsonismo (síndrome parkinsoniana)" },
        { chave: "discinesia",    label: "Discinesia tardia" },
        { chave: "catatonia",     label: "Catatonia" },
        { chave: "lentificacao",  label: "Lentificação psicomotora" }
      ],
      vinheta: `Um paciente de 55 anos tem a face <b>pouco expressiva, quase fixa</b>, dando aparência de "máscara". Nota-se um <b>tremor das mãos em repouso</b> e a voz é monótona, com a fala um pouco arrastada. Ao se levantar, caminha em <b>passos curtos e arrastados</b>.`,
      fronteira: `<b>A fronteira.</b> O conjunto — face em máscara (hipomimia), <b>tremor de repouso</b>, fala monótona e <b>marcha em pequenos passos</b> — forma a <b>síndrome parkinsoniana</b> (bradicinesia + tremor de repouso + rigidez). É um quadro <i>motor descritivo</i>, ainda sem afirmar a causa. Não é <b>discinesia tardia</b> (movimentos involuntários hipercinéticos, coreicos — o oposto da hipocinesia). Não é <b>catatonia</b> (posturas mantidas, flexibilidade cérea, negativismo). Nem <b>lentificação psicomotora</b> (lentidão global ligada ao humor, sem tremor de repouso nem marcha parkinsoniana). <i>Qual a causa</i> — Parkinson, medicamento… — é pergunta de diagnóstico, não de fenomenologia.`
    },
    {
      id: 10, grupo_eem: "Consciência do eu (§14)", correta: "leitura",
      roteiro: R + "14-consciencia-do-eu.html",
      opcoes: [
        { chave: "leitura",      label: "Vivência de leitura do pensamento" },
        { chave: "referencia",   label: "Ideia de referência" },
        { chave: "persecutorio", label: "Delírio persecutório" },
        { chave: "aluc_auditiva", label: "Alucinação auditiva" }
      ],
      vinheta: `Internado, o paciente tem a <b>certeza de que todos à sua volta conhecem o que ele pensa</b>. Sente que seus pensamentos são vigiados e que, quando pensa em algo, os outros reagem — tossem de propósito, fazem gestos. Não é que <i>deduzam</i> pela sua expressão: ele vivencia o próprio <b>pensar como acessível aos outros</b>.`,
      fronteira: `<b>A fronteira.</b> O <b>limite do eu</b> está rompido: o pensamento deixa de ser privado e é vivido como acessível a outros — <b>vivência de leitura/transmissão do pensamento</b> (sintoma de primeira ordem, da consciência do eu). A <b>ideia de referência</b> atribui a si fatos externos (olhares, gestos), mas <i>preserva</i> a privacidade do pensar. O <b>delírio persecutório</b> é o <i>tema</i> (querem prejudicá-lo), não a quebra do limite do eu. E não há voz percebida (<b>alucinação</b>).`
    }
  ];

  global.NOMEAR_DATA = { ITENS: ITENS, NOTA_REVELACAO: NOTA_REVELACAO };
})(window);
