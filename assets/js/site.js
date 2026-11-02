/* Stallion Contracting — site interactions (no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     PROJECTS — add a project by copying a block below.
     photos: in order; the first is "before", the last is "after"
     unless `before` / `after` give a different index.
     mode: 'slider' (Before / After) or 'timeline' opens first.
  ---------------------------------------------------------------- */
  var IMG = 'assets/img/projects/';
  var PROJECTS = [
    {
      name: 'Canada School of Barbering',
      location: 'Calgary',
      scope: 'Multi-room school build-out',
      mode: 'timeline',
      after: 5,
      photos: [
        ['canada-school-of-barbering-before', 'Before'],
        ['canada-school-of-barbering-shampoo-bay', 'Shampoo bay'],
        ['canada-school-of-barbering-barber-stations', 'Barber stations'],
        ['canada-school-of-barbering-window-stations', 'Window-side stations'],
        ['canada-school-of-barbering-mirror-stations', 'Mirror stations'],
        ['canada-school-of-barbering-cutting-floor', 'Main cutting floor'],
        ['canada-school-of-barbering-classroom', 'Classroom']
      ]
    },
    {
      name: 'Mr. Barber',
      location: 'Deerfoot Meadows, Calgary',
      scope: 'Barbershop storefront build-out',
      mode: 'slider',
      after: 4,
      photos: [
        ['mr-barber-deerfoot-interior-before', 'Interior — before'],
        ['mr-barber-deerfoot-empty-unit', 'Empty unit'],
        ['mr-barber-deerfoot-shampoo-progress', 'Shampoo bay — in progress'],
        ['mr-barber-deerfoot-storefront', 'Storefront — complete'],
        ['mr-barber-deerfoot-barber-floor', 'Barber floor — complete']
      ]
    },
    {
      name: 'Vape Zone',
      location: '17th Ave, Calgary',
      scope: 'Retail storefront build-out',
      mode: 'slider',
      after: 2,
      photos: [
        ['vape-zone-before', 'Before'],
        ['vape-zone-progress', 'In progress'],
        ['vape-zone-complete', 'Complete'],
        ['vape-zone-display-wall', 'Display wall'],
        ['vape-zone-showcases', 'Showcases']
      ]
    },
    {
      name: 'Everything Vapes & Cigars',
      location: 'Fairview, Calgary',
      scope: 'Retail store renovation',
      mode: 'slider',
      photos: [
        ['everything-vapes-before', 'Before renovation'],
        ['everything-vapes-complete', 'Complete']
      ]
    },
    {
      name: "K's Barbershop",
      location: 'Downtown Calgary',
      scope: 'Barbershop build-out',
      mode: 'timeline',
      photos: [
        ['ks-barbershop-before', 'Before'],
        ['ks-barbershop-drywall', 'Drywall & rough-ins'],
        ['ks-barbershop-brick-cabinetry', 'Brick wall & cabinetry'],
        ['ks-barbershop-complete', 'Complete']
      ]
    },
    {
      name: 'Office Demolition',
      location: 'Calgary',
      scope: 'Interior office demolition',
      mode: 'slider',
      photos: [
        ['office-demolition-before', 'Before'],
        ['office-demolition-after', 'After demolition']
      ]
    }
  ];

  /* Display order of the project buttons */
  var ORDER = ['Vape Zone', 'Mr. Barber', 'Office Demolition', 'Everything Vapes & Cigars', "K's Barbershop", 'Canada School of Barbering'];
  PROJECTS.sort(function (a, b) {
    var ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  var STAGE_MS = 3200;
  var $ = function (id) { return document.getElementById(id); };

  /* Header: stronger edge once the page scrolls */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Stats strip: count up when it scrolls into view */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countIO.unobserve(en.target);
        var n = en.target, to = Number(n.dataset.count), from = Number(n.dataset.from || 0), suf = n.dataset.suffix || '';
        var t0 = null, dur = 1400;
        var tick = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          n.textContent = Math.round(from + (to - from) * e) + suf;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (n) { countIO.observe(n); });
  }
  var root = $('showcase');

  if (root) {
    var S = { proj: 0, mode: PROJECTS[0].mode, pos: 50, stage: 0, elapsed: 0, playing: true, lb: -1 };
    var touched = false, sweepTimer = null, lastFocus = null;

    var el = {
      tabs: $('sc-tabs'), modeSlider: $('sc-mode-slider'), modeTimeline: $('sc-mode-timeline'),
      slider: $('sc-slider'), timeline: $('sc-timeline'),
      after: $('sc-after'), before: $('sc-before'), beforeLbl: $('sc-before-label'), afterLbl: $('sc-after-label'),
      divider: $('sc-divider'), knob: $('sc-knob'), range: $('sc-range'),
      stages: $('sc-stages'), bars: $('sc-bars'), stageNum: $('sc-stage-num'), stageName: $('sc-stage-name'),
      play: $('sc-play'), name: $('sc-name'), meta: $('sc-meta'), steps: $('sc-steps'), hint: $('sc-hint'),
      thumbs: $('sc-thumbs'), lb: $('sc-lightbox'), lbImg: $('sc-lb-img'), lbName: $('sc-lb-name'),
      lbStage: $('sc-lb-stage'), lbCount: $('sc-lb-count')
    };

    var P = function () { return PROJECTS[S.proj]; };
    var src = function (p, thumb) { return IMG + p[0] + (thumb ? '-thumb' : '') + '.jpg'; };
    var altOf = function (p) { return P().name + ', ' + P().location + ' — ' + p[1].toLowerCase(); };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    function make(tag, attrs, html) {
      var n = document.createElement(tag);
      for (var k in attrs) { if (attrs[k] !== null) n.setAttribute(k, attrs[k]); }
      if (html !== undefined) n.innerHTML = html;
      return n;
    }

    function buildTabs() {
      el.tabs.innerHTML = '';
      PROJECTS.forEach(function (p, i) {
        var b = make('button', { type: 'button', class: 'pill pill--outline', 'aria-pressed': 'false' });
        b.textContent = p.name;
        b.addEventListener('click', function () { selectProject(i); });
        el.tabs.appendChild(b);
      });
    }

    function buildProject() {
      var p = P(), ph = p.photos;
      var bi = p.before || 0, ai = (p.after !== undefined) ? p.after : ph.length - 1;
      el.before.src = src(ph[bi]); el.before.alt = altOf(ph[bi]);
      el.after.src = src(ph[ai]); el.after.alt = altOf(ph[ai]);
      el.name.textContent = p.name;
      el.meta.textContent = p.location + ' · ' + p.scope;

      el.stages.innerHTML = ''; el.bars.innerHTML = ''; el.steps.innerHTML = ''; el.thumbs.innerHTML = '';
      ph.forEach(function (photo, i) {
        var wrap = make('div', { class: 'sc-stage' });
        wrap.appendChild(make('img', { src: src(photo), alt: '', 'aria-hidden': 'true', class: 'sc-stage-blur' }));
        wrap.appendChild(make('img', { src: src(photo), alt: altOf(photo), class: 'sc-stage-img' }));
        el.stages.appendChild(wrap);

        el.bars.appendChild(make('div', { class: 'sc-bar' }, '<div class="sc-bar-fill"></div>'));

        var li = make('li');
        var step = make('button', { type: 'button', class: 'sc-step' },
          '<span class="sc-step-num">' + pad(i + 1) + '</span><span></span>');
        step.lastChild.textContent = photo[1];
        step.addEventListener('click', function () { setMode('timeline'); goStage(i); });
        li.appendChild(step); el.steps.appendChild(li);

        var t = make('button', { type: 'button', class: 'thumb', 'aria-label': 'Open photo: ' + altOf(photo) },
          '<img src="' + src(photo, true) + '" alt="" loading="lazy"><span class="thumb-tag"></span>');
        t.querySelector('.thumb-tag').textContent = photo[1];
        t.addEventListener('click', function () { openLb(i); });
        el.thumbs.appendChild(t);
      });
    }

    function renderTabs() {
      Array.prototype.forEach.call(el.tabs.children, function (b, i) {
        b.setAttribute('aria-pressed', i === S.proj ? 'true' : 'false');
      });
    }

    function renderMode() {
      var slider = S.mode === 'slider';
      el.slider.hidden = !slider; el.timeline.hidden = slider;
      el.modeSlider.setAttribute('aria-pressed', slider ? 'true' : 'false');
      el.modeTimeline.setAttribute('aria-pressed', slider ? 'false' : 'true');
      el.hint.textContent = slider
        ? 'Drag the gold handle across the photo to see the transformation.'
        : 'Tap any stage to jump to it, or let the timeline play.';
      renderStage();
    }

    function renderPos() {
      var pos = S.pos;
      el.before.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      el.divider.style.left = pos + '%';
      el.knob.style.left = pos + '%';
      el.range.value = pos;
      el.beforeLbl.style.opacity = pos > 14 ? 1 : 0;
      el.afterLbl.style.opacity = pos < 86 ? 1 : 0;
    }

    function renderStage() {
      var ph = P().photos, timeline = S.mode === 'timeline';
      Array.prototype.forEach.call(el.stages.children, function (w, i) { w.classList.toggle('is-active', i === S.stage); });
      Array.prototype.forEach.call(el.steps.querySelectorAll('.sc-step'), function (b, i) {
        var on = timeline && i === S.stage;
        b.classList.toggle('is-active', on);
        if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      el.stageNum.textContent = 'Stage ' + pad(S.stage + 1) + ' / ' + pad(ph.length);
      el.stageName.textContent = ph[S.stage] ? ph[S.stage][1] : '';
      renderBars();
      el.play.setAttribute('aria-label', S.playing ? 'Pause timeline' : 'Play timeline');
      el.play.classList.toggle('is-paused', !S.playing);
    }

    function renderBars() {
      Array.prototype.forEach.call(el.bars.children, function (b, i) {
        var w = i < S.stage ? 100 : i === S.stage ? Math.min(100, S.elapsed / STAGE_MS * 100) : 0;
        b.firstChild.style.width = w + '%';
      });
    }

    function selectProject(i) {
      S.proj = i; S.mode = PROJECTS[i].mode || 'slider'; S.stage = 0; S.elapsed = 0; S.pos = 50; S.playing = !reduceMotion;
      buildProject(); renderTabs(); renderMode(); renderPos();
    }
    function setMode(m) { S.mode = m; if (m === 'timeline') { S.elapsed = 0; } renderMode(); }
    function goStage(i) { S.stage = i; S.elapsed = 0; renderStage(); }

    el.modeSlider.addEventListener('click', function () { setMode('slider'); });
    el.modeTimeline.addEventListener('click', function () { S.stage = 0; S.playing = true; setMode('timeline'); });
    el.play.addEventListener('click', function () { S.playing = !S.playing; renderStage(); });
    el.range.addEventListener('input', function () {
      touched = true; clearInterval(sweepTimer); S.pos = Number(el.range.value); renderPos();
    });

    setInterval(function () {
      if (S.mode !== 'timeline' || !S.playing || S.lb >= 0 || document.hidden) return;
      S.elapsed += 100;
      if (S.elapsed >= STAGE_MS) { S.stage = (S.stage + 1) % P().photos.length; S.elapsed = 0; renderStage(); }
      else renderBars();
    }, 100);

    function sweep() {
      if (touched || reduceMotion) return;
      var t = 0;
      sweepTimer = setInterval(function () {
        t += 30;
        if (touched || t > 2400) { clearInterval(sweepTimer); if (!touched) { S.pos = 50; renderPos(); } return; }
        S.pos = Math.round(50 + 32 * Math.sin(t / 2400 * Math.PI * 2) * (1 - t / 3000));
        renderPos();
      }, 30);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; }) && S.mode === 'slider') { io.disconnect(); sweep(); }
      }, { threshold: 0.5 });
      io.observe($('ba-viewer'));
    }

    /* Lightbox */
    function renderLb() {
      var ph = P().photos, p = ph[S.lb];
      el.lbImg.src = src(p); el.lbImg.alt = altOf(p);
      el.lbName.textContent = P().name; el.lbStage.textContent = p[1];
      el.lbCount.textContent = (S.lb + 1) + ' / ' + ph.length;
      el.lb.setAttribute('aria-label', altOf(p));
    }
    function openLb(i) {
      lastFocus = document.activeElement; S.lb = i; renderLb();
      el.lb.hidden = false; document.body.style.overflow = 'hidden';
      $('sc-lb-close').focus();
    }
    function closeLb() {
      S.lb = -1; el.lb.hidden = true; document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    function stepLb(d) { var n = P().photos.length; S.lb = (S.lb + d + n) % n; renderLb(); }
    $('sc-lb-close').addEventListener('click', closeLb);
    $('sc-lb-backdrop').addEventListener('click', closeLb);
    $('sc-lb-prev').addEventListener('click', function () { stepLb(-1); });
    $('sc-lb-next').addEventListener('click', function () { stepLb(1); });
    document.addEventListener('keydown', function (e) {
      if (S.lb < 0) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') stepLb(-1);
      else if (e.key === 'ArrowRight') stepLb(1);
    });

    buildTabs(); selectProject(0);
  }

  /* ---------------------------------------------------------------
     Quote form — sends through FormSubmit to info@stallioncontracting.ca
  ---------------------------------------------------------------- */
  var form = $('quote-form');

  /* Step-by-step quiz: one question per screen, tap to advance */
  var quiz = { step: 0 };
  if (form && form.classList.contains('quiz')) {
    var qSteps = form.querySelectorAll('.qstep'), qBars = form.querySelectorAll('.qbars span');
    var qBack = $('q-back'), qNum = $('q-num'), qSummary = $('q-summary'), LAST = qSteps.length - 1;
    var arrowNav = false;
    form.classList.add('quiz-js');

    quiz.show = function (i, focus) {
      quiz.step = i;
      Array.prototype.forEach.call(qSteps, function (s, k) { s.classList.toggle('is-current', k === i); });
      Array.prototype.forEach.call(qBars, function (b, k) { b.classList.toggle('is-done', k <= i); });
      qNum.textContent = i + 1;
      qBack.hidden = i === 0;
      if (i === LAST) {
        qSummary.innerHTML = '';
        Array.prototype.forEach.call(form.querySelectorAll('.qradio:checked'), function (r) {
          var chip = document.createElement('span'); chip.textContent = r.value; qSummary.appendChild(chip);
        });
      }
      if (focus) {
        var target = i === LAST ? $('f-name') : qSteps[i].querySelector('.qlegend');
        if (target) target.focus({ preventScroll: true });
      }
    };
    quiz.preset = function () {
      var p = form.dataset.preset;
      if (!p) return 0;
      var r = qSteps[0].querySelector('.qradio[value="' + p.replace(/"/g, '\\"') + '"]');
      if (r) { r.checked = true; return 1; }
      return 0;
    };

    form.addEventListener('keydown', function (e) { if (/^Arrow/.test(e.key)) arrowNav = true; });
    form.addEventListener('click', function (e) {
      if (!e.target.classList || !e.target.classList.contains('qradio')) return;
      if (arrowNav) { arrowNav = false; return; }   /* keyboard users browse options with arrows; Enter/Space moves on */
      var at = quiz.step;
      setTimeout(function () { if (quiz.step === at && at < LAST) quiz.show(at + 1, true); }, 220);
    });
    qBack.addEventListener('click', function () { quiz.show(Math.max(0, quiz.step - 1), true); });
    quiz.show(quiz.preset(), false);
  }

  if (form && window.fetch) {
    var success = $('quote-success'), err = $('form-error'), btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (quiz.show && quiz.step < qSteps.length - 1) { quiz.show(quiz.step + 1, true); return; }
      err.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…';
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.hidden = true; success.hidden = false; success.focus();
      }).catch(function () {
        err.hidden = false;
      }).then(function () {
        btn.disabled = false; btn.textContent = btn.dataset.label;
      });
    });
    $('quote-reset').addEventListener('click', function () {
      form.reset(); success.hidden = true; form.hidden = false;
      if (quiz.show) quiz.show(quiz.preset(), true); else $('f-name').focus();
    });
  }

  /* Project video: make sure it plays inline (iPhone needs muted set as a property) */
  Array.prototype.forEach.call(document.querySelectorAll('video.vid-main'), function (v) {
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    var tryPlay = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) tryPlay(); else v.pause(); });
      }, { threshold: 0.25 }).observe(v);
    } else { tryPlay(); }
  });

  /* Intro: click anywhere to skip */
  var intro = $('intro');
  if (intro) intro.addEventListener('click', function () { document.documentElement.classList.remove('has-intro'); });
})();
