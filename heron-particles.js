(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let canvas;
  let context;
  let particles = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  const palette = { primary: "#d9ff5b", secondary: "#ff7448", line: "#121816", alpha: 0.22 };

  function makeParticle(index) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: index % 9 === 0 ? 2.5 : 1.45,
      color: index % 7 === 0 ? palette.secondary : palette.primary
    };
  }

  function resize() {
    if (!canvas || !context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(28, Math.min(72, Math.round((width * height) / 23000)));
    particles = Array.from({ length: count }, (_, index) => makeParticle(index));
    draw(true);
  }

  function draw(still) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      if (!still && !reduceMotion.matches) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;
      }
      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 128) continue;
        context.globalAlpha = (1 - distance / 128) * palette.alpha * 0.42;
        context.strokeStyle = palette.line;
        context.lineWidth = 0.7;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
      context.globalAlpha = palette.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function tick() {
    draw(false);
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    window.cancelAnimationFrame(frame);
    if (!reduceMotion.matches && !document.hidden) frame = window.requestAnimationFrame(tick);
    else draw(true);
  }

  function init() {
    canvas = document.createElement("canvas");
    canvas.id = "heron-particles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener?.("change", start);
  }

  window.heronParticles = { refresh: resize };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
