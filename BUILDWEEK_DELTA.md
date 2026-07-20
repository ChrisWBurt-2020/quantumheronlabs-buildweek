# Heron Build Week Delta

This document is the evidence map for the July 2026 submission. The intended public positioning remains “Read less. Learn more. Keep what matters.” The stale enterprise-agent page observed by one crawler was an origin/cache artifact, not the current product direction.

## Judge path

1. Open the anonymous HeronWatch demo; it performs no model call or persistent write.
2. Switch to **Verify** and **Credibility Hub**, seek an intervention, and inspect its timestamped Why trace.
3. Sign in with the verified account listed only in the private Devpost instructions to test private materialization.
4. Carry one selected object into Feed, Graph, Learn, and Client.
5. Verify each destination contains a real object with the same trace and a back-link to the exact Watch capsule and segment.
6. Confirm Client created only a draft ActionIntent and that repeated handoffs do not duplicate destination state.
7. Open the Cognitive Receipt and verify supported, uncertain, learning, and action sections plus truthful engine metadata.

The Structured Outputs release gate passed on July 20, 2026. The recorded receipt contains a completed response ID, schema-v2 validation, and the resolved model returned by OpenAI; the curated public demo remains model-free.

## Change map

| Prior state | Build Week change | Evidence / reproduction |
|---|---|---|
| Watch was a static foundation with no cognitive runtime. | HeronWatch now provides a synchronized media workspace, Understand/Verify/Use intents, Adaptive/Credibility Hub lenses, segment-level Why traces, Cognitive Receipts, and private capsules. | Open the public Watch demo, switch to Verify + Credibility Hub, seek a timeline intervention, and inspect Why. |
| Watch handoffs returned destination-looking links without destination state. | Account-scoped SurfaceProjections materialize idempotent Feed signals, Graph neighborhoods, Learn units, and Client draft intents under one trace. | Repeat the same authenticated handoff and verify the same destination ID/deep link is returned. |
| Feed enrichment used the provider-flexible router and did not prove the named model. | A dedicated server adapter calls the Responses API with `gpt-5.6`, strict Structured Outputs, no provider fallback, timeout/refusal/incomplete/schema handling, and persisted response metadata. | `services/heronfeed/server/gpt56-knowledge.js`; `npm test` in `services/heronfeed`. |
| Feed→Learn passed an opportunity but not one durable cross-app identity. | Account-scoped knowledge object + append-only event receipt, content dedupe, event idempotency, correlation ID, and transactional outbox writes. | `migrations/040_knowledge_objects.sql`; `services/heronclient-v2/src/knowledge.ts`. |
| Learn import was acknowledgement-only. | Learn receives retrieval questions, records `learning.generated`, grades active recall, and deterministically schedules the next review. | Open the generated Learn import URL and rate one recall item. |
| Graph was a broad live/preview field. | Graph merges at most six concepts around the latest object and records `concept.linked`. | Open Graph after the Learn review. |
| Client did not close the knowledge loop. | Client chooses exactly one next action from review mastery and suggested actions, then records `action.created`. | Open Client → **Get next action**. |
| Cross-app provenance required database inspection. | The Companion SDK exposes a shared Heron Receipt in Feed, Learn, Graph, and Client. | Use the companion’s **Receipt** action on each surface. |
| Demo setup depended on ambient account/feed state. | An idempotent reset script verifies the demo account, resets its object state, and seeds one permitted, demo-owned article. | `HERON_DEMO_EMAIL=… DATABASE_URL=… scripts/buildweek-demo-reset.sh`. Credentials remain outside Git. |
| `www` and apex could serve independently and crawlers retained stale copy. | Apex is canonical, `www` permanently redirects, HTML revalidates, versioned assets are immutable, and an OG image is declared in initial HTML. | `curl -I` apex and `www`; inspect the initial HTML head. |

## Build Week authorship record

Implementation commit hashes are recorded below. Add exported Codex session URLs immediately before submission; those links are intentionally not fabricated here.

| Feature group | Commit | Codex session | GPT‑5.6 role |
|---|---|---|---|
| Knowledge object/event spine | `3105f320` | pending export | None; deterministic storage and transitions |
| GPT‑5.6 structured synthesis | `fc2229d4` | pending export | Produces only the versioned semantic packet |
| Learn, Graph, Client continuity + receipt | `26655a5c` | pending export | Consumes the validated packet; identity/state remain deterministic |
| Judge seed, tests, and delivery consistency | `fd0a3ac7`, `c52ee45f`, `e3862a31`, `980d59f`, `a4385f7` | pending export | Reproduction and trace verification |

Current rollout note (2026-07-20): the release-gate call through the `gpt-5.6` alias completed and returned `gpt-5.6-sol`, a response ID, three schema-valid objects, and `validated=true`. The receipt is stored without source text or model output at `services/heron-runtime/BUILDWEEK_MODEL_RECEIPT.json`.

The dedicated judge identity is email-verified and OIDC-provisioned, its credentials are stored outside Git, and the golden article is seeded. A fresh-browser test confirmed that sign-in preserves `?buildweek=1` and opens directly on the retrieval-practice article.

The apex now serves a valid XML sitemap instead of falling through to HTML. The updated canonical URL and its public ownership key were submitted to the IndexNow global endpoint and accepted with HTTP 202. Google still requires an owner-console recrawl request; its currently indexed snippet remains the older enterprise page.

## Honest scope

- Feed→Learn, shared identity, Graph, receipt continuity, deterministic Client actions, and the live schema-v2 model path are implemented and integration-tested.
- Watch is the judged entry point; Adaptive and Credibility Hub are the only exposed lenses, and unfinished archetypes remain out of scope.
- The runtime requests the stable `gpt-5.6` alias and preserves the exact resolved model returned by OpenAI in run provenance.
- The post-submission production backlog remains: dedicated outbox consumers with retry/DLQ, correlation dashboards, memory exclusion/export/deletion controls, generalized `video_moment` ingestion, and Graph bundle splitting.
