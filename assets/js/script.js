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

  links.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  const workMore = document.getElementById('workMore');
  const workMoreBtn = document.getElementById('workMoreBtn');
  const workHidden = document.getElementById('workHidden');

  if (workMore && workMoreBtn && workHidden) {
    workMoreBtn.addEventListener('click', function () {
      workHidden.hidden = false;
      workMoreBtn.setAttribute('aria-expanded', 'true');
      workMore.remove();
    });
  }

  // Scroll chaining: when an inner track (Home/Work) hits its edge,
  // hand the scroll off to the next/previous top-level page section
  // instead of trapping it (nested scroll-snap mandatory doesn't
  // reliably bubble overscroll on its own in every browser).
  const pageSections = Array.from(document.querySelectorAll('.home, .work, #about, #contact'));

  function goToSection(index) {
    if (index < 0 || index >= pageSections.length) return;
    pageSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function attachChaining(track) {
    let chaining = false;

    function tryChain(forward) {
      if (chaining) return false;
      const atBottom = track.scrollTop + track.clientHeight >= track.scrollHeight - 1;
      const atTop = track.scrollTop <= 0;
      const section = track.closest('.home, .work, #about, #contact');
      const idx = pageSections.indexOf(section);

      if (forward && atBottom) {
        chaining = true;
        goToSection(idx + 1);
        setTimeout(function () { chaining = false; }, 650);
        return true;
      }
      if (!forward && atTop) {
        chaining = true;
        goToSection(idx - 1);
        setTimeout(function () { chaining = false; }, 650);
        return true;
      }
      return false;
    }

    track.addEventListener('wheel', function (e) {
      if (tryChain(e.deltaY > 0)) e.preventDefault();
    }, { passive: false });

    let touchStartY = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) > 4 && tryChain(deltaY > 0)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  document.querySelectorAll('.home-track, .work-track').forEach(attachChaining);
})();
