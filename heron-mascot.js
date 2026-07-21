/* Canonical system mark renderer. */
(function () {
  "use strict";

  function render(host) {
    const image = document.createElement("img");
    image.className = "quantumHeron quantumHeron--system";
    image.src = "/assets/brand/quantum-heron.png?v=20260720d";
    image.alt = host.dataset.heronLabel || "Quantum Heron";
    image.decoding = "async";
    host.replaceChildren(image);
  }

  function init() {
    document.querySelectorAll("[data-heron-pet]").forEach(render);
  }

  window.HeronMascot = { render, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
