// hero-bg.js — dotted design-notebook grid that slowly flies toward the viewer,
// like passing through stars. Seamless infinite zoom: a coarse grid grows while
// a finer one fades in between its dots, and every doubling loops back.
(function () {
  'use strict';

  const hero   = document.querySelector('.hero');
  const canvas = document.querySelector('.hero-bg');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SPACING   = 30;     // grid spacing in px at the start of a cycle
  const CYCLE_S   = 16;     // seconds for the grid to double in size
  const ALPHA_MIN = 0.07;   // dots near the vanishing point
  const ALPHA_MAX = 0.22;   // dots at the edges
  const STEER     = 0.12;   // how far the vanishing point follows the cursor

  let w = 0, h = 0, dpr = 1;
  let phase = 0;
  let vx = 0, vy = 0;       // vanishing point (eased)
  let tx = 0, ty = 0;       // vanishing point target
  let last = 0;
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tx = vx = w / 2;
    ty = vy = h / 2;
  }

  function drawGrid(spacing, alphaScale, oddOnly) {
    const maxD = Math.hypot(w, h) / 2;
    const i0 = Math.floor(-vx / spacing), i1 = Math.ceil((w - vx) / spacing);
    const j0 = Math.floor(-vy / spacing), j1 = Math.ceil((h - vy) / spacing);

    for (let i = i0; i <= i1; i++) {
      const x = vx + i * spacing;
      for (let j = j0; j <= j1; j++) {
        if (oddOnly && !(i & 1) && !(j & 1)) continue;  // these sit on the coarse grid
        const y = vy + j * spacing;
        const t = Math.min(1, Math.hypot(x - vx, y - vy) / maxD);
        const r = 0.5 + t * 0.9;
        ctx.globalAlpha = (ALPHA_MIN + t * (ALPHA_MAX - ALPHA_MIN)) * alphaScale;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#F2F0EC';
    const scale = Math.pow(2, phase);
    drawGrid(SPACING * scale, 1, false);
    drawGrid(SPACING * scale / 2, phase, true);
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    phase = (phase + dt / CYCLE_S) % 1;
    vx += (tx - vx) * 0.03;
    vy += (ty - vy) * 0.03;
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  resize();
  draw();
  window.addEventListener('resize', function () { resize(); draw(); });

  if (reduceMotion) return;

  hero.addEventListener('pointermove', function (e) {
    const rect = hero.getBoundingClientRect();
    tx = w / 2 + (e.clientX - rect.left - w / 2) * STEER;
    ty = h / 2 + (e.clientY - rect.top  - h / 2) * STEER;
  });
  hero.addEventListener('pointerleave', function () { tx = w / 2; ty = h / 2; });

  // Only animate while the hero is on screen.
  new IntersectionObserver(function (entries) {
    entries[0].isIntersecting ? start() : stop();
  }).observe(hero);

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
})();
