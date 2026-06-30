/* ============================================================
   ARMMY TECH LTD — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initCounters();
  initContactForm();
  initNotifyForm();
  initNewsletterForm();
  setActiveNavLink();
});

/* ── Navigation ─────────────────────────────────────────── */
function initNav() {
  const nav        = document.getElementById('main-nav');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const backdrop   = document.getElementById('nav-backdrop');

  if (!nav) return;

  /* Scroll: toggle glass effect */
  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('nav-scrolled');
      nav.classList.remove('nav-transparent');
    } else {
      nav.classList.remove('nav-scrolled');
      nav.classList.add('nav-transparent');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger toggle */
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Close on link click */
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on backdrop click */
  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (
      !nav.contains(e.target) &&
      !mobileMenu.contains(e.target) &&
      (!backdrop || !backdrop.contains(e.target))
    ) {
      closeMenu();
    }
  });

  /* Close on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* Close menu on resize to desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ── Active Nav Link ─────────────────────────────────────── */
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Scroll Reveal ───────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ── Counter Animations ──────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-count'), 10);
  const suffix   = el.getAttribute('data-suffix') || '';
  const prefix   = el.getAttribute('data-prefix') || '';
  const duration = 1800;
  const start    = performance.now();

  const update = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current  = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

/* ── Formspree endpoint ──────────────────────────────────── */
const FORMSPREE = 'https://formspree.io/f/mdarlgza';

/* ── Contact Form ────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
      } else {
        const data = await res.json();
        const msg = data.errors
          ? data.errors.map(err => err.message).join(', ')
          : 'Something went wrong. Please try again.';
        showFormError(form, msg);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (_) {
      showFormError(form, 'Network error \u2014 please check your connection and try again.');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

function showFormError(form, msg) {
  let err = form.querySelector('.form-error-msg');
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-error-msg';
    err.style.cssText = 'color:#EF4444;font-size:0.875rem;margin-top:0.75rem;text-align:center;';
    form.appendChild(err);
  }
  err.textContent = msg;
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#EF4444';
      valid = false;
    }
  });
  const emailField = form.querySelector('[type="email"]');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.style.borderColor = '#EF4444';
    valid = false;
  }
  return valid;
}

/* ── Notify Form (Careers) ───────────────────────────────── */
function initNotifyForm() {
  const form = document.getElementById('notify-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = 'Subscribed \u2713';
        btn.style.background = 'var(--green)';
        btn.style.borderColor = 'var(--green)';
        form.reset();
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 4000);
      } else {
        btn.textContent = 'Try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    } catch (_) {
      btn.textContent = 'Error \u2014 retry';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 3000);
    }
  });
}

/* ── Newsletter Form (Blog) ──────────────────────────────── */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = form.querySelector('[type="submit"]');
    const input = form.querySelector('[type="email"]');
    const originalText = btn.textContent;

    if (!input || !input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.style.borderColor = '#EF4444';
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Subscribing\u2026';

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = 'Subscribed \u2713';
        btn.style.background = 'var(--green)';
        form.reset();
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = originalText;
          btn.style.background = '';
        }, 4000);
      } else {
        btn.textContent = 'Try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    } catch (_) {
      btn.textContent = 'Error \u2014 retry';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 3000);
    }
  });
}

/* ── Smooth Scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
