/* =============================================================================
   PAINEL GENÉRICO — lockstep da Rodada 3 "Dimensões do delírio"
   Mesma condução das demais (lobby com presença de sessão → Votação → Resultado),
   mas a mecânica é dimensional: o "voto" é a classificação das 5 dimensões; o
   "resultado" mostra a DIVERGÊNCIA da turma — por dimensão, uma barra B/M/A com a
   banda de referência sobreposta. Reaproveita a viz da R3 self-paced.

   A página fornece o esqueleto + cfg: PainelDimensoes.init({ data: DIMENSOES_DATA }).
   ============================================================================= */
(function (global) {
  "use strict";

  function init(cfg){
    var DATA = cfg.data, ATIVIDADE = cfg.atividade || "dimensoes";
    var CASOS = DATA.CASOS, DIMENSOES = DATA.DIMENSOES, NIVEIS = DATA.NIVEIS, TOTAL = CASOS.length;
    var MAX_PONTOS = CASOS.reduce(function(s,c){ return s + DIMENSOES.filter(function(d){ return d.pontua && c.banda && c.banda[d.chave]; }).length; }, 0);
    var FASE_LABEL = { responder:"Classificação", resultado:"Resultado" };

    function rotuloAvancar(fase, K){
      if (fase==="responder") return "Mostrar a divergência ▸";
      if (fase==="resultado") return (K < TOTAL-1) ? "Próximo caso ▸" : "Ver a classificação ▸";
      return "Avançar ▸";
    }
    var ALFA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    var _ac=null, bipItem=-1, nGrupos=0;
    function primeAudio(){ try{ _ac = _ac || new (window.AudioContext||window.webkitAudioContext)(); if(_ac.state==='suspended') _ac.resume(); }catch(e){} }
    function bip(){ try{ primeAudio(); [660,880].forEach(function(f,i){ var o=_ac.createOscillator(), g=_ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(_ac.destination); var t=_ac.currentTime+i*0.12; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.02); g.gain.linearRampToValueAtTime(0,t+0.22); o.start(t); o.stop(t+0.26); }); }catch(e){} }

    /* ---- Sessão ---- */
    function gerarCodigo(){ var s=""; for(var i=0;i<5;i++) s+=ALFA[Math.floor(Math.random()*ALFA.length)]; return s; }
    var sessaoKey = "painel-aula-sessao", sessao = "";   // UM código para o campeonato inteiro (compartilhado)
    function setSessao(s){ sessao=s; try{localStorage.setItem(sessaoKey,s);}catch(e){} document.getElementById("codigoBig").textContent=s; }
    (function(){ var s=""; try{s=localStorage.getItem(sessaoKey)||"";}catch(e){} setSessao(s||gerarCodigo()); })();
    document.getElementById("modoTag").textContent = "(sincronização: "+PONTEIRO.modo()+")";

    var estadoP = null;
    var fimRenderizado = false, TITULO = (document.querySelector("h1") || {}).textContent || "Classificação";
    function definir(e){ estadoP=e; PONTEIRO.definir(sessao, ATIVIDADE, e); render(); }
    function novaEpoca(){ return Date.now(); }
    document.getElementById("iniciarBtn").addEventListener("click", function(){ primeAudio(); bipItem=-1; nGrupos=gruposLobby().length; definir({item:0, fase:"responder", epoca:novaEpoca()}); });
    document.getElementById("avancarBtn").addEventListener("click", function(){ primeAudio(); definir(PONTEIRO.proxima(estadoP, TOTAL)); });

    function encerrarSessao(){
      if (!confirm("Encerrar a sessão?\n\nIsto remove TODOS os grupos, apaga os votos e gera um NOVO código. Os alunos voltam à tela inicial. Não dá para desfazer.")) return;
      var antiga = sessao;
      PONTEIRO.definir(antiga, ATIVIDADE, { fase:"reset", epoca:novaEpoca() });
      setSessao(gerarCodigo()); estadoP=null; nGrupos=0; bipItem=-1; render(); assinarRespostas();
      var prefEstado = ATIVIDADE + ":estado:" + antiga + ":", prefLobby = "_lobby:estado:" + antiga + ":", chavePonteiro = "ponteiro:" + antiga + ":" + ATIVIDADE;
      setTimeout(function(){
        Object.keys(localStorage).filter(function(k){ return k.indexOf(prefEstado)===0 || k.indexOf(prefLobby)===0 || k===chavePonteiro; }).forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
      }, 2500);
    }
    document.getElementById("encerrarBtn").addEventListener("click", encerrarSessao);
    document.getElementById("novoCodigo").addEventListener("click", function(){ setSessao(gerarCodigo()); estadoP=null; render(); assinarRespostas(); });

    /* ---- Leitura dos grupos ---- */
    var SB_ON = !!(window.SB && SB.configValida());
    var gruposCache = [], lobbyCache = [];
    async function pollSupabase(){
      if (!SB_ON) return;
      try{
        var rows = await SB.consultarSessao(sessao, ATIVIDADE);
        gruposCache = rows.map(function(r){ return { grupo:r.grupo, casos:(r.dados&&r.dados.casos)||[] }; });
        var lob = await SB.consultarSessao(sessao, "_lobby");
        lobbyCache = lob.map(function(r){ return { grupo:r.grupo }; });
        render();
      }catch(e){}
    }
    /* Realtime das respostas (votos E entradas no _lobby): refresh imediato; o poll
       de 1,5s fica como rede de segurança. Re-assina quando o código muda. */
    var subResp = null, pollPedido = null;
    function pollDebounced(){ if (pollPedido) return; pollPedido = setTimeout(function(){ pollPedido = null; pollSupabase(); }, 250); }
    function assinarRespostas(){
      if (!SB_ON || !window.RT) return;
      if (subResp){ try{ subResp(); }catch(e){} subResp = null; }
      subResp = RT.assinar({ table:"respostas", sessao:sessao, topico:"resp:"+sessao+":"+ATIVIDADE, tokenFn: SB.getAuthToken, onChange: pollDebounced });
    }

    function gruposLobby(){
      if (SB_ON) return lobbyCache;
      var pre = "_lobby:estado:" + sessao + ":", out=[], vistos={};
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if (k && k.indexOf(pre)===0){
          try{ var v=JSON.parse(localStorage.getItem(k)); if(v&&v.grupo && !vistos[v.grupo]){ vistos[v.grupo]=1; out.push({grupo:v.grupo}); } }catch(e){}
        }
      }
      return out;
    }
    function gruposLocal(){
      if (SB_ON) return gruposCache;
      var pre = ATIVIDADE + ":estado:" + sessao + ":", out=[];
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if (k && k.indexOf(pre)===0){
          try{ var v=JSON.parse(localStorage.getItem(k)); if(v&&v.grupo) out.push({grupo:v.grupo, casos:(v.respostas||[]).filter(Boolean)}); }catch(e){}
        }
      }
      return out;
    }
    function ratingsDe(grupo, caso_id){
      var arr = grupo.casos || [];
      for (var i=0;i<arr.length;i++){ if (arr[i].caso_id === caso_id) return arr[i].ratings || null; }
      return null;
    }
    function votouNoCaso(grupo, caso_id){
      var r = ratingsDe(grupo, caso_id);
      return !!(r && Object.keys(r).length === DIMENSOES.length);
    }
    function contarVotantes(caso_id){
      var grupos = gruposLocal(), n = 0;
      grupos.forEach(function(g){ if (votouNoCaso(g, caso_id)) n++; });
      return n;
    }
    /* Contagem por nível, para um caso+dimensão (a divergência). */
    function contarDim(caso_id, dimChave){
      var grupos = gruposLocal(), m = { baixa:0, media:0, alta:0 }, total = 0;
      grupos.forEach(function(g){ var r = ratingsDe(g, caso_id); if (r && r[dimChave]){ m[r[dimChave]] = (m[r[dimChave]]||0)+1; total++; } });
      return { m:m, total:total };
    }
    function nivelLabel(chave){ var n = NIVEIS.find(function(x){ return x.chave===chave; }); return n ? n.label : chave; }

    /* ---- Navegação entre rodadas (no pódio): próxima rodada + mapa ---- */
    function proximaRodada(){
      var lista = window.HUB_ATIVIDADES || [], idx = -1;
      for (var i=0;i<lista.length;i++){ if (lista[i].id===ATIVIDADE){ idx=i; break; } }
      if (idx<0 || idx+1>=lista.length) return null;
      var nxt = lista[idx+1];
      return (nxt && nxt.painel) ? nxt : null;
    }
    function navRodadas(){
      var prox = proximaRodada();
      return '<div style="text-align:center;margin-top:26px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">'+
        '<button class="btn ghost" onclick="location.href=\'painel-mapa.html\'">▣ Mapa das rodadas</button>'+
        (prox
          ? '<button class="btn" onclick="location.href=\''+prox.painel+'\'">Próxima rodada: '+prox.titulo+' ▸</button>'
          : '<span class="small muted" style="align-self:center">Próximas rodadas em construção</span>')+
      '</div>';
    }

    /* ---- Classificação da rodada (placar dos grupos por pontos de banda) ---- */
    function pontosDoCaso(caso_id, ratings){
      var caso = CASOS.find(function(c){ return c.id === caso_id; });
      if (!caso || !caso.banda || !ratings) return 0;
      var p = 0;
      DIMENSOES.forEach(function(d){ if (!d.pontua) return; var b = caso.banda[d.chave]; if (b && ratings[d.chave] && b.indexOf(ratings[d.chave])!==-1) p++; });
      return p;
    }
    function scoreGrupo(g){ return (g.casos||[]).reduce(function(s,c){ return s + pontosDoCaso(c.caso_id, c.ratings); }, 0); }
    function rankingDados(){
      var votos = gruposLocal(), byName = {};
      votos.forEach(function(g){ byName[g.grupo] = g; });
      var nomes = {};
      gruposLobby().forEach(function(g){ nomes[g.grupo] = 1; });
      votos.forEach(function(g){ nomes[g.grupo] = 1; });
      return Object.keys(nomes).map(function(nome){ return { grupo: nome, pontos: byName[nome] ? scoreGrupo(byName[nome]) : 0 }; });
    }

    /* ---- Render ---- */
    function render(){
      var ini=document.getElementById("iniciarBtn"), av=document.getElementById("avancarBtn"),
          ft=document.getElementById("faseTag"), cr=document.getElementById("contadorResp"), palco=document.getElementById("palco");
      if (!estadoP){
        fimRenderizado = false;
        ini.style.display=""; av.style.display="none"; ft.style.display="none"; cr.textContent="";
        var gs = gruposLobby();
        palco.innerHTML = '<div class="card" style="text-align:center">'+
          '<h3 style="font-family:var(--font-serif); margin:0 0 6px">Sala de espera</h3>'+
          '<div style="font-family:var(--font-mono); font-size:3.4rem; color:var(--brand); line-height:1">'+gs.length+'</div>'+
          '<p class="small muted" style="margin:4px 0 0">grupo(s) entraram'+(gs.length ? ': '+gs.map(function(g){return esc(g.grupo);}).join(' · ') : '')+'</p>'+
          '<p class="small muted" style="margin:12px 0 0">Quando todos tiverem entrado, clique em <b>Iniciar rodada</b>.</p>'+
        '</div>';
        return;
      }
      if (estadoP.fase!=="fim") fimRenderizado = false;
      ini.style.display="none"; av.style.display=""; ft.style.display="";
      if (estadoP.fase==="fim"){
        ft.textContent="Classificação"; av.disabled=true; cr.textContent="";
        var rk = rankingDados(); if (!fimRenderizado && rk.length){ fimRenderizado = true; Podio.render(palco, { grupos: rk, max: MAX_PONTOS, titulo: "🏆 " + TITULO, sub: "Pontos nas dimensões com banda", festa: true }); palco.insertAdjacentHTML("beforeend", navRodadas()); }
        return;
      }
      av.disabled=false;
      var K=estadoP.item, caso=CASOS[K];
      if (!caso){ estadoP=null; render(); return; }   // ponteiro obsoleto/fora de faixa → volta ao lobby
      ft.textContent = "Caso " + (K+1) + "/" + TOTAL + " · " + FASE_LABEL[estadoP.fase];
      av.textContent = rotuloAvancar(estadoP.fase, K);

      var html = '<div class="card"><div class="muted small" style="font-family:var(--font-mono)">Caso '+caso.id+' · '+esc(caso.nome)+'</div>'+
                 '<p class="vinheta" style="margin-top:8px">'+caso.vinheta+'</p></div>';

      if (estadoP.fase==="responder"){
        var N=nGrupos || gruposLobby().length, v=contarVotantes(caso.id);   // após reload, nGrupos=0 → usa o roster vivo
        var todos = (N>0 && v>=N);
        if (todos && bipItem!==K){ bip(); bipItem=K; }
        ft.style.background = todos ? "var(--live-soft)" : "";
        ft.style.color      = todos ? "var(--live)" : "";
        ft.style.borderColor= todos ? "var(--live)" : "";
        cr.textContent = v + "/" + N + " classificaram";
        html += '<div class="big-status">'+
          (todos
            ? '<span style="color:var(--live)">✓ Todos classificaram — '+v+'/'+N+'</span><br><span class="small muted">Pode mostrar a divergência quando quiser.</span>'
            : 'Aguardando as classificações… <b>'+v+' / '+N+'</b><br><span class="small muted">Soa um sinal quando todos os grupos enviarem.</span>')+
          '</div>';
      } else if (estadoP.fase==="resultado"){
        cr.textContent="";
        ft.style.background=""; ft.style.color=""; ft.style.borderColor="";
        html += '<div class="card">'+ legenda() + divergencia(caso) +
                '<div class="fronteira" style="margin-top:14px"><b>Para discutir agora:</b> '+ (caso.discussao || esc(DATA.NOTA)) +'</div></div>';
      }
      palco.innerHTML = html;
    }

    function legenda(){
      return '<div class="dg-leg">' +
        '<span><span class="dg-sw-exp"></span>faixa esperada</span>' +
        '<span><span class="dg-sw-bar"></span>quantos grupos caíram em cada nível</span>' +
        '<span class="muted">coluna = nível · barra/número = nº de grupos</span>' +
        '</div>';
    }
    /* Grade fixa Baixa|Média|Alta por dimensão: a faixa esperada (verde) fica
       SEMPRE visível — mesmo vazia — e a contagem mostra onde a turma caiu. */
    function divergencia(caso){
      var algum = gruposLocal().some(function(g){ return ratingsDe(g, caso.id); });
      if (!algum) return '<div class="dim-empty">— sem classificações ainda —</div>';
      var rows = DIMENSOES.map(function(d){
        var c = contarDim(caso.id, d.chave);
        var banda = (caso.banda && caso.banda[d.chave]) || null;
        var pontua = d.pontua && banda;
        var cells = NIVEIS.map(function(n){
          var qt = c.m[n.chave] || 0;
          var h = c.total ? Math.round(qt / c.total * 100) : 0;
          var isBand = pontua && banda.indexOf(n.chave) !== -1;
          return '<div class="dg-cell' + (isBand ? " exp" : "") + '">' +
            (isBand ? '<span class="dg-mk">✓</span>' : '') +
            '<span class="dg-bar" style="height:' + h + '%"></span>' +
            '<span class="dg-cnt">' + qt + '</span></div>';
        }).join("");
        var verd;
        if (!pontua){ verd = '<span class="dg-verd v-disc">discussão</span>'; }
        else {
          var inBand = 0; banda.forEach(function(k){ inBand += (c.m[k] || 0); });
          var ratio = c.total ? inBand / c.total : 0;
          if (inBand === 0)        verd = '<span class="dg-verd v-fora">fora da faixa</span>';
          else if (ratio >= 0.67)  verd = '<span class="dg-verd v-na">na faixa</span>';
          else                     verd = '<span class="dg-verd v-div">dividido</span>';
        }
        return '<div class="dg-name">' + esc(d.nome) + '<span class="dg-tag">' + (pontua ? "pontua" : "discussão") + '</span></div>' +
          cells + verd;
      }).join("");
      return '<div class="dg-grid">' +
        '<div></div><div class="dg-colh">Baixa</div><div class="dg-colh">Média</div><div class="dg-colh">Alta</div><div></div>' +
        rows + '</div>';
    }
    function esc(s){ return String(s).replace(/[&<>\"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

    /* Retoma a rodada em curso após reload (não volta ao lobby; "fim" reabre o pódio). */
    function restaurar(){
      PONTEIRO.ler(sessao, ATIVIDADE).then(function(e){
        if (estadoP===null && e && e.fase && e.fase!=="reset"){ estadoP = e; render(); }
      }).catch(function(){});
    }

    window.addEventListener("storage", function(){ render(); });
    setInterval(function(){ if(!estadoP || estadoP.fase!=="fim") render(); }, 1200);
    if (SB_ON){ setInterval(pollSupabase, 1500); assinarRespostas(); }            // poll de segurança + Realtime (refresh instantâneo)
    render();
    restaurar();
  }

  global.PainelDimensoes = { init: init };
})(window);
