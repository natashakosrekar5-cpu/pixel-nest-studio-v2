// Pixel Nest Studio — site script
// Handles: mobile nav toggle, scroll fade-in reveals, contact form submit, accessibility

function initSite() {
  document.documentElement.classList.add('js-ready');

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    function toggleMenu() {
      var isOpen = navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function closeMenu() {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', toggleMenu);

    // Close mobile menu after tapping a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key press
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll reveal for .fade-in elements ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { observer.observe(el); });

    // Safety net: if anything is ever missed (observer edge cases,
    // very short pages, etc.) force-reveal everything after 1.5s so
    // content can never get stuck invisible.
    setTimeout(function () {
      fadeEls.forEach(function (el) { el.classList.add('visible'); });
    }, 1500);
  } else {
    // No IntersectionObserver support: just show everything
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  var bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { bar.style.display = 'none'; return; }

  function update() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  var items = document.querySelectorAll('.faq-item.accordion');
  items.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;

    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.setAttribute('aria-expanded', 'false');

    function toggleAccordion() {
      var wasOpen = item.classList.contains('open');
      items.forEach(function (i) {
        i.classList.remove('open');
        var btn = i.querySelector('.faq-q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    }

    q.addEventListener('click', toggleAccordion);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });
}

/* ---------- Floating Instagram button ---------- */
function initInstaFloat() {
  var btn = document.querySelector('.insta-float');
  var footer = document.querySelector('footer');
  if (!btn) return;

  function update() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    var nearFooter = false;
    if (footer) {
      var rect = footer.getBoundingClientRect();
      nearFooter = rect.top < window.innerHeight;
    }

    if (pct > 30 && !nearFooter) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initExtras() {
  initScrollProgress();
  initFaqAccordion();
  initInstaFloat();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
  document.addEventListener('DOMContentLoaded', initExtras);
} else {
  initSite();
  initExtras();
}

/* ---------- Contact form ---------- */
function handleFormSubmit(event) {
  event.preventDefault();

  var form = event.target;
  var success = document.getElementById('formSuccess');
  var button = form.querySelector('button[type="submit"]');
  var originalLabel = button ? button.textContent : '';

  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  })
    .then(function (response) {
      if (response.ok) {
        if (success) {
          success.textContent = "✓ Got it — we'll be in touch soon.";
          success.classList.add('show');
        }
        form.reset();
      } else {
        if (success) {
          success.textContent = "Something went wrong — please email us directly instead.";
          success.classList.add('show');
        }
      }
    })
    .catch(function () {
      if (success) {
        success.textContent = "Something went wrong — please email us directly instead.";
        success.classList.add('show');
      }
    })
    .finally(function () {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });

  return false;
}