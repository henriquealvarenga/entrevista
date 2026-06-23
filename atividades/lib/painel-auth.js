/* =============================================================================
   AUTENTICAÇÃO DO PAINEL — login por email (magic link), via Supabase Auth/GoTrue
   REST puro, sem SDK, sem CDN. Protege a tela do professor: só quem entra com o
   email autorizado lê as respostas (a proteção REAL é o RLS do banco — ver
   supabase/setup.sql; aqui é o fluxo de login + uso do token nas leituras).

   Fluxo: o professor digita o email → POST /auth/v1/otp envia um link mágico →
   ao clicar, o navegador volta ao painel com os tokens no #hash → guardamos a
   sessão (localStorage), passamos o access_token ao SB (Bearer das leituras) e
   liberamos o painel. O token é renovado automaticamente antes de expirar.

   Depende de window.SUPABASE_CONFIG (url, anonKey) e de window.SB.setAuthToken.
   Expõe window.PAINEL_AUTH.proteger(onReady): chama onReady() só quando autenticado.
   ============================================================================= */
(function (global) {
  "use strict";

  var cfg = global.SUPABASE_CONFIG || {};
  var AUTH = (cfg.url || "") + "/auth/v1";
  var STORE = "painel-auth";
  var refreshTimer = null;

  function $(id){ return document.getElementById(id); }

  function lerSessao(){ try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch(e){ return null; } }
  function salvarSessao(s){ try { localStorage.setItem(STORE, JSON.stringify(s)); } catch(e){} }
  function limparSessao(){ try { localStorage.removeItem(STORE); } catch(e){} }

  /* Decodifica o payload do JWT (base64url) → { email, exp, ... }. */
  function decodeJwt(token){
    try {
      var b = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      b += "===".slice((b.length + 3) % 4);
      return JSON.parse(decodeURIComponent(escape(atob(b))));
    } catch(e){ return null; }
  }
  function sessaoDeTokens(access, refresh){
    var jwt = decodeJwt(access) || {};
    return { access_token: access, refresh_token: refresh || "", email: jwt.email || "", exp: jwt.exp ? jwt.exp * 1000 : 0 };
  }
  /* Válida com 30s de margem para não usar um token quase expirado. */
  function valida(s){ return !!(s && s.access_token && s.exp && s.exp > Date.now() + 30000); }

  /* Captura tokens do magic link (#access_token=…&refresh_token=…) e limpa o hash. */
  function capturarRedirect(){
    if (!location.hash || location.hash.indexOf("access_token=") === -1) return null;
    var p = new URLSearchParams(location.hash.slice(1));
    var access = p.get("access_token"), refresh = p.get("refresh_token");
    history.replaceState(null, "", location.pathname + location.search); // não deixa tokens na URL
    if (!access) return null;
    var s = sessaoDeTokens(access, refresh);
    salvarSessao(s);
    return s;
  }

  async function enviarLink(email){
    var redirect = location.origin + location.pathname; // precisa estar nas Redirect URLs do Supabase
    try {
      var resp = await fetch(AUTH + "/otp?redirect_to=" + encodeURIComponent(redirect), {
        method: "POST",
        headers: { "apikey": cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, create_user: true })
      });
      return resp.ok;
    } catch(e){ return false; }
  }

  async function refrescar(s){
    try {
      var resp = await fetch(AUTH + "/token?grant_type=refresh_token", {
        method: "POST",
        headers: { "apikey": cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      });
      if (!resp.ok) return null;
      var d = await resp.json();
      var ns = sessaoDeTokens(d.access_token, d.refresh_token);
      salvarSessao(ns);
      return ns;
    } catch(e){ return null; }
  }

  function agendarRefresh(s, aoFalhar){
    if (refreshTimer) clearTimeout(refreshTimer);
    var ms = Math.max(10000, s.exp - Date.now() - 60000); // renova 1 min antes de expirar
    refreshTimer = setTimeout(async function(){
      var ns = await refrescar(s);
      if (ns){ SB.setAuthToken(ns.access_token); agendarRefresh(ns, aoFalhar); }
      else { aoFalhar(); }
    }, ms);
  }

  function mostrarGate(onReady){
    $("painelMain").hidden = true;
    $("authGate").hidden = false;
    var msg = $("authMsg");
    $("authSendBtn").onclick = async function(){
      var email = ($("authEmail").value || "").trim();
      if (!email){ msg.textContent = "Digite seu email."; return; }
      $("authSendBtn").disabled = true;
      msg.textContent = "Enviando…";
      var ok = await enviarLink(email);
      $("authSendBtn").disabled = false;
      msg.textContent = ok
        ? "Link enviado para " + email + ". Abra o email e clique no link para entrar (verifique o spam)."
        : "Não foi possível enviar o link agora. Confira o email e tente de novo.";
    };
  }

  function ativar(s, onReady){
    SB.setAuthToken(s.access_token);
    $("authGate").hidden = true;
    $("painelMain").hidden = false;
    var who = $("authWho"); if (who) who.textContent = s.email || "";
    var sair = $("authSair");
    if (sair) sair.onclick = function(){
      if (refreshTimer) clearTimeout(refreshTimer);
      limparSessao(); SB.setAuthToken(null);
      location.reload();
    };
    agendarRefresh(s, function(){ limparSessao(); SB.setAuthToken(null); mostrarGate(onReady); });
    onReady();
  }

  /* Portão: libera onReady() só com sessão válida; senão mostra o login. */
  function proteger(onReady){
    var s = capturarRedirect() || lerSessao();
    if (valida(s)) { ativar(s, onReady); return; }
    if (s && s.refresh_token) {           // expirou mas pode renovar em silêncio
      refrescar(s).then(function(ns){
        if (ns && valida(ns)) ativar(ns, onReady);
        else mostrarGate(onReady);
      });
      return;
    }
    mostrarGate(onReady);
  }

  global.PAINEL_AUTH = { proteger: proteger };
})(window);
