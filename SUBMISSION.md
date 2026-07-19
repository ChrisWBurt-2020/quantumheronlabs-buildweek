# Build Week submission working brief

> Use this as a planning document, then rewrite the final Devpost description in your own voice. OpenAI's event update explicitly recommends not submitting AI-written copy unchanged.

## Recommended framing

- **Project name:** Heron
- **Submission title:** Heron — From signal to memory
- **Track:** Apps for Your Life
- **One line:** A personal intelligence loop that turns the sources you choose into explanations, practice, and durable recall.
- **Live demo:** <https://quantumheronlabs.com>
- **Public site repository:** <https://github.com/ChrisWBurt-2020/quantumheronlabs-buildweek>

Apps for Your Life is the strongest fit because the primary audience is an individual managing everyday attention, learning, and action. Education is plausible, but it describes only Heron Learn and weakens the larger Feed → Learn → Client → Graph story.

## Problem and solution

### Problem

Online feeds are optimized to keep people consuming. Useful reading is fragmented across tabs and saves, and information that felt clear today is usually forgotten next week.

### Solution

Heron gives one person a deliberate loop:

1. Choose and scan sources in HeronFeed.
2. Select a signal worth understanding.
3. Use GPT-5.6 to structure the source packet into explanations, counterarguments, questions, and learning prompts.
4. Move the idea into Heron Learn for short guided practice and spaced recall.
5. Use HeronClient to turn context into private agent work, and Heron Graph to inspect the relationships across the system.
6. Keep HeronWatch available as the observation surface while its deeper signal model is defined.

## What changed during July 13–21

The final entry must distinguish this work from the pre-existing project and link each claim to a dated commit or Codex session:

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

- Show a real Feed → Enrich → Learn flow, not only the landing page.
- Show the GPT-5.6 request, structured output contract, and where the result enters deterministic code.
- Point to dated commits and the primary Codex `/feedback` session.
- Explain one technical decision Codex helped surface and one decision you changed or rejected.

### Design

- Start the video on the landing page, then move immediately into the two live apps.
- Use one shared account and one coherent sample topic throughout the demo.
- Avoid setup time on camera; pre-load the source and learning state.

### Potential impact

- Make the audience specific: curious people who read constantly but retain too little.
- Demonstrate the outcome as a completed recall step, not an article summary.
- Describe the behavior you want to change: fewer passive saves, more ideas recalled and applied.

### Quality of the idea

- Lead with the closed loop, not three separate products.
- Contrast Heron with both algorithmic feeds and generic AI summarizers: the user controls entry, and useful signals become scheduled learning.
- Present HeronWatch honestly: its production surface is live, while its deeper observation behavior remains forthcoming.

## Three-minute video storyboard

Keep the final video under three minutes, public on YouTube, and narrated. It must explain what was built and how Codex and GPT-5.6 were used.

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:20 | Landing-page hero and loop animation | The problem: feeds capture attention but do not build durable understanding. |
| 0:20–0:55 | HeronFeed source scan and selected item | The user controls sources and chooses what deserves deeper attention. |
| 0:55–1:25 | Enrichment result and GPT-5.6 structure | Show explanation, steelman/counterargument, and generated learning prompts; name GPT-5.6 directly. |
| 1:25–1:55 | Send to Heron Learn and start a short session | The selected idea becomes guided practice and active recall rather than another forgotten save. |
| 1:55–2:15 | Shared identity and progress | One verified account joins the two live apps while progress remains local-first with optional sync. |
| 2:15–2:35 | HeronClient, Graph, and Watch | Show agent action and graph synthesis; identify Watch as a live foundation with forthcoming context. |
| 2:35–2:55 | Build Week section and repository | Name what Codex accelerated, show dated commits, and identify the submission-period work. |
| 2:55–3:00 | Landing CTA | Close with: “Read less. Learn more. Keep what matters.” |

## Required before July 21 at 5:00 PM Pacific

- [ ] Register/join and create the Devpost draft now.
- [ ] Verify the production Feed → GPT-5.6 → Learn path works exactly as narrated.
- [ ] Put explicit GPT-5.6 evidence and reproducible test guidance in the application-code README.
- [ ] Retrieve the `/feedback` session ID from the primary Codex build task.
- [ ] Record a narrated video of three minutes or less.
- [ ] Upload the video publicly to YouTube.
- [ ] Add the correct application code repository, not only the landing-page repository.
- [ ] If that repository stays private, share it with `testing@devpost.com` and `build-week-event@openai.com`.
- [ ] Create a judge-ready test account or a no-friction sandbox and document credentials/instructions.
- [ ] Verify all team members have accepted Devpost invitations before the deadline.
- [ ] Submit in English and do a final rules check on Devpost.

## Highest-risk gaps

1. **GPT-5.6 evidence:** the public story is ready, but judges need the actual model call path in code and in the video.
2. **Repository scope:** this repository contains the landing site; the submission must also expose the working application code for judging.
3. **Judge friction:** both live apps currently require verified email. Provide a test account or sandbox so a judge reaches value without creating an account.
4. **Demo scope:** prioritize the working Feed → Learn path, then use Client and Graph to prove the wider system; keep Watch's forthcoming behavior explicit.
