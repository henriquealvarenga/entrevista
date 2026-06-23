/* =============================================================================
   MÓDULO DE PAINEL — Rodada 2 "Fronteiras"
   Desenha SÓ o miolo específico: por item, um TALLY categórico das ESCOLHAS
   entre os grupos, sobre as opções do item, com a CORRETA destacada — o "mapa
   de confusão" (de relance, quantos grupos caíram em cada vizinho). Forte gancho
   de debate ("5 disseram ilusão, 6 alucinação — o que decide?").

   Esta atividade pontua → registrarPainel placar:true (o shell mostra o placar
   genérico). O shell cuida de código, abas, polling e legenda. Auto-registra via
   registrarPainel() ao carregar. Lê row.dados.itens (escolha por item_id).
   Metadados dos itens vêm de window.FRONTEIRAS_DATA (mesma fonte da atividade).

   A evocação digitada NÃO chega aqui (não é enviada) — o painel agrega só a MC.
   CSS específica mora AQUI (injetada uma vez); herda as variáveis do tema do shell.
   ============================================================================= */
(function (global) {
  "use strict";

  function injetarCSS(){
    if (document.getElementById("css-painel-fronteiras")) return;
    var s = document.createElement("style");
    s.id = "css-painel-fronteiras";
    s.textContent =
      ".fen-cases{display:grid; grid-template-columns:1fr; gap:14px}" +
      "@media(min-width:900px){ .fen-cases{grid-template-columns:1fr 1fr} }" +
      ".fen-case{background:var(--paper-content); border:1px solid var(--border-color); border-radius:6px; padding:18px 20px}" +
      ".fen-case .num{font-family:var(--font-mono); color:var(--brand); font-size:.9rem}" +
      ".fen-case h2{font-family:var(--font-serif); font-size:1.2rem; font-weight:700; color:var(--text-primary); margin:0 0 2px; line-height:1.2}" +
      ".fen-case .grp{font-size:.78rem; color:var(--text-muted); margin-bottom:6px}" +
      ".fen-tally{margin-top:10px}" +
      ".fen-row{display:grid; grid-template-columns:11em 1fr 2em; align-items:center; gap:10px; margin:7px 0; font-size:.9rem}" +
      ".fen-label{color:var(--text-secondary); text-align:right; line-height:1.2}" +
      ".fen-row.correta .fen-label{color:var(--live); font-weight:600}" +
      ".fen-track{position:relative; height:16px; background:var(--sidebar-bg); border-radius:8px; overflow:hidden}" +
      ".fen-fill{position:absolute; left:0; top:0; bottom:0; background:var(--brand); border-radius:8px; transition:width .3s}" +
      ".fen-row.correta .fen-fill{background:var(--live)}" +
      ".fen-count{font-family:var(--font-mono); color:var(--brand); font-weight:600; text-align:right}" +
      ".fen-row.correta .fen-count{color:var(--live)}" +
      ".fen-empty{font-size:.9rem; color:var(--text-muted); text-align:center; padding:12px 0}";
    document.head.appendChild(s);
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }

  /* Escolha de um grupo num item (ou null). */
  function escolhaNoItem(row, itemId){
    var dados = row.dados || {};
    var arr = Array.isArray(dados.itens) ? dados.itens : [];
    for (var i=0;i<arr.length;i++){ if (arr[i].item_id === itemId) return arr[i].escolha; }
    return null;
  }

  /* Contagem de escolhas por chave de opção, para um item. */
  function contar(grupos, itemId){
    var m = {};
    grupos.forEach(function(g){
      var e = escolhaNoItem(g, itemId);
      if (e != null){ m[e] = (m[e] || 0) + 1; }
    });
    return m;
  }

  function render(container, grupos /*, cores */){
    var ITENS = global.FRONTEIRAS_DATA.ITENS;

    var html = '<div class="fen-cases">' + ITENS.map(function(it){
      var contagem = contar(grupos, it.id);
      var total = Object.keys(contagem).reduce(function(s,k){ return s + contagem[k]; }, 0);
      var correctLabel = "";
      for (var i=0;i<it.opcoes.length;i++){ if (it.opcoes[i].chave === it.correta){ correctLabel = it.opcoes[i].label; break; } }

      var barras = it.opcoes.map(function(o){
        var n = contagem[o.chave] || 0;
        var pct = total ? Math.round(n / total * 100) : 0;
        var cls = "fen-row" + (o.chave === it.correta ? " correta" : "");
        return '<div class="' + cls + '">' +
          '<span class="fen-label">' + (o.chave === it.correta ? "✓ " : "") + esc(o.label) + '</span>' +
          '<span class="fen-track"><span class="fen-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="fen-count">' + n + '</span>' +
        '</div>';
      }).join("");

      return '<div class="fen-case">' +
        '<div class="num">Fronteira ' + it.id + '</div>' +
        '<h2>' + esc(correctLabel) + '</h2>' +
        '<div class="grp">' + esc(it.grupo_eem) + '</div>' +
        (total ? '<div class="fen-tally">' + barras + '</div>'
               : '<div class="fen-empty">— sem respostas ainda —</div>') +
      '</div>';
    }).join("") + '</div>';

    container.innerHTML = html;
  }

  injetarCSS();
  global.registrarPainel({
    id: "fronteiras",               // === valor da coluna `atividade`
    label: "Fronteiras",            // rótulo da aba / instrução do código
    rota: "02-fronteiras.html",     // página da atividade
    placar: true,                   // pontua → placar genérico do shell
    maxPontos: global.FRONTEIRAS_DATA.ITENS.length, // 8 itens × 1 pt (normaliza /100)
    itensParaCompletar: global.FRONTEIRAS_DATA.ITENS.length, // aba "concluída" = todos fizeram os itens
    dataGlobal: "FRONTEIRAS_DATA",  // window[...] carregado via <script> antes daqui
    render: render
  });
})(window);
