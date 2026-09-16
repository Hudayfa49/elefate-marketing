// Mobiel menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      // laat dropdown-links het menu niet sluiten als het naar een subpagina navigeert is prima; sluit gewoon
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    })
  );
}

// Fade-in bij scrollen
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reduce) {
  reveals.forEach(el => el.classList.add('in'));
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in'));
}

// Cursor-glow: alleen op de homepage (body.home)
if (document.body.classList.contains('home') && !reduce) {
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);
  let shown = false;
  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    if (!shown) { glow.style.opacity = '1'; shown = true; }
  });
}

// Blogfilter
const filterBar = document.querySelector('.filter-bar');
if (filterBar) {
  const btns = filterBar.querySelectorAll('.filter-btn');
  const posts = document.querySelectorAll('.post');
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    posts.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('hide', !show);
      if (show) p.classList.add('in');
    });
  });
}
