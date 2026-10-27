/* particulas.js — agrégalo antes de </body>:  <script src="particulas.js" defer></script>
   Crea solo el canvas, la barra de progreso y la luz de las tarjetas. No toca tu HTML ni tu JS. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Canvas de partículas ---------- */
  var canvas = document.createElement('canvas');
  canvas.id = 'particles-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, parts = [], raf = null;
  var mouse = { x: -9999, y: -9999 };
  var COLORS = ['#ffffff', '#22d3ee', '#a78bfa', '#6366f1'];
  var LINK = 130, LINK2 = LINK * LINK, lastY = window.scrollY;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(140, Math.floor((W * H) / 11000));
    parts = [];
    for (var i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.6,
        z: Math.random() * 0.35 + 0.05,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var sdy = window.scrollY - lastY;   // parallax: las partículas siguen el scroll de toda la página
    lastY = window.scrollY;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];

      if (!reduce) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 16900 && d2 > 0) {            // radio 130px: se alejan del cursor
          var d = Math.sqrt(d2);
          p.x += (dx / d) * 1.1;
          p.y += (dy / d) * 1.1;
        }
        p.x += p.vx;
        p.y += p.vy - sdy * p.z;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (var j = i + 1; j < parts.length; j++) {
        var q = parts[j], ax = p.x - q.x, ay = p.y - q.y, dd = ax * ax + ay * ay;
        if (dd < LINK2) {
          ctx.globalAlpha = (1 - dd / LINK2) * 0.26;
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    // líneas hacia el cursor
    if (!reduce && mouse.x > -9000) {
      for (var k = 0; k < parts.length; k++) {
        var m = parts[k], mx = m.x - mouse.x, my = m.y - mouse.y, md = mx * mx + my * my;
        if (md < 28900) {
          ctx.globalAlpha = (1 - md / 28900) * 0.35;
          ctx.strokeStyle = '#a78bfa';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() { if (!reduce && !raf) loop(); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  build();
  if (reduce) draw(); else start();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); if (reduce) draw(); }, 150);
  });
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseout', function () { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  /* ---------- Barra de progreso de scroll ---------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* ---------- Luz que sigue al cursor en tarjetas ---------- */
  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest && e.target.closest('.skill-card, .testimonial-card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();