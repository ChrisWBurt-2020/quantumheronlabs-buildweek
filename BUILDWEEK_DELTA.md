# Heron Build Week Delta

This document is the evidence map for the July 2026 submission. The intended public positioning remains “Read less. Learn more. Keep what matters.” The stale enterprise-agent page observed by one crawler was an origin/cache artifact, not the current product direction.

## Judge path

1. Sign in with the verified account listed only in the private Devpost testing instructions.
2. Open `https://heronfeed.quantumheronlabs.com/?buildweek=1`.
3. On the golden retrieval-practice article, choose **Turn this into knowledge**.
4. Open **Heron Receipt** and verify `signal.captured` → `signal.structured`, exact model metadata, schema validation, source, and correlation ID.
5. Choose **Open in Learn**, reveal the retrieval answer, and rate it **Again** or **Good**.
6. Open Graph and inspect the latest compact concept neighborhood. The same receipt adds `learning.generated`, `review.completed`, and `concept.linked`.
7. Open Client and choose **Get next action**. The deterministic action and `action.created` event close the loop.

This is the target transaction, not yet a public claim: the production feature flag remains off until the OpenAI quota blocker described below is cleared and a real `gpt-5.6` receipt passes validation.

## Change map

| Prior state | Build Week change | Evidence / reproduction |
|---|---|---|
| Feed enrichment used the provider-flexible router and did not prove the named model. | A dedicated server adapter calls the Responses API with `gpt-5.6`, strict Structured Outputs, no provider fallback, timeout/refusal/incomplete/schema handling, and persisted response metadata. | `services/heronfeed/server/gpt56-knowledge.js`; `npm test` in `services/heronfeed`. |
| Feed→Learn passed an opportunity but not one durable cross-app identity. | Account-scoped knowledge object + append-only event receipt, content dedupe, event idempotency, correlation ID, and transactional outbox writes. | `migrations/040_knowledge_objects.sql`; `services/heronclient-v2/src/knowledge.ts`. |
| Learn import was acknowledgement-only. | Learn receives retrieval questions, records `learning.generated`, grades active recall, and deterministically schedules the next review. | Open the generated Learn import URL and rate one recall item. |
| Graph was a broad live/preview field. | Graph merges at most six concepts around the latest object and records `concept.linked`. | Open Graph after the Learn review. |
| Client did not close the knowledge loop. | Client chooses exactly one next action from review mastery and suggested actions, then records `action.created`. | Open Client → **Get next action**. |
| Cross-app provenance required database inspection. | The Companion SDK exposes a shared Heron Receipt in Feed, Learn, Graph, and Client. | Use the companion’s **Receipt** action on each surface. |
| Demo setup depended on ambient account/feed state. | An idempotent reset script verifies the demo account, resets its object state, and seeds one permitted, demo-owned article. | `HERON_DEMO_EMAIL=… DATABASE_URL=… scripts/buildweek-demo-reset.sh`. Credentials remain outside Git. |
| `www` and apex could serve independently and crawlers retained stale copy. | Apex is canonical, `www` permanently redirects, HTML revalidates, versioned assets are immutable, and an OG image is declared in initial HTML. | `curl -I` apex and `www`; inspect the initial HTML head. |

## Build Week authorship record

Fill commit hashes and exported Codex session URLs immediately before submission; they are intentionally not fabricated here.

| Feature group | Commit | Codex session | GPT‑5.6 role |
|---|---|---|---|
| Knowledge object/event spine | pending commit | pending export | None; deterministic storage and transitions |
| GPT‑5.6 structured synthesis | pending commit | pending export | Produces only the versioned semantic packet |
| Learn, Graph, Client continuity + receipt | pending commit | pending export | Consumes the validated packet; identity/state remain deterministic |
| Judge seed, tests, and delivery consistency | pending commit | pending export | Reproduction and trace verification |

Current rollout note (2026-07-19): the dedicated production adapter reached OpenAI but the configured project returned HTTP 429 `quota exceeded`. The public site therefore says “OpenAI” rather than claiming GPT‑5.6. Restore project quota, run the golden path, and verify `model=gpt-5.6`, a response ID, `status=completed`, and `validated=true` in the receipt before enabling the exact-model copy.

## Honest scope

- Feed→Learn, shared identity, Graph, receipt continuity, and deterministic Client actions are implemented and integration-tested. The live GPT-backed entry remains gated because the production OpenAI request did not complete.
- Watch is a live production foundation and remains outside the judged transaction; deeper observation behavior is forthcoming.
- Public GPT‑5.6 wording should be enabled only after a production receipt shows that exact model on the demonstrated run.
- The post-submission production backlog remains: dedicated outbox consumers with retry/DLQ, correlation dashboards, memory exclusion/export/deletion controls, generalized `video_moment` ingestion, and Graph bundle splitting.
