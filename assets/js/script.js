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
  const hiddenProjects = document.querySelectorAll('.work-project[hidden]');

  if (workMore && workMoreBtn && hiddenProjects.length) {
    workMoreBtn.addEventListener('click', function () {
      hiddenProjects.forEach(function (project) { project.removeAttribute('hidden'); });
      workMoreBtn.setAttribute('aria-expanded', 'true');
      workMore.remove();
    });
  }

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

  // Each work card carries its own header dots, reflecting which of
  // its 3 horizontal panels (main/details/extra) is currently in view.
  document.querySelectorAll('.work-project').forEach(function (project) {
    const track = project.querySelector('.work-project-track');
    const dots = project.querySelectorAll('.work-dots .dot');

    if (!track || !dots.length) return;

    track.addEventListener('scroll', function () {
      const index = Math.min(2, Math.round(track.scrollLeft / track.clientWidth));
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === index); });
    }, { passive: true });
  });
})();
