/* =============================================================================
   PÓDIO COMPARTILHADO — classificação ao fim de uma rodada (telão)
   Mesmo visual e sons do pódio do painel multi-atividade (painel-core.js): barras
   em cascata, medalhas 🥇🥈🥉, confete e fanfarra. Extraído para um lib próprio
   para os painéis-piloto do lockstep (painel-mc / painel-dimensoes) reusarem sem
   depender do shell multi-atividade. Vanilla, sem CDN.

     Podio.render(container, {
       grupos: [{ grupo:"Grupo 1", pontos: 7 }, ...],   // não precisa vir ordenado
       max:    10,                                       // pontos máximos (barras /max)
       titulo: "🏆 Rodada 1 — Nomear o fenômeno",
       sub:    "Acertos da rodada",                      // opcional
       festa:  true                                      // fanfarra + confete no fim
     });
   ============================================================================= */
(function (global) {
  "use strict";

  var PALETA = ["#b45309","#2f6db4","#2f7d4f","#9b2f8f","#b0331f","#1f8f96","#8f6b1f","#5a4fb4","#b42f6b","#4a4a4a"];
  function reduzMov(){ try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e){ return false; } }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

  function injetarCSS(){
    if (document.getElementById("css-podio")) return;
    var s = document.createElement("style"); s.id = "css-podio";
    s.textContent =
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
      ".pod-empty{text-align:center; color:var(--text-muted); padding:18px 0}" +
      ".confete{position:absolute; top:-12px; width:9px; height:14px; border-radius:2px; opacity:.9; animation:podcair linear forwards}" +
      "@keyframes podcair{to{transform:translateY(420px) rotate(540deg); opacity:0}}" +
      "@media(max-width:640px){ .pod-name{flex-basis:6em} }";
    document.head.appendChild(s);
  }

  function animarBarras(container, aoFim){
    var rows = container.querySelectorAll(".pod-row");
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

  function confete(host){
    if (reduzMov() || !host) return;
    for (var i=0;i<36;i++){
      var p = document.createElement("div"); p.className = "confete";
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

  function render(container, opts){
    injetarCSS();
    if (global.SFX) SFX.destravar();
    var grupos = (opts.grupos || []).slice().sort(function(a,b){
      return (b.pontos||0) - (a.pontos||0) || String(a.grupo).localeCompare(b.grupo);
    });
    // colocação com empate compartilhado
    var rank = 0, prev = null;
    grupos.forEach(function(g,i){ if (prev === null || g.pontos !== prev){ rank = i+1; prev = g.pontos; } g.rank = rank; });

    var max = opts.max || (grupos.length ? Math.max(1, grupos[0].pontos) : 1);
    var medalhas = ["🥇","🥈","🥉"];
    var rows = grupos.map(function(x){
      var w = Math.max(0, Math.min(100, Math.round((x.pontos||0) / max * 100)));
      var medal = (x.rank <= 3) ? medalhas[x.rank-1] : ('<span class="pod-rank">'+x.rank+'º</span>');
      return '<div class="pod-row" data-w="'+w+'">' +
        '<span class="pod-medal">'+medal+'</span>' +
        '<span class="pod-name">'+esc(x.grupo)+'</span>' +
        '<span class="pod-bar-wrap"><span class="pod-bar"></span></span>' +
        '<span class="pod-pts">'+(x.pontos||0)+'/'+max+'</span>' +
      '</div>';
    }).join("") || '<div class="pod-empty">Nenhum grupo participou.</div>';

    container.innerHTML =
      '<div class="podio" id="podioFim">' +
        '<div class="pod-title">'+esc(opts.titulo || "Classificação")+'</div>' +
        (opts.sub ? '<div class="pod-sub">'+esc(opts.sub)+'</div>' : '') +
        rows +
      '</div>';

    animarBarras(container, function(){
      if (opts.festa && grupos.length){
        if (global.SFX) SFX.fanfarra();
        confete(document.getElementById("podioFim"));
      }
    });
  }

  global.Podio = { render: render };
})(window);
