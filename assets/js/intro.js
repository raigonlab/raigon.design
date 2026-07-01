// intro.js — one-time typing overlay shown on first visit per session
(function () {
  'use strict';

  const intro  = document.getElementById('homeIntro');
  const target = document.getElementById('homeIntroText');
  const cursor = document.getElementById('homeIntroCursor');
  if (!intro || !target) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || sessionStorage.getItem('intro-seen')) {
    intro.style.display = 'none';
    return;
  }

  const text           = "Hi, I'm Rai —\na designer.\nEmpowering businesses\nand people through design.";
  const CHAR_SPEED_MS  = 42;
  const PAUSE_AFTER_MS = 1400;
  const FADE_DURATION  = 950;

  let i = 0;
  function type() {
    if (i < text.length) {
      const ch = text[i++];
      if (ch === '\n') {
        target.appendChild(document.createElement('br'));
      } else {
        target.appendChild(document.createTextNode(ch));
      }
      setTimeout(type, CHAR_SPEED_MS);
    } else {
      setTimeout(function () {
        if (cursor) cursor.style.display = 'none';
        intro.classList.add('is-done');
        sessionStorage.setItem('intro-seen', '1');
        setTimeout(function () { intro.style.display = 'none'; }, FADE_DURATION);
      }, PAUSE_AFTER_MS);
    }
  }

  // Short delay so the marquee cards start moving first.
  setTimeout(type, 600);
}());
