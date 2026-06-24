/* =============================================================================
   MOTOR — Rodada 3 "Dimensões do delírio" (treino + aula lockstep)
   Mecânica PRÓPRIA (não múltipla escolha): por caso, o grupo classifica 5
   DIMENSÕES em Baixa/Média/Alta. Três dimensões pontuam por BANDA DE REFERÊNCIA.
   A página é casca fina (esqueleto + AtividadeDimensoes.init()).

   TREINO  = self-paced; classifica e avança sozinho.
   AULA    = lockstep (Peer Instruction): espera → o professor abre o caso →
             o grupo classifica e CONFIRMA (voto) → o professor mostra o resultado
             (no aparelho do aluno: veredito por dimensão; no telão: divergência da
             turma). PONTUA pelas bandas. O professor controla o avanço.

   Reusa PONTEIRO (espera/resultado, época, reset, presença de sessão), igual às
   demais rodadas. Mesmo payload do treino (dados.casos com ratings) → o painel lê
   sem mudança. Sem framework, sem CDN.
   ============================================================================= */
(function (global) {
  "use strict";

  function init(){
    var DATA      = global.DIMENSOES_DATA;
    var DIMENSOES = DATA.DIMENSOES, NIVEIS = DATA.NIVEIS, CASOS = DATA.CASOS;
    var TOTAL     = CASOS.length;
    var ATIVIDADE = "dimensoes";

    /* maxPontos = soma das dimensões pontuadas com banda em cada caso. */
    var MAX_PONTOS = CASOS.reduce(function(s,c){
      return s + DIMENSOES.filter(function(d){ return d.pontua && c.banda && c.banda[d.chave]; }).length;
    }, 0);

    /* ---- Estado ---- */
    var estado = { sessao:"", grupo:"", idx:0, respostas:[], atual:{} };
    // respostas[i] = { caso_id, ratings:{conviccao,extensao,bizarrice,desorganizacao,preocupacao} }

    function chaveEstado(s,g){ return ATIVIDADE + ":estado:" + s + ":" + g; }
    function chavePendente(s,g){ return ATIVIDADE + ":pendente:" + s + ":" + g; }
    function lerEstadoSalvo(s,g){ try { return JSON.parse(localStorage.getItem(chaveEstado(s,g)) || "null"); } catch(e){ return null; } }
    function salvarLocal(){
      try {
        localStorage.setItem(chaveEstado(estado.sessao, estado.grupo), JSON.stringify({
          sessao:estado.sessao, grupo:estado.grupo, idx:estado.idx, respostas:estado.respostas, epoca:estado.epoca
        }));
      } catch(e){}
    }
    function limparLocal(s,g){ try { localStorage.removeItem(chaveEstado(s,g)); localStorage.removeItem(chavePendente(s,g)); } catch(e){} }

    /* ---- Pontuação ---- */
    function pontosDoCaso(caso_id, ratings){
      var caso = CASOS.find(function(c){ return c.id === caso_id; });
      if (!caso || !caso.banda || !ratings) return 0;
      var p = 0;
      DIMENSOES.forEach(function(d){
        if (!d.pontua) return;
        var banda = caso.banda[d.chave];
        if (banda && ratings[d.chave] && banda.indexOf(ratings[d.chave]) !== -1) p++;
      });
      return p;
    }
    function scoreTotal(){ return estado.respostas.reduce(function(s,r){ return s + (r ? pontosDoCaso(r.caso_id, r.ratings) : 0); }, 0); }
    function bandasDoCaso(caso){ return DIMENSOES.filter(function(d){ return d.pontua && caso.banda && caso.banda[d.chave]; }).length; }

    /* Payload CUMULATIVO: só os casos concluídos (5 dimensões marcadas). */
    function montarPayload(){
      var casos = estado.respostas
        .filter(function(r){ return r && r.ratings && Object.keys(r.ratings).length === DIMENSOES.length; })
        .map(function(r){ return { caso_id:r.caso_id, ratings:r.ratings }; });
      return { sessao:estado.sessao, atividade:ATIVIDADE, grupo:estado.grupo, pontuacao:scoreTotal(), dados:{ casos:casos } };
    }

    /* ---- Sync (idêntico às demais; treino não envia) ---- */
    var syncPendente = false, reenvioTimer = null;
    function refletirSync(){
      var el = document.getElementById("syncMsg"); if (!el) return;
      if (MODO !== "aula"){ el.className = "small sync-msg ok"; el.textContent = "Modo treino — as respostas ficam só neste aparelho."; return; }
      if (syncPendente){ el.className = "small sync-msg erro"; el.textContent = "Respostas salvas neste aparelho. Sem conexão com a turma — tentando reenviar…"; }
      else { el.className = "small sync-msg ok"; el.textContent = "✓ Respostas salvas automaticamente."; }
    }
    function guardarPendente(payload){ syncPendente = true; try { localStorage.setItem(chavePendente(estado.sessao, estado.grupo), JSON.stringify(payload)); } catch(e){} agendarReenvio(); }
    function limparPendente(){ syncPendente = false; try { localStorage.removeItem(chavePendente(estado.sessao, estado.grupo)); } catch(e){} }
    function lerPendente(){ try { return JSON.parse(localStorage.getItem(chavePendente(estado.sessao, estado.grupo)) || "null"); } catch(e){ return null; } }
    function agendarReenvio(){
      if (reenvioTimer) return;
      reenvioTimer = setInterval(async function(){
        var pend = lerPendente();
        if (!pend){ clearInterval(reenvioTimer); reenvioTimer = null; return; }
        if (!(window.SB && SB.configValida())) return;
        try { var r = await SB.enviarResultado(pend); if (r.ok){ limparPendente(); clearInterval(reenvioTimer); reenvioTimer = null; refletirSync(); } } catch(e){}
      }, 8000);
    }
    async function enviar(payload){
      if (MODO !== "aula"){ return; }
      try {
        if (!(window.SB && SB.configValida())){ guardarPendente(payload); return; }
        var r = await SB.enviarResultado(payload);
        if (r.ok) limparPendente(); else guardarPendente(payload);
      } catch(e){ guardarPendente(payload); }
      refletirSync();
    }
    function salvarProgresso(){ salvarLocal(); enviar(montarPayload()); }

    /* ---- Navegação ---- */
    function show(sectionId){
      document.querySelectorAll(".wrap > .step").forEach(function(s){ s.classList.remove("active"); });
      document.getElementById(sectionId).classList.add("active");
      window.scrollTo({top:0, behavior:"smooth"});
    }
    function nivelLabel(chave){ var n = NIVEIS.find(function(x){ return x.chave===chave; }); return n ? n.label : "—"; }

    function renderLegenda(){
      var ul = document.getElementById("dimLegend"); if (!ul) return;
      ul.innerHTML = DIMENSOES.map(function(d){
        return '<li><b>'+d.nome+'</b><span class="tag '+(d.pontua?"placar":"debate")+'">'+(d.pontua?"placar":"discussão")+'</span><br><span class="muted small">'+d.desc+'</span></li>';
      }).join("");
    }

    /* Monta a grade de 5 dimensões no #dimList.
       clickable=true: níveis clicáveis; ao completar as 5, chama onComplete().
       clickable=false: travada, mostrando `ratings` (e, se mostrarBanda, ✓/✗ por dimensão). */
    function montarGrade(ratings, opts){
      opts = opts || {};
      var box = document.getElementById("dimList"); box.innerHTML = "";
      var caso = CASOS[estado.idx];
      DIMENSOES.forEach(function(d){
        var row = document.createElement("div"); row.className = "dim-row"; row.dataset.dim = d.chave;
        var sel = ratings ? ratings[d.chave] : null;
        var niv = NIVEIS.map(function(n){
          var cls = "niv" + (sel===n.chave ? " sel" : "");
          return '<button class="'+cls+'" data-niv="'+n.chave+'"'+(opts.clickable?"":" disabled")+'>'+n.label+'</button>';
        }).join("");
        var verdict = "";
        if (opts.mostrarBanda){
          var banda = caso.banda && caso.banda[d.chave];
          if (d.pontua && banda){
            var hit = banda.indexOf(sel) !== -1;
            verdict = '<div class="dim-verd '+(hit?"hit":"miss")+'">'+(hit?"✓":"✗")+' banda: '+banda.map(nivelLabel).join("/")+'</div>';
          } else {
            verdict = '<div class="dim-verd deb">• discussão (sem gabarito)</div>';
          }
        }
        row.innerHTML =
          '<div class="dim-head"><span class="dim-nome">'+d.nome+'</span><span class="dim-desc">'+d.desc+'</span></div>' +
          '<div class="niveis">'+niv+'</div>' + verdict;
        if (opts.clickable){
          row.querySelectorAll(".niv").forEach(function(b){ b.addEventListener("click", function(){
            row.querySelectorAll(".niv").forEach(function(x){ x.classList.remove("sel"); });
            b.classList.add("sel");
            estado.atual[d.chave] = b.dataset.niv;
            SFX.click();
            if (opts.onComplete) opts.onComplete(Object.keys(estado.atual).length === DIMENSOES.length);
          }); });
        }
        box.appendChild(row);
      });
    }

    /* ---- Identidade ---- */
    var CTX = AULA.exigir();
    var MODO = CTX ? CTX.modo : "aula";
    var aulaUnsub = null, aulaEstadoAtual = null, aulaSomItem = -1;
    if (CTX) { renderLegenda(); if (MODO === "aula") aulaBoot(); else bootAtividade(); }

    /* =========================================================================
       MODO AULA — LOCKSTEP
       ========================================================================= */
    function aulaBoot(){
      SFX.montarBotaoMudo();
      estado.sessao = CTX.sessao; estado.grupo = CTX.grupo;
      var salvo = lerEstadoSalvo(CTX.sessao, CTX.grupo);
      if (salvo && Array.isArray(salvo.respostas)) estado.respostas = salvo.respostas;
      if (salvo) estado.epoca = salvo.epoca;
      salvarLocal();                 // presença por-rodada (votos)
      enviar(montarPayload());
      document.getElementById("nextRow").classList.add("hidden");
      aulaEspera();
      aulaStatus("sync " + PONTEIRO.modo() + " · sessão " + estado.sessao + " · aguardando");
      aulaUnsub = PONTEIRO.observar(estado.sessao, ATIVIDADE, aulaRender);
      var es = document.getElementById("esperaSair");
      if (es) es.onclick = function(e){ e.preventDefault(); if (confirm("Sair e trocar de grupo?")){ AULA.limpar(); location.href = "index.html"; } };
    }
    function aulaStatus(txt){
      var el = document.getElementById("aulaStatus");
      if (!el){
        el = document.createElement("div"); el.id = "aulaStatus";
        el.style.cssText = "position:fixed;left:10px;bottom:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);background:var(--paper);padding:3px 8px;border:1px solid var(--border-color);border-radius:6px;z-index:50";
        document.body.appendChild(el);
      }
      el.textContent = txt;
    }
    function aulaEspera(){
      document.getElementById("esperaGrupo").textContent = estado.grupo;
      document.getElementById("esperaSessao").textContent = estado.sessao;
      show("espera");
    }

    function aulaRender(p){
      aulaStatus("sync " + PONTEIRO.modo() + " · sessão " + estado.sessao + " · " + (p ? ("C" + (p.item+1) + " " + p.fase) : "aguardando"));
      if (p && p.fase === "reset"){ if (aulaUnsub){ aulaUnsub(); aulaUnsub=null; } AULA.limpar(); location.href = "index.html"; return; }
      if (!p){ aulaEspera(); return; }
      if (p.epoca !== estado.epoca){ estado.epoca = p.epoca; estado.respostas = []; estado.atual = {}; aulaSomItem = -1; salvarLocal(); }
      if (p.fase === "fim"){ if (aulaUnsub){ aulaUnsub(); aulaUnsub=null; } montarSinteseAula(); show("synth"); return; }
      aulaEstadoAtual = p;
      var K = p.item, caso = CASOS[K];
      if (!caso){ aulaEspera(); return; }
      show("loop");
      document.getElementById("caseCounter").textContent = "Caso " + (K+1) + " de " + TOTAL;
      document.getElementById("progressBar").style.width = (K/TOTAL*100)+"%";
      document.getElementById("casoNome").textContent = caso.nome;
      document.getElementById("casoVinheta").innerHTML = caso.vinheta;
      document.getElementById("scoreVal").textContent = scoreTotal();

      var reveal = document.getElementById("aulaReveal");
      var confirmRow = document.getElementById("confirmRow");
      var r = estado.respostas[K];
      var jaVotou = !!(r && r.ratings && Object.keys(r.ratings).length === DIMENSOES.length);

      if (p.fase === "responder"){
        reveal.classList.add("hidden");
        if (jaVotou){
          montarGrade(r.ratings, { clickable:false });
          confirmRow.classList.add("hidden");
          aulaMsg("✅ Classificação registrada — aguardem a turma.");
        } else {
          if (!estado.atual) estado.atual = {};
          montarGrade(estado.atual, { clickable:true, onComplete:function(completo){ document.getElementById("confirmBtn").disabled = !completo; } });
          confirmRow.classList.remove("hidden");
          var cb = document.getElementById("confirmBtn");
          cb.disabled = (Object.keys(estado.atual).length !== DIMENSOES.length);
          cb.onclick = function(){ aulaConfirmar(K); };
          aulaMsg("");
        }
      } else if (p.fase === "resultado"){
        confirmRow.classList.add("hidden");
        montarGrade(r ? r.ratings : null, { clickable:false, mostrarBanda:true });
        var pts = r ? pontosDoCaso(caso.id, r.ratings) : 0;
        var nb = bandasDoCaso(caso);
        var fb = document.getElementById("aulaFeedback");
        if (!jaVotou){ fb.className = "fb neutro"; fb.innerHTML = "Vocês não classificaram este caso a tempo."; }
        else if (pts === nb){ fb.className = "fb ok"; fb.innerHTML = "✓ Vocês caíram na banda de referência nas <b>"+nb+"</b> dimensões pontuadas."; }
        else if (pts > 0){ fb.className = "fb ok"; fb.innerHTML = "Vocês pegaram <b>"+pts+" de "+nb+"</b> dimensões pontuadas."; }
        else { fb.className = "fb erro"; fb.innerHTML = "Vocês ficaram fora da banda nas dimensões pontuadas — comparem com o telão."; }
        if (aulaSomItem !== K){ aulaSomItem = K; if (jaVotou){ (pts>0) ? SFX.acerto() : SFX.erro(); } }
        var link = document.getElementById("revLink");
        if (caso.caso_completo){ link.href = caso.caso_completo; link.parentNode.style.display = ""; } else { link.parentNode.style.display = "none"; }
        var disc = document.getElementById("revDiscussao"); if (disc) disc.innerHTML = caso.discussao || DATA.NOTA;
        reveal.classList.remove("hidden");
        document.getElementById("scoreVal").textContent = scoreTotal();
      }
    }
    function aulaMsg(txt){
      var el = document.getElementById("aulaMsg"); if (!el) return;
      el.textContent = txt; el.style.display = txt ? "" : "none";
    }
    function aulaConfirmar(K){
      if (Object.keys(estado.atual).length !== DIMENSOES.length) return;
      var caso = CASOS[K];
      estado.respostas[K] = { caso_id: caso.id, ratings: Object.assign({}, estado.atual) };
      SFX.click();
      salvarLocal(); enviar(montarPayload());
      if (aulaEstadoAtual) aulaRender(aulaEstadoAtual);
    }

    function montarSinteseAula(){ montarSinteseComum(); }

    /* =========================================================================
       MODO TREINO — self-paced
       ========================================================================= */
    function bootAtividade(){
      SFX.montarBotaoMudo();
      estado.sessao = CTX.sessao; estado.grupo = CTX.grupo;
      var salvo = lerEstadoSalvo(CTX.sessao, CTX.grupo);
      var completos = salvo && Array.isArray(salvo.respostas)
        ? salvo.respostas.filter(function(r){ return r && r.ratings && Object.keys(r.ratings).length === DIMENSOES.length; }).length : 0;
      if (completos >= TOTAL){ Object.assign(estado, { respostas:salvo.respostas.slice(0,TOTAL), idx:TOTAL }); montarSintese(); show("synth"); return; }
      if (completos > 0){ Object.assign(estado, { respostas:salvo.respostas.slice(0,completos), idx:completos }); show("loop"); carregarCaso(); return; }
      show("intro");
    }

    var startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.addEventListener("click", function(){
      limparLocal(estado.sessao, estado.grupo);
      Object.assign(estado, { idx:0, respostas:[], atual:{} });
      syncPendente = false; SFX.click();
      show("loop"); carregarCaso();
    });

    function carregarCaso(){
      var caso = CASOS[estado.idx];
      document.getElementById("caseCounter").textContent = "Caso " + (estado.idx+1) + " de " + TOTAL;
      document.getElementById("progressBar").style.width = (estado.idx/TOTAL*100)+"%";
      document.getElementById("scoreVal").textContent = scoreTotal();
      document.getElementById("casoNome").textContent = caso.nome;
      document.getElementById("casoVinheta").innerHTML = caso.vinheta;
      document.getElementById("aulaReveal").classList.add("hidden");
      document.getElementById("confirmRow").classList.add("hidden");
      document.getElementById("nextRow").classList.remove("hidden");

      estado.atual = {};
      var nb = document.getElementById("nextBtn");
      montarGrade(estado.atual, { clickable:true, onComplete:function(completo){ nb.disabled = !completo; } });
      nb.disabled = true;
      nb.textContent = (estado.idx >= TOTAL-1) ? "Ver a síntese →" : "Próximo caso →";
      show("loop");
    }

    var nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.addEventListener("click", function(){
      if (Object.keys(estado.atual).length !== DIMENSOES.length) return;
      var caso = CASOS[estado.idx];
      estado.respostas[estado.idx] = { caso_id: caso.id, ratings: Object.assign({}, estado.atual) };
      if (pontosDoCaso(caso.id, estado.atual) > 0) SFX.acerto(); else SFX.click();
      salvarProgresso();
      estado.idx++;
      if (estado.idx >= TOTAL){ montarSintese(); show("synth"); }
      else carregarCaso();
    });

    function montarSintese(){ montarSinteseComum(); }

    /* ---- Síntese (comum aos dois modos) ---- */
    function montarSinteseComum(){
      document.getElementById("progressBar").style.width = "100%";
      document.getElementById("synthGroup").textContent = estado.grupo;
      document.getElementById("synthScore").textContent = scoreTotal();
      document.getElementById("synthTotal").textContent = MAX_PONTOS;

      var pct = MAX_PONTOS ? scoreTotal()/MAX_PONTOS : 0;
      var titulo;
      if (pct >= 0.75) titulo = "Olhar dimensional afiado";
      else if (pct >= 0.5) titulo = "Boa calibração";
      else titulo = "Aprendiz das dimensões";
      document.getElementById("synthBadge").innerHTML = '<span class="badge">'+titulo+'</span>';

      var list = document.getElementById("synthList"); list.innerHTML = "";
      estado.respostas.forEach(function(r){
        if (!r) return;
        var caso = CASOS.find(function(c){ return c.id===r.caso_id; });
        var div = document.createElement("div"); div.className = "item";
        var head = document.createElement("b"); head.textContent = caso.nome; div.appendChild(head);
        DIMENSOES.forEach(function(d){
          var rate = r.ratings[d.chave];
          var line = document.createElement("div"); line.className = "dimline";
          var banda = caso.banda && caso.banda[d.chave];
          if (d.pontua && banda){
            var hit = banda.indexOf(rate) !== -1;
            line.innerHTML = '<span class="'+(hit?"hit":"miss")+'">'+(hit?"✓":"✗")+'</span> '+d.nome+': vocês <b>'+nivelLabel(rate)+'</b> · banda '+banda.map(nivelLabel).join("/");
          } else {
            line.innerHTML = '<span class="deb">•</span> '+d.nome+': vocês <b>'+nivelLabel(rate)+'</b> <span class="deb">(discussão)</span>';
          }
          div.appendChild(line);
        });
        if (caso.discussao){
          var dd = document.createElement("div"); dd.className = "dimline deb"; dd.style.marginTop = "5px";
          dd.innerHTML = caso.discussao;
          div.appendChild(dd);
        }
        if (caso.caso_completo){
          var lk = document.createElement("div"); lk.className = "dimline";
          lk.innerHTML = '<a href="'+caso.caso_completo+'" target="_blank" rel="noopener" style="color:var(--brand);font-weight:600;text-decoration:none">ler o caso completo →</a>';
          div.appendChild(lk);
        }
        list.appendChild(div);
      });

      refletirSync(); salvarProgresso();
      if (MODO === "aula") AULA.marcarConcluida(estado.sessao, estado.grupo, ATIVIDADE);
      ajustarBotoesFim();
    }

    function ajustarBotoesFim(){
      var restart = document.getElementById("restartBtn");
      var voltar  = document.getElementById("voltarHub");
      if (!restart || !voltar) return;
      if (MODO === "aula"){ restart.style.display = "none"; voltar.style.display = ""; voltar.textContent = "Voltar ao campeonato →"; }
      else { restart.style.display = ""; voltar.style.display = ""; voltar.textContent = "Voltar às atividades →"; }
    }

    var restartBtn = document.getElementById("restartBtn");
    if (restartBtn) restartBtn.addEventListener("click", function(){
      if (!confirm("Isto recomeça do zero. Tem certeza?")) return;
      limparLocal(estado.sessao, estado.grupo);
      if (reenvioTimer){ clearInterval(reenvioTimer); reenvioTimer = null; }
      syncPendente = false;
      estado.idx = 0; estado.respostas = []; estado.atual = {};
      carregarCaso();
    });
  }

  global.AtividadeDimensoes = { init: init };
})(window);
