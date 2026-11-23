(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* mobiel menu */
  var burger = document.getElementById('burger');
  var mm = document.getElementById('mm');
  if (burger && mm) {
    var setMenu = function (open) {
      mm.classList.toggle('open', open);
      burger.classList.toggle('x', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setMenu(!mm.classList.contains('open')); });
    mm.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* elementen verschijnen bij het scrollen */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  var bars = [].slice.call(document.querySelectorAll('.bars'));
  if (!hasIO || reduce) {
    rv.forEach(function (el) { el.classList.remove('rv'); });
    bars.forEach(function (el) { el.classList.add('in'); });
  } else {
    var groups = new Map();
    rv.forEach(function (el) {
      var i = groups.get(el.parentNode) || 0;
      groups.set(el.parentNode, i + 1);
      el.style.setProperty('--rd', Math.min(i, 5) * 0.08 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('in');
        if (el.classList.contains('bars')) return;
        setTimeout(function () {
          el.classList.remove('rv', 'in');
          el.style.removeProperty('--rd');
        }, 1500);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
    bars.forEach(function (el) { io.observe(el); });
  }

  /* tellers (5+ en 10+) */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length && hasIO && !reduce) {
    var run = function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    counters.forEach(function (el) { el.textContent = '0'; });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { cio.unobserve(en.target); run(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* uitklapbare vragen */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.faq > button');
    if (!b) return;
    var open = b.parentNode.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* filter op de blogpagina */
  var chips = document.querySelector('[data-filters]');
  if (chips) {
    var cards = [].slice.call(document.querySelectorAll('[data-cat]'));
    var empty = document.getElementById('empty');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      [].forEach.call(chips.querySelectorAll('button'), function (x) {
        var on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var n = 0;
      cards.forEach(function (c) {
        var show = f === 'alle' || c.getAttribute('data-cat') === f;
        c.hidden = !show;
        if (show) n++;
      });
      if (empty) empty.hidden = n > 0;
    });
    var showAll = document.getElementById('show-all');
    if (showAll) showAll.addEventListener('click', function () {
      var all = chips.querySelector('[data-filter="alle"]');
      if (all) all.click();
    });
  }

  /* leesbalk in artikelen */
  var bar = document.querySelector('.progress i');
  var art = document.querySelector('article');
  if (bar && art) {
    var update = function () {
      var top = art.getBoundingClientRect().top + window.scrollY;
      var h = art.offsetHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY - top) / h : 1;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* contactformulier */
  var form = document.getElementById('contact-form');
  if (form) {
    var topics = document.getElementById('f-onderwerp');
    var err = document.getElementById('f-err');
    var chipsBox = form.querySelector('[data-chips]');
    chipsBox.addEventListener('click', function (e) {
      var b = e.target.closest('button.chip');
      if (!b) return;
      var on = !b.classList.contains('on');
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      topics.value = [].map.call(chipsBox.querySelectorAll('.chip.on'), function (c) { return c.textContent; }).join(', ');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('f-naam').value.trim();
      var mail = document.getElementById('f-mail').value.trim();
      var msg = document.getElementById('f-msg').value.trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(mail)) {
        err.textContent = 'Vul je naam en een geldig e-mailadres in.';
        err.hidden = false;
        return;
      }
      err.hidden = true;
      if (document.getElementById('f-key').value.indexOf('VUL_HIER') === 0) {
        /* nog geen sleutel ingevuld: open het mailprogramma met een ingevuld bericht */
        var body = 'Naam: ' + name + '\nE-mail: ' + mail + (topics.value ? '\nOnderwerp: ' + topics.value : '') + '\n\n' + msg;
        window.location.href = 'mailto:elefate.marketing@gmail.com?subject=' + encodeURIComponent('Aanvraag via elefatemarketing.nl') + '&body=' + encodeURIComponent(body);
        return;
      }
      var submit = form.querySelector('button[type=submit]');
      submit.disabled = true;
      fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error('mislukt');
          form.hidden = true;
          document.getElementById('f-sent').hidden = false;
        })
        .catch(function () {
          err.textContent = 'Versturen is niet gelukt. Mail ons via elefate.marketing@gmail.com.';
          err.hidden = false;
          submit.disabled = false;
        });
    });
  }

  /* knoppen en links die naar het mailprogramma wijzen ("Plan een gesprek", "Aanvragen") gaan naar de contactpagina */
  [].forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (a) {
    if (a.classList.contains('btn') || /plan een gesprek/i.test(a.textContent)) a.setAttribute('href', '/contact');
  });
})();
