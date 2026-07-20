# Heron — Your private AI exocortex

The independently deployable landing page for Quantum Heron Labs' OpenAI Build Week submission: one private, provenance-first system connecting **HeronFeed**, **Heron Learn**, **HeronWatch**, **HeronClient**, and **Heron Graph**.

## Live experience

- Submission landing page: <https://quantumheronlabs.com>
- Judge guide: <https://quantumheronlabs.com/?audience=judge#judge>
- HeronFeed: <https://heronfeed.quantumheronlabs.com>
- Heron Learn: <https://learn.quantumheronlabs.com>
- HeronWatch: <https://watch.quantumheronlabs.com>
- HeronClient: <https://heronclient.quantumheronlabs.com>
- Heron Graph: <https://graph.quantumheronlabs.com>
- Track: **Apps for Your Life**

## The idea

Most media ends at consumption. HeronWatch turns a selected source into a deliberate, inspectable loop:

1. **HeronWatch** synchronizes media with Understand, Verify, and Use projections plus the Credibility Hub lens.
2. **GPT-5.6** produces schema-constrained semantic objects while provenance retains exact segments, retrieval, inference, and uncertainty.
3. **HeronFeed** records an account-scoped attention signal and related-source context.
4. **Heron Graph** materializes the selected claims, concepts, entities, evidence, and relationships.
5. **Heron Learn** schedules a source-evaluation or retrieval LearningUnit.
6. **HeronClient** creates a private draft ActionIntent while approval policy continues to govern execution.

The human remains the editor. AI helps at the reasoning boundary; deterministic product code owns identity, source state, learning schedules, progress, and UI. Cross-surface links use a versioned context envelope so trace, capsule, source, and semantic-object identity can survive the transition without exposing private destination IDs. The five destination applications validate that envelope in the shared Companion SDK, preserve it across a reload, emit a `heron:context-received` browser event, and show a compact handoff receipt.

## What is new during Build Week

Heron predates the event, so the submission explicitly separates prior work from the July 13–21 work:

- Redesigned Heron Learn around one useful next step and 5/10/15-minute sessions.
- Launched Heron Learn at its canonical production domain.
- Connected HeronFeed activity to a Learn reinforcement loop.
- Added one verified Heron account across both applications.
- Recovered cross-device account confirmation and hardened deployed permissions/secrets.
- Established protected build, approval, and release paths.
- Built this public submission story and independent production container with Codex.
- Added canonical cross-app navigation across all five surfaces and launched HeronWatch.
- Reworked Heron Graph navigation, labels, touch controls, synthesis, and Companion SDK access.
- Built the Heron Cognitive Runtime, versioned contracts, Watch workspace, private capsules, Cognitive Receipts, and idempotent five-surface projections.

The timestamped product commit history lives in the primary application repository. This repository contains the public submission site and its deployment boundary.

See [`SUBMISSION.md`](./SUBMISSION.md) for the judging-criteria map, three-minute demo storyboard, deadline checklist, and highest-risk gaps.

## Codex and GPT-5.6

Codex was used as an engineering and design partner for repository analysis, implementation, browser QA, deployment diagnosis, release hardening, documentation, and construction of this site.

GPT-5.6 is used at the synthesis boundary: turning material a user has deliberately selected into structured explanations, steelman views, questions, and learning prompts. The surrounding system stays deterministic and inspectable.

The QHL-owned public demo script is narrated with an AI-generated OpenAI built-in voice; the transcript and timed captions are included with the source asset.

Before final submission, the Devpost entry should include:

- The `/feedback` session ID from the primary Codex build task.
- A public YouTube demo with audio explaining Codex usage.
- The application code repository, or private-repository access for `testing@devpost.com` and `build-week-event@openai.com`.
- Sample/test-account guidance that lets judges reach a useful moment quickly.
- Clear evidence of the GPT-5.6 call path and structured response contract.

## Run locally

No package installation or build step is required:

```bash
python3 -m http.server 8080
```

Then open <http://127.0.0.1:8080>.

Validate the static structure, product assets, judge-mode entry, JavaScript syntax, and four context links with:

```bash
npm run lint
npm test
```

## Run with Docker

```bash
docker compose up -d --build
curl -fsS http://127.0.0.1:8465/health
```

The container is read-only, drops all capabilities except the minimum Nginx runtime set, and binds only to localhost. Host Nginx terminates TLS and proxies `quantumheronlabs.com` to port `8465`.

## Files

- `index.html` — semantic landing-page structure and submission narrative
- `styles.css` — responsive visual system with no external font or asset dependency
- `script.js` — mobile navigation, progressive reveal, and interactive loop demo
- `package.json` / `scripts/validate-site.mjs` — dependency-free release checks for the static site
- `assets/product/<surface>/` — real, privacy-reviewed desktop/mobile captures plus a source manifest for every surface
- `nginx.conf` — static serving, health check, caching, CSP, and security headers
- `Dockerfile` / `docker-compose.yml` — independent production runtime
- `deploy/quantumheronlabs.com.conf` — source-controlled host Nginx proxy configuration

## Accessibility and performance

- Semantic headings, landmarks, navigation labels, and skip link
- Keyboard-friendly links and controls
- Reduced-motion support
- Responsive layouts down to narrow mobile screens
- No third-party JavaScript, tracking, font, or image requests; all product imagery is local
- Static assets served with caching and a restrictive Content Security Policy

## Disclosure

HeronFeed, Heron Learn, HeronClient, and parts of Heron Graph include pre-existing work. The Build Week additions are listed above and should be corroborated by timestamped Codex sessions and commit history. HeronWatch and its public precomputed demo are live. The submission distinguishes live model runs, precomputed packets, and non-model fallbacks, and does not claim unfinished archetypal lenses. Capture manifests record the source commit and dirty-tree fingerprint so the landing assets are auditable without pretending they came from a clean release commit.
