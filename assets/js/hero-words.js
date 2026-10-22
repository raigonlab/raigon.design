// hero-words.js — living typography on the intro: a verb that quietly changes
// and process words that surface around the cursor, then dissolve.
(function () {
  'use strict';

  const intro = document.querySelector('.intro');
  const swaps = [...document.querySelectorAll('.intro .word-swap')];
  const field = document.querySelector('.word-field');
  if (!intro || !swaps.length || !field) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const TERMS = [
    'iteration', 'combination', 'interpolation', 'fabricating', 'prototyping',
    'sketching', 'variation', 'composition', 'hierarchy', 'contrast', 'rhythm',
    'kerning', 'wireframe', 'grid', 'tension', 'scale', 'feedback loop',
    'user flow', 'constraint', 'pattern', 'system', 'refine', 'test', 'ship',
    'research', 'empathy', 'affordance', 'negative space', 'what if…?',
  ];

  const SWAP_EVERY_PX   = 650;   // mouse travel between verb changes
  const SWAP_MIN_MS     = 3200;  // and never faster than this
  const SPAWN_EVERY_PX  = 240;   // mouse travel between floating words
  const SPAWN_MIN_MS    = 1100;
  const MAX_WORDS       = 5;
  const FADE_MS         = 700;   // keep in sync with .word-swap transition

  // ── Swapping words: soft fade + width glide, one at a time ──
  const words = swaps.map(function (el) { return { el: el, list: el.dataset.words.split(','), i: 0 }; });
  let turn = 0;
  let swapping = false;
  let lastSwap = 0;

  function measure(swap, text) {
    const probe = swap.cloneNode();
    probe.textContent = text;
    probe.style.cssText = 'position:absolute;visibility:hidden;width:auto';
    swap.parentNode.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  }

  function nextVerb() {
    const now = performance.now();
    if (swapping || now - lastSwap < SWAP_MIN_MS) return;
    swapping = true;
    lastSwap = now;

    const w = words[turn];
    turn = (turn + 1) % words.length;
    const swap = w.el;
    w.i = (w.i + 1) % w.list.length;
    const next = w.list[w.i];

    swap.style.width = swap.getBoundingClientRect().width + 'px';
    swap.classList.add('is-out');

    setTimeout(function () {
      swap.textContent = next;
      swap.style.width = measure(swap, next) + 'px';
      swap.classList.remove('is-out');
      setTimeout(function () {
        swap.style.width = '';
        swapping = false;
      }, FADE_MS);
    }, FADE_MS);
  }

  // ── Floating process words ──
  let termIndex = (Math.random() * TERMS.length) | 0;
  let lastSpawn = 0;

  function spawn(x, y) {
    const now = performance.now();
    if (now - lastSpawn < SPAWN_MIN_MS) return;
    lastSpawn = now;

    if (field.childElementCount >= MAX_WORDS) field.firstElementChild.remove();

    const word = TERMS[termIndex];
    termIndex = (termIndex + 1) % TERMS.length;

    const el = document.createElement('span');
    el.className = 'word-float';
    el.style.left = x + (Math.random() - 0.5) * 200 + 'px';
    el.style.top  = y + (Math.random() - 0.5) * 120 + 'px';
    el.style.fontSize = (1 + Math.random() * 0.7).toFixed(2) + 'rem';
    el.style.setProperty('--drift', (Math.random() - 0.5) * 16 + 'px');
    if (Math.random() < 0.25) el.classList.add('is-accent');

    [...word].forEach(function (ch, i) {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      el.appendChild(s);
    });

    field.appendChild(el);
    el.addEventListener('animationend', function (e) {
      if (e.target === el) el.remove();
    });
  }

  // ── Input ──
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    let lastX = null, lastY = null, swapDist = 0, spawnDist = 0;

    intro.addEventListener('pointermove', function (e) {
      const rect = intro.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (lastX !== null) {
        const d = Math.hypot(x - lastX, y - lastY);
        swapDist += d;
        spawnDist += d;
      }
      lastX = x; lastY = y;

      if (swapDist > SWAP_EVERY_PX)   { swapDist = 0;  nextVerb(); }
      if (spawnDist > SPAWN_EVERY_PX) { spawnDist = 0; spawn(x, y); }
    });

    intro.addEventListener('pointerleave', function () { lastX = lastY = null; });
  } else {
    // Touch: let the page breathe on its own.
    setInterval(nextVerb, 4000);
    setInterval(function () {
      spawn(Math.random() * intro.clientWidth, Math.random() * intro.clientHeight);
    }, 2600);
  }
})();
