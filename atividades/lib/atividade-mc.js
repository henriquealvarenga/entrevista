/* =============================================================================
   MOTOR GENÉRICO — atividade de MÚLTIPLA ESCOLHA (evocar + discriminar)
   Compartilhado pelas rodadas de mesma mecânica (R1 "Nomear", R2 "Fronteiras"…).
   A página fornece só o ESQUELETO HTML (mesmos ids) + um cfg; este lib roda os
   dois modos: TREINO (self-paced, com evocação/palpite) e AULA (lockstep / Peer
   Instruction, guiado pelo PONTEIRO). Sem framework, sem CDN.

   Uso na página (ao fim do body, depois de aula.js/sfx.js/ponteiro.js + o data-file):
     AtividadeMC.init({
       data:          window.NOMEAR_DATA,          // { ITENS, NOTA_REVELACAO }
       atividade:     "nomear",                     // discriminador (casa com o painel)
       unidade:       "Fenômeno",                   // rótulo do contador: "Fenômeno 3 de 10"
       rotuloProximo: "Próximo fenômeno →",         // texto do botão Próximo
       medalha:       function(score, total){ … }   // título da síntese por pontuação
     });

   Contrato de DADOS (cfg.data.ITENS[i]): { id, correta, roteiro,
     opcoes:[{chave,label}], vinheta(HTML), fronteira(HTML) }.
   ============================================================================= */
