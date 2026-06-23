/* =============================================================================
   IDENTIDADE ÚNICA DA AULA (SPEC §3) — fim do re-login por atividade
   Vanilla JS, sem dependências, sem CDN. Uma só chave de localStorage,
   compartilhada por TODAS as atividades: o hub (index.html) grava uma vez; cada
   atividade lê no boot e nunca repergunta código/grupo.

   chave "aula:identidade":
     { modo:"aula",   sessao:"JTU96", grupo:"Grupo 3" }   // com código → campeonato
     { modo:"treino" }                                    // sem código → livre

   Em treino nada é enviado ao Supabase, mas o localStorage por-atividade ainda
   precisa de uma chave para retomar: usamos o par fixo local "_treino".

   Progresso do campeonato (quais etapas o grupo concluiu) vive em
   "aula:progresso:<sessao>:<grupo>" — a atividade marca ao chegar na síntese; o
   hub lê para desenhar o mapa (✓ feita / ▶ atual / 🔒 bloqueada).

   Expõe window.AULA.
   ============================================================================= */
(function (global) {
  "use strict";

  var KEY_ID = "aula:identidade";
  function progKey(s, g) { return "aula:progresso:" + s + ":" + g; }

  function ler() {
    try { return JSON.parse(localStorage.getItem(KEY_ID) || "null"); }
    catch (e) { return null; }
  }
  function gravar(obj) {
    try { localStorage.setItem(KEY_ID, JSON.stringify(obj)); } catch (e) { /* storage indisponível */ }
  }
  function limpar() {
    try { localStorage.removeItem(KEY_ID); } catch (e) { /* idem */ }
  }

  /* Contexto de execução de uma atividade: normaliza a identidade num par
     (sessao, grupo) sempre presente — mesmo em treino, onde é local e fixo.
     Devolve null se a identidade estiver ausente ou corrompida (órfã). */
  function contexto() {
    var id = ler();
    if (!id) return null;
    if (id.modo === "treino") return { modo: "treino", sessao: "_treino", grupo: "_treino" };
    if (id.modo === "aula" && id.sessao && id.grupo)
      return { modo: "aula", sessao: id.sessao, grupo: id.grupo };
    return null;
  }

  /* Boot guard das atividades (SPEC §3): devolve o contexto OU manda de volta
     ao hub e devolve null. A atividade só prossegue se receber um contexto. */
  function exigir() {
    var ctx = contexto();
    if (!ctx) { location.replace("index.html"); return null; }
    return ctx;
  }

  /* ---- Progresso do campeonato (só usado no modo aula) ---- */
  function concluidas(s, g) {
    try {
      var a = JSON.parse(localStorage.getItem(progKey(s, g)) || "[]");
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function marcarConcluida(s, g, atividadeId) {
    var a = concluidas(s, g);
    if (a.indexOf(atividadeId) === -1) {
      a.push(atividadeId);
      try { localStorage.setItem(progKey(s, g), JSON.stringify(a)); } catch (e) { /* idem */ }
    }
  }

  global.AULA = {
    ler: ler,
    gravar: gravar,
    limpar: limpar,
    contexto: contexto,
    exigir: exigir,
    concluidas: concluidas,
    marcarConcluida: marcarConcluida
  };
})(window);
