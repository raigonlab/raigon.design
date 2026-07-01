// home-marquee.js — endless drifting grid of project thumbnails
(function () {
  'use strict';

  const stage = document.getElementById('homeStage');
  if (!stage) return;

  // All 18 home thumbnails as a static pool — independent of which
  // project sections are visible in the page. This gives enough unique
  // cards that columns of 15 look completely different from each other.
  const ALL_CARDS = [
    { title: 'Arca Vault',        desc: 'UX/UI Design · Fintech',        thumb: 'assets/images/home/arcavault-1.png' },
    { title: 'Dronzza',           desc: 'UX/UI Design · Food Delivery',  thumb: 'assets/images/home/dronzza-1.png' },
    { title: 'inxfitness',        desc: 'Brand Identity · From Scratch', thumb: 'assets/images/home/inxfitness-1.png' },
    { title: 'sky-fly',           desc: 'Web Design · UX',               thumb: 'assets/images/home/sky-fly-1.png' },
    { title: 'Arca Vault',        desc: 'UX/UI Design · Fintech',        thumb: 'assets/images/home/arcavault-2.png' },
    { title: 'Dronzza',           desc: 'UX/UI Design · Food Delivery',  thumb: 'assets/images/home/dronzza-2.png' },
    { title: 'inxfitness',        desc: 'Brand Identity · From Scratch', thumb: 'assets/images/home/inxfitness-2.png' },
    { title: 'sky-fly',           desc: 'Web Design · UX',               thumb: 'assets/images/home/sky-fly-2.png' },
    { title: 'Arca Vault',        desc: 'UX/UI Design · Fintech',        thumb: 'assets/images/home/arcavault-3.png' },
    { title: 'Kerart Gallery',    desc: 'Identity · Web · Branding',     thumb: 'assets/images/home/kerart-gallery-1.png' },
    { title: 'sky-fly',           desc: 'Web Design · UX',               thumb: 'assets/images/home/sky-fly-3.png' },
    { title: 'Arca Vault',        desc: 'UX/UI Design · Fintech',        thumb: 'assets/images/home/arcavault-4.png' },
    { title: 'Kerart Gallery',    desc: 'Identity · Web · Branding',     thumb: 'assets/images/home/kerart-gallery-2.png' },
    { title: 'Raigon MMXI',       desc: 'Web · Vanilla HTML/CSS/JS',     thumb: 'assets/images/home/raigon-mmxi-1.png' },
    { title: 'Kerart Gallery',    desc: 'Identity · Web · Branding',     thumb: 'assets/images/home/kerart-gallery-3.png' },
    { title: 'Lumen',             desc: 'Product Design · Fintech API',  thumb: 'assets/images/home/lumen-1.png' },
    { title: 'Lumen',             desc: 'Product Design · Fintech API',  thumb: 'assets/images/home/lumen-2.png' },
    { title: 'Language Learning', desc: 'Design System · UX · Brand',    thumb: 'assets/images/home/language-learning-1.png' },
  ];

  // Shuffle once so columns start at different points in the sequence.
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  const INFO_H    = 38;
  const ROW_GAP   = 32;
  const COL_GAP   = 24;
  const SPEED     = 0.22;
  const TARGET_COL_W = 184;
  const MAX_COLS  = 5;
  const MAX_COL_W = 260;
  const ASPECT    = 1.3;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols = [];
  let lastNumCols = 0;

  function thumbBg(card) {
    var scrim = /dronzza-1\.png$/.test(card.thumb)
      ? 'linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)),'
      : '';
    return 'background-image:' + scrim + 'url(' + card.thumb + ');background-size:cover;background-position:center';
  }

  function makeCol(cards, cardH) {
    var colEl = document.createElement('div');
    colEl.className = 'home-marquee-col';
    // Repeat 3 times to ensure seamless looping
    for (var rep = 0; rep < 3; rep++) {
      cards.forEach(function (card) {
        var el = document.createElement('div');
        el.className = 'home-marquee-card';
        el.innerHTML =
          '<div class="home-marquee-thumb" style="' + thumbBg(card) + ';height:' + cardH + 'px"></div>' +
          '<div>' +
            '<div class="home-marquee-card-title">' + card.title + '</div>' +
            '<div class="home-marquee-card-desc">'  + card.desc  + '</div>' +
          '</div>';
        colEl.appendChild(el);
      });
    }
    stage.appendChild(colEl);
    return colEl;
  }

  function numColsFor(stageW) {
    var n = Math.max(2, Math.round(stageW / (TARGET_COL_W + COL_GAP)));
    var w = (stageW - (n - 1) * COL_GAP) / n;
    if (w > 241 && n < MAX_COLS) n++;
    else if (w < 150 && n > 2) n--;
    return Math.min(n, MAX_COLS);
  }

  function rebuildCols(numCols) {
    cols.forEach(function (c) { if (c.el) c.el.remove(); });
    cols = [];
    for (var i = 0; i < numCols; i++) {
      // Each column gets a differently-shuffled version of the full 18-card pool
      cols.push({ el: null, cards: shuffle(ALL_CARDS), dir: i % 2 === 0 ? 1 : -1, traveled: 0, setH: 0 });
    }
    lastNumCols = numCols;
  }

  function layoutCols() {
    var stageW  = stage.offsetWidth;
    var numCols = numColsFor(stageW);
    if (numCols !== lastNumCols) rebuildCols(numCols);

    var rawColW = (stageW - (numCols - 1) * COL_GAP) / numCols;
    var colW    = Math.min(rawColW, MAX_COL_W);
    var cardH   = Math.round(colW * ASPECT);
    var step    = cardH + INFO_H + ROW_GAP;
    var totalW  = numCols * colW + (numCols - 1) * COL_GAP;
    var offsetX = Math.max(0, (stageW - totalW) / 2);

    cols.forEach(function (col, i) {
      if (!col.el) {
        col.el = makeCol(col.cards, cardH);
      } else {
        col.el.querySelectorAll('.home-marquee-thumb').forEach(function (t) {
          t.style.height = cardH + 'px';
        });
      }
      col.setH         = col.cards.length * step;
      col.el.style.width = colW + 'px';
      col.el.style.left  = (offsetX + i * (colW + COL_GAP)) + 'px';
    });
  }

  layoutCols();
  window.addEventListener('resize', layoutCols);

  if (reduceMotion) return;

  // Pause when the tab is hidden — saves CPU/battery.
  var paused = false;
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });

  var lastTs = null;
  function render(ts) {
    if (paused) { lastTs = null; requestAnimationFrame(render); return; }
    if (!lastTs) lastTs = ts;
    var dt  = Math.min(ts - lastTs, 50);
    lastTs  = ts;
    var spd = SPEED * (dt / 16.67);

    cols.forEach(function (col) {
      if (!col.el || !col.setH) return;
      col.traveled += spd;
      var offset = -col.setH + col.dir * (col.traveled % col.setH);
      col.el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    });
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}());
