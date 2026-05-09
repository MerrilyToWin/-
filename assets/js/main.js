'use strict';

/* ─── Helpers ─────────────────────────────────────────────── */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot  = $('#cursor');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const hoverSels = 'a,button,.project-card,.skill-tag,.tl-card,.achievement-card,.course-card,.contact-item,.social-btn,.nav-link';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSels)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSels)) document.body.classList.remove('cursor-hover');
  });
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   NAVBAR — scroll style + mobile hamburger
   ============================================================ */
function initNav() {
  const nav       = $('#main-nav');
  const hamburger = $('#navHamburger');
  const mobileMenu= $('#mobileMenu');
  const links     = $$('#main-nav .nav-link');
  const sections  = $$('main section[id]');

  // Scroll class for stronger backdrop
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close mobile menu on link click
  $$('.mobile-link, .mobile-resume').forEach(l => {
    l.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      hamburger?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link tracking
  if (!links.length || !sections.length) return;
  function updateActive() {
    const mid = window.scrollY + window.innerHeight * 0.38;
    let active = sections[0].id;
    sections.forEach(s => { if (s.offsetTop <= mid) active = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

/* ============================================================
   HERO PARALLAX
   ============================================================ */
function initParallax() {
  const imgWrap = $('#heroImgWrap');
  const content = $('#heroContent');
  let ticking = false;

  function apply() {
    const y = window.scrollY;
    if (imgWrap) imgWrap.style.transform = `translate3d(0,${y * 0.38}px,0)`;
    if (content) {
      content.style.transform = `translate3d(0,${y * 0.14}px,0)`;
      content.style.opacity   = Math.max(0, 1 - y / 650).toFixed(3);
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(apply); ticking = true; }
  }, { passive: true });
  apply();
}

/* ============================================================
   HERO CANVAS — animated particle mesh
   ============================================================ */
function initCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];
  const N = 80, DIST = 145;
  const MOUSE = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    MOUSE.x = e.clientX - r.left;
    MOUSE.y = e.clientY - r.top;
  });

  (function loop() {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = n.x - MOUSE.x, dy = n.y - MOUSE.y;
      const d = Math.hypot(dx, dy);
      if (d < 100 && d > 0) { n.x += (dx / d) * 2.5; n.y += (dy / d) * 2.5; }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < DIST) {
          const alpha = (1 - d / DIST) * 0.5;
          // Gradient line: blue → purple
          const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          grad.addColorStop(0, `rgba(59,130,246,${alpha.toFixed(3)})`);
          grad.addColorStop(1, `rgba(139,92,246,${alpha.toFixed(3)})`);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      // Node dot
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,92,246,0.7)';
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ============================================================
   TYPED TEXT
   ============================================================ */
function initTyped() {
  const el = $('#typed-text');
  if (!el) return;
  const roles = [
    'Full Stack Developer',
    'DevSecOps Engineer',
    'Post-Quantum Explorer',
    'Python Developer',
    'Network Engineer',
    'Security Researcher',
    'Cloud Architect',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
    deleting ? ci-- : ci++;
    let wait = deleting ? 50 : 95;
    if (!deleting && ci === word.length)   { wait = 2400; deleting = true; }
    else if (deleting && ci === 0)         { deleting = false; ri = (ri + 1) % roles.length; wait = 350; }
    setTimeout(tick, wait);
  }
  tick();
}

/* ============================================================
   STAT COUNTERS
   ============================================================ */
function initCounters() {
  const els = $$('.stat-num[data-count], .stat-num[data-val]');
  if (!els.length) return;
  let done = false;

  function run() {
    if (done) return;
    const hero = $('#hero');
    if (!hero || hero.getBoundingClientRect().top > window.innerHeight) return;
    done = true;

    els.forEach(el => {
      const isFloat = el.hasAttribute('data-val');
      const target  = parseFloat(isFloat ? el.dataset.val : el.dataset.count);
      const dur = 1800, t0 = performance.now();

      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = isFloat
          ? (e * target).toFixed(2)
          : Math.round(e * target) + '+';
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isFloat ? target.toFixed(2) : target + '+';
      })(t0);
    });
  }

  window.addEventListener('scroll', run, { passive: true });
  run();
}

/* ============================================================
   INTERSECTION OBSERVER — section + card reveals
   ============================================================ */
function initReveals() {
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); secObs.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  $$('.section-reveal').forEach(s => secObs.observe(s));

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in-view'), i * 60);
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  $$(
    '.tl-card,.project-card,.achievement-card,.edu-card,.research-card,.course-card,.info-card'
  ).forEach(c => cardObs.observe(c));
}

/* ============================================================
   3D CARD TILT (parallax on cards)
   ============================================================ */
function initCardTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      const rotX = y * -10;
      const rotY = x *  10;

      card.style.transform    = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      card.style.transition   = 'transform 0.08s ease, border-color 0.3s, box-shadow 0.3s';

      // Glare position
      card.style.setProperty('--glare-x', ((x + 0.5) * 100) + '%');
      card.style.setProperty('--glare-y', ((y + 0.5) * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      card.style.transition = 'transform 0.55s ease, border-color 0.3s, box-shadow 0.3s';
    });
  });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH ANCHOR NAV
   ============================================================ */
function initAnchorNav() {
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initForm() {
  const form = $('#contactForm');
  const btn  = $('#submitBtn');
  if (!form || !btn) return;
  form.addEventListener('submit', () => {
    const span = btn.querySelector('span');
    if (span) span.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      if (span) span.textContent = 'Send Message';
      btn.disabled = false;
    }, 6000);
  });
}

/* ============================================================
   SECTION HEADING 3D PERSPECTIVE EFFECT ON SCROLL
   ============================================================ */
function initHeading3D() {
  const titles = $$('.section-title');
  if (!titles.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transform = 'perspective(600px) rotateX(0deg)';
        e.target.style.opacity   = '1';
      }
    });
  }, { threshold: 0.2 });

  titles.forEach(t => {
    t.style.transform  = 'perspective(600px) rotateX(6deg)';
    t.style.opacity    = '0';
    t.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease';
    t.style.transformOrigin = 'left bottom';
    obs.observe(t);
  });
}

/* ============================================================
   GRADIENT BORDER on section tags
   ============================================================ */
function initSectionTagAnim() {
  const tags = $$('.tag-line');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = '32px';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  tags.forEach(t => {
    t.style.width      = '0px';
    t.style.transition = 'width 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s';
    obs.observe(t);
  });
}

/* ============================================================
   TIMELINE dots pulse on scroll-into-view
   ============================================================ */
function initTimelineDots() {
  const dots = $$('.tl-dot');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transform = 'scale(1)';
        e.target.style.opacity   = '1';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  dots.forEach(d => {
    d.style.transform  = 'scale(0)';
    d.style.opacity    = '0';
    d.style.transition = 'transform 0.45s var(--ease-spring), opacity 0.35s ease';
    obs.observe(d);
  });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initNav();
  initParallax();
  initCanvas();
  initTyped();
  initCounters();
  initReveals();
  initCardTilt();
  initBackTop();
  initAnchorNav();
  initForm();
  initHeading3D();
  initSectionTagAnim();
  initTimelineDots();
});
