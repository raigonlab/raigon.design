(function () {
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  if (!nav || !toggle || !links) return;

  function openMenu() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  const workMore = document.getElementById('workMore');
  const workMoreBtn = document.getElementById('workMoreBtn');
  const workMoreHeading = document.getElementById('workMoreHeading');
  const workMoreIntro = document.getElementById('workMoreIntro');
  const workGalleryGrid = document.getElementById('workGalleryGrid');

  const COLLAPSED_HEADING = 'See more about our stories and projects';
  const EXPANDED_HEADING = 'Our stories and projects';

  if (workMore && workMoreBtn && workMoreHeading && workMoreIntro && workGalleryGrid) {
    workMoreBtn.addEventListener('click', function () {
      const expanding = workMoreBtn.getAttribute('aria-expanded') !== 'true';
      workMoreBtn.setAttribute('aria-expanded', String(expanding));
      workMoreBtn.textContent = expanding ? 'See less' : 'See more';
      workMoreHeading.textContent = expanding ? EXPANDED_HEADING : COLLAPSED_HEADING;
      workMoreIntro.hidden = !expanding;
      workGalleryGrid.hidden = !expanding;
      if (expanding) workMore.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Gallery thumbnails jump straight to a project's full card, unhiding
  // it first if it had not been revealed yet.
  document.querySelectorAll('.work-gallery-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      const target = document.querySelector(item.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.removeAttribute('hidden');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Every intro slide, work card, about and contact is now a direct,
  // top-level scroll-snap item (single continuous vertical scroll —
  // no nested scroll-snap tracks, so no scroll-chaining hacks needed).
  const pageSlides = Array.from(
    document.querySelectorAll('.home-slide, .work-project, .work-more, #about, #contact')
  );

  function navGroupFor(el) {
    if (el.id === 'about') return 'about';
    if (el.id === 'contact') return 'contact';
    if (el.classList.contains('work-project') || el.classList.contains('work-more')) return 'work';
    return null;
  }

  // Highlight the nav link for whichever top-level slide is currently
  // in view (home slides have no link, so being there clears them all).
  const navLinksList = Array.from(document.querySelectorAll('.nav-link'));

  if (navLinksList.length && pageSlides.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      const visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];

      if (!visible) return;

      const group = navGroupFor(visible.target);
      navLinksList.forEach(function (link) {
        link.classList.toggle('active', link.dataset.nav === group);
      });
    }, { threshold: 0.5 });

    pageSlides.forEach(function (slide) { sectionObserver.observe(slide); });
  }

  // Each project card carries its own "All Projects" shortcut, confined
  // to the card so it always stays inside its visible bounds.
  if (workMore && workMoreBtn) {
    document.querySelectorAll('.all-projects-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (workMoreBtn.getAttribute('aria-expanded') !== 'true') {
          workMoreBtn.click();
        } else {
          workMore.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Each work card carries its own header dots, reflecting which of
  // its 3 horizontal panels (main/details/extra) is currently in view.
  document.querySelectorAll('.work-project').forEach(function (project) {
    const track = project.querySelector('.work-project-track');
    const dots = project.querySelectorAll('.work-dots .dot');
    const titles = project.querySelectorAll('.work-header-title');

    if (!track || !dots.length) return;

    track.addEventListener('scroll', function () {
      const index = Math.min(2, Math.round(track.scrollLeft / track.clientWidth));
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === index); });
      // Each panel has its own header title ("Selected work" on the
      // main panel, name + a panel-specific subtitle on the others).
      titles.forEach(function (title) {
        title.classList.toggle('is-active', Number(title.dataset.panel) === index);
      });
    }, { passive: true });

    const down = project.querySelector('.work-project-down');
    if (down) {
      down.addEventListener('click', function () {
        const next = project.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  // About's cinematic cover slides: same dot-tracking pattern as the
  // work cards, just a single flat track (no per-panel header swap).
  const aboutTrack = document.getElementById('aboutTrack');
  const aboutDots = document.querySelectorAll('.about-dots .dot');

  if (aboutTrack && aboutDots.length) {
    aboutTrack.addEventListener('scroll', function () {
      const index = Math.min(aboutDots.length - 1, Math.round(aboutTrack.scrollLeft / aboutTrack.clientWidth));
      aboutDots.forEach(function (dot, i) { dot.classList.toggle('active', i === index); });
    }, { passive: true });
  }
})();
