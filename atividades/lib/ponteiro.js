/* =============================================================================
   PONTEIRO DE SESSÃO — sincronização lockstep (modo aula, Peer Instruction)
   O professor controla em que QUESTÃO e em que FASE a turma está; os aparelhos
   dos alunos "escutam" e andam juntos. Estado = { item: índice 0-based, fase }.

   Fases por questão (avançam na ordem; ver FASES):
     responder → divisao → revotar → gabarito → (próxima questão: responder)
     ... após a última questão: fase "fim".

   Backend DUPLO (escolhido automaticamente):
     • Supabase  → real, entre dispositivos (quando a config estiver preenchida).
     • Local     → BroadcastChannel + localStorage, MESMA máquina/navegador.
       Serve para desenvolver/testar o fluxo (painel numa aba, grupos em outras)
       sem depender do backend. Não sincroniza entre dispositivos diferentes.

   API:
     PONTEIRO.FASES                          → ["responder","divisao","revotar","gabarito"]
     PONTEIRO.proxima(estado, totalItens)    → próximo estado (avança fase/item/fim)
     PONTEIRO.observar(sessao, atividade, cb)→ assina; cb(estado|null) a cada mudança;
                                               retorna função de cancelamento.
     PONTEIRO.definir(sessao, atividade, estado) → (professor) grava o estado.
   Sem framework, sem CDN. Expõe window.PONTEIRO.
   ============================================================================= */
