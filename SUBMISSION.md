# Build Week submission working brief

> Use this as a planning document, then rewrite the final Devpost description in your own voice. OpenAI's event update explicitly recommends not submitting AI-written copy unchanged.

## Recommended framing

- **Project name:** Heron
- **Submission title:** HeronWatch — Meaning without losing the source
- **Track:** Apps for Your Life
- **One line:** A provenance-first interpretation workspace that turns source media into inspectable understanding, durable memory, and controlled action.
- **Live demo:** <https://quantumheronlabs.com>
- **Judge guide:** <https://quantumheronlabs.com/?audience=judge#judge>
- **Public site repository:** <https://github.com/ChrisWBurt-2020/quantumheronlabs-buildweek>
- **Application repository:** <https://github.com/ChrisWBurt-2020/exocortex-hub>

Apps for Your Life is the strongest fit because the primary audience is an individual managing everyday attention, learning, and action. Education is plausible, but it describes only Heron Learn and weakens the larger Feed → Learn → Client → Graph story.

## Problem and solution

### Problem

Online feeds are optimized to keep people consuming. Useful reading is fragmented across tabs and saves, and information that felt clear today is usually forgotten next week.

### Solution

Heron gives one person a deliberate loop:

1. Open source media in HeronWatch and keep the player, timeline, and interpretation synchronized.
2. Choose Understand, Verify, or Use and optionally apply the Credibility Hub lens.
3. Compile the source into typed semantic objects with segment-level provenance and calibrated uncertainty.
4. Carry one selected object into Feed attention, a Graph evidence neighborhood, and a scheduled Learn unit under one trace.
5. Create a private draft ActionIntent in HeronClient; execution remains approval-controlled.

## What changed during July 13–21

The final entry must distinguish this work from the pre-existing project and link each claim to a dated commit or Codex session:

- HeronWatch theatre-first player, cognitive gradient, intent modes, Credibility Hub, Why traces, and Cognitive Receipt
- Shared cognitive contracts and provenance-first runtime
- Real, idempotent Feed, Graph, Learn, and Client materialization under one trace
- Heron Learn redesign and canonical-domain production launch
- Feed-to-Learn reinforcement integration
- Unified verified account across HeronFeed and Learn
- Cross-device confirmation recovery
- Deployed permission and secret hardening
- Protected release flow and production approvals
- New submission narrative, design, container, and production cutover

## Judging-criteria map

The four criteria are equally weighted.

### Technological implementation

- Show a real Watch → Feed → Graph → Learn → Client trace, not only the landing page.
- Show the GPT-5.6 request, structured output contract, and where the result enters deterministic code.
- Point to dated commits and the primary Codex `/feedback` session.
- Explain one technical decision Codex helped surface and one decision you changed or rejected.

### Design

- Start directly in Watch's public demo, then move through the four trace-scoped projections.
- Use one shared account and one coherent sample topic throughout the demo.
- Avoid setup time on camera; pre-load the source and learning state.

### Potential impact

- Make the audience specific: curious people who read constantly but retain too little.
- Demonstrate the outcome as a completed recall step, not an article summary.
- Describe the behavior you want to change: fewer passive saves, more ideas recalled and applied.

### Quality of the idea

- Lead with one source, one semantic object, and one trace—not five separate apps.
- Contrast Heron with both algorithmic feeds and generic AI summarizers: the user controls entry, and useful signals become scheduled learning.
- Present model provenance honestly: distinguish live model output, precomputed model output, and curated or extractive fallback.

## Three-minute video storyboard

Keep the final video under three minutes, public on YouTube, and narrated. It must explain what was built and how Codex and GPT-5.6 were used.

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:18 | HeronWatch player and cognitive gradient | Passive media becomes source-synchronized, inspectable understanding. |
| 0:18–0:50 | Switch Verify → Credibility Hub | The lens changes the runtime constraints and the claim-oriented interface together. |
| 0:50–1:20 | Seek an intervention and open Why | Show the exact segment, evidence, counterevidence, uncertainty, hashes, and inference path. |
| 1:20–2:12 | Open Feed, Graph, Learn, and Client projections | One selection creates real destination objects with the same trace; Client remains a draft. |
| 2:12–2:38 | Cognitive Receipt and private capsule | Summarize supported, uncertain, worth-learning, and available-action sections. |
| 2:38–2:55 | Runtime, GPT-5.6, and Codex evidence | Show Structured Outputs, deterministic contracts, dated code, and the primary Codex session. |

## Required before July 21 at 5:00 PM Pacific

- [ ] Register/join and create the Devpost draft now.
- [x] Verify the production Watch → GPT‑5.6 → four-surface materialization path works exactly as narrated.
- [x] Put explicit GPT-5.6 evidence and reproducible test guidance in the application-code README.
- [ ] Retrieve the `/feedback` session ID from the primary Codex build task.
- [ ] Record a narrated video of three minutes or less.
- [ ] Upload the video publicly to YouTube.
- [ ] Add the correct application code repository, not only the landing-page repository.
- [ ] If that repository stays private, share it with `testing@devpost.com` and `build-week-event@openai.com`.
- [x] Create and fresh-browser verify a judge-ready test account.
- [ ] Paste the credentials and the `?buildweek=1` start URL into Devpost's private testing instructions (never commit them).
- [ ] Verify all team members have accepted Devpost invitations before the deadline.
- [ ] Submit in English and do a final rules check on Devpost.

## Remaining submission risks

1. **Devpost access:** the application repository and private judge-account instructions still need to be entered in the Devpost form.
2. **Video/editorial evidence:** the final public YouTube video must show the validated GPT-5.6 receipt, the exact resolved model, and the public context receipts without presenting the deterministic fallback as model output.
3. **Codex attribution:** add the primary `/feedback` session ID and explain one decision Codex influenced in the final human-edited submission copy.
4. **Deadline controls:** confirm team invitations, English copy, public video visibility, and the final rules review before pressing Submit.
