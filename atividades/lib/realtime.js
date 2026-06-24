/* =============================================================================
   REALTIME GENÉRICO — assina postgres_changes de UMA tabela filtrada por sessão.
   Cliente Phoenix WebSocket MÍNIMO (na unha, sem supabase-js), irmão do que o
   ponteiro.js já usa para `sessao_estado`. Aqui é genérico: o painel assina a
   tabela `respostas` para receber os votos dos grupos NA HORA, sem esperar o poll.

   NÃO faz poll: quem chama mantém o seu próprio poll de SEGURANÇA (se o WS cair ou
   o Realtime não estiver habilitado, o poll continua atualizando — nunca regride).
   Exige a tabela na publicação `supabase_realtime` (ver supabase/setup.sql §6).

   RLS: o postgres_changes respeita o RLS pela role do JWT. Para tabela SEM leitura
   anônima (ex.: `respostas` em produção), passe `tokenFn` retornando o access_token
   do professor logado — incluído no join como `access_token`, lido FRESCO a cada
   (re)conexão (o reconnect a cada 3s pega o token renovado). Sem token, conecta como
   anon (serve para tabelas com leitura anônima, ou no piloto).

   Uso:
     var cancelar = RT.assinar({ table:"respostas", sessao:"ABCDE", topico:"resp:ABCDE",
                                 tokenFn: SB.getAuthToken, onChange:function(rec){ ... } });
     // ...depois: cancelar();
   Expõe window.RT.
   ============================================================================= */
(function (global) {
  "use strict";

  function assinar(opts) {
    var cfg = global.SUPABASE_CONFIG || {};
    if (!cfg.url || !cfg.anonKey || !opts || !opts.table || !opts.sessao) return function () {};
    var table = opts.table, sessao = opts.sessao,
        onChange = opts.onChange || function () {},
        tokenFn = opts.tokenFn || function () { return null; },
        topico = "realtime:" + (opts.topico || (table + ":" + sessao));
    var parado = false, ws = null, hb = null, reconnectT = null;

    function conectar() {
      if (parado) return;
      var url = cfg.url.replace(/^http/, "ws") + "/realtime/v1/websocket?apikey=" +
                encodeURIComponent(cfg.anonKey) + "&vsn=1.0.0";
      try { ws = new WebSocket(url); } catch (e) { return; }
      var ref = 0, token = null;
      try { token = tokenFn(); } catch (e) {}
      ws.onopen = function () {
        var payload = { config: { postgres_changes: [ { event: "*", schema: "public", table: table, filter: "sessao=eq." + sessao } ] } };
        if (token) payload.access_token = token;   // RLS: assina como o professor logado
        ws.send(JSON.stringify({ topic: topico, event: "phx_join", payload: payload, ref: String(++ref) }));
        hb = setInterval(function () { try { ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++ref) })); } catch (e) {} }, 25000);
      };
      ws.onmessage = function (ev) {
        try {
          var m = JSON.parse(ev.data);
          if (m.event === "postgres_changes" && m.payload && m.payload.data) {
            var d = m.payload.data;
            onChange(d.record || d.old_record || null);
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
      parado = true;
      if (hb) clearInterval(hb);
      if (reconnectT) clearTimeout(reconnectT);
      try { if (ws) ws.close(); } catch (e) {}
    };
  }

  global.RT = { assinar: assinar };
})(window);
