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

  // Each column gets its own dedicated set of images (thumb1/thumb2)
  // so the two columns never show the same photo at the same time.
  const projects0 = buildProjects('thumb1');
  const projects1 = buildProjects('thumb2');

  if (!projects0.length) return;

  const CARD_H = 200;
  const INFO_H = 38;
  const GAP = 32;
  const STEP = CARD_H + INFO_H + GAP;
  const COL_GAP = 24;
  const SPEED = 0.22;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SET_H = projects0.length * STEP;

  function makeCol(projects) {
    const colEl = document.createElement('div');
    colEl.className = 'home-marquee-col';

    for (let rep = 0; rep < 3; rep++) {
      projects.forEach(function (p) {
        const card = document.createElement('div');
        card.className = 'home-marquee-card';
        // dronzza-1.png runs very bright/white — a dark scrim is layered
        // under it so it doesn't blow out against the rest of the marquee.
        const scrim = /dronzza-1\.png$/.test(p.thumb)
          ? 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),'
          : '';
        const thumbBg = p.thumb
          ? 'background-image:' + scrim + 'url(' + p.thumb + ');background-size:cover;background-position:center'
          : 'background:' + p.color;
        card.innerHTML =
          '<div class="home-marquee-thumb" style="' + thumbBg + ';height:' + CARD_H + 'px"></div>' +
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

  const col0 = makeCol(projects0);
  const col1 = makeCol(projects1);

  let colW = 0;

  function layoutCols() {
    const stageW = stage.offsetWidth;
    colW = (stageW - COL_GAP) / 2;
    col0.style.width = colW + 'px';
    col1.style.width = colW + 'px';
    col0.style.left = '0px';
    col1.style.left = (colW + COL_GAP) + 'px';
  }

  layoutCols();
  window.addEventListener('resize', layoutCols);

  if (reduceMotion) return;

  // Distance travelled accumulates forever; the on-screen offset is
  // derived from it with modulo, so the position is always a pure
  // function of elapsed distance — no threshold check, no risk of a
  // skipped/duplicated frame causing a visible stall or jump at the
  // wrap point.
  let traveled0 = 0;
  let traveled1 = 0;
  let lastTs = null;

  function render(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;

    const spd = SPEED * (dt / 16.67);

    traveled0 += spd;
    traveled1 += spd;

    const offset0 = -SET_H - (traveled0 % SET_H);
    const offset1 = -SET_H + (traveled1 % SET_H);

    col0.style.transform = 'translateY(' + offset0.toFixed(1) + 'px)';
    col1.style.transform = 'translateY(' + offset1.toFixed(1) + 'px)';

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
