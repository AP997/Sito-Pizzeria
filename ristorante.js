/**
 * La Fornace Nera — script.js
 * Funzionalità: Navbar scroll, Menu mobile, Tab menu,
 * Scroll animations (IntersectionObserver), Slider recensioni,
 * Lightbox galleria, Prenotazione form, Back-to-top
 */

/* ══════════════════════════════════════
   NAVBAR — scroll behavior
══════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Back to top click
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ══════════════════════════════════════
   NAVBAR — hamburger menu mobile
══════════════════════════════════════ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    // Prevent body scroll when menu is open
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ══════════════════════════════════════
   SMOOTH SCROLL per nav links interni
══════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════
   MENU TABS — filtra categorie pizza
══════════════════════════════════════ */
(function initMenuTabs() {
  const tabs  = document.querySelectorAll('.tab');
  const grids = document.querySelectorAll('.menu-grid');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;

      // Toggle active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show correct grid with fade
      grids.forEach(grid => {
        if (grid.dataset.cat === cat) {
          grid.classList.remove('hidden');
          // Re-trigger reveal animations for newly visible cards
          grid.querySelectorAll('.reveal').forEach((el, i) => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        } else {
          grid.classList.add('hidden');
        }
      });
    });
  });

  // Immediately trigger first visible grid
  const firstGrid = document.querySelector('.menu-grid:not(.hidden)');
  if (firstGrid) {
    firstGrid.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 80);
    });
  }
})();


/* ══════════════════════════════════════
   INTERSECTION OBSERVER — scroll animations
══════════════════════════════════════ */
(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after reveal (one-shot animation)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Observe all .reveal elements except those inside hidden menu grids
  document.querySelectorAll('.reveal').forEach(el => {
    const parentGrid = el.closest('.menu-grid');
    if (parentGrid && parentGrid.classList.contains('hidden')) return;
    observer.observe(el);
  });
})();


/* ══════════════════════════════════════
   SLIDER RECENSIONI
══════════════════════════════════════ */
(function initSlider() {
  const slides    = document.querySelectorAll('.slide');
  const dotsWrap  = document.getElementById('sliderDots');
  const btnPrev   = document.getElementById('sliderPrev');
  const btnNext   = document.getElementById('sliderNext');

  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  const INTERVAL = 5000; // ms

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Recensione ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    autoTimer = setInterval(next, INTERVAL);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  btnNext.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
  btnPrev.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

  // Pause on hover
  const wrapper = document.querySelector('.slider-wrapper');
  wrapper.addEventListener('mouseenter', stopAuto);
  wrapper.addEventListener('mouseleave', startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      stopAuto();
      diff > 0 ? next() : prev();
      startAuto();
    }
  });

  // Init first slide
  slides[0].classList.add('active');
  startAuto();
})();


/* ══════════════════════════════════════
   GALLERIA LIGHTBOX
══════════════════════════════════════ */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbClose  = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      const alt = item.querySelector('img').alt;
      lbImg.src = src;
      lbImg.alt = alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();


/* ══════════════════════════════════════
   FORM PRENOTAZIONE
══════════════════════════════════════ */
(function initBookingForm() {
  const btn     = document.getElementById('bookingBtn');
  const success = document.getElementById('bookingSuccess');

  if (!btn) return;

  btn.addEventListener('click', () => {
    const nome    = document.getElementById('nome').value.trim();
    const tel     = document.getElementById('tel').value.trim();
    const data    = document.getElementById('data').value;
    const ospiti  = document.getElementById('ospiti').value;

    // Simple validation
    if (!nome || !tel || !data) {
      // Highlight empty required fields
      [['nome', nome], ['tel', tel], ['data', data]].forEach(([id, val]) => {
        const el = document.getElementById(id);
        el.style.borderColor = !val ? '#c0392b' : '';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
      });
      return;
    }

    // Simulate submission
    btn.textContent = 'Invio in corso…';
    btn.disabled = true;

    setTimeout(() => {
      btn.style.display = 'none';
      success.classList.add('visible');
      // Reset form fields
      ['nome','tel','data','note'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }, 1200);
  });
})();


/* ══════════════════════════════════════
   PARALLAX leggero sull'hero (desktop only)
══════════════════════════════════════ */
(function initParallax() {
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg || window.innerWidth < 768) return;

  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.25;
    heroImg.style.transform = `scale(1) translateY(${offset}px)`;
  }, { passive: true });
})();


/* ══════════════════════════════════════
   ACTIVE NAV LINK — highlight su scroll
══════════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActive() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-link');
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
})();


/* ══════════════════════════════════════
   ANIMAZIONE NUMERO STATS (count-up)
══════════════════════════════════════ */
(function initCountUp() {
  const stats = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Only animate if content is a plain number or has a digit prefix
      const raw = el.textContent;
      const match = raw.match(/^(\d+)/);
      if (!match) return;

      const end = parseInt(match[1], 10);
      const suffix = raw.slice(match[0].length);
      let start = 0;
      const duration = 1400;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (end - start) * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();
