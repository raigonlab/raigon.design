// hero-words.js — the headline verbs quietly change as the cursor moves.
(function () {
  'use strict';

  const intro = document.querySelector('.cover-stage');
  const swaps = [...document.querySelectorAll('.cover-stage .word-swap')];
  if (!intro || !swaps.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SWAP_EVERY_PX = 650;   // mouse travel between verb changes
  const SWAP_MIN_MS   = 3200;  // and never faster than this
  const FADE_MS       = 700;   // keep in sync with .word-swap transition

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

  // ── Input ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let lastX = null, lastY = null, dist = 0;

    intro.addEventListener('pointermove', function (e) {
      if (lastX !== null) dist += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
      if (dist > SWAP_EVERY_PX) { dist = 0; nextVerb(); }
    });

    intro.addEventListener('pointerleave', function () { lastX = lastY = null; });
  } else {
    // Touch: let the page breathe on its own.
    setInterval(nextVerb, 4000);
  }
})();
