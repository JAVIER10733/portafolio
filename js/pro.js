/* pro.js — se carga después de main.js y particulas.js. Crea todo por JS: no necesitas tocar tu HTML. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover)').matches;
  function $(s) { return document.querySelector(s); }
  function $$(s) { return [].slice.call(document.querySelectorAll(s)); }
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Luz que sigue al cursor ---- */
  if (fine && !reduce) {
    var spot = document.createElement('div');
    spot.id = 'spot';
    document.body.appendChild(spot);
    window.addEventListener('mousemove', function (e) {
      spot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });
  }

  /* ---- Línea tipo terminal en el hero ---- */
  var lead = $('.hero-lead');
  if (lead) {
    var term = document.createElement('p');
    term.className = 'terminal';
    term.setAttribute('aria-hidden', 'true');
    term.innerHTML = '<span class="prompt">~$</span> <span id="typed"></span><span class="caret"></span>';
    lead.insertAdjacentElement('afterend', term);
    var typed = $('#typed');
    var roles = ['whoami → Desarrollador Full Stack', 'bots --whatsapp → automatización inteligente', 'nmap --learn → ciberseguridad y hacking ético', 'git commit -m "siempre construyendo"'];
    var ri = 0, ci = 0, del = false;
    (function type() {
      if (reduce) { typed.textContent = roles[0]; return; }
      var w = roles[ri];
      typed.textContent = w.slice(0, ci);
      if (!del && ci < w.length) { ci++; return setTimeout(type, 45); }
      if (!del) { del = true; return setTimeout(type, 1600); }
      if (ci > 0) { ci--; return setTimeout(type, 22); }
      del = false; ri = (ri + 1) % roles.length; setTimeout(type, 300);
    })();
  }

  /* ---- Banda de tecnologías + contadores ---- */
  var hero = $('.hero');
  if (hero) {
    var items = ['JavaScript', 'Node.js', 'PHP', 'Python', 'WhatsApp API', 'REST APIs', 'MySQL', 'MongoDB', 'Git / GitHub', 'Linux', 'HTML5 / CSS3', 'Ciberseguridad'];
    var set = items.map(function (x) { return '<span>' + x + '</span>'; }).join('');
    var m = document.createElement('div');
    m.className = 'tech-marquee';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<div class="tech-track">' + set + set + '</div>';
    hero.insertAdjacentElement('afterend', m);

    var st = document.createElement('div');
    st.className = 'container stats-strip';
    st.innerHTML = [[9, '', 'Repositorios públicos'], [60, '+', 'Contribuciones en 2026'], [5, '', 'Proyectos destacados']].map(function (a) {
      return '<div class="stat-item pro-hidden"><strong class="stat-num" data-n="' + a[0] + '" data-s="' + a[1] + '">' + a[0] + a[1] + '</strong><span>' + a[2] + '</span></div>';
    }).join('');
    m.insertAdjacentElement('afterend', st);

    var nums = $$('.stat-num');
    var cards = $$('.stat-item');
    if (!hasIO || reduce) {
      cards.forEach(function (c) { c.classList.add('pro-in'); });
    } else {
      nums.forEach(function (n) { n.textContent = '0'; });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var card = e.target, n = card.querySelector('.stat-num'), end = +n.dataset.n, t0 = null;
          card.classList.add('pro-in');
          (function step(t) {
            if (!t0) t0 = t;
            var k = Math.min((t - t0) / 1500, 1);
            n.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? n.dataset.s : '');
            if (k < 1) requestAnimationFrame(step);
          })(performance.now());
          io.unobserve(card);
        });
      }, { threshold: 0.5 });
      cards.forEach(function (c) { io.observe(c); });
    }
  }

  /* ---- Menú: marca la sección activa ---- */
  var links = $$('.nav-menu a[href^="#"]');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if (secs.length && hasIO) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Tilt 3D en tarjetas ---- */
  if (fine && !reduce) {
    $$('.skill-card, .testimonial-card, .blog-card, .stat-item').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('tilt');
        el.style.transform = 'perspective(700px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 10) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.classList.remove('tilt'); el.style.transform = ''; });
    });
  }

  /* ---- Botón volver arriba ---- */
  var tt = document.createElement('button');
  tt.className = 'to-top';
  tt.type = 'button';
  tt.setAttribute('aria-label', 'Volver arriba');
  tt.textContent = '↑';
  document.body.appendChild(tt);
  tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  window.addEventListener('scroll', function () { tt.classList.toggle('show', window.scrollY > 700); }, { passive: true });
})();