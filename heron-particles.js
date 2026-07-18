(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000, active: false, pulse: 0 };
  let canvas;
  let context;
  let particles = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let palette = { primary: "#d9ff5b", secondary: "#ff7448", line: "#121816", alpha: 0.44 };

  function cssValue(name, fallback) {
    return getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  }

  function readPalette() {
    const dark = root.dataset.theme === "dark" || root.classList.contains("dark") ||
      (!root.dataset.theme && getComputedStyle(root).colorScheme.includes("dark"));
    palette = {
      primary: cssValue("--particle-primary", cssValue("--domain-primary", cssValue("--accent", "#d9ff5b"))),
      secondary: cssValue("--particle-secondary", "#ff7448"),
      line: dark ? "#f4f2e9" : "#121816",
      alpha: dark ? 0.58 : 0.44
    };
  }

  function makeParticle(index) {
    const anchor = index % 11 === 0;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (anchor ? 0.16 : 0.34),
      vy: (Math.random() - 0.5) * (anchor ? 0.16 : 0.34),
      size: anchor ? 3.1 + Math.random() : 1.35 + Math.random() * 1.1,
      anchor,
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
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(46, Math.min(112, Math.round((width * height) / 14500)));
    particles = Array.from({ length: count }, (_, index) => makeParticle(index));
    draw(true);
  }

  function moveParticle(particle) {
    if (reduceMotion.matches) return;
    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 180 && distance > 1) {
        const force = (1 - distance / 180) * (particle.anchor ? 0.0015 : 0.003);
        particle.vx += dx * force;
        particle.vy += dy * force;
      }
    }
    particle.vx *= 0.992;
    particle.vy *= 0.992;
    const speed = Math.hypot(particle.vx, particle.vy);
    if (speed > 0.52) {
      particle.vx = particle.vx / speed * 0.52;
      particle.vy = particle.vy / speed * 0.52;
    }
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < -12) particle.x = width + 12;
    if (particle.x > width + 12) particle.x = -12;
    if (particle.y < -12) particle.y = height + 12;
    if (particle.y > height + 12) particle.y = -12;
  }

  function draw(still) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      if (!still) moveParticle(particle);
      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 154) continue;
        context.globalAlpha = (1 - distance / 154) * palette.alpha * 0.72;
        context.strokeStyle = particle.anchor || other.anchor ? palette.primary : palette.line;
        context.lineWidth = particle.anchor || other.anchor ? 1 : 0.72;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
      if (particle.anchor) {
        context.globalAlpha = palette.alpha * 0.46;
        context.strokeStyle = particle.color;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size + 4 + pointer.pulse * 5, 0, Math.PI * 2);
        context.stroke();
      }
      context.globalAlpha = palette.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    pointer.pulse *= 0.93;
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

  function refresh() {
    if (!canvas || !context) return init();
    readPalette();
    particles.forEach((particle, index) => {
      particle.color = index % 7 === 0 ? palette.secondary : palette.primary;
    });
    draw(true);
    start();
  }

  function destroy() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    canvas?.remove();
    canvas = null;
    context = null;
    particles = [];
  }

  function init() {
    if (canvas?.isConnected) return refresh();
    canvas = document.getElementById("heron-particles") || document.createElement("canvas");
    canvas.id = "heron-particles";
    canvas.setAttribute("aria-hidden", "true");
    if (!canvas.isConnected) document.body.prepend(canvas);
    context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    readPalette();
    resize();
    start();
  }

  new MutationObserver(refresh).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme", "data-domain", "data-channel-theme", "class", "style"]
  });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener("pointerout", () => { pointer.active = false; }, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointer.pulse = 1;
  }, { passive: true });
  document.addEventListener("visibilitychange", start);
  reduceMotion.addEventListener?.("change", start);

  window.heronParticles = {
    refresh,
    destroy,
    get count() { return particles.length; }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
