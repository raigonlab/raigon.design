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
      if (expanding) jumpTo(workMore);
    });
  }

  // scroll-snap-type: mandatory on <html> can "catch" a long programmatic
  // scrollIntoView at the nearest snap point instead of letting it travel
  // all the way to a far-away target, so it's switched off for the
  // duration of the jump and restored once the scroll actually settles
  // (a fixed timeout is unreliable here — far jumps, e.g. down to the
  // see-more card at the very end of the page, can easily take longer
  // than a short delay, so snap would re-engage mid-scroll and yank the
  // view back toward the nearest snap point).
  let snapReleaseTimer = null;
  function jumpTo(target) {
    document.documentElement.style.scrollSnapType = 'none';
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    function restoreSnap() {
      applySnapTypeForGroup(navGroupFor(target));
      window.removeEventListener('scrollend', restoreSnap);
      clearTimeout(snapReleaseTimer);
    }

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', restoreSnap, { once: true });
    }
    // Always also arm a generous fallback timeout in case scrollend
    // never fires (unsupported browser, or the scroll gets interrupted).
    clearTimeout(snapReleaseTimer);
    snapReleaseTimer = setTimeout(restoreSnap, 2500);
  }

  // Gallery thumbnails jump straight to a project's full card, unhiding
  // it first if it had not been revealed yet.
  document.querySelectorAll('.work-gallery-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      const target = document.querySelector(item.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.removeAttribute('hidden');
      jumpTo(target);
    });
  });

  // Every intro slide, work card, about and contact is now a direct,
  // top-level scroll-snap item (single continuous vertical scroll —
  // no nested scroll-snap tracks, so no scroll-chaining hacks needed).
  const pageSlides = Array.from(
    document.querySelectorAll('.home-slide, .work-project, #about, #skills, #contact')
  );

  function navGroupFor(el) {
    if (el.id === 'about' || el.id === 'skills') return 'about';
    if (el.id === 'contact') return 'contact';
    if (el.classList.contains('work-project')) return 'work';
    return null;
  }

  // Hybrid scroll-snap: Home and Work stay mandatory (full-bleed cards
  // never look right half-shown), About/Contact scroll freely.
  function applySnapTypeForGroup(group) {
    const immersive = group === null || group === 'work';
    document.documentElement.style.scrollSnapType = immersive ? 'y mandatory' : 'y proximity';
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
      applySnapTypeForGroup(group);
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
          jumpTo(workMore);
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
        let next = project.nextElementSibling;
        while (next && next.hasAttribute('hidden')) next = next.nextElementSibling;
        if (next) jumpTo(next);
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
