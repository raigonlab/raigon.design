(function () {
  const stage = document.getElementById('homeStage');
  if (!stage) return;

  const palette = ['#E6F1FB', '#EEEDFE', '#E1F5EE', '#FAEEDA', '#FAECE7'];

  const projectEls = Array.from(document.querySelectorAll('.work-project'));

  function buildProjects(thumbKey) {
    return projectEls.map(function (project, i) {
      const title = project.querySelector('.project-name');
      const category = project.querySelector('.project-category');
      return {
        title: title ? title.textContent.trim() : '',
        desc: category ? category.textContent.trim() : '',
        color: palette[i % palette.length],
        thumb: project.dataset[thumbKey] || ''
      };
    });
  }

  // Only two distinct image sets exist per project (thumb1/thumb2); columns
  // alternate between them so no two adjacent columns show the same photo.
  const projectSets = [buildProjects('thumb1'), buildProjects('thumb2')];

  if (!projectSets[0].length) return;

  const INFO_H = 38;
  const ROW_GAP = 32;
  const COL_GAP = 24;
  const SPEED = 0.22;
  // Comfortable card width range — instead of always 2 columns (which
  // stretches into a flat, cropped-looking rectangle on wide screens),
  // the column count grows to keep each card close to its mobile
  // proportions, and more (smaller) cards repeat across the marquee.
  const TARGET_COL_W = 160;
  const ASPECT = 1.3; // card height = column width * ASPECT
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols = []; // { el, projects, dir, traveled, setH }
  let lastNumCols = 0;

  function thumbBgFor(p) {
    // dronzza-1.png runs very bright/white — a dark scrim is layered
    // under it so it doesn't blow out against the rest of the marquee.
    const scrim = /dronzza-1\.png$/.test(p.thumb)
      ? 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),'
      : '';
    return p.thumb
      ? 'background-image:' + scrim + 'url(' + p.thumb + ');background-size:cover;background-position:center'
      : 'background:' + p.color;
  }

  function makeCol(projects, cardH) {
    const colEl = document.createElement('div');
    colEl.className = 'home-marquee-col';

    for (let rep = 0; rep < 3; rep++) {
      projects.forEach(function (p) {
        const card = document.createElement('div');
        card.className = 'home-marquee-card';
        card.innerHTML =
          '<div class="home-marquee-thumb" style="' + thumbBgFor(p) + ';height:' + cardH + 'px"></div>' +
          '<div>' +
            '<div class="home-marquee-card-title">' + p.title + '</div>' +
            '<div class="home-marquee-card-desc">' + p.desc + '</div>' +
          '</div>';
        colEl.appendChild(card);
      });
    }

    stage.appendChild(colEl);
    return colEl;
  }

  function numColsFor(stageW) {
    let n = Math.max(2, Math.round(stageW / (TARGET_COL_W + COL_GAP)));
    let colW = (stageW - (n - 1) * COL_GAP) / n;
    if (colW > 210) n += 1;
    else if (colW < 130 && n > 2) n -= 1;
    return n;
  }

  function rebuildCols(numCols) {
    cols.forEach(function (c) { c.el.remove(); });
    cols = [];
    for (let i = 0; i < numCols; i++) {
      const projects = projectSets[i % projectSets.length];
      cols.push({ el: null, projects: projects, dir: i % 2 === 0 ? 1 : -1, traveled: 0, setH: 0 });
    }
    lastNumCols = numCols;
  }

  function layoutCols() {
    const stageW = stage.offsetWidth;
    const numCols = numColsFor(stageW);

    if (numCols !== lastNumCols) rebuildCols(numCols);

    const colW = (stageW - (numCols - 1) * COL_GAP) / numCols;
    const cardH = Math.round(colW * ASPECT);
    const step = cardH + INFO_H + ROW_GAP;

    cols.forEach(function (col, i) {
      if (!col.el) {
        col.el = makeCol(col.projects, cardH);
      } else {
        col.el.querySelectorAll('.home-marquee-thumb').forEach(function (thumb) {
          thumb.style.height = cardH + 'px';
        });
      }
      col.setH = col.projects.length * step;
      col.el.style.width = colW + 'px';
      col.el.style.left = (i * (colW + COL_GAP)) + 'px';
    });
  }

  layoutCols();
  window.addEventListener('resize', layoutCols);

  if (reduceMotion) return;

  // Distance travelled accumulates forever; the on-screen offset is
  // derived from it with modulo, so the position is always a pure
  // function of elapsed distance — no threshold check, no risk of a
  // skipped/duplicated frame causing a visible stall or jump at the
  // wrap point.
  let lastTs = null;

  function render(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;

    const spd = SPEED * (dt / 16.67);

    cols.forEach(function (col) {
      if (!col.el || !col.setH) return;
      col.traveled += spd;
      const offset = -col.setH + col.dir * (col.traveled % col.setH);
      col.el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