(function (global) {
  "use strict";

  var FASES = ["responder", "resultado"];

  /* Próximo estado, dado o total de questões. fase null/"fim" → começo/encerrado.
     A `epoca` (carimbo do início da rodada) é PRESERVADA ao avançar. */
  function proxima(estado, total) {
    var ep = estado ? estado.epoca : undefined;
    if (!estado || estado.fase === "fim") return { item: 0, fase: "responder", epoca: ep };
    var i = FASES.indexOf(estado.fase);
    if (i < 0) return { item: estado.item || 0, fase: "responder", epoca: ep };
    if (i < FASES.length - 1) return { item: estado.item, fase: FASES[i + 1], epoca: ep };
    // estava em "gabarito": vai para a próxima questão (ou "fim")
    if (estado.item + 1 < total) return { item: estado.item + 1, fase: "responder", epoca: ep };
    return { item: estado.item, fase: "fim", epoca: ep };
  }

  function usaSupabase() {
    return !!(global.SB && SB.configValida && SB.configValida() &&
              SB.lerEstado && SB.definirEstado);
  }

  function chaveLocal(s, a) { return "ponteiro:" + s + ":" + a; }

  function igual(a, b) {
    if (!a || !b) return a === b;
    return a.item === b.item && a.fase === b.fase && a.epoca === b.epoca;
  }

  /* ---------------- Backend LOCAL (BroadcastChannel + localStorage) ---------- */
  function observarLocal(sessao, atividade, cb) {
    var key = chaveLocal(sessao, atividade);
    var ultimo; // sentinela undefined: garante 1ª emissão mesmo com estado nulo
    function ler() {
      try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; }
    }
    function emitir() {
      var e = ler();
      if (!igual(e, ultimo)) { ultimo = e; cb(e); }
    }
    var bc = null;
    try { bc = new BroadcastChannel(key); bc.onmessage = emitir; } catch (e) { /* sem BC: usa storage */ }
    function onStorage(ev) { if (ev.key === key) emitir(); }
    global.addEventListener("storage", onStorage);
    // Poll de SEGURANÇA: relê o localStorage periodicamente. localStorage é
    // compartilhado entre abas do mesmo navegador, então isto sincroniza mesmo
    // que os eventos (BroadcastChannel/storage) não cheguem por algum motivo.
    var timer = setInterval(emitir, 800);
    emitir(); // estado inicial (para quem entra atrasado)
    return function cancelar() {
      try { if (bc) bc.close(); } catch (e) {}
      global.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }
  function definirLocal(sessao, atividade, estado) {
    var key = chaveLocal(sessao, atividade);
    try { localStorage.setItem(key, JSON.stringify(estado)); } catch (e) {}
    try { var bc = new BroadcastChannel(key); bc.postMessage(estado); bc.close(); } catch (e) {}
    return Promise.resolve({ ok: true });
  }

  /* ---------------- Backend SUPABASE (polling) ------------------------------- */
  function observarSupabase(sessao, atividade, cb) {
    var ultimo, parado = false; // sentinela undefined (idem observarLocal)
    function tick() {
      if (parado) return;
      SB.lerEstado(sessao, atividade).then(function (e) {
        if (!igual(e, ultimo)) { ultimo = e; cb(e); }
      }).catch(function () {}).finally(function () {
        if (!parado) timer = setTimeout(tick, 1500);
      });
    }
    var timer = setTimeout(tick, 0);
    return function cancelar() { parado = true; clearTimeout(timer); };
  }
  function definirSupabase(sessao, atividade, estado) {
    return SB.definirEstado(sessao, atividade, estado.item, estado.fase, estado.epoca);
  }

  /* ---------------- Backend SUPABASE REALTIME (WebSocket, push) -------------- */
  /* Cliente Phoenix MÍNIMO (na unha, sem supabase-js): assina postgres_changes
     da tabela sessao_estado filtrada pela sessão → updates INSTANTÂNEOS. Mantém
     um POLL DE SEGURANÇA de 1,5s: se o WS cair ou o Realtime não estiver
     habilitado, continua funcionando (igual ao polling de antes). Os dois chamam
     emitir(), que deduplica — então nunca dispara duas vezes nem regride. */
  function observarRealtime(sessao, atividade, cb) {
    var cfg = global.SUPABASE_CONFIG || {};
    var ultimo, parado = false, ws = null, hb = null, reconnectT = null;
    /* Ordem de progressão dentro de uma época — para não REGREDIR a fase por um
       poll atrasado que leu o estado antigo depois de o WS já ter emitido o novo. */
    function ordem(e) { if (!e) return -1; if (e.fase === "fim") return 1e9; var fi = FASES.indexOf(e.fase); return (e.item || 0) * FASES.length + (fi < 0 ? 0 : fi); }
    function emitir(e) {
      if (igual(e, ultimo)) return;
      if (ultimo && e && ultimo.epoca === e.epoca && ordem(e) < ordem(ultimo)) return;   // mesma época: nunca regride
      ultimo = e; cb(e);
    }
    function buscar() { if (parado) return; SB.lerEstado(sessao, atividade).then(emitir).catch(function () {}); }
    buscar();                                  // estado inicial imediato
    var pollT = setInterval(buscar, 1500);     // rede de segurança
    function conectar() {
      if (parado) return;
      var url = cfg.url.replace(/^http/, "ws") + "/realtime/v1/websocket?apikey=" +
                encodeURIComponent(cfg.anonKey) + "&vsn=1.0.0";
      try { ws = new WebSocket(url); } catch (e) { return; }
      var ref = 0;
      ws.onopen = function () {
        ws.send(JSON.stringify({
          topic: "realtime:pt:" + sessao + ":" + atividade, event: "phx_join",
          payload: { config: { postgres_changes: [ { event: "*", schema: "public", table: "sessao_estado", filter: "sessao=eq." + sessao } ] } },
          ref: String(++ref)
        }));
        hb = setInterval(function () { try { ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++ref) })); } catch (e) {} }, 25000);
      };
      ws.onmessage = function (ev) {
        try {
          var m = JSON.parse(ev.data);
          if (m.event === "postgres_changes" && m.payload && m.payload.data) {
            var rec = m.payload.data.record;
            if (rec && rec.atividade === atividade) emitir({ item: rec.item_atual, fase: rec.fase, epoca: rec.epoca });
          }
        } catch (e) {}
      };
      ws.onclose = function () {
        if (hb) { clearInterval(hb); hb = null; }
        if (!parado) reconnectT = setTimeout(conectar, 3000);
      };
    }
    conectar();
    return function cancelar() {
      parado = true; clearInterval(pollT);
      if (hb) clearInterval(hb);
      if (reconnectT) clearTimeout(reconnectT);
      try { if (ws) ws.close(); } catch (e) {}
    };
  }

  /* Leitura ÚNICA do estado atual (sem assinar). Usada pelo painel ao (re)carregar
     para retomar a rodada em curso em vez de voltar ao lobby. Promise<estado|null>. */
  function lerLocalUnico(sessao, atividade) {
    try { return Promise.resolve(JSON.parse(localStorage.getItem(chaveLocal(sessao, atividade)) || "null")); }
    catch (e) { return Promise.resolve(null); }
  }

  global.PONTEIRO = {
    FASES: FASES,
    proxima: proxima,
    observar: function (s, a, cb) {
      return usaSupabase() ? observarRealtime(s, a, cb) : observarLocal(s, a, cb);
    },
    definir: function (s, a, estado) {
      return usaSupabase() ? definirSupabase(s, a, estado) : definirLocal(s, a, estado);
    },
    ler: function (s, a) {
      return usaSupabase() ? SB.lerEstado(s, a) : lerLocalUnico(s, a);
    },
    modo: function () { return usaSupabase() ? "supabase" : "local"; }
  };
})(window);
