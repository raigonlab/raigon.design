// nav.js — mobile menu toggle, scroll-shrink, active-section highlight
(function () {
  'use strict';

  const nav    = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
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
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  // Clicking the pill body (not a specific element) also opens it.
  nav.addEventListener('click', function (e) {
    if (e.target === nav && !nav.classList.contains('is-open')) openMenu();
  });

  // Click outside collapses the menu.
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) closeMenu();
  });

  // Shrink nav slightly once user scrolls away from the very top.
  window.addEventListener('scroll', function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });

  // Highlight the nav link for whichever section is in view.
  const navLinksList = Array.from(document.querySelectorAll('.nav-link'));
  const pageSlides   = Array.from(document.querySelectorAll(
    '.home-slide, .work-project, .work-page, #about, #skills, #contact'
  ));

  function navGroupFor(el) {
    if (el.id === 'about' || el.id === 'skills') return 'about';
    if (el.id === 'contact') return 'contact';
    if (el.classList.contains('work-project') || el.classList.contains('work-page')) return 'work';
    return null;
  }

  if (navLinksList.length && pageSlides.length) {
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible) return;
      const group = navGroupFor(visible.target);
      navLinksList.forEach(function (link) {
        link.classList.toggle('active', link.dataset.nav === group);
      });
    }, { threshold: 0.5 });
    pageSlides.forEach(function (s) { observer.observe(s); });
  }
}());
