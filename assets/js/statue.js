// statue.js — a form made of pixels, always turning: a Greek head that dissolves
// into a tree, the torso of Hercules and a plant, and back. Each project is a coloured point
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
    tree:  'fig. 02 · jacaranda tree · Poly Haven · CC0',
    hercules: 'fig. 03 · lansdowne herakles · cast KAS224, SMK · public domain',
    plant: 'fig. 04 · anthurium · Poly Haven · CC0',
  };
  const SHAPES = data.shapes.map(function (sh) {
    const rawP = decode(sh.pos, Int16Array), rawN = decode(sh.nor, Int8Array);
    const p = new Float32Array(N * 3), n = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) { p[i] = rawP[i] / 32767; n[i] = rawN[i] / 127; }
    return { name: sh.name, p: p, n: n, twoSided: sh.name === 'plant' || sh.name === 'tree' };
  });

  // Current cloud (what gets drawn) and a random direction per point for the scatter.
  const P = new Float32Array(N * 3), NR = new Float32Array(N * 3), J = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) J[i] = Math.random() * 2 - 1;
  P.set(SHAPES[0].p); NR.set(SHAPES[0].n);

  // A slow, simple change of form: every point glides to its new place together,
  // with only a little stagger so the change feels soft rather than mechanical.
  const HOLD = 8, MORPH = 6, WAVE = 0.8;
  const R = new Float32Array(N);
  for (let i = 0; i < N; i++) R[i] = Math.random();
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
    const x = (phase - HOLD) / MORPH;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      let u = (x - R[i] * (1 - WAVE)) / WAVE;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const e = u * u * u * (u * (u * 6 - 15) + 10);           // smootherstep
      for (let c = 0; c < 3; c++) {
        P[k + c] = a.p[k + c] + (b.p[k + c] - a.p[k + c]) * e;
        NR[k + c] = a.n[k + c] + (b.n[k + c] - a.n[k + c]) * e;
      }
    }
  }

  // Light from the upper left, slightly in front.
  const L = (function () { const v = [-0.55, 0.6, 0.6], l = Math.hypot(v[0], v[1], v[2]); return v.map(function (c) { return c / l; }); })();
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + 0.5) / 16; });
  const INK = 0xFFE7EBEC;    // #ECEBE7 as little-endian ABGR
  const DIST = 3.4;          // camera distance in model units

  // Each project is a small cloud of coloured atoms, still being formed, on its own
  // wide orbit — far from the others, like loose particles around the statue.
  // One tilted plane, same pace, evenly spaced: the clouds never meet.
  // Different radii keep the ring loose, like atoms rather than beads.
  const ORBITS = [0.86, 1.32, 1.02, 1.42, 1.16].map(function (r, i) {
    return { r: r, incl: 0.32 + (i % 2 ? 0.08 : -0.08), node: 0.35, speed: 0.075, phase: i * (Math.PI * 2 / 5) };
  });
  const ATOMS = 230;
  function rgba(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    const v = m ? parseInt(m[1], 16) : 0xECEBE7;
    return ((a << 24) | ((v & 0xFF) << 16) | (v & 0xFF00) | ((v >> 16) & 0xFF)) >>> 0;
  }
  function cloud() {
    // anisotropic blob: every project gets its own lopsided shape
    const sx = 0.6 + Math.random() * 0.8, sy = 0.6 + Math.random() * 0.8, sz = 0.6 + Math.random() * 0.8;
    const a = new Float32Array(ATOMS * 9);
    for (let i = 0; i < ATOMS; i++) {
      const k = i * 9, u = Math.random();
      const stray = Math.random() < 0.18;
      let dx = Math.random() * 2 - 1, dy = Math.random() * 2 - 1, dz = Math.random() * 2 - 1;
      const l = Math.hypot(dx, dy, dz) || 1;
      const r = stray ? 0.1 + u * 0.12 : 0.01 + Math.pow(u, 0.85) * 0.085;
      a[k] = dx / l * r * sx; a[k + 1] = dy / l * r * sy; a[k + 2] = dz / l * r * sz;
      a[k + 3] = 0.6 + Math.random() * 1.4;           // wobble speed
      a[k + 4] = Math.random() * Math.PI * 2;         // wobble phase
      a[k + 5] = (stray ? 0.03 : 0.012) + Math.random() * 0.02;   // wobble amplitude
      a[k + 6] = stray ? 0.25 + Math.random() * 0.3 : 0.55 + Math.random() * 0.45;   // weight
      a[k + 7] = stray ? 1 : 0;
      a[k + 8] = Math.random() * Math.PI * 2;         // drift-away phase
    }
    return a;
  }
  const orbits = [...cover.querySelectorAll('.orbit')].map(function (el, i) {
    const o = ORBITS[i % ORBITS.length];
    const col = getComputedStyle(el).getPropertyValue('--c');
    return { el: el, r: o.r, incl: o.incl, node: o.node, speed: o.speed, phase: o.phase,
      atoms: cloud(), hex: col.trim(), col: rgba(col, 0xFF), colSoft: rgba(col, 0xA6), lit: 0, boom: 0, sx: 0, sy: 0 };
  });
  const legend = [...cover.querySelectorAll('.c-legend a')];

  let cx0, cx1, cy0, cy1;
  let W, H, PX, cw, ch, cx, cy, scale, img, buf32, zbuf, light;
  let yawExtra = 0, pitchExtra = 0, targetYaw = 0, targetPitch = 0;
  let running = false, raf, start = performance.now();
  let booming = false, calm = 0, pointing = false;   // calm: 0 → 1 as the title steps aside and the figure centres

  function resize() {
    cw = cover.clientWidth; ch = cover.clientHeight;
    PX = cw < 700 ? 2 : 3;                       // size of one statue pixel in CSS px
    W = Math.ceil(cw / PX); H = Math.ceil(ch / PX);
    canvas.width = W; canvas.height = H;
    cx0 = W * 0.5;  cx1 = W * 0.5;
    cy0 = H * (cw < 700 ? 0.66 : 0.47); cy1 = H * (cw < 700 ? 0.5 : 0.47);
    cx = cx0 + (cx1 - cx0) * calm; cy = cy0 + (cy1 - cy0) * calm;
    scale = Math.min(H * (cw < 700 ? 0.2 : 0.32), W * 0.4);
    img = ctx.createImageData(W, H);
    buf32 = new Uint32Array(img.data.buffer);
    zbuf = new Float32Array(W * H);
    light = new Float32Array(W * H);
  }

  function frame(now) {
    const t = (now - start) / 1000;
    // No pointer: a slow idle glance from side to side.
    const idle = !pointing && !reduceMotion;
    const tyaw = idle ? Math.sin(t * 0.35) * 0.35 : targetYaw;
    const tpitch = idle ? 0 : targetPitch;
    yawExtra += (tyaw - yawExtra) * 0.04;
    pitchExtra += (tpitch - pitchExtra) * 0.04;
    const calmTarget = cover.classList.contains('is-calm') ? 1 : 0;
    calm = reduceMotion ? calmTarget : calm + (calmTarget - calm) * 0.025;
    cx = cx0 + (cx1 - cx0) * calm; cy = cy0 + (cy1 - cy0) * calm;

    const yaw = yawExtra;          // the figure faces the viewer and turns toward the pointer
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
    // Orbits: each project is a cloud of atoms projected with the same camera.
    // Atoms behind the statue almost vanish; nothing here is a perfect dot.
    const spreadR = cw < 700 ? 0.82 : 1;
    orbits.forEach(function (o) {
      const a = o.phase + (reduceMotion ? 0 : t * o.speed);
      let x = o.r * spreadR * Math.cos(a), y = 0, z = o.r * spreadR * Math.sin(a);
      const ci = Math.cos(o.incl), si = Math.sin(o.incl);
      [y, z] = [y * ci - z * si, y * si + z * ci];
      const cn = Math.cos(o.node + yawExtra), sn = Math.sin(o.node + yawExtra);
      [x, z] = [x * cn + z * sn, -x * sn + z * cn];
      const y2 = y * cP - z * sP, z2 = y * sP + z * cP;
      const s = DIST / (DIST - z2);
      const bx = cx + x * scale * s, by = cy - y2 * scale * s;
      o.el.style.transform = 'translate(' + (bx * PX).toFixed(1) + 'px,' + (by * PX).toFixed(1) + 'px)';
      o.el.style.zIndex = z2 > 0 ? 3 : 1;
      o.sx = bx * PX; o.sy = by * PX;

      o.lit += ((o.el.classList.contains('is-lit') ? 1 : 0) - o.lit) * 0.12;
      // small and crisp while orbiting; hover makes it bigger and more diffuse; a click bursts it
      let burst = 0, fade = 1;
      if (o.boom) {
        const p = Math.min(1, (now - o.boom) / 900);
        burst = 1 - Math.pow(1 - p, 3); fade = 1 - p * p;
      } else if (booming) fade = 0.25;
      if (fade <= 0) return;
      const A = o.atoms, swell = (0.7 + o.lit * 0.9) * (1 + burst * 16);   // 30% smaller in orbit, full size on hover
      for (let i = 0; i < ATOMS; i++) {
        const k = i * 9, w = A[k + 3], ph = A[k + 4], amp = A[k + 5];
        // strays drift out and come back; the core breathes
        let out = 1 + 0.18 * Math.sin(t * 0.9 + ph);
        if (A[k + 7]) out += 1.6 * Math.pow(Math.max(0, Math.sin(t * 0.35 + A[k + 8])), 4);
        out *= swell;
        const ax = x + A[k] * out + amp * Math.sin(t * w + ph);
        const ay = y2 + A[k + 1] * out + amp * Math.sin(t * w * 1.3 + ph * 2);
        const az = z2 + A[k + 2] * out + amp * Math.cos(t * w * 0.8 + ph);
        const ps = DIST / (DIST - az);
        const px = (cx + ax * scale * ps) | 0, py = (cy - ay * scale * ps) | 0;
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const idx = py * W + px;
        let dens = A[k + 6] * (0.9 - o.lit * 0.3) * fade;
        if (zbuf[idx] > az) dens *= 0.12;                      // behind the statue
        if (dens <= BAYER[((py & 3) * 4) + (px & 3)]) continue;  // translucent by omission
        const c = A[k + 6] > 0.75 + o.lit * 0.15 ? o.col : o.colSoft;
        buf32[idx] = c;
        if (A[k + 6] > 0.93 && o.lit < 0.5 && px < W - 1 && py < H - 1) {   // a few heavier nuclei
          buf32[idx + 1] = c; buf32[idx + W] = c; buf32[idx + W + 1] = c;
        }
      }
    });
    ctx.putImageData(img, 0, 0);

    if (running) raf = requestAnimationFrame(frame);
  }

  function play() {
    if (running) return;
    if (reduceMotion) { frame(performance.now()); return; }
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  // ── Click: the cloud explodes and the work materialises out of its pixels ──
  function materialize(i, target) {
    const o = orbits[i];
    if (!o || booming) return;
    booming = true; o.boom = performance.now(); near(true);
    if (!running) play();

    const B = innerWidth < 700 ? 8 : 12;                   // one block of the wave, in CSS px
    const w = Math.ceil(innerWidth / B), h = Math.ceil(innerHeight / B);
    const ov = document.createElement('canvas');
    ov.className = 'materialize'; ov.width = w; ov.height = h;
    ov.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ov);
    const c2 = ov.getContext('2d'), im = c2.createImageData(w, h), u = new Uint32Array(im.data.buffer);
    const r = cover.getBoundingClientRect();
    function field(ox, oy) {                                // distance from a point, roughened
      const f = new Float32Array(w * h), m = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
        f[y * w + x] = Math.hypot(x - ox, y - oy) / m * 0.7 + Math.random() * 0.3;
      return f;
    }
    const inF = field((r.left + o.sx) / B, (r.top + o.sy) / B);
    const solid = o.col, soft = o.colSoft;
    const t0 = performance.now() + 300, IN = 560;

    function step() {
      const e = performance.now() - t0;
      const c = Math.max(0, Math.min(1, e / IN)) * 1.08;    // the pixels take over the screen
      u.fill(0);
      for (let k = 0; k < u.length; k++) if (inF[k] < c) u[k] = inF[k] > c - 0.06 ? soft : solid;
      c2.putImageData(im, 0, 0);
      if (e < IN + 60) { requestAnimationFrame(step); return; }

      // fully covered: swap to the work underneath (no scroll), then fade out / fade in
      const root = document.documentElement, sb = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, target.getBoundingClientRect().top + scrollY);
      root.style.scrollBehavior = sb;
      try { history.pushState(null, '', '#' + target.id); } catch (err) { /* file:// previews */ }
      target.classList.remove('is-arriving'); void target.offsetWidth;
      target.classList.add('is-arriving');
      o.boom = 0;
      requestAnimationFrame(function () {
        ov.classList.add('is-leaving');
        setTimeout(function () {
          ov.remove(); booming = false;
          target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
        }, 900);
      });
    }
    requestAnimationFrame(step);
  }

  function explodeOnClick(el, i) {
    el.addEventListener('click', function (e) {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const target = document.querySelector(el.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      materialize(i, target);
    });
  }
  orbits.forEach(function (o, i) { explodeOnClick(o.el, i); });
  legend.forEach(function (a, i) { explodeOnClick(a, i); });

  // ── The title steps aside after a few seconds; the pill brings it back ──
  const toggle = cover.querySelector('.c-toggle');
  function setCalm(on) {
    cover.classList.toggle('is-calm', on);
    if (toggle) {
      toggle.textContent = on ? 'Intro +' : 'Hide';
      toggle.setAttribute('aria-expanded', String(!on));
    }
    if (!running) frame(performance.now());
  }
  let calmTimer = setTimeout(function () { setCalm(true); }, 5500);
  if (toggle) toggle.addEventListener('click', function () {
    clearTimeout(calmTimer);
    setCalm(!cover.classList.contains('is-calm'));
  });

  // ── Coming close reveals the projects ──
  function near(on) {
    cover.classList.toggle('is-near', on);
    if (!running && img) frame(performance.now());
  }

  if (fine) {
    cover.addEventListener('pointermove', function (e) {
      const r = cover.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const d = Math.hypot(mx - cx * PX, my - cy * PX);
      near(d < Math.min(cw, ch) * 0.55);
      // look toward the pointer: up to ~50° left/right, ~17° up/down
      pointing = true;
      targetYaw = Math.max(-1, Math.min(1, (mx - cx * PX) / (cw * 0.5))) * 0.9;
      targetPitch = Math.max(-1, Math.min(1, (my - cy * PX) / (ch * 0.5))) * 0.3;
    });
    cover.addEventListener('pointerleave', function () { near(false); pointing = false; });
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
      orbits[i].el.addEventListener('pointerenter', function () { lit(true); });
      orbits[i].el.addEventListener('pointerleave', function () { lit(false); });
    }
  });

  resize();
  new ResizeObserver(function () { resize(); if (!running) frame(performance.now()); }).observe(cover);
  new IntersectionObserver(function (entries) { entries[0].isIntersecting ? play() : pause(); }).observe(cover);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });
  play();
})();
