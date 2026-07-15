// work.js — project navigation, gallery thumbnails, scroll-snap helpers
(function () {
  'use strict';

  // Temporarily disable mandatory scroll-snap for programmatic scrolls so
  // the browser doesn't intercept a long jump mid-way.
  let snapTimer = null;
  function jumpTo(target) {
    document.documentElement.style.scrollSnapType = 'none';
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    function restore() {
      document.documentElement.style.scrollSnapType = '';
      window.removeEventListener('scrollend', restore);
      clearTimeout(snapTimer);
    }

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', restore, { once: true });
    }
    clearTimeout(snapTimer);
    snapTimer = setTimeout(restore, 2500);
  }

  // Skills river toggle — collapses into a compact grid, resumes on scroll.
  const skillsPanel  = document.getElementById('skills');
  const skillsToggle = document.getElementById('skillsToggle');
  if (skillsPanel && skillsToggle) {
    skillsToggle.addEventListener('click', function () {
      const collapsed = skillsPanel.classList.toggle('is-collapsed');
      skillsToggle.setAttribute('aria-pressed', String(collapsed));
      skillsToggle.setAttribute('aria-label', collapsed
        ? 'Resume the flowing animation'
        : 'Pause and show everything at once');
    });
    window.addEventListener('scroll', function () {
      if (!skillsPanel.classList.contains('is-collapsed')) return;
      skillsPanel.classList.remove('is-collapsed');
      skillsToggle.setAttribute('aria-pressed', 'false');
      skillsToggle.setAttribute('aria-label', 'Pause and show everything at once');
    }, { passive: true });
  }

  // Work nav link → jump to the gallery page.
  const workMore    = document.getElementById('workMore');
  const workNavLink = document.querySelector('.nav-link[data-nav="work"]');
  if (workMore && workNavLink) {
    workNavLink.addEventListener('click', function (e) {
      e.preventDefault();
      jumpTo(workMore);
    });
  }

  // Gallery thumbnail clicks: reveal hidden project section then scroll to it.
  document.querySelectorAll('.work-gallery-item[href]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      const target = document.querySelector(item.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.removeAttribute('hidden');
      jumpTo(target);
    });
  });

  // Per-project horizontal swipe: sync dots + header title to active panel.
  document.querySelectorAll('.work-project').forEach(function (project) {
    const track  = project.querySelector('.work-project-track');
    const dots   = project.querySelectorAll('.work-dots .dot');
    const titles = project.querySelectorAll('.work-header-title');
    if (!track || !dots.length) return;

    track.addEventListener('scroll', function () {
      const index = Math.min(2, Math.round(track.scrollLeft / track.clientWidth));
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === index); });
      titles.forEach(function (title) {
        title.classList.toggle('is-active', Number(title.dataset.panel) === index);
      });
    }, { passive: true });
  });
}());
