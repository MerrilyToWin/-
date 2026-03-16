'use strict';

/* ─── Enable CSS smooth scrolling ─────────────────────────── */
document.documentElement.style.scrollBehavior = 'smooth';

/* ─── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function initTheme() {
  const html  = document.documentElement;
  const btn   = $('#theme-toggle');
  const label = $('#theme-label');
  const saved = localStorage.getItem('mj-theme') || 'dark';

  html.setAttribute('data-theme', saved);
  if (label) label.textContent = saved;

  btn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    if (label) label.textContent = next;
    localStorage.setItem('mj-theme', next);
  });
}

/* ============================================================
   CUSTOM CURSOR  (desktop only)
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

  (function ringLoop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(ringLoop);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.project-card,.skill-tag,.timeline-card,.achievement-card'))
      document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,.project-card,.skill-tag,.timeline-card,.achievement-card'))
      document.body.classList.remove('cursor-hover');
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
   HERO PARALLAX — pure window.scrollY, no DOM hijack
   ============================================================ */
function initParallax() {
  const imgWrap   = $('#heroImgWrap');
  const content   = $('#heroContent');
  const orbEls    = $$('.hero-orb[data-parallax]');
  const nameLines = $$('.hero-name-line[data-parallax]');

  let ticking = false;

  function apply() {
    const y = window.scrollY;

    if (imgWrap) imgWrap.style.transform = `translate3d(0,${y * 0.40}px,0)`;

    if (content) {
      content.style.transform = `translate3d(0,${y * 0.16}px,0)`;
      content.style.opacity   = Math.max(0, 1 - y / 600).toFixed(3);
    }

    orbEls.forEach(orb => {
      const rate = parseFloat(orb.dataset.parallax) || 0.05;
      orb.style.transform = `translate3d(0,${y * rate * 100}px,0)`;
    });

    nameLines.forEach(line => {
      const rate = parseFloat(line.dataset.parallax) || 0.015;
      line.style.transform = `translate3d(0,${y * rate * 50}px,0)`;
    });

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
  const N = 75, DIST = 140;
  const MOUSE = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45,
      vy: (Math.random() - .5) * .45,
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    MOUSE.x = e.clientX - r.left;
    MOUSE.y = e.clientY - r.top;
  });

  function rgb() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '90,77,230' : '123,108,255';
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    const c = rgb();

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = n.x - MOUSE.x, dy = n.y - MOUSE.y;
      const d = Math.hypot(dx, dy);
      if (d < 90 && d > 0) { n.x += dx / d * 2; n.y += dy / d * 2; }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${c},${((1 - d / DIST) * .45).toFixed(3)})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},.65)`;
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
    'DevSecOps Enthusiast',
    'Post-Quantum Explorer',
    'Python Developer',
    'Network Engineer',
    'Security Researcher',
  ];
  let ri = 0, ci = 0, del = false;

  function tick() {
    const word = roles[ri];
    el.textContent = del ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
    del ? ci-- : ci++;
    let wait = del ? 55 : 100;
    if (!del && ci === word.length)  { wait = 2200; del = true; }
    else if (del && ci === 0)        { del = false; ri = (ri + 1) % roles.length; wait = 380; }
    setTimeout(tick, wait);
  }
  tick();
}

/* ============================================================
   STAT COUNTERS
   ============================================================ */
function initCounters() {
  const els = $$('.hero-stat-num[data-count], .hero-stat-num[data-val]');
  if (!els.length) return;
  let done = false;

  function run() {
    if (done) return;
    const hero = $('#hero');
    if (!hero) return;
    if (hero.getBoundingClientRect().top > window.innerHeight) return;
    done = true;

    els.forEach(el => {
      const isFloat = el.hasAttribute('data-val');
      const target  = parseFloat(isFloat ? el.dataset.val : el.dataset.count);
      const dur = 1600, t0 = performance.now();

      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = isFloat ? (e * target).toFixed(2) : Math.round(e * target) + '+';
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
  }, { threshold: 0.07 });

  $$('.section-reveal').forEach(s => secObs.observe(s));

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in-view'), i * 55);
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  $$(
    '.timeline-card,.project-card,.achievement-card,.edu-card,.cert-card,.research-card'
  ).forEach(c => cardObs.observe(c));
}

/* ============================================================
   ACTIVE NAV
   ============================================================ */
function initNav() {
  const links    = $$('#main-nav .nav-link');
  const sections = $$('main section[id]');
  if (!links.length || !sections.length) return;

  function update() {
    const mid = window.scrollY + window.innerHeight * 0.35;
    let active = sections[0].id;
    sections.forEach(sec => { if (sec.offsetTop <= mid) active = sec.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   ANCHOR NAV — all [data-scroll] links
   ============================================================ */
function initAnchorNav() {
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  initScrollProgress();
  initParallax();
  initCanvas();
  initTyped();
  initCounters();
  initReveals();
  initNav();
  initBackTop();
  initAnchorNav();
  initForm();
});
