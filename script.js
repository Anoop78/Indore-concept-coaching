/**
 * Concept Academy Indore — script.js
 * Handles: Sticky header, mobile nav, counter animation,
 *          testimonial carousel, countdown timer, scroll reveal,
 *          form validation, and smooth interactions.
 */

'use strict';

/* =========================================================
   UTILITY HELPERS
   ========================================================= */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =========================================================
   1. STICKY HEADER — add .scrolled class on scroll
   ========================================================= */
(function initStickyHeader() {
  const header = $('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();



/* =========================================================
   Other Faculty
   ========================================================= */
const track = document.getElementById("sliderTrack");
let index = 0;

function slideTeachers() {
  const cardWidth = document.querySelector(".teacher-card").offsetWidth + 20;

  index++;

  if (index >= track.children.length) {
    index = 0;
  }

  track.style.transform = `translateX(-${index * cardWidth}px)`;
}

setInterval(slideTeachers, 2000);
/* =========================================================
   2. MOBILE NAVIGATION TOGGLE
   ========================================================= */
(function initMobileNav() {
  const toggle = $('#navToggle');
  const nav    = $('#mainNav');
  if (!toggle || !nav) return;

  const open  = () => { nav.classList.add('open'); toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
  const close = () => { nav.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => nav.classList.contains('open') ? close() : open());

  // Close on nav link click
  $$('a', nav).forEach(link => link.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) close();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* =========================================================
   3. SMOOTH SCROLL for anchor links
   ========================================================= */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72', 10);
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =========================================================
   4. COUNTER ANIMATION (Trust Numbers)
   ========================================================= */
(function initCounters() {
  const statCards = $$('.stat-card');
  if (!statCards.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const numEl   = el.querySelector('.stat-num');
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1800; // ms
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.floor(easeOut(progress) * target);
      numEl.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statCards.forEach(card => observer.observe(card));
})();

/* =========================================================
   5. TESTIMONIAL CAROUSEL (auto-play + manual nav)
   ========================================================= */
(function initCarousel() {
  const track   = $('#testimonialTrack');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const dotsWrap= $('#carouselDots');
  if (!track || !prevBtn || !nextBtn) return;

  const cards   = $$('.testimonial-card', track);
  const total   = cards.length;
  let current   = 0;
  let autoTimer = null;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = () => $$('.carousel-dot', dotsWrap);

  const goTo = (idx) => {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots().forEach((d, i) => d.classList.toggle('active', i === current));
    track.setAttribute('aria-label', `Testimonial ${current + 1} of ${total}`);
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });

  // Auto-play
  const startAuto = () => { autoTimer = setInterval(next, 4800); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };
  startAuto();

  // Pause on hover
  const carousel = $('.testimonial-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);
  }
})();

/* =========================================================
   6. COUNTDOWN TIMER (target: April 1, 2025)
   ========================================================= */
(function initCountdown() {
  const cdDays = $('#cd-days');
  const cdHours= $('#cd-hours');
  const cdMins = $('#cd-mins');
  const cdSecs = $('#cd-secs');
  if (!cdDays) return;

  // Target: 1st April of current or next year, whichever is future
  const now = new Date();
  let target = new Date(now.getFullYear(), 3, 1, 0, 0, 0); // April 1 (month index 3)
  if (target <= now) target = new Date(now.getFullYear() + 1, 3, 1, 0, 0, 0);

  const pad = n => String(Math.max(0, n)).padStart(2, '0');

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cdDays.textContent = cdHours.textContent = cdMins.textContent = cdSecs.textContent = '00';
      return;
    }
    const s = Math.floor(diff / 1000);
    cdDays.textContent  = pad(Math.floor(s / 86400));
    cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
    cdMins.textContent  = pad(Math.floor((s % 3600) / 60));
    cdSecs.textContent  = pad(s % 60);
  };

  tick();
  setInterval(tick, 1000);
})();

/* =========================================================
   7. SCROLL REVEAL (add .reveal class in CSS via JS)
   ========================================================= */
(function initScrollReveal() {
  // Add reveal class to target elements
  const targets = [
    '.feature-card',
    '.course-card',
    '.topper-card',
    '.other-faculty-card',
    '.contact-item',
    '.stat-card',
    '.batch-benefits',
    '.offer-banner',
    '.guarantee-strip',
    '.hostel-info',
    '.result-badge',
  ];

  targets.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.06}s`;
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach(el => io.observe(el));
})();

/* =========================================================
   8. FORM VALIDATION & SUBMISSION
   ========================================================= */
(function initLeadForm() {
  const form    = $('#leadForm');
  const success = $('#formSuccess');
  if (!form) return;

  const nameInput   = $('#studentName');
  const phoneInput  = $('#phoneNum');
  const courseInput = $('#courseInterest');
  const nameErr     = $('#nameError');
  const phoneErr    = $('#phoneError');
  const courseErr   = $('#courseError');

  const setError = (input, errEl, msg) => {
    errEl.textContent = msg;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
  };
  const clearError = (input, errEl) => {
    errEl.textContent = '';
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
  };

  const validateName = () => {
    const v = nameInput.value.trim();
    if (!v) { setError(nameInput, nameErr, 'Please enter your full name.'); return false; }
    if (v.length < 2) { setError(nameInput, nameErr, 'Name must be at least 2 characters.'); return false; }
    clearError(nameInput, nameErr); return true;
  };

  const validatePhone = () => {
    const v = phoneInput.value.trim();
    if (!v) { setError(phoneInput, phoneErr, 'Please enter your phone number.'); return false; }
    if (!/^[6-9]\d{9}$/.test(v)) { setError(phoneInput, phoneErr, 'Enter a valid 10-digit Indian mobile number.'); return false; }
    clearError(phoneInput, phoneErr); return true;
  };

  const validateCourse = () => {
    if (!courseInput.value) { setError(courseInput, courseErr, 'Please select your course interest.'); return false; }
    clearError(courseInput, courseErr); return true;
  };

  // Live validation
  nameInput.addEventListener('blur',  validateName);
  phoneInput.addEventListener('blur', validatePhone);
  courseInput.addEventListener('change', validateCourse);

  // Only allow digits in phone field
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v1 = validateName();
    const v2 = validatePhone();
    const v3 = validateCourse();
    if (!v1 || !v2 || !v3) return;

    // Build WhatsApp message for lead notification
    const msg = encodeURIComponent(
      `New Enquiry from Concept Academy Website!\n\nName: ${nameInput.value.trim()}\nPhone: ${phoneInput.value.trim()}\nCourse: ${courseInput.value}\n\nPlease follow up!`
    );

    // Show success state
    form.hidden = true;
    success.hidden = false;
    success.focus();

    // Open WhatsApp with pre-filled message (optional — can be replaced with API call)
    setTimeout(() => {
      window.open(`https://wa.me/917489856895?text=${msg}`, '_blank', 'noopener,noreferrer');
    }, 800);
  });
})();

