/* =============================================================================
   HELPER SUPABASE — atividades do Continuum
   Vanilla JS, sem dependências, sem CDN. Fala direto com a REST API (PostgREST).
   Carregado tanto pela atividade do aluno quanto pelo painel do professor;
   centralizar o fetch aqui evita duplicar URL/headers nos dois lugares.

   Depende de window.SUPABASE_CONFIG (ver supabase-config.js), carregado ANTES.
   Usa SOMENTE a chave anon/publishable (pública). A proteção do banco vem do
   RLS (ver ../../supabase/setup.sql), não do segredo da chave.
   Expõe a API em window.SB.
   ============================================================================= */
(function (global) {
  "use strict";

  var cfg = global.SUPABASE_CONFIG || {};

  /* Placeholders deixados no supabase-config.js antes de preencher os valores
     reais. Se a config ainda estiver nesse estado, o backend está "desligado"
     e quem chama deve cair no modo offline. */
  var PLACEHOLDERS = [
    "", undefined, null,
    "https://SEU-PROJETO.supabase.co",
    "COLE_AQUI_A_URL",
    "COLE_AQUI_A_ANON_KEY"
  ];

  function ehPlaceholder(v) {
    return PLACEHOLDERS.indexOf(v) !== -1;
  }

  function configValida() {
    return !ehPlaceholder(cfg.url) &&
           !ehPlaceholder(cfg.anonKey) &&
           !!cfg.table;
  }

  /* Token de usuário autenticado (login do painel, ver painel-auth.js). Quando
     definido, é usado como Bearer nas LEITURAS (consultarSessao) — para o RLS
     reconhecer o professor. Os envios dos alunos seguem na chave anon. */
  var authToken = null;
  function setAuthToken(t) { authToken = t || null; }
  function getAuthToken() { return authToken; }

  /* Cabeçalhos comuns. apikey é SEMPRE a chave anon (publishable); o Bearer pode
     ser sobrescrito pelo token de usuário (bearer) — senão, também é a anon. */
  function headers(extra, bearer) {
    var h = {
      "apikey": cfg.anonKey,
      "Authorization": "Bearer " + (bearer || cfg.anonKey)
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
      }
    }
    return h;
  }

  function endpoint() {
    return cfg.url + "/rest/v1/" + cfg.table;
  }

  /* Envia o resultado de um grupo via a RPC enviar_resposta (SECURITY DEFINER no
     banco — ver setup.sql). A função faz o UPSERT por (sessao, atividade, grupo)
     IGNORANDO o RLS, então o aluno (anônimo) ESCREVE sem precisar poder LER a
     tabela: a leitura das respostas é exclusiva do professor logado. Isso resolve
     a colisão do upsert direto, que exigia SELECT anônimo (= dados públicos).
     payload: { sessao, atividade, grupo, pontuacao, dados }. Bearer = chave anon.
     O envio é incremental (estado CUMULATIVO a cada passo). Retorna {ok:true} ou
     {ok:false, erro}. Nunca lança: quem chama trata o ok=false como "salvou só local". */
  async function enviarResultado(payload) {
    if (!configValida()) {
      return { ok: false, erro: "config-invalida" };
    }
    try {
      var resp = await fetch(cfg.url + "/rest/v1/rpc/enviar_resposta", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          p_sessao: payload.sessao,
          p_atividade: payload.atividade,
          p_grupo: payload.grupo,
          p_pontuacao: (payload.pontuacao == null ? null : payload.pontuacao),
          p_dados: payload.dados
        })
      });
      if (!resp.ok) {
        var texto = await resp.text().catch(function () { return ""; });
        return { ok: false, erro: "HTTP " + resp.status + " " + texto };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: String(e) };
    }
  }

  /* Lê as respostas de uma (sessao, atividade) — SELECT filtrando por AMBOS,
     ordenadas por criação. Retorna um array (vazio em caso de erro — o painel
     mostra "sem dados" em vez de quebrar). */
  async function consultarSessao(sessao, atividade) {
    if (!configValida()) return [];
    try {
      var qs = "?sessao=eq." + encodeURIComponent(sessao) +
               "&atividade=eq." + encodeURIComponent(atividade) +
               "&select=grupo,pontuacao,dados,criado_em" +
               "&order=criado_em.asc";
      var resp = await fetch(endpoint() + qs, {
        method: "GET",
        headers: headers(null, authToken) // leitura autenticada (token do professor)
      });
      if (!resp.ok) return [];
      var dados = await resp.json();
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }

  /* Lê TODAS as linhas de uma sessão — sem filtrar `atividade` — para o agregador
     acumulado do painel (SPEC §7). Inclui a coluna `atividade` (o agregador
     precisa saber a que etapa cada linha pertence). Leitura autenticada (token do
     professor; a policy owner_select já permite). Sem mudança de backend. Retorna
     um array (vazio em erro). */
  async function consultarSessaoTudo(sessao) {
    if (!configValida()) return [];
    try {
      var qs = "?sessao=eq." + encodeURIComponent(sessao) +
               "&select=grupo,atividade,pontuacao,dados,criado_em" +
               "&order=criado_em.asc";
      var resp = await fetch(endpoint() + qs, {
        method: "GET",
        headers: headers(null, authToken)
      });
      if (!resp.ok) return [];
      var dados = await resp.json();
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }

  /* PONTEIRO DE SESSÃO (modo aula lockstep). lerEstado: SELECT anônimo na
     sessao_estado (policy anon_select_estado) — os alunos acompanham. Retorna
     {item, fase, epoca} ou null. */
  async function lerEstado(sessao, atividade) {
    if (!configValida()) return null;
    try {
      var qs = "?sessao=eq." + encodeURIComponent(sessao) +
               "&atividade=eq." + encodeURIComponent(atividade) +
               "&select=item_atual,fase,epoca&limit=1";
      var resp = await fetch(cfg.url + "/rest/v1/sessao_estado" + qs, {
        method: "GET", headers: headers(null, authToken)
      });
      if (!resp.ok) return null;
      var rows = await resp.json();
      if (!Array.isArray(rows) || !rows.length) return null;
      var r = rows[0];
      return { item: r.item_atual, fase: r.fase, epoca: r.epoca };
    } catch (e) { return null; }
  }

  /* definirEstado: grava o ponteiro via RPC definir_estado (SECURITY DEFINER).
     Retorna {ok}. Nunca lança. */
  async function definirEstado(sessao, atividade, item, fase, epoca) {
    if (!configValida()) return { ok: false, erro: "config-invalida" };
    try {
      var resp = await fetch(cfg.url + "/rest/v1/rpc/definir_estado", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json" }, authToken),
        body: JSON.stringify({
          p_sessao: sessao, p_atividade: atividade,
          p_item: (item == null ? 0 : item), p_fase: fase,
          p_epoca: (epoca == null ? 0 : epoca)
        })
      });
      if (!resp.ok) { var t = await resp.text().catch(function () { return ""; }); return { ok: false, erro: "HTTP " + resp.status + " " + t }; }
      return { ok: true };
    } catch (e) { return { ok: false, erro: String(e) }; }
  }

  global.SB = {
    configValida: configValida,
    enviarResultado: enviarResultado,
    consultarSessao: consultarSessao,
    consultarSessaoTudo: consultarSessaoTudo,
    lerEstado: lerEstado,
    definirEstado: definirEstado,
    setAuthToken: setAuthToken,
    getAuthToken: getAuthToken
  };
})(window);
