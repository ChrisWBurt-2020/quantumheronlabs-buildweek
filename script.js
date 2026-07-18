const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  header?.classList.toggle('is-compact', current > 36);
  header?.classList.toggle('is-hidden', current > lastScroll && current > 500);
  lastScroll = current;
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const loopButton = document.querySelector('[data-loop-button]');
const loopNodes = [...document.querySelectorAll('[data-loop-node]')];
let loopStep = 0;
let loopTimer;

function showLoopStep(index) {
  loopStep = index % loopNodes.length;
  loopNodes.forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex === loopStep));
}

function playLoop() {
  window.clearInterval(loopTimer);
  showLoopStep(0);
  loopButton?.classList.add('is-playing');
  let count = 0;
  loopTimer = window.setInterval(() => {
    count += 1;
    showLoopStep(count);
    if (count >= loopNodes.length + 1) {
      window.clearInterval(loopTimer);
      loopButton?.classList.remove('is-playing');
    }
  }, 820);
}

loopButton?.addEventListener('click', playLoop);

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

