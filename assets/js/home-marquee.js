(function () {
  const stage = document.getElementById('homeStage');
  if (!stage) return;

  const palette = ['#E6F1FB', '#EEEDFE', '#E1F5EE', '#FAEEDA', '#FAECE7'];

  const projects = Array.from(document.querySelectorAll('.work-project')).map(function (project, i) {
    const title = project.querySelector('.project-name');
    const category = project.querySelector('.project-category');
    return {
      title: title ? title.textContent.trim() : '',
      desc: category ? category.textContent.trim() : '',
      color: palette[i % palette.length]
    };
  });

  if (!projects.length) return;

  const CARD_H = 200;
  const INFO_H = 38;
  const GAP = 32;
  const STEP = CARD_H + INFO_H + GAP;
  const COL_GAP = 24;
  const SPEED = 0.22;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SET_H = projects.length * STEP;

  function makeCol() {
    const colEl = document.createElement('div');
    colEl.className = 'home-marquee-col';

    for (let rep = 0; rep < 3; rep++) {
      projects.forEach(function (p) {
        const card = document.createElement('div');
        card.className = 'home-marquee-card';
        card.innerHTML =
          '<div class="home-marquee-thumb" style="background:' + p.color + ';height:' + CARD_H + 'px"></div>' +
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

  const col0 = makeCol();
  const col1 = makeCol();

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

  let offset0 = -SET_H * 0.5;
  let offset1 = -SET_H * 1.0;
  let lastTs = null;

  function render(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;

    const spd = SPEED * (dt / 16.67);

    offset0 -= spd;
    if (offset0 < -SET_H * 2) offset0 += SET_H;

    offset1 += spd;
    if (offset1 > 0) offset1 -= SET_H;

    col0.style.transform = 'translateY(' + offset0.toFixed(1) + 'px)';
    col1.style.transform = 'translateY(' + offset1.toFixed(1) + 'px)';

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
