/* Shared Quantum Heron mascot renderer. App mode changes the heron's behavior. */
(function () {
  "use strict";

  const common = `
    <g class="heronBody">
      <path class="heronTorso" d="M22 61C23 49 33 42 47 43c14 1 22 10 20 21-2 10-11 16-24 16-14 0-23-7-21-19Z"/>
      <path class="heronNeck" d="M48 51c-8-8-9-17 1-22 9-5 10-11 5-16"/>
      <circle class="heronHead" cx="56" cy="13" r="7"/>
      <path class="heronBeak" d="m61 10 24 5-23 6Z"/>
      <circle class="heronEye" cx="58" cy="11.5" r="1.5"/>
      <path class="heronWing" d="M33 53c10-7 22-4 26 6-11-1-19 3-25 11-5-5-6-11-1-17Z"/>
      <path class="heronLegs" d="M38 77v12m15-12v12M33 89h10m6 0h10"/>
    </g>`;

  const variants = {
    orbit: `
      <g class="quantumOrbits">
        <ellipse class="orbit orbitOne" cx="48" cy="48" rx="39" ry="16"/>
        <ellipse class="orbit orbitTwo" cx="48" cy="48" rx="39" ry="16"/>
        <circle class="quantumNode nodeOne" cx="12" cy="43" r="3"/>
        <circle class="quantumNode nodeTwo" cx="81" cy="28" r="2.5"/>
      </g>`,
    feed: `
      <g class="feedSignals">
        <path class="signalWave waveOne" d="M82 9c6 3 9 8 9 14"/>
        <path class="signalWave waveTwo" d="M82 29c6-3 9-8 9-14"/>
        <circle class="signalNode" cx="87" cy="16" r="3"/>
      </g>`,
    learn: `
      <g class="learningBook">
        <path class="bookPage pageLeft" d="M12 69c13-3 25-1 36 7v15c-11-6-23-8-36-5Z"/>
        <path class="bookPage pageRight" d="M84 69c-13-3-25-1-36 7v15c11-6 23-8 36-5Z"/>
        <path class="bookSpine" d="M48 76v15"/>
        <path class="ideaSpark" d="m77 27 2.3 5.2L85 35l-5.7 2.7L77 43l-2.4-5.3L69 35l5.6-2.8Z"/>
      </g>`
  };

  function render(host) {
    const mode = host.dataset.heronPet || "orbit";
    host.innerHTML = `
      <svg class="quantumHeron quantumHeron--${mode}" viewBox="0 0 96 96" role="img" aria-label="${host.dataset.heronLabel || "Quantum Heron mascot"}">
        ${variants[mode] || variants.orbit}
        ${common}
      </svg>`;
  }

  function init() {
    document.querySelectorAll("[data-heron-pet]").forEach(render);
  }

  window.HeronMascot = { render, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
