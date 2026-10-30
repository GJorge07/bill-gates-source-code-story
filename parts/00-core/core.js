/* ===== Código-fonte — core.js : window.Gates ===== */
(function () {
  'use strict';
  var W = window, D = document, html = D.documentElement;
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var mq = function (q) { try { return W.matchMedia(q).matches; } catch (e) { return false; } };
  var REDUCED = mq('(prefers-reduced-motion: reduce)');
  var TOUCH = mq('(hover: none) and (pointer: coarse)') || (mq('(pointer: coarse)') && !mq('(pointer: fine)'));
  if (REDUCED) html.classList.add('reduced');
  if (TOUCH) html.classList.add('touch');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var slice = function (l) { return Array.prototype.slice.call(l); };

  /* ================= ÁUDIO (WebAudio sintetizado) ================= */
  var audio = (function () {
    var ac = null, master = null, noiseBuf = null, enabled = false, subs = [];
    function ensure() {
      if (ac) return true;
      var AC = W.AudioContext || W.webkitAudioContext;
      if (!AC) return false;
      try { ac = new AC(); } catch (e) { return false; }
      var comp = ac.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 4;
      master = ac.createGain(); master.gain.value = 0.0001;
      master.connect(comp); comp.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function env(g, t, a, peak, d) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    }
    function tone(type, f0, f1, t, dur, vol, dest) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, Math.min(0.006, dur / 3), vol, dur);
      o.connect(g); g.connect(dest || master);
      o.start(t); o.stop(t + dur + 0.05);
      return o;
    }
    function noise(t, dur, vol, ftype, f0, f1, q) {
      var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noiseBuf; s.loop = true;
      f.type = ftype; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t);
      if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, Math.min(0.004, dur / 3), vol, dur);
      s.connect(f); f.connect(g); g.connect(master);
      s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.05);
    }
    var S = {
      click: function (t, v, r) { noise(t, 0.03, 0.45 * v, 'highpass', 2600 * r, 2600 * r); tone('sine', 900 * r, 320 * r, t, 0.05, 0.22 * v); },
      key: function (t, v, r) {
        noise(t, 0.035, 0.38 * v, 'bandpass', (1800 + Math.random() * 900) * r, 1400 * r, 1.1);
        tone('square', 150 * r, 80 * r, t, 0.05, 0.08 * v);
      },
      tick: function (t, v, r) { tone('sine', 2700 * r, 2100 * r, t, 0.03, 0.14 * v); },
      heartbeat: function (t, v, r) {
        tone('sine', 78 * r, 42 * r, t, 0.16, 0.9 * v);
        tone('sine', 70 * r, 40 * r, t + 0.19 / r, 0.2, 0.62 * v);
        noise(t, 0.12, 0.08 * v, 'lowpass', 220, 120, 0.7);
      },
      cry: function (t, v, r) {
        var o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), l = ac.createOscillator(), lg = ac.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(430 * r, t);
        o.frequency.linearRampToValueAtTime(640 * r, t + 0.2);
        o.frequency.linearRampToValueAtTime(470 * r, t + 0.75);
        l.frequency.value = 7; lg.gain.value = 22; l.connect(lg); lg.connect(o.frequency);
        f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 1.6;
        env(g, t, 0.06, 0.2 * v, 0.7);
        o.connect(f); f.connect(g); g.connect(master);
        o.start(t); l.start(t); o.stop(t + 0.85); l.stop(t + 0.85);
      },
      chime: function (t, v, r) {
        var p = [[1, 0.22, 1.7], [2.76, 0.1, 1.0], [5.4, 0.045, 0.55]];
        p.forEach(function (x) { tone('sine', 660 * r * x[0], 660 * r * x[0], t, x[2], x[1] * v); });
      },
      boot: function (t, v, r) {
        tone('square', 880 * r, 880 * r, t, 0.11, 0.07 * v);
        tone('square', 1320 * r, 1320 * r, t + 0.14, 0.16, 0.07 * v);
        noise(t, 0.3, 0.03 * v, 'lowpass', 400, 200, 0.5);
      },
      whoosh: function (t, v, r) { noise(t, 0.6, 0.34 * v, 'bandpass', 250 * r, 3200 * r, 0.9); },
      error: function (t, v, r) { tone('sawtooth', 150 * r, 120 * r, t, 0.13, 0.16 * v); tone('sawtooth', 150 * r, 110 * r, t + 0.17, 0.2, 0.16 * v); },
      success: function (t, v, r) {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone('triangle', f * r, f * r, t + i * 0.07, 0.34, 0.16 * v); });
      },
      teletype: function (t, v, r) {
        var at = 0;
        for (var i = 0; i < 7; i++) {
          at += 0.035 + Math.random() * 0.03;
          noise(t + at, 0.03, 0.3 * v, 'bandpass', (1500 + Math.random() * 1500) * r, 1200 * r, 1.4);
          tone('square', 110 * r, 70 * r, t + at, 0.03, 0.06 * v);
        }
      },
      bell: function (t, v, r) {
        tone('sine', 2350 * r, 2350 * r, t, 1.1, 0.18 * v); tone('sine', 3180 * r, 3180 * r, t, 0.7, 0.08 * v);
        noise(t, 0.02, 0.25 * v, 'highpass', 3000, 3000);
      },
      flip: function (t, v, r) { noise(t, 0.07, 0.3 * v, 'bandpass', 1100 * r, 3000 * r, 1.2); tone('sine', 520 * r, 300 * r, t, 0.05, 0.07 * v); },
      pop: function (t, v, r) { tone('sine', 720 * r, 170 * r, t, 0.1, 0.34 * v); }
    };
    function notify() { subs.forEach(function (f) { try { f(enabled); } catch (e) { console.error(e); } }); }
    var api = {
      names: Object.keys(S),
      get enabled() { return enabled; },
      get ac() { return ac; },
      get master() { return master; },
      play: function (name, o) {
        if (!enabled || !ac) return;
        var fn = S[name]; if (!fn) return;
        o = o || {};
        try {
          if (ac.state === 'suspended') ac.resume();
          fn(ac.currentTime + 0.005, o.vol == null ? 1 : o.vol, o.rate || 1);
        } catch (e) { console.error('[audio] ' + name, e); }
      },
      enable: function () {
        if (!ensure()) return false;
        try { if (ac.state === 'suspended') ac.resume(); } catch (e) {}
        enabled = true;
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ac.currentTime);
        master.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.15);
        notify(); return true;
      },
      disable: function () {
        enabled = false;
        if (ac) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.04); }
        notify();
      },
      toggle: function () { if (enabled) api.disable(); else api.enable(); return enabled; },
      onchange: function (fn) { subs.push(fn); }
    };
    return api;
  })();

  /* ================= núcleo ================= */
  var G = W.Gates = {
    facts: {}, audio: audio, reduced: REDUCED, touch: TOUCH,
    defs: [], inst: {}, started: false, era: null, current: null,
    _ready: [], _isReady: false
  };
  G.chapter = function (id, fn) {
    G.defs.push({ id: id, fn: fn });
    if (G.started) { var sec = D.getElementById(id); if (sec) mount(sec, fn); }
  };
  G.ready = function (fn) { if (G._isReady) { try { fn(); } catch (e) { console.error(e); } } else G._ready.push(fn); };
  G.fact = function (id) { openFacts(id); };
  G.scrollTo = function (id) {
    var el = D.getElementById(id); if (!el) return;
    var y = el.getBoundingClientRect().top + W.pageYOffset;
    W.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
  };

  var sections = [], insts = [], navLinks = [], activeIdx = -1, scrollQueued = false;
  var live = null;

  function say(text) {
    if (!live) live = D.getElementById('g-live'); if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = String(text); }, 60);
  }
  G.say = say;

  function safe(inst, what, fn, a) {
    try { return fn.call(inst.api, a); }
    catch (e) { console.error('[Gates] erro em ' + inst.id + '.' + what + ':', e); }
  }

  /* ---------- webgl ---------- */
  function webgl(canvas, opts) {
    if (!W.THREE) throw new Error('THREE indisponível');
    opts = opts || {};
    var cfg = {}, k;
    for (k in opts) if (['pixelRatio', 'autoResize', 'clearColor', 'clearAlpha', 'onResize'].indexOf(k) < 0) cfg[k] = opts[k];
    cfg.canvas = canvas;
    if (cfg.antialias === undefined) cfg.antialias = true;
    if (cfg.alpha === undefined) cfg.alpha = true;
    if (!cfg.powerPreference) cfg.powerPreference = 'high-performance';
    var renderer = new THREE.WebGLRenderer(cfg);
    var pr = Math.min(opts.pixelRatio || W.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    if (opts.clearColor !== undefined) renderer.setClearColor(opts.clearColor, opts.clearAlpha == null ? 1 : opts.clearAlpha);
    var out = { renderer: renderer, width: 0, height: 0, pixelRatio: pr };
    function setSize(w, h) {
      if (w == null || h == null) {
        w = canvas.clientWidth || (canvas.parentNode && canvas.parentNode.clientWidth) || 300;
        h = canvas.clientHeight || (canvas.parentNode && canvas.parentNode.clientHeight) || 150;
      }
      out.width = w; out.height = h;
      renderer.setSize(w, h, false);
      if (typeof opts.onResize === 'function') { try { opts.onResize(w, h); } catch (e) { console.error(e); } }
    }
    out.setSize = setSize;
    var ro = null;
    if (opts.autoResize !== false && W.ResizeObserver) {
      ro = new ResizeObserver(function () { setSize(); });
      ro.observe(canvas);
    }
    setSize();
    out.dispose = function () {
      if (ro) ro.disconnect();
      try { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); } catch (e) {}
    };
    return out;
  }

  /* ---------- instanciação de capítulos ---------- */
  function mount(sec, fn) {
    var inst = {
      id: sec.id, root: sec, visible: false, entered: false, frames: [], api: {}, idx: sections.indexOf(sec),
      era: sec.getAttribute('data-era') || 'void'
    };
    var ctx = {
      root: sec,
      $: function (s) { return sec.querySelector(s); },
      $$: function (s) { return slice(sec.querySelectorAll(s)); },
      gsap: W.gsap, ScrollTrigger: W.ScrollTrigger, THREE: W.THREE,
      audio: audio, reduced: REDUCED, touch: TOUCH,
      onFrame: function (f) { if (typeof f === 'function') inst.frames.push({ fn: f, dead: false }); },
      webgl: webgl,
      say: say,
      fact: function (id) { openFacts(id || sec.id); },
      scan: function (r) { utilities(r || sec); },
      scrollTo: G.scrollTo,
      id: sec.id
    };
    Object.defineProperty(ctx, 'visible', { get: function () { return inst.visible; } });
    insts.push(inst); G.inst[sec.id] = inst;
    var api;
    try { api = fn(ctx); } catch (e) { console.error('[Gates] erro ao iniciar ' + sec.id + ':', e); api = null; }
    inst.api = api && typeof api === 'object' ? api : {};
    if (W.ScrollTrigger && typeof inst.api.progress === 'function') {
      try {
        ScrollTrigger.create({
          trigger: sec, start: 'top bottom', end: 'bottom top',
          onUpdate: function (self) { safe(inst, 'progress', inst.api.progress, self.progress); }
        });
      } catch (e) { console.error('[Gates] ScrollTrigger progress ' + sec.id, e); }
    }
    if (inst.visible) enterInst(inst);
    return inst;
  }
  function enterInst(inst) {
    inst.entered = true;
    if (typeof inst.api.enter === 'function') safe(inst, 'enter', inst.api.enter);
  }

  /* ---------- utilitários data-* ---------- */
  var DONE = '__gDone';
  function utilities(scope) {
    if (!W.gsap) return;
    var q = function (s) { return slice(scope.querySelectorAll(s)); };
    q('[data-reveal]').forEach(function (el) {
      if (el[DONE + 'r']) return; el[DONE + 'r'] = 1;
      if (REDUCED) return;
      var t = el.getAttribute('data-reveal') || 'fade', from = { opacity: 0 };
      if (t === 'up') from.y = 28; else if (t === 'left') from.x = -34; else if (t === 'right') from.x = 34; else if (t === 'scale') from.scale = 0.94;
      var dl = parseFloat(el.getAttribute('data-reveal-delay')) || 0;
      gsap.from(el, Object.assign(from, {
        duration: 0.9, ease: 'power3.out', delay: dl, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }));
    });
    q('[data-count]').forEach(function (el) {
      if (el[DONE + 'c']) return; el[DONE + 'c'] = 1;
      var to = parseFloat(el.getAttribute('data-count'));
      if (isNaN(to)) return;
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      var fmt = function (n) {
        return pre + n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      };
      var final = fmt(to);
      el.setAttribute('aria-label', final);
      if (REDUCED) { el.textContent = final; return; }
      el.textContent = fmt(0);
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: to, duration: 1.8, ease: 'power2.out',
            onUpdate: function () { el.textContent = fmt(o.v); },
            onComplete: function () { el.textContent = final; }
          });
        }
      });
    });
    q('[data-parallax]').forEach(function (el) {
      if (el[DONE + 'p']) return; el[DONE + 'p'] = 1;
      if (REDUCED) return;
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.fromTo(el, { y: function () { return sp * 140; } }, {
        y: function () { return -sp * 140; }, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    });
  }
  G.scan = utilities;

  /* ---------- navegação ---------- */
  var navEl, navList, pctEl, topFill, menuBtn, scrim;
  function buildNav() {
    navEl = D.getElementById('g-nav'); navList = navEl.querySelector('.g-nav-list');
    pctEl = D.getElementById('g-pct'); topFill = D.getElementById('g-topfill');
    menuBtn = D.getElementById('g-menu'); scrim = D.getElementById('g-scrim');
    navList.innerHTML = '';
    sections.forEach(function (sec, i) {
      var li = D.createElement('li'), a = D.createElement('a');
      a.href = '#' + sec.id;
      var title = sec.getAttribute('data-title') || sec.id, year = sec.getAttribute('data-year') || '';
      a.innerHTML = '<span class="g-dot" aria-hidden="true"></span><span class="g-lab"><b></b><i></i></span>';
      a.querySelector('b').textContent = title;
      a.querySelector('i').textContent = year;
      a.setAttribute('aria-label', title + (year ? ', ' + year : ''));
      a.addEventListener('click', function (e) {
        e.preventDefault();
        audio.play('tick');
        closeMenu();
        G.scrollTo(sec.id);
        history.replaceState(null, '', '#' + sec.id);
        say('Capítulo ' + title);
      });
      li.appendChild(a); navList.appendChild(li); navLinks.push(a);
    });
    menuBtn.addEventListener('click', function () {
      var open = !navEl.classList.contains('open');
      navEl.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      scrim.hidden = !open; requestAnimationFrame(function () { scrim.classList.toggle('show', open); });
    });
    scrim.addEventListener('click', function () { if (navEl.classList.contains('open')) closeMenu(); else closeFacts(); });
  }
  function closeMenu() {
    if (!navEl.classList.contains('open')) return;
    navEl.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
    if (!factsOpen) { scrim.classList.remove('show'); setTimeout(function () { if (!scrim.classList.contains('show')) scrim.hidden = true; }, 300); }
  }

  /* ---------- painel de ressalvas ---------- */
  /* perguntas frequentes: mesmo painel; itens com `q` viram <details> */
  G.facts.faq = {
    title: 'Perguntas frequentes',
    intro: 'Dúvidas comuns sobre Bill Gates, respondidas com o que as fontes sustentam.',
    items: [
      { q: 'A Microsoft criou o MS-DOS?',
        text: 'Não do zero. O sistema nasceu como QDOS/86-DOS, de Tim Paterson, da Seattle Computer Products. A Microsoft licenciou e depois comprou o sistema, contratou Paterson e o rebatizou MS-DOS em julho de 1981.',
        url: 'https://en.wikipedia.org/wiki/86-DOS', label: 'Wikipedia: 86-DOS' },
      { q: 'Quando a Gates Foundation vai acabar?',
        text: 'Em 8 de maio de 2025, Gates anunciou que a fundação vai gastar mais de US$ 200 bilhões e encerrar as atividades em 31 de dezembro de 2045.',
        url: 'https://www.philanthropy.com/news/the-gates-foundation-the-worlds-biggest-philanthropy-announces-plans-to-shutter-in-2045/', label: 'Chronicle of Philanthropy' }
      // TODO(human): mais 3 a 5 perguntas
    ]
  };

  var factsEl, factsList, factsTitle, factsIntro, factsIntroDefault, factsBtn, factsOpen = false, factsLast = null;
  function buildFacts() {
    factsEl = D.getElementById('g-facts'); factsList = D.getElementById('g-facts-list');
    factsTitle = D.getElementById('g-facts-title'); factsBtn = D.getElementById('g-facts-btn');
    factsIntro = factsEl.querySelector('.g-facts-intro'); factsIntroDefault = factsIntro.textContent;
    D.getElementById('g-facts-close').addEventListener('click', closeFacts);
    factsBtn.addEventListener('click', function () { if (G.current) openFacts(G.current); });
    D.getElementById('g-faq-btn').addEventListener('click', function () { openFacts('faq'); });
  }
  function sourceLink(it) {
    var a = D.createElement('a'); a.href = it.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = it.label || it.url.replace(/^https?:\/\//, '').slice(0, 60);
    return a;
  }
  function openFacts(id) {
    var f = G.facts[id];
    factsTitle.textContent = f && f.title ? f.title : 'Ressalvas';
    factsIntro.textContent = f && f.intro ? f.intro : factsIntroDefault;
    factsList.innerHTML = '';
    var items = f && f.items && f.items.length ? f.items : [{ text: 'Este capítulo não registrou ressalvas específicas.' }];
    items.forEach(function (it) {
      var li = D.createElement('li');
      if (it.q) {
        li.className = 'g-faq';
        var det = D.createElement('details'), sum = D.createElement('summary'), p = D.createElement('p');
        sum.textContent = it.q; p.textContent = it.text;
        if (it.url) { p.appendChild(D.createElement('br')); p.appendChild(sourceLink(it)); }
        det.appendChild(sum); det.appendChild(p); li.appendChild(det);
      } else {
        li.appendChild(D.createTextNode(typeof it === 'string' ? it : it.text));
        if (it.url) { li.appendChild(D.createElement('br')); li.appendChild(sourceLink(it)); }
      }
      factsList.appendChild(li);
    });
    factsLast = D.activeElement;
    factsEl.removeAttribute('inert'); factsEl.classList.add('open'); factsOpen = true;
    scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add('show'); });
    audio.play('pop', { vol: 0.6 });
    setTimeout(function () { try { D.getElementById('g-facts-close').focus(); } catch (e) {} }, 60);
    say('Painel ' + factsTitle.textContent.toLowerCase() + ' aberto');
  }
  function closeFacts() {
    if (!factsOpen) return;
    factsOpen = false; factsEl.classList.remove('open'); factsEl.setAttribute('inert', '');
    scrim.classList.remove('show');
    setTimeout(function () { if (!scrim.classList.contains('show')) scrim.hidden = true; }, 300);
    if (factsLast && factsLast.focus) try { factsLast.focus(); } catch (e) {}
  }
  G.closeFacts = closeFacts;

  /* ---------- botão de som ---------- */
  function buildSound() {
    var b = D.getElementById('g-sound'), txt = D.getElementById('g-sound-txt');
    function upd(on) {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Som ligado. Desativar som' : 'Som desligado. Ativar som');
      txt.textContent = on ? 'Som ligado' : 'Som desligado';
    }
    upd(false);
    audio.onchange(upd);
    b.addEventListener('click', function () {
      var on = audio.toggle();
      if (on) audio.play('chime', { vol: 0.7 });
      say(on ? 'Som ativado' : 'Som desativado');
    });
  }

  /* ---------- era / capítulo ativo ---------- */
  function onScroll() {
    if (scrollQueued) return; scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; updateActive(); });
  }
  function updateActive() {
    if (!sections.length) return;
    var vh = W.innerHeight, y = vh * 0.5, best = -1, t = 0, i, r;
    for (i = 0; i < sections.length; i++) {
      r = sections[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { best = i; t = clamp((y - r.top) / Math.max(1, r.height), 0, 1); break; }
    }
    if (best < 0) {
      r = sections[0].getBoundingClientRect();
      if (r.top > y) { best = 0; t = 0; } else { best = sections.length - 1; t = 1; }
    }
    var max = Math.max(1, D.documentElement.scrollHeight - vh);
    var total = clamp(W.pageYOffset / max, 0, 1);
    var n = sections.length, frac = n > 1 ? clamp((best + t) / (n - 1), 0, 1) : t;
    navList.style.setProperty('--p', frac.toFixed(4));
    topFill.style.transform = 'scaleX(' + total.toFixed(4) + ')';
    pctEl.textContent = 'compilado ' + Math.round(total * 100) + '%';
    updateDock(W.pageYOffset);
    if (best !== activeIdx) {
      activeIdx = best;
      var sec = sections[best], era = sec.getAttribute('data-era') || 'void';
      D.body.setAttribute('data-era', era); G.era = era; G.current = sec.id;
      var th = D.querySelector('meta[name="theme-color"]');
      navLinks.forEach(function (a, j) {
        if (j === best) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        a.classList.toggle('is-past', j < best);
      });
      flashLabel(navLinks[best]);
      if (factsBtn) factsBtn.hidden = !(G.facts[sec.id] && G.facts[sec.id].items && G.facts[sec.id].items.length);
      D.dispatchEvent(new CustomEvent('gates:chapter', { detail: { id: sec.id, era: era, index: best } }));
    }
  }

  /* rótulo do capítulo novo aparece por um instante no trilho */
  var flashT = 0;
  function flashLabel(a) {
    navLinks.forEach(function (x) { x.classList.remove('is-flash'); });
    if (!a) return;
    a.classList.add('is-flash');
    clearTimeout(flashT);
    flashT = setTimeout(function () { a.classList.remove('is-flash'); }, 1800);
  }

  /* dock: some aos poucos ao descer e reaparece aos poucos ao subir, preso à rolagem
     (como o título da abertura). --dock-hide vai de 0 (visível) a 1 (sumida).
     Setas, PageUp/PageDown e espaço rolam a página e passam por aqui do mesmo jeito. */
  var dockEl = null, dockLastY = 0, dockHide = 0;
  function updateDock(y) {
    if (!dockEl) dockEl = D.querySelector('.g-dock');
    if (!dockEl) return;
    var dist = Math.max(140, W.innerHeight * 0.2); // rolagem necessária para sumir/voltar por inteiro
    var dy = y - dockLastY; dockLastY = y;
    var h = clamp(dockHide + dy / dist, 0, 1);
    h = Math.min(h, Math.max(0, y) / dist); // no topo da página ela está sempre visível
    if (h === dockHide) return;
    dockHide = h;
    dockEl.style.setProperty('--dock-hide', h.toFixed(3));
    dockEl.classList.toggle('is-away', h > 0.6); // quase invisível: não intercepta cliques
  }

  /* ---------- loop de frames ---------- */
  var lastT = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = lastT ? Math.min(now - lastT, 64) : 16; lastT = now;
    for (var i = 0; i < insts.length; i++) {
      var inst = insts[i]; if (!inst.visible || !inst.frames.length) continue;
      for (var j = 0; j < inst.frames.length; j++) {
        var f = inst.frames[j]; if (f.dead) continue;
        try { f.fn(now, dt); }
        catch (e) { f.dead = true; console.error('[Gates] erro em ' + inst.id + '.onFrame (desativado):', e); }
      }
    }
  }

  /* ---------- visibilidade ---------- */
  function observe() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var inst = G.inst[en.target.id]; if (!inst) return;
        var vis = en.isIntersecting;
        if (vis === inst.visible) return;
        inst.visible = vis;
        if (vis) enterInst(inst);
        else if (typeof inst.api.leave === 'function') safe(inst, 'leave', inst.api.leave);
      });
    }, { rootMargin: '0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- resize ---------- */
  var rzT = 0;
  function onResize() {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      insts.forEach(function (inst) { if (typeof inst.api.resize === 'function') safe(inst, 'resize', inst.api.resize); });
      if (W.ScrollTrigger) ScrollTrigger.refresh();
      updateActive();
    }, 160);
  }

  /* ---------- boot ---------- */
  function start() {
    if (G.started) return;
    sections = slice(D.querySelectorAll('#story > section.chapter'));
    try { if (W.gsap && W.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); } }
    catch (e) { console.error('[Gates] gsap', e); }
    buildNav(); buildFacts(); buildSound();
    G.started = true;
    var byId = {};
    G.defs.forEach(function (d) { (byId[d.id] = byId[d.id] || []).push(d.fn); });
    sections.forEach(function (sec) {
      (byId[sec.id] || []).forEach(function (fn) { mount(sec, fn); });
    });
    sections.forEach(function (sec) {
      if (!byId[sec.id]) console.warn('[Gates] seção ' + sec.id + ' sem Gates.chapter registrado');
    });
    G.defs.forEach(function (d) { if (!D.getElementById(d.id)) console.warn('[Gates] Gates.chapter("' + d.id + '") sem <section> correspondente'); });
    try { utilities(D.getElementById('story')); } catch (e) { console.error('[Gates] utilidades', e); }
    observe();
    W.addEventListener('scroll', onScroll, { passive: true });
    W.addEventListener('resize', onResize);
    W.addEventListener('orientationchange', onResize);
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (factsOpen) closeFacts(); else closeMenu(); }
    });
    updateActive();
    requestAnimationFrame(tick);
    var refresh = function () { if (W.ScrollTrigger) ScrollTrigger.refresh(); updateActive(); };
    refresh();
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(refresh);
    setTimeout(refresh, 700);
    setTimeout(refresh, 2600);
    // loader
    var wait = Math.max(0, 650 - (W.performance ? performance.now() : 0));
    setTimeout(function () {
      html.classList.add('g-loaded');
      var ld = D.getElementById('g-loader'); if (ld) ld.setAttribute('aria-hidden', 'true');
      if (W.ScrollTrigger) ScrollTrigger.refresh();
      if (location.hash && D.getElementById(location.hash.slice(1))) {
        var el = D.getElementById(location.hash.slice(1));
        W.scrollTo(0, el.getBoundingClientRect().top + W.pageYOffset);
      }
      G._isReady = true;
      G._ready.splice(0).forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
    }, wait);
  }

  function boot() {
    var loaded = new Promise(function (res) { if (D.readyState === 'complete') res(); else W.addEventListener('load', res); });
    var fonts = Promise.race([
      (D.fonts && D.fonts.ready) ? D.fonts.ready : Promise.resolve(),
      new Promise(function (res) { setTimeout(res, 3000); })
    ]);
    Promise.all([loaded, fonts]).then(function () {
      try { start(); } catch (e) { console.error('[Gates] falha no início', e); html.classList.add('g-loaded'); }
    });
  }
  boot();
})();
