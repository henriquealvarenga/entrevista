/* =============================================================================
   PAINEL DO PROFESSOR — SHELL GENÉRICO (multi-atividade)
   Vanilla JS, sem framework, sem CDN. Tudo que NÃO é específico de uma atividade
   mora aqui: geração/trava do código da aula, seletor de atividades (abas),
   polling, dedup de grupos, paleta de cores, legenda e placar.

   NOVO (SPEC modos-campeonato):
     §6 REVELAR/masking — antes de revelar o painel só mostra o PROGRESSO (quem
        enviou, X/N), sem expor respostas; ao revelar, mostra o gabarito.
     §4 Nº de grupos — o professor define (2–10, default 6), persistido em
        "painel-num-grupos" (o hub lê a mesma chave para oferecer a lista).
     §7/§8 Agregador acumulado + pódio em 2 telas (rodada → geral) com setas de
        movimentação, sons (whoosh/fanfarra) e animação (respeita reduced-motion).

   Cada atividade se auto-registra via window.registrarPainel({...}) (carregado
   DEPOIS deste arquivo). Contrato do módulo:
     { id, label, rota, placar?, maxPontos?, dataGlobal?, render(container, grupos, cores) }
   maxPontos (só nas pontuadas) habilita a normalização /100 do agregador.
   ============================================================================= */
