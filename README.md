# Quantum Heron Labs — site

The public site for Quantum Heron Labs LLC. Two surfaces, two jobs:

- **Root `/` is the contracting page** — the headline. Services, method, and the fixed-price $5,000 Field Service Workflow Pilot. This is what visitors are meant to act on.
- **`/platform/` is the showcase** — ancillary proof. What the Heron system does today, with an honest live / demo / private status for every surface. It sends impressed visitors back to `/#services` and `/#pilot`.

## Live experience

- Contracting (root): <https://quantumheronlabs.com/>
- Platform showcase: <https://quantumheronlabs.com/platform/>
- Privacy: <https://quantumheronlabs.com/privacy/>
- Platform public demos (fictional sample data, in-browser only):
  - Learn demo: <https://quantumheronlabs.com/platform/learn/>
  - Graph demo: <https://quantumheronlabs.com/platform/graph/>
- Original Build Week surfaces: Watch (public demo), Feed, Client — linked from `/platform/` with their current status. The real Learn / Study Loop and the real Heron Graph are **private**; there is no public live Learn, and `learn.quantumheronlabs.com` is not a public destination. The public demos above exist precisely so a prospect can see the shape without touching private data.

## History

This repository began as the OpenAI Build Week 2026 submission site (July 13–21, 2026, track: Apps for Your Life). That history is preserved, dated, in:

- [`SUBMISSION.md`](./SUBMISSION.md) — **historical record** of the July submission
- [`BUILDWEEK_DELTA.md`](./BUILDWEEK_DELTA.md) — **historical record** of the Build Week changes

The `/platform/` page carries a dated Build Week history section as provenance. There is no judge funnel: the July judge guide URL, guided trace links, and contest framing were retired in the November 2026 modernization.

## What the platform is now (November 2026)

Since July, Heron grew past the five contest surfaces. `/platform/` leads with what shipped since: Listen + Heron Press, the Study Loop, Field / Share-to-Heron / Now, Book Club as a worked example, local corpora at 57M+ records (full-text, local), and 23 human-gated voice personas routed to 6 outputs under a governed, local-first model router. The original five surfaces are demoted to a dated section with one honest status line each.

## Run locally

No package installation or build step is required:

```bash
python3 -m http.server 8080
```

Then open <http://127.0.0.1:8080/> and <http://127.0.0.1:8080/platform/>.

Validate root + platform structure and claims with:

```bash
npm run lint
npm test
```

## Run with Docker

```bash
docker compose up -d --build
curl -fsS http://127.0.0.1:8465/health
```

The container is read-only, drops all capabilities except the minimum Nginx runtime set, and binds only to localhost. Host Nginx terminates TLS and proxies `quantumheronlabs.com` to port `8465`. Deployment is a separate, explicitly approved step; this repository's default flow is branch → review → merge → deploy from the canonical VPS checkout.

## Files

- `index.html` — the contracting landing page (root, the headline)
- `platform/index.html` — the platform showcase (ancillary)
- `platform/learn/index.html` — public Learn demo, fictional sample data, self-contained
- `platform/graph/index.html` — public Graph demo, fictional sample data, self-contained
- `privacy/index.html` — privacy page
- `styles.css` — shared responsive visual system (root, platform, privacy); shared-file changes are covered by the validator's root + platform checks
- `script.js` — mobile navigation, progressive reveal, and interactive loop demo
- `package.json` / `scripts/validate-site.mjs` — dependency-free release checks for root and platform
- `assets/product/<surface>/` — July 2026 capture archive (dated manifests); no longer presented on `/platform/` as current imagery
- `nginx.conf` — static serving, health check, caching, CSP, and security headers
- `Dockerfile` / `docker-compose.yml` — independent production runtime
- `deploy/quantumheronlabs.com.conf` — source-controlled host Nginx proxy configuration

## Accessibility and performance

- Semantic headings, landmarks, navigation labels, and skip link
- Keyboard-friendly links and controls
- Reduced-motion support
- Responsive layouts down to narrow mobile screens
- No third-party JavaScript, tracking, font, or image requests on root or platform