(function (global) {
  "use strict";

  /* embaralha uma cópia do array (Fisher–Yates) — opções nunca preveem a correta */
  function embaralhar(arr){
    var a = arr.slice();
    for (var i=a.length-1; i>0; i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; });
  }

  function init(cfg){
    var ITENS = cfg.data.ITENS;
    var TOTAL = ITENS.length;
    var NOTA_REVELACAO = cfg.data.NOTA_REVELACAO;
    var UNIDADE = cfg.unidade || "Item";
    var ROT_PROXIMO = cfg.rotuloProximo || "Próximo →";
    var USA_PALPITE = (cfg.palpite !== false);   // treino: R1 tem evocação; R2 (lightning) não
    var medalha = cfg.medalha || function(){ return ""; };
    var ATIVIDADE = cfg.atividade;  // discriminador na tabela (casa com o painel)

    /* ---- Estado ---- */
    var estado = { sessao:"", grupo:"", idx:0, score:0, respostas:[], _palpiteTmp:"" };
    // treino: respostas[i] = { item_id, palpite, escolha, correto }
    // aula:   respostas[i] = { item_id, escolha1, correto1 }

    /* ---- Persistência local + envio incremental ---- */
    function chaveEstado(s,g){ return ATIVIDADE + ":estado:" + s + ":" + g; }
    function chavePendente(s,g){ return ATIVIDADE + ":pendente:" + s + ":" + g; }

    function lerEstadoSalvo(s,g){
      try { return JSON.parse(localStorage.getItem(chaveEstado(s,g)) || "null"); }
      catch(e){ return null; }
    }
    function salvarLocal(){
      try {
        localStorage.setItem(chaveEstado(estado.sessao, estado.grupo), JSON.stringify({
          sessao:estado.sessao, grupo:estado.grupo, idx:estado.idx, score:estado.score, respostas:estado.respostas, epoca:estado.epoca
        }));
      } catch(e){ /* localStorage indisponível: ignora, não quebra a UI */ }
    }
    function limparLocal(s,g){
      try { localStorage.removeItem(chaveEstado(s,g)); localStorage.removeItem(chavePendente(s,g)); }
      catch(e){ /* idem */ }
    }

    function montarPayload(){
      var itens = estado.respostas
        .filter(function(r){ return r && typeof r.escolha === "string"; })
        .map(function(r){ return { item_id:r.item_id, escolha:r.escolha, correto:r.correto }; });
      var pontuacao = itens.filter(function(it){ return it.correto; }).length;
      return { sessao:estado.sessao, atividade:ATIVIDADE, grupo:estado.grupo, pontuacao:pontuacao, dados:{ itens:itens } };
    }

    var syncPendente = false;
    var reenvioTimer = null;

    function refletirSync(){
      var el = document.getElementById("syncMsg");
      if (!el) return;
      if (MODO !== "aula"){   // treino: nada é enviado
        el.className = "small sync-msg ok";
        el.textContent = "Modo treino — as respostas ficam só neste aparelho.";
        return;
      }
      if (syncPendente){
        el.className = "small sync-msg erro";
        el.textContent = "Respostas salvas neste aparelho. Sem conexão com a turma — tentando reenviar…";
      } else {
        el.className = "small sync-msg ok";
        el.textContent = "✓ Respostas salvas automaticamente.";
      }
    }
    function guardarPendente(payload){
      syncPendente = true;
      try { localStorage.setItem(chavePendente(estado.sessao, estado.grupo), JSON.stringify(payload)); } catch(e){}
      agendarReenvio();
    }
    function limparPendente(){
      syncPendente = false;
      try { localStorage.removeItem(chavePendente(estado.sessao, estado.grupo)); } catch(e){}
    }
    function lerPendente(){
      try { return JSON.parse(localStorage.getItem(chavePendente(estado.sessao, estado.grupo)) || "null"); }
      catch(e){ return null; }
    }
    function agendarReenvio(){
      if (reenvioTimer) return;
      reenvioTimer = setInterval(async function(){
        var pend = lerPendente();
        if (!pend){ clearInterval(reenvioTimer); reenvioTimer = null; return; }
        if (!(window.SB && SB.configValida())) return;
        try {
          var r = await SB.enviarResultado(pend);
          if (r.ok){ limparPendente(); clearInterval(reenvioTimer); reenvioTimer = null; refletirSync(); }
        } catch(e){ /* segue tentando no próximo tick */ }
      }, 8000);
    }
    async function enviar(payload){
      if (MODO !== "aula"){ return; }   // treino calcula só na tela; nada vai ao Supabase
      try {
        if (!(window.SB && SB.configValida())){ guardarPendente(payload); return; }
        var r = await SB.enviarResultado(payload);
        if (r.ok) limparPendente(); else guardarPendente(payload);
      } catch(e){ guardarPendente(payload); }
      refletirSync();
    }
    function salvarProgresso(){
      salvarLocal();
      enviar(montarPayload());
    }

    /* ---- Navegação entre telas ---- */
    function show(sectionId){
      document.querySelectorAll(".wrap > .step").forEach(function(s){ s.classList.remove("active"); });
      document.getElementById(sectionId).classList.add("active");
      window.scrollTo({top:0, behavior:"smooth"});
    }

    /* ---- Identidade compartilhada (lê do hub; sem login próprio) ---- */
    var CTX = AULA.exigir();          // {modo, sessao, grupo} ou redireciona ao hub
    var MODO = CTX ? CTX.modo : "aula";
    var aulaUnsub = null, aulaEstadoAtual = null, ordemOpcoes = {}, aulaSomItem = -1;
    if (CTX) { if (MODO === "aula") aulaBoot(); else bootAtividade(); }

    /* =========================================================================
       MODO AULA — LOCKSTEP (Peer Instruction), guiado pelo PONTEIRO.
       Sem palpite. Por item: responder (voto) → resultado. PONTUA O VOTO.
       O professor controla o avanço; o aluno só segue.
       ========================================================================= */
    function aulaBoot(){
      SFX.montarBotaoMudo();
      estado.sessao = CTX.sessao; estado.grupo = CTX.grupo;
      var salvo = lerEstadoSalvo(CTX.sessao, CTX.grupo);
      if (salvo && Array.isArray(salvo.respostas)) estado.respostas = salvo.respostas;
      if (salvo) estado.epoca = salvo.epoca;   // p/ retomar a MESMA rodada (mesma época) sem zerar
      salvarLocal();                  // registra PRESENÇA: o painel conta este grupo na sala de espera
      enviar(montarPayloadAula());    // presença também no backend (no-op no modo local)
      var eb = document.getElementById("evocaBox"); if (eb) eb.style.display = "none";
      document.getElementById("nextRow").classList.add("hidden");
      aulaEspera();   // começa na sala de espera (defensivo: nunca fica em branco)
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

    function aulaScore(ateK){ var s=0; for (var i=0;i<=ateK && i<TOTAL;i++){ var r=estado.respostas[i]; if (r && r.correto1) s++; } return s; }

    function aulaEspera(){
      document.getElementById("esperaGrupo").textContent = estado.grupo;
      document.getElementById("esperaSessao").textContent = estado.sessao;
      show("espera");
    }

    /* Ordem das opções EMBARALHADA por item (a correta não fica sempre na 1ª).
       Cacheada por item: estável dentro da questão; recriada a cada rodada. */
    function opcoesEmb(it){ if (!ordemOpcoes[it.id]) ordemOpcoes[it.id] = embaralhar(it.opcoes); return ordemOpcoes[it.id]; }

    function aulaOpcoesClicaveis(it, onPick){
      var box = document.getElementById("opcoesBox"); box.innerHTML = "";
      opcoesEmb(it).forEach(function(o){
        var b = document.createElement("button"); b.className="opt"; b.dataset.k=o.chave;
        b.innerHTML = "<b>" + o.label + "</b>";
        b.addEventListener("click", function(){ SFX.click(); onPick(o.chave); });
        box.appendChild(b);
      });
    }
    function aulaOpcoesTravadas(it, escolha, correta, mostrarCorreta){
      var box = document.getElementById("opcoesBox"); box.innerHTML = "";
      opcoesEmb(it).forEach(function(o){
        var b = document.createElement("button"); b.className="opt"; b.disabled=true; b.dataset.k=o.chave;
        b.innerHTML = "<b>" + o.label + "</b>";
        if (mostrarCorreta && o.chave===correta) b.classList.add("correct");
        if (o.chave===escolha) b.classList.add( (mostrarCorreta && escolha!==correta) ? "wrong" : "sel" );
        box.appendChild(b);
      });
    }

    function aulaRender(p){
      aulaStatus("sync " + PONTEIRO.modo() + " · sessão " + estado.sessao + " · " + (p ? ("Q" + (p.item+1) + " " + p.fase) : "aguardando"));
      if (p && p.fase === "reset"){    // professor encerrou a sessão → volta à tela inicial
        if (aulaUnsub){ aulaUnsub(); aulaUnsub=null; }
        AULA.limpar(); location.href = "index.html"; return;
      }
      if (!p){ aulaEspera(); return; }
      if (p.epoca !== estado.epoca){   // (re)início de rodada (época nova) → zera os votos deste grupo
        estado.epoca = p.epoca; estado.respostas = []; salvarLocal();
        Object.keys(ordemOpcoes).forEach(function(k){ delete ordemOpcoes[k]; });   // reembaralha as opções na nova rodada
        aulaSomItem = -1;
      }
      if (p.fase === "fim"){ if (aulaUnsub){ aulaUnsub(); aulaUnsub=null; } montarSinteseAula(); show("synth"); return; }
      aulaEstadoAtual = p;
      var K = p.item, it = ITENS[K];
      if (!it){ aulaEspera(); return; }
      show("loop");
      document.getElementById("caseCounter").textContent = UNIDADE + " " + (K+1) + " de " + TOTAL;
      document.getElementById("progressBar").style.width = (K/TOTAL*100)+"%";
      document.getElementById("itemVinheta").innerHTML = it.vinheta;
      document.getElementById("discrimBox").classList.remove("hidden");
      var reveal = document.getElementById("revealBox");
      var h3 = document.querySelector("#discrimBox h3");
      var r = estado.respostas[K] || {};

      if (p.fase === "responder"){
        reveal.classList.add("hidden");
        if (r.escolha1){ aulaOpcoesTravadas(it, r.escolha1, null, false); h3.textContent = "✅ Voto registrado — aguardem a turma."; }
        else { aulaOpcoesClicaveis(it, function(ch){ aulaVotar(K,ch); }); h3.textContent = "Escolham a resposta do grupo."; }
        document.getElementById("scoreVal").textContent = aulaScore(K-1);
      } else if (p.fase === "resultado"){
        aulaOpcoesTravadas(it, r.escolha1, it.correta, true);
        h3.textContent = "Resultado";
        var corrLabel = (it.opcoes.find(function(o){ return o.chave===it.correta; })||{}).label || "";
        var fb = document.getElementById("aulaFeedback");
        if (!r.escolha1){ fb.className = "fb neutro"; fb.innerHTML = "Vocês não votaram. A resposta certa: <b>" + corrLabel + "</b>."; }
        else if (r.escolha1 === it.correta){ fb.className = "fb ok"; fb.innerHTML = "✓ Vocês acertaram!"; }
        else { fb.className = "fb erro"; fb.innerHTML = "✗ Não foi dessa vez — a resposta certa era <b>" + corrLabel + "</b>."; }
        fb.style.display = "";
        if (aulaSomItem !== K){            // toca o som do veredito UMA vez ao revelar
          aulaSomItem = K;
          if (r.escolha1){ (r.escolha1 === it.correta) ? SFX.acerto() : SFX.erro(); }
        }
        document.getElementById("revNota").textContent = NOTA_REVELACAO;
        var saidv = reveal.querySelector(".saidv"); if (saidv) saidv.style.display = "none";
        document.getElementById("revFronteira").innerHTML = it.fronteira;
        document.getElementById("revLink").href = it.roteiro;
        reveal.classList.remove("hidden");
        document.getElementById("scoreVal").textContent = aulaScore(K);
      }
    }

    function aulaVotar(K, chave){
      var it = ITENS[K];
      var r = estado.respostas[K] || { item_id: it.id };
      r.escolha1 = chave; r.correto1 = (chave === it.correta);
      estado.respostas[K] = r;
      salvarLocal();
      enviar(montarPayloadAula());
      if (aulaEstadoAtual) aulaRender(aulaEstadoAtual);
    }

    function montarPayloadAula(){
      var itens = estado.respostas
        .filter(function(r){ return r && typeof r.escolha1 === "string"; })
        .map(function(r){ return { item_id:r.item_id, escolha1:r.escolha1, correto1:r.correto1 }; });
      var pontuacao = itens.filter(function(it){ return it.correto1; }).length;
      return { sessao:estado.sessao, atividade:ATIVIDADE, grupo:estado.grupo, pontuacao:pontuacao, dados:{ itens:itens } };
    }

    function montarSinteseAula(){
      document.getElementById("progressBar").style.width = "100%";
      document.getElementById("synthGroup").textContent = estado.grupo;
      var score = aulaScore(TOTAL-1);
      document.getElementById("synthScore").textContent = score;
      var _st = document.getElementById("synthTotal"); if (_st) _st.textContent = TOTAL;
      document.getElementById("synthBadge").innerHTML = '<span class="badge">' + medalha(score, TOTAL) + '</span>';
      var list = document.getElementById("synthList"); list.innerHTML = "";
      estado.respostas.forEach(function(r,i){
        if (!r) return;
        var it = ITENS[i];
        var lbl = function(ch){ return (it.opcoes.find(function(o){ return o.chave===ch; })||{}).label || "—"; };
        var div = document.createElement("div"); div.className = "item";
        var b = document.createElement("b"); b.textContent = (i+1) + ". " + lbl(it.correta);
        var l1 = document.createElement("div"); l1.appendChild(b);
        var l2 = document.createElement("div"); l2.className = "small";
        l2.innerHTML = (r.correto1 ? "✓" : "✗") + " " + escapeHtml(lbl(r.escolha1));
        div.appendChild(l1); div.appendChild(l2); list.appendChild(div);
      });
      refletirSync();
      enviar(montarPayloadAula());
      AULA.marcarConcluida(estado.sessao, estado.grupo, ATIVIDADE);
      ajustarBotoesFim();
    }

    /* =========================================================================
       MODO TREINO — self-paced (com evocação/palpite). Não envia ao Supabase.
       ========================================================================= */
    function bootAtividade(){
      SFX.montarBotaoMudo();
      estado.sessao = CTX.sessao;
      estado.grupo  = CTX.grupo;
      var salvo = lerEstadoSalvo(CTX.sessao, CTX.grupo);
      var concluidos = salvo && Array.isArray(salvo.respostas)
        ? salvo.respostas.filter(function(r){ return r && typeof r.escolha === "string"; }).length : 0;

      if (concluidos >= TOTAL){    // concluída → síntese
        Object.assign(estado, { respostas:salvo.respostas.slice(0,TOTAL), score:salvo.score||0, idx:TOTAL });
        montarSintese(); show("synth"); return;
      }
      if (concluidos > 0){         // retoma de onde parou
        Object.assign(estado, { respostas:salvo.respostas.slice(0,concluidos), score:salvo.score||0, idx:concluidos });
        show("loop"); carregarItem(); return;
      }
      show("intro");               // começo do zero: mostra a abertura instrucional
    }

    var startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.addEventListener("click", function(){
      limparLocal(estado.sessao, estado.grupo);
      Object.assign(estado, { idx:0, score:0, respostas:[] });
      syncPendente = false;
      SFX.click();
      show("loop"); carregarItem();
    });

    function carregarItem(){
      var it = ITENS[estado.idx];
      document.getElementById("caseCounter").textContent = UNIDADE + " " + (estado.idx+1) + " de " + TOTAL;
      document.getElementById("progressBar").style.width = (estado.idx/TOTAL*100)+"%";
      document.getElementById("scoreVal").textContent = estado.score;
      document.getElementById("itemVinheta").innerHTML = it.vinheta; // HTML confiável (data)

      document.getElementById("revealBox").classList.add("hidden");
      document.getElementById("nextRow").classList.add("hidden");
      document.getElementById("opcoesBox").innerHTML = "";
      estado._palpiteTmp = "";

      if (USA_PALPITE){
        // fase 1: evocação (reset) — só aparece após "Confirmar palpite"
        var pal = document.getElementById("palpite");
        if (pal){ pal.value = ""; pal.readOnly = false; }
        var pe = document.getElementById("palpiteErro"); if (pe) pe.style.display = "none";
        var cb = document.getElementById("confirmPalpiteBtn"); if (cb) cb.disabled = true;
        document.getElementById("discrimBox").classList.add("hidden");
      } else {
        // lightning round (sem palpite): vai direto às opções
        renderOpcoes();
        document.getElementById("discrimBox").classList.remove("hidden");
      }

      show("loop");
    }

    var palpiteInput = document.getElementById("palpite");
    if (palpiteInput) palpiteInput.addEventListener("input", function(){
      document.getElementById("palpiteErro").style.display = "none";
      document.getElementById("confirmPalpiteBtn").disabled =
        document.getElementById("palpite").value.trim().length === 0;
    });

    var confirmBtn = document.getElementById("confirmPalpiteBtn");
    if (confirmBtn) confirmBtn.addEventListener("click", function(){
      var pal = document.getElementById("palpite");
      var v = pal.value.trim();
      if (!v){
        document.getElementById("palpiteErro").textContent = "Escrevam um palpite antes de ver as opções.";
        document.getElementById("palpiteErro").style.display = "block"; return;
      }
      estado._palpiteTmp = v;
      pal.readOnly = true;                                  // trava a evocação
      document.getElementById("confirmPalpiteBtn").disabled = true;
      renderOpcoes();
      document.getElementById("discrimBox").classList.remove("hidden");
    });

    function renderOpcoes(){
      var it = ITENS[estado.idx];
      var box = document.getElementById("opcoesBox"); box.innerHTML = "";
      embaralhar(it.opcoes).forEach(function(o){                    // ORDEM embaralhada
        var b = document.createElement("button");
        b.className = "opt"; b.dataset.k = o.chave;
        b.innerHTML = "<b>" + o.label + "</b>";
        b.addEventListener("click", function(){ escolher(o.chave); });
        box.appendChild(b);
      });
    }

    function escolher(chave){
      var it = ITENS[estado.idx];
      var correto = (chave === it.correta);

      // trava as opções; destaca a correta (e a escolha errada, se for o caso)
      document.querySelectorAll("#opcoesBox .opt").forEach(function(b){
        b.disabled = true;
        if (b.dataset.k === it.correta) b.classList.add("correct");
        if (b.dataset.k === chave && !correto) b.classList.add("wrong");
      });

      if (correto){ estado.score += 1; SFX.acerto(); } else { SFX.erro(); }
      document.getElementById("scoreVal").textContent = estado.score;

      var correctLabel = it.opcoes.find(function(o){ return o.chave === it.correta; }).label;
      estado.respostas[estado.idx] = { item_id: it.id, palpite: estado._palpiteTmp, escolha: chave, correto: correto };

      // revelação
      document.getElementById("revNota").textContent = NOTA_REVELACAO;
      var se = document.getElementById("saidEvoca"); if (se) se.textContent = estado._palpiteTmp; // texto do grupo → escapado (ausente no lightning)
      document.getElementById("saidTermo").textContent = correctLabel;
      document.getElementById("revFronteira").innerHTML = it.fronteira;       // HTML confiável (data)
      document.getElementById("revLink").href = it.roteiro;

      document.getElementById("nextBtn").textContent =
        (estado.idx >= TOTAL-1) ? "Ver a síntese →" : ROT_PROXIMO;

      document.getElementById("revealBox").classList.remove("hidden");
      document.getElementById("nextRow").classList.remove("hidden");

      salvarProgresso(); // item concluído → salva local + envia estado cumulativo (upsert)
    }

    var nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.addEventListener("click", function(){
      SFX.click();
      estado.idx++;
      if (estado.idx >= TOTAL){ montarSintese(); show("synth"); }
      else carregarItem();
    });

    /* Botões do fim: em aula, read-only + volta ao campeonato; em treino, refaz. */
    function ajustarBotoesFim(){
      var restart = document.getElementById("restartBtn");
      var voltar  = document.getElementById("voltarHub");
      if (!restart || !voltar) return;
      if (MODO === "aula"){ restart.style.display = "none"; voltar.style.display = ""; voltar.textContent = "Voltar ao campeonato →"; }
      else { restart.style.display = ""; voltar.style.display = ""; voltar.textContent = "Voltar às atividades →"; }
    }

    /* ---- Síntese (treino) ---- */
    function montarSintese(){
      document.getElementById("progressBar").style.width = "100%";
      document.getElementById("synthGroup").textContent = estado.grupo;
      document.getElementById("synthScore").textContent = estado.score;
      var _st = document.getElementById("synthTotal"); if (_st) _st.textContent = TOTAL;

      document.getElementById("synthBadge").innerHTML = '<span class="badge">' + medalha(estado.score, TOTAL) + '</span>';

      // lista: item → palpite digitado → termo correto
      var list = document.getElementById("synthList"); list.innerHTML = "";
      estado.respostas.forEach(function(r,i){
        var it = ITENS[i];
        var correctLabel = it.opcoes.find(function(o){ return o.chave === it.correta; }).label;
        var escolhaLabel = (it.opcoes.find(function(o){ return o.chave === r.escolha; }) || {}).label || "—";
        var acerto = r.correto ? "✓" : "✕";
        var div = document.createElement("div"); div.className = "item";
        var b = document.createElement("b"); b.textContent = (i+1) + ". " + correctLabel;
        var linha1 = document.createElement("div"); linha1.appendChild(b);
        var linha2 = document.createElement("div"); linha2.className = "small muted";
        linha2.textContent = "Palpite de vocês: “" + r.palpite + "”";
        var linha3 = document.createElement("div"); linha3.className = "small";
        linha3.innerHTML = "Escolha: " + acerto + " " + escapeHtml(escolhaLabel);
        div.appendChild(linha1); div.appendChild(linha2); div.appendChild(linha3);
        list.appendChild(div);
      });

      refletirSync();   // estado otimista; enviar() corrige se falhar
      salvarProgresso();
      if (MODO === "aula") AULA.marcarConcluida(estado.sessao, estado.grupo, ATIVIDADE);
      ajustarBotoesFim();
    }

    /* ---- Refazer (treino): recomeça o MESMO grupo/sessão ---- */
    var restartBtn = document.getElementById("restartBtn");
    if (restartBtn) restartBtn.addEventListener("click", function(){
      if (!confirm("Isto recomeça do zero. Tem certeza?")) return;
      limparLocal(estado.sessao, estado.grupo);
      if (reenvioTimer){ clearInterval(reenvioTimer); reenvioTimer = null; }
      syncPendente = false;
      estado.idx = 0; estado.score = 0; estado.respostas = []; estado._palpiteTmp = "";
      carregarItem();
    });
  }

  global.AtividadeMC = { init: init };
})(window);
