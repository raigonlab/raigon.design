// cover.js — editorial collage on the cover: torn paper edges, hand scribbles,
// project reels drifting through the torn windows, and a slight paper parallax.
(function () {
  'use strict';

  const stage = document.querySelector('.cover-stage');
  if (!stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PROJECTS = [
    { title: 'RaigonOS',      thumb: 'assets/images/home/raigonos-1.webp' },
    { title: 'Arca Vault',    thumb: 'assets/images/home/arcavault-1.webp' },
    { title: 'Tattoo Studio', thumb: 'assets/images/home/raigonch-1.webp' },
    { title: 'Dronzza',       thumb: 'assets/images/home/dronzza-1.webp' },
    { title: 'Cublok',        thumb: 'assets/images/home/cublok-1.webp' },
    { title: 'Lumen',         thumb: 'assets/images/home/lumen-1.webp' },
    { title: 'Kerart',        thumb: 'assets/images/home/kerart-gallery-1.webp' },
    { title: 'Arca Vault',    thumb: 'assets/images/home/arcavault-2.webp' },
    { title: 'inxfitness',    thumb: 'assets/images/home/inxfitness-1.webp' },
    { title: 'Dronzza',       thumb: 'assets/images/home/dronzza-2.webp' },
    { title: 'Gallery MMXI',  thumb: 'assets/images/home/raigon-mmxi-1.webp' },
    { title: 'sky-fly',       thumb: 'assets/images/home/sky-fly-1.webp' },
  ];

  // ── Reels: each window starts at a different project, list doubled to loop ──
  stage.querySelectorAll('[data-reel]').forEach(function (reel) {
    const offset = +reel.dataset.reel;
    const order = PROJECTS.slice(offset).concat(PROJECTS.slice(0, offset));
    order.concat(order).forEach(function (p) {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = p.thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      const cap = document.createElement('figcaption');
      cap.textContent = p.title;
      fig.append(img, cap);
      reel.appendChild(fig);
    });
  });

  // ── Torn edges: jagged clip-path on the sides listed in data-torn ──
  function tornEdge(len, steps, depth) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const jitter = i === 0 || i === steps ? 0 : (Math.random() - 0.5) * (100 / steps) * 0.6;
      pts.push([Math.min(100, Math.max(0, (i / steps) * 100 + jitter)), Math.random() * depth]);
    }
    return pts;
  }

  function tear(el) {
    const sides = el.dataset.torn;
    const w = el.offsetWidth || 300, h = el.offsetHeight || 300;
    const dx = (7 / w) * 100, dy = (7 / h) * 100;      // ~7px deep tears
    const stepsX = Math.max(8, Math.round(w / 14));
    const stepsY = Math.max(8, Math.round(h / 14));
    const poly = [];

    const top = sides.includes('t') ? tornEdge(100, stepsX, dy) : [[0, 0], [100, 0]];
    top.forEach(function (p) { poly.push([p[0], p[1]]); });

    const right = sides.includes('r') ? tornEdge(100, stepsY, dx) : [[0, 0], [100, 0]];
    right.forEach(function (p) { poly.push([100 - p[1], p[0]]); });

    const bottom = sides.includes('b') ? tornEdge(100, stepsX, dy) : [[0, 0], [100, 0]];
    bottom.forEach(function (p) { poly.push([100 - p[0], 100 - p[1]]); });

    const left = sides.includes('l') ? tornEdge(100, stepsY, dx) : [[0, 0], [100, 0]];
    left.forEach(function (p) { poly.push([p[1], 100 - p[0]]); });

    el.style.clipPath = 'polygon(' + poly.map(function (p) {
      return p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%';
    }).join(',') + ')';
  }

  const torn = stage.querySelectorAll('[data-torn]');
  torn.forEach(tear);

  // ── Scribbles: a pencil wandering in loose loops ──
  stage.querySelectorAll('[data-scribble]').forEach(function (svg) {
    const n = +svg.dataset.scribble;
    let x = 20 + Math.random() * 60, y = 20 + Math.random() * 60;
    let d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
    for (let i = 0; i < n; i++) {
      const cx = x + (Math.random() - 0.5) * 60;
      const cy = y + (Math.random() - 0.5) * 60;
      x = Math.min(98, Math.max(2, x + (Math.random() - 0.5) * 50));
      y = Math.min(98, Math.max(2, y + (Math.random() - 0.5) * 50));
      d += ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { torn.forEach(tear); }, 200);
  });

  // ── Parallax: paper layers shift slightly with the cursor ──
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  stage.addEventListener('pointermove', function (e) {
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    stage.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  stage.addEventListener('pointerleave', function () {
    stage.style.setProperty('--mx', 0);
    stage.style.setProperty('--my', 0);
  });
})();
