/* =============================================================================
   PAINEL GENÉRICO — lockstep (Peer Instruction) para rodadas de MÚLTIPLA ESCOLHA
   Compartilhado por R1 "Nomear", R2 "Fronteiras"… O professor conduz a turma
   questão a questão: Votação → Resultado. A página fornece só o ESQUELETO HTML
   (mesmos ids) + um cfg; este lib roda a condução.

   Lê os votos dos grupos do Supabase (poll, cross-device) OU do localStorage
   (piloto local, testável numa máquina só). Escreve o PONTEIRO (estado da turma).

   Uso na página (depois de supabase-config/supabase/ponteiro + o data-file):
     PainelMC.init({ data: window.NOMEAR_DATA, atividade:"nomear", unidade:"Fenômeno" });
   ============================================================================= */
(function (global) {
  "use strict";

  function init(cfg){
    var ITENS = cfg.data.ITENS, TOTAL = ITENS.length, ATIVIDADE = cfg.atividade;
    var UNIDADE = cfg.unidade || "Item";
    var FASE_LABEL = { responder:"Votação", resultado:"Resultado" };

    /* O botão diz o que o PRÓXIMO clique fará. */
    function rotuloAvancar(fase, K){
      if (fase==="responder") return "Mostrar os resultados ▸";
      if (fase==="resultado") return (K < TOTAL-1) ? "Próxima questão ▸" : "Ver a classificação ▸";
      return "Avançar ▸";
    }
    var ALFA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    /* Nº de grupos (capturado da sala de espera no Iniciar) + sinal de "todos votaram". */
    var _ac=null, bipItem=-1, nGrupos=0;
    function primeAudio(){ try{ _ac = _ac || new (window.AudioContext||window.webkitAudioContext)(); if(_ac.state==='suspended') _ac.resume(); }catch(e){} }
    function bip(){ try{ primeAudio(); [660,880].forEach(function(f,i){ var o=_ac.createOscillator(), g=_ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(_ac.destination); var t=_ac.currentTime+i*0.12; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.02); g.gain.linearRampToValueAtTime(0,t+0.22); o.start(t); o.stop(t+0.26); }); }catch(e){} }
    function numGrupos(){ return nGrupos || gruposLobby().length; }   // após reload, nGrupos=0 → usa o roster vivo

    /* ---- Sessão (código) ---- */
    function gerarCodigo(){ var s=""; for(var i=0;i<5;i++) s+=ALFA[Math.floor(Math.random()*ALFA.length)]; return s; }
    var sessaoKey = "painel-aula-sessao";   // UM código para o campeonato inteiro (compartilhado por todos os painéis)
    var sessao = "";
    function setSessao(s){ sessao=s; try{localStorage.setItem(sessaoKey,s);}catch(e){} document.getElementById("codigoBig").textContent=s; }
    (function initSessao(){ var s=""; try{s=localStorage.getItem(sessaoKey)||"";}catch(e){} setSessao(s||gerarCodigo()); })();
    document.getElementById("modoTag").textContent = "(sincronização: "+PONTEIRO.modo()+")";

    /* ---- Estado do ponteiro (o painel é quem escreve) ---- */
    var estadoP = null;
    var fimRenderizado = false, TITULO = (document.querySelector("h1") || {}).textContent || "Classificação";
    function definir(e){ estadoP=e; PONTEIRO.definir(sessao, ATIVIDADE, e); render(); }

    function novaEpoca(){ return Date.now(); }   // carimbo único do início da rodada
    document.getElementById("iniciarBtn").addEventListener("click", function(){ primeAudio(); bipItem=-1; nGrupos=gruposLobby().length; definir({item:0, fase:"responder", epoca:novaEpoca()}); });
    document.getElementById("avancarBtn").addEventListener("click", function(){ primeAudio(); definir(PONTEIRO.proxima(estadoP, TOTAL)); });

    /* TEARDOWN destrutivo: encerra a sessão, manda os alunos à tela inicial, gera novo código. */
    function encerrarSessao(){
      if (!confirm("Encerrar a sessão?\n\nIsto remove TODOS os grupos, apaga os votos e gera um NOVO código. Os alunos voltam à tela inicial. Não dá para desfazer.")) return;
      var antiga = sessao;
      PONTEIRO.definir(antiga, ATIVIDADE, { fase:"reset", epoca:novaEpoca() });   // sinaliza: alunos → tela inicial
      setSessao(gerarCodigo()); estadoP=null; nGrupos=0; bipItem=-1; render(); assinarRespostas();   // painel: novo código, volta ao lobby
      var prefEstado = ATIVIDADE + ":estado:" + antiga + ":", prefLobby = "_lobby:estado:" + antiga + ":", chavePonteiro = "ponteiro:" + antiga + ":" + ATIVIDADE;
      setTimeout(function(){                                                       // limpa dados da sessão antiga (após os alunos lerem o reset)
        Object.keys(localStorage).filter(function(k){ return k.indexOf(prefEstado)===0 || k.indexOf(prefLobby)===0 || k===chavePonteiro; }).forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
      }, 2500);
    }
    document.getElementById("encerrarBtn").addEventListener("click", encerrarSessao);
    document.getElementById("novoCodigo").addEventListener("click", function(){ setSessao(gerarCodigo()); estadoP=null; render(); assinarRespostas(); });

    /* ---- Leitura dos grupos: Supabase (cache do poll, cross-device) ou localStorage ---- */
    var SB_ON = !!(window.SB && SB.configValida());
    var gruposCache = [], lobbyCache = [];
    async function pollSupabase(){
      if (!SB_ON) return;
      try{
        var rows = await SB.consultarSessao(sessao, ATIVIDADE);
        gruposCache = rows.map(function(r){ return { grupo:r.grupo, itens:(r.dados&&r.dados.itens)||[] }; });
        var lob = await SB.consultarSessao(sessao, "_lobby");
        lobbyCache = lob.map(function(r){ return { grupo:r.grupo }; });
        render();
      }catch(e){}
    }
    /* Realtime das respostas: assina postgres_changes de `respostas` (filtrado pela
       sessão → pega votos E entradas no _lobby) e dispara um refresh imediato; o poll
       de 1,5s acima fica como rede de segurança. Re-assina quando o código muda. */
    var subResp = null, pollPedido = null;
    function pollDebounced(){ if (pollPedido) return; pollPedido = setTimeout(function(){ pollPedido = null; pollSupabase(); }, 250); }
    function assinarRespostas(){
      if (!SB_ON || !window.RT) return;
      if (subResp){ try{ subResp(); }catch(e){} subResp = null; }
      subResp = RT.assinar({ table:"respostas", sessao:sessao, topico:"resp:"+sessao+":"+ATIVIDADE, tokenFn: SB.getAuthToken, onChange: pollDebounced });
    }

    /* Roster da SESSÃO (lobby): quem escolheu o grupo no hub, mesmo sem ter entrado
       numa rodada. É a fonte do placar de grupos e do N de "X/N votaram". */
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
          try{ var v=JSON.parse(localStorage.getItem(k)); if(v&&v.grupo) out.push({grupo:v.grupo, itens:(v.respostas||[]).filter(Boolean)}); }catch(e){}
        }
      }
      return out;
    }
    function escolhaNoItem(grupo, itemId, qual){
      var it = (grupo.itens||[]).find(function(r){ return r.item_id===itemId; }); if(!it) return null;
      return qual===1 ? it.escolha1 : (it.escolha2!=null?it.escolha2:it.escolha1);
    }
    function contar(itemId, qual){
      var m={}, grupos=gruposLocal(), total=0;
      grupos.forEach(function(g){ var e=escolhaNoItem(g,itemId,qual); if(e!=null){ m[e]=(m[e]||0)+1; total++; } });
      return {m:m, total:total};
    }

    function esc(s){ return String(s).replace(/[&<>\"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

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
        var rk = rankingDados(); if (!fimRenderizado && rk.length){ fimRenderizado = true; Podio.render(palco, { grupos: rk, max: TOTAL, titulo: "🏆 " + TITULO, sub: "Acertos da rodada", festa: true }); palco.insertAdjacentHTML("beforeend", navRodadas()); }
        return;
      }
      av.disabled=false;
      var K=estadoP.item, it=ITENS[K];
      if (!it){ estadoP=null; render(); return; }   // ponteiro obsoleto/fora de faixa → volta ao lobby
      ft.textContent = "Questão " + (K+1) + "/" + TOTAL + " · " + FASE_LABEL[estadoP.fase];
      av.textContent = rotuloAvancar(estadoP.fase, K);
      var correctLabel = it.opcoes.find(function(o){ return o.chave===it.correta; }).label;

      var html = '<div class="card"><div class="muted small" style="font-family:var(--font-mono)">'+UNIDADE+' '+it.id+' · '+it.grupo_eem+'</div>'+
                 '<p class="vinheta" style="margin-top:8px">'+it.vinheta+'</p></div>';

      if (estadoP.fase==="responder"){
        var N=numGrupos(), c=contar(it.id,1);
        var todos = (N>0 && c.total>=N);
        if (todos && bipItem!==K){ bip(); bipItem=K; }
        ft.style.background = todos ? "var(--live-soft)" : "";
        ft.style.color      = todos ? "var(--live)" : "";
        ft.style.borderColor= todos ? "var(--live)" : "";
        cr.textContent = c.total + "/" + N + " votaram";
        html += '<div class="big-status">'+
          (todos
            ? '<span style="color:var(--live)">✓ Todos votaram — '+c.total+'/'+N+'</span><br><span class="small muted">Pode mostrar os resultados quando quiser.</span>'
            : 'Aguardando os votos… <b>'+c.total+' / '+N+'</b><br><span class="small muted">Soa um sinal quando todos os grupos votarem.</span>')+
          '</div>';
      } else if (estadoP.fase==="resultado"){
        var c2=contar(it.id,1); cr.textContent="";
        ft.style.background=""; ft.style.color=""; ft.style.borderColor="";
        html += '<div class="card"><h3 style="font-family:var(--font-serif);margin:0 0 8px">Resultado: <span style="color:var(--live)">'+correctLabel+'</span></h3>'+
                barras(it, c2, it.correta) +
                '<div class="fronteira">'+it.fronteira+'</div></div>';
      }
      palco.innerHTML = html;
    }

    function barras(it, c, correta){
      return it.opcoes.map(function(o){
        var n=c.m[o.chave]||0, pct=c.total?Math.round(n/c.total*100):0, ok=(correta&&o.chave===correta);
        return '<div class="dist-row'+(ok?" correta":"")+'"><span class="dist-label">'+(ok?"✓ ":"")+o.label+'</span>'+
          '<span class="dist-track"><span class="dist-fill" style="width:'+pct+'%"></span></span><span class="dist-count">'+n+'</span></div>';
      }).join("");
    }

    /* ---- Navegação entre rodadas (no pódio): próxima rodada + mapa ---- */
    function proximaRodada(){
      var lista = window.HUB_ATIVIDADES || [], idx = -1;
      for (var i=0;i<lista.length;i++){ if (lista[i].id===ATIVIDADE){ idx=i; break; } }
      if (idx<0 || idx+1>=lista.length) return null;
      var nxt = lista[idx+1];
      return (nxt && nxt.painel) ? nxt : null;   // só se o painel da próxima existe
    }
    function ehUltima(){
      var lista = window.HUB_ATIVIDADES || [], idx = -1;
      for (var i=0;i<lista.length;i++){ if (lista[i].id===ATIVIDADE){ idx=i; break; } }
      return idx>=0 && idx+1>=lista.length;
    }
    function navRodadas(){
      var prox = proximaRodada();
      var semProx = ehUltima()
        ? '<span class="small muted" style="align-self:center">🏆 Fim do campeonato — a classificação geral está no mapa das rodadas.</span>'
        : '<span class="small muted" style="align-self:center">Próximas rodadas em construção</span>';
      return '<div style="text-align:center;margin-top:26px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">'+
        '<button class="btn ghost" onclick="location.href=\'painel-mapa.html\'">▣ Mapa das rodadas</button>'+
        (prox
          ? '<button class="btn" onclick="location.href=\''+prox.painel+'\'">Próxima rodada: '+prox.titulo+' ▸</button>'
          : semProx)+
      '</div>';
    }

    /* ---- Classificação da rodada (placar dos grupos por acertos) ---- */
    function scoreGrupo(g){ return (g.itens||[]).filter(function(it){ return it.correto1; }).length; }
    function rankingDados(){
      var votos = gruposLocal(), byName = {};
      votos.forEach(function(g){ byName[g.grupo] = g; });
      var nomes = {};
      gruposLobby().forEach(function(g){ nomes[g.grupo] = 1; });
      votos.forEach(function(g){ nomes[g.grupo] = 1; });
      return Object.keys(nomes).map(function(nome){
        return { grupo: nome, pontos: byName[nome] ? scoreGrupo(byName[nome]) : 0 };
      });
    }

    /* ---- Atualização ao vivo das contagens ---- */
    /* Retoma a rodada em curso: se o painel for recarregado no meio, lê o ponteiro
       persistido e restaura o estado em vez de cair no lobby (a "fim" reabre o pódio). */
    function restaurar(){
      PONTEIRO.ler(sessao, ATIVIDADE).then(function(e){
        if (estadoP===null && e && e.fase && e.fase!=="reset"){ estadoP = e; render(); }
      }).catch(function(){});
    }

    window.addEventListener("storage", function(){ render(); });                  // atualiza inclusive o lobby (modo local)
    setInterval(function(){ if(!estadoP || estadoP.fase!=="fim") render(); }, 1200); // lobby (estadoP null) também atualiza
    if (SB_ON){ setInterval(pollSupabase, 1500); assinarRespostas(); }            // poll de segurança + Realtime (refresh instantâneo)
    render();
    restaurar();
  }

  global.PainelMC = { init: init };
})(window);