/* =========================================================
   9. ACTIVE NAV HIGHLIGHT (Intersection Observer on sections)
   ========================================================= */
(function initActiveNav() {
  const sections = $$('section[id], div[id]').filter(el =>
    ['courses', 'results', 'faculty', 'contact', 'why', 'testimonials'].includes(el.id)
  );
  const navLinks = $$('.main-nav ul li a');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.style.color = href === `#${id}` ? 'var(--orange)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* =========================================================
   10. LAZY-LOAD MAP (defer heavy iframe until in view)
   ========================================================= */
(function initLazyMap() {
  const mapWrap = $('.map-wrap');
  if (!mapWrap) return;
  const iframe  = $('iframe', mapWrap);
  if (!iframe) return;

  // Store real src, remove until visible
  const realSrc = iframe.getAttribute('src');
  iframe.removeAttribute('src');

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      iframe.setAttribute('src', realSrc);
      io.disconnect();
    }
  }, { threshold: 0.1 });
  io.observe(mapWrap);
})();

/* =========================================================
   11. PHONE NUMBER CLICK TRACKING (GA4 ready)
   ========================================================= */
(function initClickTracking() {
  $$('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => {
      // Fires GA4 event if gtag is loaded
      if (typeof gtag === 'function') {
        gtag('event', 'click', { event_category: 'Contact', event_label: 'Phone Call', value: el.href });
      }
    });
  });
  $$('a[href^="https://wa.me"]').forEach(el => {
    el.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'click', { event_category: 'Contact', event_label: 'WhatsApp Click' });
      }
    });
  });
})();

/* =========================================================
   12. PERFORMANCE — requestIdleCallback polyfill safety
   ========================================================= */
if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => setTimeout(cb, 1);
}





/* =========================================================
   TOPPERS CAROUSEL - MANUAL VERSION (Button Navigation)
   ========================================================= */
(function initToppersManualCarousel() {
  const track = document.querySelector(".toppers-track");
  const prevBtn = document.querySelector(".toppers-prev");
  const nextBtn = document.querySelector(".toppers-next");
  
  if (!track || !prevBtn || !nextBtn) return;

  let currentPosition = 0;
  const cardWidth = 216; // card width + margin (200 + 16)

  const moveCarousel = (direction) => {
    const maxScroll = track.scrollWidth / 2;
    
    if (direction === 'next') {
      currentPosition += cardWidth;
      if (currentPosition >= maxScroll) {
        currentPosition = 0; // Loop back to start
      }
    } else if (direction === 'prev') {
      currentPosition -= cardWidth;
      if (currentPosition < 0) {
        currentPosition = maxScroll - cardWidth; // Loop to end
      }
    }

    track.style.transform = `translateX(-${currentPosition}px)`;
    track.style.transition = 'transform 0.5s ease';
  };

  // Button click handlers
  prevBtn.addEventListener('click', () => moveCarousel('prev'));
  nextBtn.addEventListener('click', () => moveCarousel('next'));

  // Optional: Keyboard navigation (arrow keys)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') moveCarousel('next');
    if (e.key === 'ArrowLeft') moveCarousel('prev');
  });
})();