# Heron — OpenAI Build Week 2026

The public landing page for Quantum Heron Labs' OpenAI Build Week submission: a personal intelligence loop that connects **HeronFeed**, **Heron Learn**, and the developing **TruthCast** vision.

## Live experience

- Submission landing page: <https://quantumheronlabs.com>
- HeronFeed: <https://heronfeed.quantumheronlabs.com>
- Heron Learn: <https://learn.quantumheronlabs.com>
- Track: **Apps for Your Life**

## The idea

Most feeds end at consumption. Heron turns useful reading into a deliberate loop:

1. **HeronFeed** lets one person control their sources, scan the open web, and choose what matters.
2. **GPT-5.6** structures selected source packets into explanations, counterarguments, questions, and learning prompts.
3. **Heron Learn** turns those ideas into short guided sessions, active recall, and spaced review.
4. **TruthCast** is the in-development extension toward evidence-aware, second-screen context for media.

The human remains the editor. AI helps at the reasoning boundary; deterministic product code owns identity, source state, learning schedules, progress, and UI.

## What is new during Build Week

Heron predates the event, so the submission explicitly separates prior work from the July 13–21 work:

- Redesigned Heron Learn around one useful next step and 5/10/15-minute sessions.
- Launched Heron Learn at its canonical production domain.
- Connected HeronFeed activity to a Learn reinforcement loop.
- Added one verified Heron account across both applications.
- Recovered cross-device account confirmation and hardened deployed permissions/secrets.
- Established protected build, approval, and release paths.
- Built this public submission story and independent production container with Codex.

The timestamped product commit history lives in the primary application repository. This repository contains the public submission site and its deployment boundary.

## Codex and GPT-5.6

Codex was used as an engineering and design partner for repository analysis, implementation, browser QA, deployment diagnosis, release hardening, documentation, and construction of this site.

GPT-5.6 is used at the synthesis boundary: turning material a user has deliberately selected into structured explanations, steelman views, questions, and learning prompts. The surrounding system stays deterministic and inspectable.

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
- `nginx.conf` — static serving, health check, caching, CSP, and security headers
- `Dockerfile` / `docker-compose.yml` — independent production runtime
- `deploy/quantumheronlabs.com.conf` — source-controlled host Nginx proxy configuration

## Accessibility and performance

- Semantic headings, landmarks, navigation labels, and skip link
- Keyboard-friendly links and controls
- Reduced-motion support
- Responsive layouts down to narrow mobile screens
- No third-party JavaScript, tracking, font, or image requests
- Static assets served with caching and a restrictive Content Security Policy

## Disclosure

HeronFeed and Heron Learn include pre-existing work. The Build Week additions are listed above and should be corroborated by timestamped Codex sessions and commit history. TruthCast is clearly labeled in development; the interface shown on the landing page is a concept preview, not a live product claim.
