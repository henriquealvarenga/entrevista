/* =============================================================================
   SONS SINTETIZADOS (SPEC §10) — Web Audio API, zero asset, zero CDN, zero licença
   Vanilla JS. Osciladores apenas: nenhum arquivo de áudio para servir ou licenciar.

   Device do aluno : click (tick curto), acerto (arpejo ascendente), erro (nota grave).
   Painel (telão)  : whoosh (cada colocação do pódio) + fanfarra (grande final).

   Mudo disponível e PERSISTIDO ("sfx-mudo"); som LIGADO por padrão. O AudioContext
   é criado preguiçosamente e destravado no 1º gesto (autoplay policy do browser —
   como todo som vem de um toque, resolve sozinho). Respeita prefers-reduced-motion
   apenas na ANIMAÇÃO (no painel); o som em si segue o toggle de mudo.

   Expõe window.SFX.
   ============================================================================= */
(function (global) {
  "use strict";

  var KEY = "sfx-mudo";
  var ctx = null;
  var mudo = false;
  try { mudo = localStorage.getItem(KEY) === "1"; } catch (e) { /* storage indisponível */ }

  function ac() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }
  /* Retoma o contexto se suspenso (chamado dentro de um gesto). */
  function destravar() {
    var c = ac();
    if (c && c.state !== "running" && c.resume) c.resume();
  }

  /* Garante o contexto RODANDO antes de agendar e só então toca. No Safari o
     resume() é assíncrono e agendar em currentTime enquanto "suspended" perde o
     som (o envelope passa antes de o relógio do contexto andar). Aqui esperamos
     o resume resolver para agendar. */
  function comCtx(cb) {
    var c = ac();
    if (!c || mudo) return;
    if (c.state === "running") { cb(c); return; }
    if (c.resume) c.resume().then(function () { if (!mudo && c.state === "running") cb(c); }).catch(function () {});
    else cb(c);
  }

  /* Uma nota: freq (Hz), dur (s), tipo de onda, pico de ganho, atraso (s).
     Envelope com rampas LINEARES de ganho — de propósito, NÃO trocar por
     exponentialRampToValueAtTime: o WebKit/Safari tem um bug antigo em que a
     rampa exponencial no GainNode não é aplicada, o ganho fica preso no valor
     inicial e o som sai INAUDÍVEL (o oscilador roda e o Safari até mostra o
     indicador de áudio na aba, mas em volume ~0). A rampa exponencial também
     não pode partir de 0 (exige um piso 0.0001), o que piora o problema.
     Rampas lineares partem de 0, são portáveis e bastam para blips curtos. */
  function nota(freq, dur, tipo, vol, delay) {
    comCtx(function (c) {
      var t0 = c.currentTime + (delay || 0);
      var osc = c.createOscillator(), g = c.createGain();
      osc.type = tipo || "sine";
      osc.frequency.value = freq;
      osc.connect(g); g.connect(c.destination);
      var pico = (vol == null ? 0.12 : vol);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(pico, t0 + 0.012);      // ataque (sem clique)
      g.gain.linearRampToValueAtTime(0, t0 + dur);           // decaimento até zero
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    });
  }

  /* ---- Sons do aluno (sutis e curtos: sala com muitos devices) ---- */
  function click() { nota(660, 0.05, "triangle", 0.05); }
  function acerto() {                          // arpejo ascendente C5–E5–G5
    nota(523.25, 0.12, "sine", 0.09, 0);
    nota(659.25, 0.12, "sine", 0.09, 0.07);
    nota(783.99, 0.16, "sine", 0.09, 0.14);
  }
  function erro() { nota(146.83, 0.22, "sawtooth", 0.08); }  // nota grave breve

  /* ---- Sons do painel (telão, fonte única de evento) ---- */
  function whoosh() {                          // varredura curta ascendente
    comCtx(function (c) {
      var t0 = c.currentTime;
      var osc = c.createOscillator(), g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, t0);
      osc.frequency.linearRampToValueAtTime(880, t0 + 0.17);  // rampas lineares: robustas no WebKit
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.03);
      g.gain.linearRampToValueAtTime(0, t0 + 0.22);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + 0.25);
    });
  }
  function fanfarra() {                         // arpejo triunfal + acorde sustentado
    [[523.25, 0], [659.25, 0.13], [783.99, 0.26], [1046.5, 0.39]].forEach(function (s) {
      nota(s[0], 0.5, "triangle", 0.12, s[1]);
    });
    [523.25, 659.25, 783.99].forEach(function (f) { nota(f, 0.8, "sine", 0.07, 0.52); });
  }

  /* ---- Mudo (persistido) ---- */
  function setMudo(v) {
    mudo = !!v;
    try { localStorage.setItem(KEY, mudo ? "1" : "0"); } catch (e) { /* idem */ }
  }
  function estaMudo() { return mudo; }

  /* Botão flutuante de mudo (canto inferior direito). Uma chamada por página;
     idempotente. Estilo inline mínimo, herda nada do shell (funciona sozinho). */
  function montarBotaoMudo() {
    if (document.getElementById("sfx-mute-btn")) return;
    var b = document.createElement("button");
    b.id = "sfx-mute-btn";
    b.type = "button";
    b.style.cssText =
      "position:fixed; right:14px; bottom:14px; z-index:9999; width:42px; height:42px;" +
      "border-radius:50%; border:1px solid #e5e5e0; background:#fff; cursor:pointer;" +
      "font-size:1.1rem; line-height:1; box-shadow:0 1px 4px rgba(0,0,0,.12);";
    function refletir() {
      b.textContent = mudo ? "🔇" : "🔊";
      b.setAttribute("aria-label", mudo ? "Sons desligados — tocar para ligar" : "Sons ligados — tocar para desligar");
      b.title = b.getAttribute("aria-label");
    }
    refletir();
    b.addEventListener("click", function () {
      setMudo(!mudo);
      refletir();
      if (!mudo) { destravar(); click(); }   // feedback ao religar
    });
    document.body.appendChild(b);
  }

  /* Destrava o áudio no 1º gesto do usuário em QUALQUER lugar da página. O Safari
     (mais rígido que o Chrome) só cria/retoma o AudioContext dentro de um gesto;
     sem isso, o som do painel/atividade pode não tocar até o usuário acertar um
     botão que chame destravar(). Aqui garantimos que qualquer toque/clique/tecla
     já libera. Idempotente (once por evento). */
  function bindAutoDestrava(){
    var h = function(){ destravar(); };
    ["pointerdown", "touchstart", "mousedown", "keydown"].forEach(function(ev){
      document.addEventListener(ev, h, { once: true, capture: true, passive: true });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindAutoDestrava);
  else bindAutoDestrava();

  global.SFX = {
    click: click,
    acerto: acerto,
    erro: erro,
    whoosh: whoosh,
    fanfarra: fanfarra,
    destravar: destravar,
    setMudo: setMudo,
    mudo: estaMudo,
    montarBotaoMudo: montarBotaoMudo
  };
})(window);
