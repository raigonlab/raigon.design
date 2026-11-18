// statue.js — a form made of pixels, always turning: a Greek head that dissolves
// into a fish, a wolf and a plant, and back. Each project is a coloured point
// orbiting it; the points appear when the visitor comes close.
(function () {
  'use strict';

  const cover  = document.querySelector('.cover');
  const canvas = document.querySelector('.c-statue');
  const data   = window.STATUE_SHAPES;
  const credit = document.querySelector('.c-credit');
  if (!cover || !canvas || !data) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ctx = canvas.getContext('2d');

  // ── Decode the point cloud ──
  function decode(b64, Type) {
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Type(bytes.buffer);
  }
  const N = data.count;
  const CREDITS = {
    head:  'fig. 01 · niobid nymph · cast KAS869, SMK · public domain',
    fish:  'fig. 02 · barramundi · Khronos glTF sample · CC0',
    wolf:  'fig. 03 · capitoline wolf · cast KAS837, SMK · public domain',
    plant: 'fig. 04 · anthurium · Poly Haven · CC0',
  };
  const SHAPES = data.shapes.map(function (sh) {
    const rawP = decode(sh.pos, Int16Array), rawN = decode(sh.nor, Int8Array);
    const p = new Float32Array(N * 3), n = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) { p[i] = rawP[i] / 32767; n[i] = rawN[i] / 127; }
    return { name: sh.name, p: p, n: n, twoSided: sh.name === 'plant' };
  });

  // Current cloud (what gets drawn) and a random direction per point for the scatter.
  const P = new Float32Array(N * 3), NR = new Float32Array(N * 3), J = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) J[i] = Math.random() * 2 - 1;
  P.set(SHAPES[0].p); NR.set(SHAPES[0].n);

  const HOLD = 7, MORPH = 2.8;   // seconds a form stays, seconds to become the next one
  let shown = -1, twoSided = false;

  function morph(t) {
    const cycle = HOLD + MORPH;
    const idx = Math.floor(t / cycle) % SHAPES.length;
    const phase = t % cycle;
    const a = SHAPES[idx];
    if (phase < HOLD) {
      if (shown !== idx) {               // settle on the form once, then leave it be
        P.set(a.p); NR.set(a.n); shown = idx; twoSided = a.twoSided;
        if (credit) credit.textContent = CREDITS[a.name] || '';
      }
      return;
    }
    shown = -1; twoSided = true;
    const b = SHAPES[(idx + 1) % SHAPES.length];
    const x = (phase - HOLD) / MORPH, e = x * x * (3 - 2 * x);
    const spread = Math.sin(Math.PI * e) * 0.45;   // points fly loose mid-way
    for (let i = 0; i < N * 3; i++) {
      P[i] = a.p[i] + (b.p[i] - a.p[i]) * e + J[i] * spread;
      NR[i] = a.n[i] + (b.n[i] - a.n[i]) * e;
    }
  }

  // Light from the upper left, slightly in front.
  const L = (function () { const v = [-0.55, 0.6, 0.6], l = Math.hypot(v[0], v[1], v[2]); return v.map(function (c) { return c / l; }); })();
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + 0.5) / 16; });
  const INK = 0xFFE7EBEC;    // #ECEBE7 as little-endian ABGR
  const DIST = 3.4;          // camera distance in model units

  const orbits = [...cover.querySelectorAll('.orbit')].map(function (el, i) {
    return { el: el, r: 0.8 + i * 0.075, incl: -0.55 + i * 0.27, node: i * 1.25, speed: 0.16 + i * 0.035, phase: i * (Math.PI * 2 / 5) };
  });
  const legend = [...cover.querySelectorAll('.c-legend a')];

  let W, H, PX, cw, ch, cx, cy, scale, img, buf32, zbuf, light;
  let yawExtra = 0, pitchExtra = 0, targetYaw = 0, targetPitch = 0;
  let running = false, raf, start = performance.now();

  function resize() {
    cw = cover.clientWidth; ch = cover.clientHeight;
    PX = cw < 700 ? 2 : 3;                       // size of one statue pixel in CSS px
    W = Math.ceil(cw / PX); H = Math.ceil(ch / PX);
    canvas.width = W; canvas.height = H;
    cx = W * (cw < 700 ? 0.5 : 0.6);
    cy = H * (cw < 700 ? 0.66 : 0.47);
    scale = Math.min(H * (cw < 700 ? 0.2 : 0.32), W * 0.4);
    img = ctx.createImageData(W, H);
    buf32 = new Uint32Array(img.data.buffer);
    zbuf = new Float32Array(W * H);
    light = new Float32Array(W * H);
  }

  function frame(now) {
    const t = (now - start) / 1000;
    yawExtra += (targetYaw - yawExtra) * 0.05;
    pitchExtra += (targetPitch - pitchExtra) * 0.05;

    const yaw = (reduceMotion ? 0.6 : t * (Math.PI * 2 / 40)) + yawExtra;
    const pitch = -0.08 + pitchExtra;
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
    if (!reduceMotion) morph(t);

    zbuf.fill(-1e9);
    buf32.fill(0);

    for (let i = 0; i < N; i++) {
      const k = i * 3;
      // normal first: skip points facing away
      const nx = NR[k], ny = NR[k + 1], nz = NR[k + 2];
      let nx1 = nx * cY + nz * sY, nz1 = -nx * sY + nz * cY;
      let ny2 = ny * cP - nz1 * sP, nz2 = ny * sP + nz1 * cP;
      if (nz2 < -0.15) {
        if (!twoSided) continue;          // thin leaves and loose points show both faces
        nx1 = -nx1; ny2 = -ny2; nz2 = -nz2;
      }

      const x = P[k], y = P[k + 1], z = P[k + 2];
      const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      const y2 = y * cP - z1 * sP, z2 = y * sP + z1 * cP;
      const s = DIST / (DIST - z2);
      const px = (cx + x1 * scale * s) | 0, py = (cy - y2 * scale * s) | 0;
      if (px < 0 || py < 0 || px >= W - 1 || py >= H - 1) continue;

      const diff = Math.max(0, nx1 * L[0] + ny2 * L[1] + nz2 * L[2]);
      const rim = Math.pow(1 - Math.abs(nz2), 3) * 0.25;
      const b = 0.02 + diff * 0.85 + rim;

      // 2×2 splat with depth test
      for (let oy = 0; oy < 2; oy++) {
        for (let ox = 0; ox < 2; ox++) {
          const idx = (py + oy) * W + px + ox;
          if (z2 > zbuf[idx]) { zbuf[idx] = z2; light[idx] = b; }
        }
      }
    }

    // 1-bit ordered dither: the statue is made only of pixels that are on or off
    for (let py = 0; py < H; py++) {
      const row = py * W, by = (py & 3) * 4;
      for (let px = 0; px < W; px++) {
        const idx = row + px;
        if (zbuf[idx] > -1e8 && light[idx] > BAYER[by + (px & 3)]) buf32[idx] = INK;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Orbits: project each point with the same camera; dim it when it passes behind the head
    orbits.forEach(function (o) {
      const a = o.phase + (reduceMotion ? 0 : t * o.speed);
      let x = o.r * Math.cos(a), y = 0, z = o.r * Math.sin(a);
      const ci = Math.cos(o.incl), si = Math.sin(o.incl);
      [y, z] = [y * ci - z * si, y * si + z * ci];
      const cn = Math.cos(o.node + yawExtra), sn = Math.sin(o.node + yawExtra);
      [x, z] = [x * cn + z * sn, -x * sn + z * cn];
      const y2 = y * cP - z * sP, z2 = y * sP + z * cP;
      const s = DIST / (DIST - z2);
      const bx = cx + x * scale * s, by = cy - y2 * scale * s;
      const idx = (by | 0) * W + (bx | 0);
      const hidden = idx >= 0 && idx < zbuf.length && zbuf[idx] > z2;
      o.el.style.transform = 'translate(' + (bx * PX).toFixed(1) + 'px,' + (by * PX).toFixed(1) + 'px) scale(' + s.toFixed(2) + ')';
      o.el.style.setProperty('--o', hidden ? 0.15 : 1);
      o.el.style.zIndex = z2 > 0 ? 3 : 1;
    });

    if (running) raf = requestAnimationFrame(frame);
  }

  function play() {
    if (running) return;
    if (reduceMotion) { frame(performance.now()); return; }
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  // ── Coming close reveals the projects ──
  function near(on) { cover.classList.toggle('is-near', on); }

  if (fine) {
    cover.addEventListener('pointermove', function (e) {
      const r = cover.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const d = Math.hypot(mx - cx * PX, my - cy * PX);
      near(d < Math.min(cw, ch) * 0.55);
      targetYaw = ((mx / cw) - 0.5) * 0.6;
      targetPitch = ((my / ch) - 0.5) * 0.2;
    });
    cover.addEventListener('pointerleave', function () { near(false); targetYaw = targetPitch = 0; });
  } else {
    near(true);   // no hover on touch screens: the orbit is always visible
  }
  cover.addEventListener('click', function (e) {
    if (!e.target.closest('a')) near(!cover.classList.contains('is-near'));
  });

  // Legend ⇄ orbit: pointing at a project in either place lights both
  legend.forEach(function (a, i) {
    function lit(on) {
      a.classList.toggle('is-lit', on);
      if (orbits[i]) orbits[i].el.classList.toggle('is-lit', on);
      if (on) near(true);
    }
    a.addEventListener('pointerenter', function () { lit(true); });
    a.addEventListener('pointerleave', function () { lit(false); });
    a.addEventListener('focus', function () { lit(true); });
    a.addEventListener('blur', function () { lit(false); });
    if (orbits[i]) {
      orbits[i].el.addEventListener('pointerenter', function () { a.classList.add('is-lit'); });
      orbits[i].el.addEventListener('pointerleave', function () { a.classList.remove('is-lit'); });
    }
  });

  resize();
  new ResizeObserver(function () { resize(); if (!running) frame(performance.now()); }).observe(cover);
  new IntersectionObserver(function (entries) { entries[0].isIntersecting ? play() : pause(); }).observe(cover);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });
  play();
})();