(function (global) {
  "use strict";

  /* Paleta de cores distintas para os grupos (legíveis sobre paper). */
  var PALETA = ["#b45309","#2f6db4","#2f7d4f","#9b2f8f","#b0331f",
                "#1f8f96","#8f6b1f","#5a4fb4","#b42f6b","#4a4a4a"];

  var POLL_MS      = 4000;
  var STORE_KEY    = "painel-sessao";       // código da aula (compartilhado entre atividades)
  var STORE_GRUPOS = "painel-num-grupos";   // nº de grupos (lido também pelo hub)
  var ALFABETO     = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0 O 1 I L
  var CODIGO_LEN   = 5;

  var registry = [];          // módulos registrados (ordem dos <script>)
  var atividadeAtiva = null;  // id da atividade selecionada
  var sessao = "";
  var timer = null;

  /* Estado do REVELAR/pódio. fase: monitor → gabarito → rodada → geral.
     Reinicia em "monitor" ao trocar de atividade (SPEC §6: reset por aba). */
  var fase = "monitor";
  var numGrupos = 6;
  var ultimasRows = [];       // últimas linhas da atividade atual (do polling)
  var ultimasTodas = [];      // últimas linhas de TODAS as atividades (p/ marcar abas)
  var snap = null;            // snapshot do agregador, congelado durante o pódio

  function $(id){ return document.getElementById(id); }
  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }
  function agora(){
    var d = new Date(), p = function(n){ return String(n).padStart(2,"0"); };
    return p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds());
  }
  function reduzMov(){
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch(e){ return false; }
  }

  /* ---- Registry ---- */
  global.registrarPainel = function (mod) {
    if (mod && mod.id) registry.push(mod);
  };
  function moduloAtivo(){
    for (var i=0;i<registry.length;i++) if (registry[i].id === atividadeAtiva) return registry[i];
    return null;
  }
  /* Módulos pontuados (têm maxPontos) — base do agregador. O Júri fica de fora. */
  function pontuados(){ return registry.filter(function(m){ return typeof m.maxPontos === "number"; }); }

  /* ---- CSS específica do shell (monitor + pódio): injetada uma vez ---- */
  function injetarCSS(){
    if (document.getElementById("css-painel-extra")) return;
    var s = document.createElement("style");
    s.id = "css-painel-extra";
    s.textContent =
      /* monitor (antes de revelar) */
      ".monitor{background:var(--paper-content); border:1px solid var(--border-color); border-radius:6px; padding:20px 22px}" +
      ".mon-head{font-size:1.2rem; color:var(--text-secondary); margin-bottom:6px}" +
      ".mon-head b{color:var(--text-primary)}" +
      ".mon-count{font-family:var(--font-mono); font-weight:600; color:var(--brand); font-size:1.3rem; margin-right:8px}" +
      ".mon-hint{font-size:.9rem; color:var(--text-muted); margin-bottom:16px}" +
      ".mon-row{display:flex; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid var(--border-color); font-size:1.05rem}" +
      ".mon-row:last-child{border-bottom:none}" +
      ".mon-dot{width:11px; height:11px; border-radius:50%; background:var(--live, #2f7d4f); flex:0 0 auto}" +
      ".mon-name{flex:1 1 auto; font-weight:600; color:var(--text-primary)}" +
      ".mon-prog{font-family:var(--font-mono); color:var(--text-muted); font-size:.9rem}" +
      /* pódio (rodada + geral) */
      ".podio{background:var(--paper-content); border:1px solid var(--border-color); border-radius:6px; padding:22px 24px; position:relative; overflow:hidden}" +
      ".pod-title{font-family:var(--font-serif); font-size:1.8rem; font-weight:700; color:var(--text-primary); margin:0 0 2px}" +
      ".pod-sub{font-size:.92rem; color:var(--text-muted); margin-bottom:18px}" +
      ".pod-row{display:flex; align-items:center; gap:14px; padding:10px 0; font-size:1.15rem}" +
      ".pod-medal{font-size:1.5rem; width:1.6em; text-align:center; flex:0 0 auto}" +
      ".pod-rank{font-family:var(--font-mono); color:var(--text-muted); font-size:1rem}" +
      ".pod-name{flex:0 0 8.5em; font-weight:600; color:var(--text-primary)}" +
      ".pod-bar-wrap{flex:1 1 auto; height:18px; background:var(--sidebar-bg); border-radius:9px; overflow:hidden}" +
      ".pod-bar{display:block; height:100%; background:var(--brand); border-radius:9px; width:0; transition:width .7s cubic-bezier(.2,.7,.3,1)}" +
      ".pod-pts{font-family:var(--font-mono); font-weight:600; color:var(--brand); min-width:5.2em; text-align:right}" +
      ".pod-et{font-family:var(--font-mono); font-size:.8rem; color:var(--text-muted); min-width:6em; text-align:right}" +
      ".pod-delta{font-family:var(--font-mono); font-size:.85rem; min-width:3.6em; text-align:right}" +
      ".pod-delta.up{color:var(--ok, #2f7d4f); font-weight:600}" +
      ".pod-delta.down{color:#b0331f}" +
      ".pod-delta.same{color:var(--text-muted)}" +
      ".pod-delta.new{color:var(--brand)}" +
      "@media(max-width:640px){ .pod-et,.pod-delta{display:none} .pod-name{flex-basis:6em} }" +
      /* confete */
      ".confete{position:absolute; top:-12px; width:9px; height:14px; border-radius:2px; opacity:.9; animation:cair linear forwards}" +
      "@keyframes cair{to{transform:translateY(420px) rotate(540deg); opacity:0}}" +
      /* aba concluída por TODOS os grupos: fundo verde + ✓ (mesma linguagem do hub).
         A aba ATIVA mantém o destaque laranja (por isso :not(.ativa)); o ✓ fica nas duas. */
      ".aba.concluida:not(.ativa){border-color:var(--live); background:var(--live-soft); color:var(--live)}" +
      ".aba.concluida::after{content:' \\2713'; font-weight:700}";
    document.head.appendChild(s);
  }

  /* ---- Código da sessão (gerado aqui, sem QR) ---- */
  function gerarCodigo(){
    var s = "";
    for (var i=0;i<CODIGO_LEN;i++) s += ALFABETO[Math.floor(Math.random()*ALFABETO.length)];
    return s;
  }
  function sessaoInicial(){
    var url = (new URLSearchParams(location.search).get("sessao") || "").trim().toUpperCase();
    if (url) return url;
    var salvo = (localStorage.getItem(STORE_KEY) || "").trim().toUpperCase();
    if (salvo) return salvo;
    return gerarCodigo();
  }
  function fixarSessao(novo){
    sessao = (novo || "").trim().toUpperCase();
    try { localStorage.setItem(STORE_KEY, sessao); } catch (e) { /* segue na URL */ }
    refletirNaURL();
    $("sessaoInput").value = sessao;
    $("codigoBig").textContent = sessao || "—";
    enterFase("monitor");   // "monitor" já (re)inicia o polling
  }

  /* ---- Nº de grupos (SPEC §4) ---- */
  function numGruposInicial(){
    var v = parseInt(localStorage.getItem(STORE_GRUPOS), 10);
    if (!v || isNaN(v)) v = 6;
    return Math.max(2, Math.min(10, v));
  }
  function fixarNumGrupos(n){
    numGrupos = Math.max(2, Math.min(10, parseInt(n, 10) || 6));
    try { localStorage.setItem(STORE_GRUPOS, String(numGrupos)); } catch (e) { /* idem */ }
    var inp = $("numGruposInput"); if (inp) inp.value = numGrupos;
    if (fase === "monitor") render(ultimasRows);   // atualiza o "X/N" do monitor
    atualizarAbasConcluidas(ultimasTodas);          // e re-marca as abas com o novo N
  }

  /* ---- Atividade ativa ---- */
  function atividadeInicial(){
    var url = (new URLSearchParams(location.search).get("atividade") || "").trim().toLowerCase();
    if (url && registry.some(function(m){ return m.id === url; })) return url;
    return registry.length ? registry[0].id : null;
  }
  function trocaAtividade(id){
    atividadeAtiva = id;
    snap = null;
    refletirNaURL();
    montarAbas();
    atualizarInstrucao();
    enterFase("monitor");   // SPEC §6: trocar de atividade volta a NÃO-revelado (e reinicia o polling)
  }

  function refletirNaURL(){
    var u = new URL(location.href);
    if (sessao) u.searchParams.set("sessao", sessao);
    if (atividadeAtiva) u.searchParams.set("atividade", atividadeAtiva);
    history.replaceState(null, "", u);
  }

  /* ---- Abas ---- */
  function montarAbas(){
    var box = $("abas");
    if (registry.length <= 1){ box.style.display = "none"; box.innerHTML = ""; return; }
    box.style.display = "";
    box.innerHTML = "";
    registry.forEach(function(m){
      var b = document.createElement("button");
      b.className = "aba" + (m.id === atividadeAtiva ? " ativa" : "");
      b.setAttribute("data-atividade", m.id);   // p/ pintar de verde quando concluída
      b.textContent = m.label;
      b.addEventListener("click", function(){ if (m.id !== atividadeAtiva) trocaAtividade(m.id); });
      box.appendChild(b);
    });
  }

  function atualizarInstrucao(){
    var m = moduloAtivo();
    $("instrAtividade").textContent = m ? m.label : "—";
  }

  function setLive(on, texto){
    $("liveTag").classList.toggle("off", !on);
    $("liveText").textContent = texto;
  }

  /* ---- Dedup: fica o mais recente (rows vêm ordenadas por criado_em asc) ---- */
  function porGrupo(rows){
    var m = new Map();
    rows.forEach(function(r){ m.set(r.grupo, r); });
    return Array.from(m.values());
  }
  /* nº de respostas já enviadas por um grupo (genérico: 1º array em dados) */
  function progressoDe(row){
    var d = row.dados || {};
    var a = d.casos || d.itens || d.vereditos || [];
    return Array.isArray(a) ? a.length : 0;
  }

  /* Uma atividade está "concluída" quando os N grupos definidos (campo Nº de grupos)
     terminaram TODOS os itens dela — progresso ≥ itensParaCompletar (declarado pelo
     módulo). all = todas as linhas da sessão. */
  function atividadeConcluida(all, mod){
    var total = mod && mod.itensParaCompletar;
    if (!total || !numGrupos) return false;
    var rows = all.filter(function(r){ return r.atividade === mod.id; });
    var completos = porGrupo(rows).filter(function(r){ return progressoDe(r) >= total; }).length;
    return completos >= numGrupos;
  }
  /* Pinta de verde (✓) as abas das atividades concluídas por todos os grupos. */
  function atualizarAbasConcluidas(all){
    registry.forEach(function(m){
      var b = $("abas").querySelector('[data-atividade="' + m.id + '"]');
      if (b) b.classList.toggle("concluida", atividadeConcluida(all, m));
    });
  }

  /* =========================================================================
     AGREGADOR ACUMULADO (SPEC §7)
     ========================================================================= */
  function notaDe(pont, max){ return max ? Math.max(0, Math.min(100, (pont || 0) / max * 100)) : 0; }

  /* Índice de uma atividade na ordem do fluxo (registry = ordem dos <script>). */
  function idxNoFluxo(id){
    for (var i=0;i<registry.length;i++) if (registry[i].id === id) return i;
    return -1;
  }
  /* Conjunto de atividades PONTUADAS até uma posição do fluxo. incluir=true → até
     a atual inclusive; false → estritamente antes (a "rodada anterior"). É isto que
     torna o acumulado PROGRESSIVO: revelar a 2ª etapa soma só 1ª+2ª, não tudo o que
     já foi jogado — senão o total fica igual em qualquer aba. */
  function pontuadasAte(idAtual, incluir){
    var lim = idxNoFluxo(idAtual), ids = {};
    for (var i=0;i<registry.length;i++){
      var m = registry[i];
      if (typeof m.maxPontos !== "number") continue;       // Júri (sem placar) fora
      if (incluir ? (i <= lim) : (i < lim)) ids[m.id] = true;
    }
    return ids;
  }

  /* Agrega linhas JÁ FILTRADAS pelo conjunto de etapas da rodada. Normaliza cada
     etapa /100 (clamp), soma por grupo, ordena e dá colocação com empate (SPEC §9).
     jogadas = nº de etapas pontuadas presentes nessas linhas. */
  function agregar(rows){
    var maxById = {};
    pontuados().forEach(function(m){ maxById[m.id] = m.maxPontos; });
    var porG = {}, jogadas = {};
    rows.forEach(function(r){
      if (!(r.atividade in maxById)) return;          // não-pontuada (Júri) → fora
      jogadas[r.atividade] = true;
      if (!porG[r.grupo]) porG[r.grupo] = { grupo: r.grupo, etapas: {} };
      porG[r.grupo].etapas[r.atividade] = notaDe(r.pontuacao, maxById[r.atividade]); // último vence
    });
    var grupos = Object.keys(porG).map(function(g){
      var e = porG[g], total = 0, n = 0;
      for (var aid in e.etapas){ total += e.etapas[aid]; n++; }
      return { grupo: g, total: Math.round(total), etapas: n };
    });
    grupos.sort(function(a,b){ return b.total - a.total || String(a.grupo).localeCompare(b.grupo); });
    // colocação com empate compartilhado (SPEC §9)
    var rank = 0, prev = null;
    grupos.forEach(function(g,i){ if (prev === null || g.total !== prev){ rank = i + 1; prev = g.total; } g.rank = rank; });
    return { grupos: grupos, jogadas: Object.keys(jogadas).length };
  }
  /* Resultado da rodada ATUAL (acertos brutos), a partir das linhas da atividade. */
  function rodadaDados(){
    var mod = moduloAtivo();
    var max = (mod && typeof mod.maxPontos === "number") ? mod.maxPontos : null;
    var grupos = porGrupo(ultimasRows).map(function(r){ return { grupo: r.grupo, pont: (r.pontuacao || 0) }; });
    grupos.sort(function(a,b){ return b.pont - a.pont || String(a.grupo).localeCompare(b.grupo); });
    return { grupos: grupos, max: max, label: mod ? mod.label : "—" };
  }

  /* =========================================================================
     FASES DO REVELAR / PÓDIO
     ========================================================================= */
  function atualizarControles(){
    var mod = moduloAtivo();
    var scored = mod && typeof mod.maxPontos === "number";
    var rev = $("revelarBtn"), rec = $("recolherBtn");
    if (!rev || !rec) return;
    rec.style.display = (fase === "monitor") ? "none" : "";
    if (fase === "monitor"){ rev.style.display = ""; rev.textContent = "REVELAR ▸"; }
    else if (fase === "gabarito"){
      if (scored){ rev.style.display = ""; rev.textContent = "Resultado da rodada ▸"; }
      else { rev.style.display = "none"; }   // Júri: sem pódio
    }
    else if (fase === "rodada"){ rev.style.display = ""; rev.textContent = "Classificação geral ▸"; }
    else { rev.style.display = "none"; }      // geral
  }

  function enterFase(f){
    fase = f;
    atualizarControles();
    if (f === "monitor" || f === "gabarito"){
      iniciarPolling();          // ao vivo
      render(ultimasRows);
    } else {
      if (timer){ clearInterval(timer); timer = null; }  // congela durante o pódio
      if (global.SFX) SFX.destravar();
      if (f === "rodada") prepararSnapshot(renderRodada);
      else renderGeral();
    }
  }
  function avancar(){
    if (global.SFX) SFX.destravar();
    if (fase === "monitor") enterFase("gabarito");
    else if (fase === "gabarito") enterFase("rodada");
    else if (fase === "rodada") enterFase("geral");
  }

  async function prepararSnapshot(cb){
    $("legend").innerHTML = "";
    $("scoreboardWrap").style.display = "none";
    $("atividadeContainer").innerHTML = '<div class="empty">Calculando a classificação…</div>';
    var all = await SB.consultarSessaoTudo(sessao);
    // Acumulado PROGRESSIVO: corta pelas etapas pontuadas até a atual (ordem do fluxo).
    var ate   = pontuadasAte(atividadeAtiva, true);    // 1ª … atual (inclusive)
    var antes = pontuadasAte(atividadeAtiva, false);   // 1ª … anterior (base das setas ↑↓)
    var rowsAte   = all.filter(function(r){ return ate[r.atividade]; });
    var rowsAntes = all.filter(function(r){ return antes[r.atividade]; });
    snap = { atual: agregar(rowsAte), anterior: agregar(rowsAntes), rodada: rodadaDados() };
    cb();
  }

  /* ---- Render: despacha conforme a fase ---- */
  function render(rows){
    var grupos = porGrupo(rows);
    grupos.sort(function(a,b){
      return (b.pontuacao||0) - (a.pontuacao||0) || String(a.grupo).localeCompare(b.grupo);
    });
    var cores = new Map();
    grupos.forEach(function(g,i){ cores.set(g.grupo, PALETA[i % PALETA.length]); });
    $("grupoCount").textContent = grupos.length;

    if (fase === "gabarito") renderGabarito(grupos, cores);
    else renderMonitor(grupos);  // monitor (rodada/geral têm render próprio)
  }

  /* Monitor (SPEC §6): só progresso, sem expor respostas. */
  function renderMonitor(grupos){
    $("legend").innerHTML = "";
    $("scoreboardWrap").style.display = "none";
    var mod = moduloAtivo();
    var lista = grupos.map(function(g){
      return '<div class="mon-row"><span class="mon-dot"></span>' +
        '<span class="mon-name">'+esc(g.grupo)+'</span>' +
        '<span class="mon-prog">'+progressoDe(g)+' resposta(s)</span></div>';
    }).join("") || '<div class="empty">Nenhum grupo enviou ainda.</div>';
    $("atividadeContainer").innerHTML =
      '<div class="monitor">' +
        '<div class="mon-head"><span class="mon-count">'+grupos.length+'/'+numGrupos+' ✓</span>' +
          'grupos enviaram em <b>'+esc(mod ? mod.label : "—")+'</b></div>' +
        '<div class="mon-hint">As respostas ficam ocultas no telão até você revelar. Quando todos enviarem, clique <b>REVELAR</b>.</div>' +
        lista +
      '</div>';
  }

  /* Gabarito (SPEC §6 "depois de revelar"): SÓ legenda + miolo do módulo (o
     gabarito/tally). Pontos e classificação NÃO aparecem aqui — vivem só nas
     telas dedicadas "Resultado da rodada" e "Classificação geral" (decisão do
     autor, jun/2026: evitar placar redundante embaixo do gabarito). */
  function renderGabarito(grupos, cores){
    $("legend").innerHTML = grupos.map(function(g){
      return '<span class="g"><span class="swatch" style="background:'+cores.get(g.grupo)+'"></span>'+esc(g.grupo)+'</span>';
    }).join("");
    $("scoreboardWrap").style.display = "none";

    var mod = moduloAtivo();
    var cont = $("atividadeContainer");
    cont.innerHTML = "";
    if (mod && mod.dataGlobal && !global[mod.dataGlobal]){
      cont.innerHTML = '<div class="empty">Dados da atividade ('+esc(mod.dataGlobal)+') não carregados.</div>';
    } else if (mod && typeof mod.render === "function"){
      mod.render(cont, grupos, cores);
    }
  }

  /* Tela 1 do pódio: desempenho NESTA rodada (acertos), rótulo "Nesta rodada". */
  function renderRodada(){
    $("legend").innerHTML = "";
    $("scoreboardWrap").style.display = "none";
    var d = snap.rodada;
    var denom = d.max || (d.grupos.length ? Math.max(1, d.grupos[0].pont) : 1);
    var rows = d.grupos.map(function(x){
      var w = Math.max(0, Math.min(100, Math.round(x.pont / denom * 100)));
      var val = (d.max != null) ? (x.pont + "/" + d.max) : (x.pont + " pts");
      return '<div class="pod-row" data-w="'+w+'">' +
        '<span class="pod-name">'+esc(x.grupo)+'</span>' +
        '<span class="pod-bar-wrap"><span class="pod-bar"></span></span>' +
        '<span class="pod-pts">'+val+'</span>' +
      '</div>';
    }).join("") || '<div class="empty">Sem respostas nesta rodada.</div>';
    $("atividadeContainer").innerHTML =
      '<div class="podio">' +
        '<div class="pod-title">Nesta rodada</div>' +
        '<div class="pod-sub">'+esc(d.label)+' · acertos desta atividade (não acumulado)</div>' +
        rows +
      '</div>';
    animarBarras();
  }

  /* Tela 2 do pódio: classificação GERAL acumulada (normalizada), com setas. */
  function renderGeral(){
    $("legend").innerHTML = "";
    $("scoreboardWrap").style.display = "none";
    var g = snap.atual.grupos, jogadas = snap.atual.jogadas;
    var prevRank = {};
    snap.anterior.grupos.forEach(function(x){ prevRank[x.grupo] = x.rank; });
    var maxTotal = g.length ? Math.max(1, g[0].total) : 1;
    var medalhas = ["🥇","🥈","🥉"];
    var fim = jogadas >= pontuados().length;   // todas as etapas pontuadas jogadas → clímax

    var rows = g.map(function(x){
      var pr = prevRank[x.grupo];
      var delta = (pr == null) ? null : (pr - x.rank);
      var seta = (delta == null) ? '<span class="pod-delta new">novo</span>'
        : delta > 0 ? '<span class="pod-delta up">▲ '+delta+'</span>'
        : delta < 0 ? '<span class="pod-delta down">▼ '+(-delta)+'</span>'
        : '<span class="pod-delta same">—</span>';
      var medal = (x.rank <= 3) ? medalhas[x.rank-1] : ('<span class="pod-rank">'+x.rank+'º</span>');
      var w = Math.max(0, Math.min(100, Math.round(x.total / maxTotal * 100)));
      return '<div class="pod-row" data-w="'+w+'">' +
        '<span class="pod-medal">'+medal+'</span>' +
        '<span class="pod-name">'+esc(x.grupo)+'</span>' +
        '<span class="pod-bar-wrap"><span class="pod-bar"></span></span>' +
        '<span class="pod-pts">'+x.total+' pts</span>' +
        '<span class="pod-et">etapas '+x.etapas+'/'+jogadas+'</span>' +
        seta +
      '</div>';
    }).join("") || '<div class="empty">Sem pontuações ainda.</div>';

    $("atividadeContainer").innerHTML =
      '<div class="podio" id="podioGeral">' +
        '<div class="pod-title">'+(fim ? "🏆 Classificação final" : "Classificação geral")+'</div>' +
        '<div class="pod-sub">Pontos normalizados acumulados · '+jogadas+' etapa(s) pontuada(s) jogada(s)' +
          (fim ? " — todas concluídas" : "")+'</div>' +
        rows +
      '</div>';
    animarBarras(function(){
      if (global.SFX) SFX.fanfarra();
      if (fim) confete($("podioGeral"));
    });
  }

  /* Anima as barras em cascata + whoosh por colocação; callback ao terminar. */
  function animarBarras(aoFim){
    var rows = $("atividadeContainer").querySelectorAll(".pod-row");
    var passo = reduzMov() ? 0 : 220;
    rows.forEach(function(row, i){
      setTimeout(function(){
        var bar = row.querySelector(".pod-bar");
        if (bar) bar.style.width = row.dataset.w + "%";
        if (global.SFX) SFX.whoosh();
      }, passo * i + 80);
    });
    if (aoFim) setTimeout(aoFim, passo * rows.length + 250);
  }

  /* Confete leve, só na grande final; respeita prefers-reduced-motion (SPEC §10). */
  function confete(host){
    if (reduzMov() || !host) return;
    for (var i=0;i<36;i++){
      var p = document.createElement("div");
      p.className = "confete";
      p.style.left = (Math.random()*100) + "%";
      p.style.background = PALETA[i % PALETA.length];
      p.style.animationDelay = (Math.random()*0.5) + "s";
      p.style.animationDuration = (2 + Math.random()*1.5) + "s";
      host.appendChild(p);
    }
    setTimeout(function(){
      var ps = host.querySelectorAll(".confete");
      for (var j=0;j<ps.length;j++) ps[j].remove();
    }, 4200);
  }

  /* ---- Ciclo de atualização (só nas fases ao vivo) ---- */
  async function atualizar(){
    if (!sessao){ setLive(false, "informe a sessão"); return; }
    if (!atividadeAtiva){ setLive(false, "sem atividade"); return; }
    if (fase !== "monitor" && fase !== "gabarito") return;  // pódio congelado
    // Uma consulta serve a tudo: o miolo da atividade ativa + a marca de concluída
    // em TODAS as abas. Evita um 2º request por ciclo.
    var all = await SB.consultarSessaoTudo(sessao);
    ultimasTodas = all;
    ultimasRows = all.filter(function(r){ return r.atividade === atividadeAtiva; });
    atualizarAbasConcluidas(all);
    render(ultimasRows);
    $("lastUpdate").textContent = "última atualização " + agora();
    setLive(true, fase === "gabarito" ? "ao vivo · revelado" : "ao vivo · oculto");
  }
  function iniciarPolling(){
    if (timer) clearInterval(timer);
    atualizar();
    timer = setInterval(atualizar, POLL_MS);
  }

  /* ---- Boot do painel (após autenticado) ---- */
  function bootPainel(){
    if (!registry.length){
      $("notice").style.display = "";
      $("notice").textContent = "Nenhuma atividade registrada (inclua os <script> da atividade em painel.html).";
      setLive(false, "sem atividade");
      return;
    }
    injetarCSS();
    if (global.SFX) SFX.montarBotaoMudo();

    atividadeAtiva = atividadeInicial();
    montarAbas();
    atualizarInstrucao();

    numGrupos = numGruposInicial();
    var numInp = $("numGruposInput");
    if (numInp){ numInp.value = numGrupos; numInp.addEventListener("change", function(){ fixarNumGrupos(numInp.value); }); }

    var rev = $("revelarBtn"), rec = $("recolherBtn");
    if (rev) rev.addEventListener("click", avancar);
    if (rec) rec.addEventListener("click", function(){ enterFase("monitor"); });

    $("sessaoInput").addEventListener("change", function(){ fixarSessao($("sessaoInput").value); });
    $("novoCodigoBtn").addEventListener("click", function(){
      // SPEC §11: confirmação reforçada (não apaga respostas; só inicia sessão limpa).
      if (!confirm("Gerar um novo código? Os grupos conectados ao código atual precisarão reentrar com o novo. As respostas já enviadas continuam salvas.")) return;
      fixarSessao(gerarCodigo());
    });
    $("refreshBtn").addEventListener("click", atualizar);

    fixarSessao(sessaoInicial()); // trava o código, entra em "monitor" e dispara o polling
  }

  /* ---- Entrada: valida config → portão de login → bootPainel ---- */
  function init(){
    if (!(global.SB && SB.configValida())){
      $("painelMain").hidden = false;
      $("notice").style.display = "";
      $("notice").innerHTML = "Backend não configurado (chave/URL ainda são placeholders em " +
        "<code>lib/supabase-config.js</code>). O painel não tem dados para mostrar.";
      setLive(false, "sem backend");
      return;
    }
    if (global.PAINEL_AUTH) PAINEL_AUTH.proteger(bootPainel);
    else { $("painelMain").hidden = false; bootPainel(); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
