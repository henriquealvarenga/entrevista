/* =============================================================================
   MÓDULO DE PAINEL — Rodada 3 "Dimensões do delírio"
   Desenha a DIVERGÊNCIA da turma: por caso, uma barra por dimensão dividida em
   Baixa/Média/Alta segundo quantos grupos escolheram cada nível. Nas dimensões
   pontuadas, a BANDA de referência aparece sobreposta (contorno verde) — dá para
   ver, de relance, onde a turma caiu em relação à banda e onde se dividiu.

   Pontua → registrarPainel placar:true (placar genérico do shell). Lê
   row.dados.casos (ratings por caso_id). Metadados de window.DIMENSOES_DATA.
   CSS específica injetada aqui; herda as variáveis do tema do shell.
   ============================================================================= */
(function (global) {
  "use strict";

  function injetarCSS(){
    if (document.getElementById("css-painel-dimensoes")) return;
    var s = document.createElement("style");
    s.id = "css-painel-dimensoes";
    s.textContent =
      ".dim-cases{display:grid; grid-template-columns:1fr; gap:14px}" +
      "@media(min-width:920px){ .dim-cases{grid-template-columns:1fr 1fr} }" +
      ".dim-case{background:var(--paper-content); border:1px solid var(--border-color); border-radius:6px; padding:16px 18px}" +
      ".dim-case h2{font-family:var(--font-serif); font-size:1.15rem; font-weight:700; color:var(--text-primary); margin:0 0 10px; line-height:1.2}" +
      ".dim-case .num{font-family:var(--font-mono); color:var(--brand); font-size:.85rem}" +
      ".dd-row{display:grid; grid-template-columns:8.5em 1fr 5.5em; align-items:center; gap:9px; margin:7px 0; font-size:.84rem}" +
      ".dd-name{color:var(--text-secondary); text-align:right; line-height:1.15}" +
      ".dd-bar{display:flex; height:22px; border-radius:5px; overflow:hidden; background:var(--sidebar-bg)}" +
      ".dd-seg{display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:.72rem; color:#fff; font-weight:600; min-width:0; transition:flex-grow .3s}" +
      ".dd-seg.baixa{background:#8aa996}" +
      ".dd-seg.media{background:#d6a574}" +
      ".dd-seg.alta{background:var(--brand)}" +
      ".dd-seg.band{box-shadow:inset 0 0 0 2px var(--live), inset 0 0 0 3px #fff}" +
      ".dd-band{font-family:var(--font-mono); font-size:.66rem; color:var(--live); line-height:1.1}" +
      ".dd-band.deb{color:var(--text-muted)}" +
      ".dim-empty{font-size:.9rem; color:var(--text-muted); text-align:center; padding:10px 0}" +
      ".dim-leg{display:flex; gap:14px; flex-wrap:wrap; margin:0 0 14px; font-size:.8rem; color:var(--text-muted)}" +
      ".dim-leg .sw{display:inline-block; width:12px; height:12px; border-radius:3px; vertical-align:middle; margin-right:5px}";
    document.head.appendChild(s);
  }

  function esc(s){ return String(s).replace(/[&<>\"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

  /* ratings de um grupo para um caso (ou null). */
  function ratingsDe(row, caso_id){
    var d = row.dados || {}; var arr = Array.isArray(d.casos) ? d.casos : [];
    for (var i=0;i<arr.length;i++){ if (arr[i].caso_id === caso_id) return arr[i].ratings || null; }
    return null;
  }
  /* Contagem por nível, para um caso+dimensão. */
  function contar(grupos, caso_id, dimChave){
    var m = { baixa:0, media:0, alta:0 }, total = 0;
    grupos.forEach(function(g){
      var r = ratingsDe(g, caso_id);
      if (r && r[dimChave]){ m[r[dimChave]] = (m[r[dimChave]] || 0) + 1; total++; }
    });
    return { m:m, total:total };
  }

  function render(container, grupos /*, cores */){
    var DATA = global.DIMENSOES_DATA;
    var DIMENSOES = DATA.DIMENSOES, NIVEIS = DATA.NIVEIS, CASOS = DATA.CASOS;

    var legenda = '<div class="dim-leg">' +
      '<span><span class="sw" style="background:#8aa996"></span>Baixa</span>' +
      '<span><span class="sw" style="background:#d6a574"></span>Média</span>' +
      '<span><span class="sw" style="background:var(--brand)"></span>Alta</span>' +
      '<span><span class="sw" style="box-shadow:inset 0 0 0 2px var(--live),inset 0 0 0 3px #fff;background:var(--sidebar-bg)"></span>banda de referência</span>' +
      '</div>';

    var cards = CASOS.map(function(caso){
      var linhas = DIMENSOES.map(function(d){
        var c = contar(grupos, caso.id, d.chave);
        var banda = (caso.banda && caso.banda[d.chave]) || null;
        var pontua = d.pontua && banda;

        var segs = NIVEIS.map(function(n){
          var qt = c.m[n.chave] || 0;
          var pct = c.total ? (qt / c.total * 100) : 0;
          var isBand = pontua && banda.indexOf(n.chave) !== -1;
          if (pct === 0) return "";
          return '<span class="dd-seg ' + n.chave + (isBand ? " band" : "") + '" style="flex:' + pct + ' 0 0">' + (qt || "") + '</span>';
        }).join("");

        var bandTxt = pontua
          ? '<span class="dd-band">banda ' + banda.map(function(k){ var n=NIVEIS.filter(function(x){return x.chave===k;})[0]; return n?n.label:k; }).join("/") + '</span>'
          : '<span class="dd-band deb">discussão</span>';

        return '<div class="dd-row">' +
          '<span class="dd-name">' + esc(d.nome) + '</span>' +
          '<span class="dd-bar">' + (c.total ? segs : '') + '</span>' +
          bandTxt +
        '</div>';
      }).join("");

      var algum = grupos.some(function(g){ return ratingsDe(g, caso.id); });
      return '<div class="dim-case">' +
        '<h2><span class="num">' + caso.id + '.</span> ' + esc(caso.nome) + '</h2>' +
        (algum ? linhas : '<div class="dim-empty">— sem respostas ainda —</div>') +
      '</div>';
    }).join("");

    container.innerHTML = legenda + '<div class="dim-cases">' + cards + '</div>';
  }

  /* maxPontos = soma das dimensões pontuadas com banda em cada caso (normaliza /100). */
  function maxPontos(){
    var DATA = global.DIMENSOES_DATA;
    return DATA.CASOS.reduce(function(s,c){
      return s + DATA.DIMENSOES.filter(function(d){ return d.pontua && c.banda && c.banda[d.chave]; }).length;
    }, 0);
  }

  injetarCSS();
  global.registrarPainel({
    id: "dimensoes",
    label: "Dimensões do delírio",
    rota: "03-dimensoes.html",
    placar: true,
    maxPontos: maxPontos(),
    itensParaCompletar: global.DIMENSOES_DATA.CASOS.length,
    dataGlobal: "DIMENSOES_DATA",
    render: render
  });
})(window);
