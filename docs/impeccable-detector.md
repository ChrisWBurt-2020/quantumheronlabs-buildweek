# Impeccable detector (CI)

This repo runs [Impeccable](https://github.com/pbakaus/impeccable)'s
deterministic design detector in CI as a **mechanical complement** to
design review — never as a replacement for it.

**Design authority stays with unslop** (the estate's design skill).
The detector enforces a fixed rule set deterministically — exact
contrast ratios with affected-element counts, tiny/undersized text,
eyebrow chips, side-tab borders, marquee loops and the like — and
hands back JSON plus a CI exit code. Judgment calls (type system,
tint system, spacing system, composition) remain a human/agent
unslop review. An agent armed with only the detector produces a
worse review than one armed with only unslop; the pair is the point.

## Pin

| Thing | Pinned / observed |
|---|---|
| npm package | `impeccable@4.8.2` — exact, never floated |
| Bundled engine | `0.1.21+engine` **as served** by that npm pin (verified 2026-11-09; the upstream `engine-v0.1.22` release tag is not what npm 4.8.2 bundles — record the as-served engine, not the tag) |
| Rules | 62 (per `detect --list-rules`) |
| Scan target | `index.html` + `styles.css` (the landing surface; `styles.css` is shared by the sub-pages) |

Upstream's release cadence is daily-class. Any pin bump is a
deliberate change: re-check the bundled engine version, re-run the
baseline, and re-audit before merging.

## CI behaviour

Workflow: `.github/workflows/impeccable-detector.yml` — runs on
pushes to `main`, pull requests, and manual dispatch.

- Runs `detect --json`, captures the exit code into the job summary,
  and uploads the findings JSON as the `impeccable-report` artifact.
- **Non-blocking.** The detector step is `continue-on-error` and never
  fails the check. Baseline at adoption (2026-11-09, `origin/main`
  897a747): **39 raw findings** on the landing surface, **38** after
  the one reasoned waiver below. A hard-red CI over a known baseline
  nobody has burned down yet would train everyone to ignore the
  tool. Burn the baseline down first, then ratchet in a deliberate
  follow-up change.

## Run it locally

From the repo root, exactly as CI runs it:

```bash
IMPECCABLE_LIVE_COPY_AGENT=off DO_NOT_TRACK=1 \
  npx -y impeccable@4.8.2 detect --json index.html styles.css > impeccable-report.json
echo $?   # 0 = clean, 1 = target unscannable, 2 = findings present
```

## Waivers: ignores-with-reason

Intentional choices are waived in `.impeccable/config.json` (the
tool's own shared config, committed on purpose so CI and local runs
agree), **always with a reason**. A waiver without a reason is a
finding in itself. Manage them with the tool, not by hand:

```bash
npx -y impeccable@4.8.2 ignores list
npx -y impeccable@4.8.2 ignores add-value <rule> <value> --reason "why this is intentional"
```

First entry (2026-11-09): `cream-palette` on `index.html` — the warm
paper `#f4f2e9` (`--paper` token in `styles.css`) is QHL's deliberate
brand surface. Unslop's world-tinted-ramp rule endorses a neutral
ramp tinted toward the product's world; this is the brand, not the
reflex AI default the rule exists to catch. (The rule has no
extractable value, so the waiver uses the tool's prescribed form:
`add-value cream-palette "*" --file "index.html"`.)

Only `.impeccable/config.json` is tracked; the rest of `.impeccable/`
(working files, caches, live-mode state) is gitignored.

## Hard boundaries

- **CI-only.** No impeccable hooks are installed in this repo or on
  any estate machine. Hooks run outside agent approval and can
  download/execute a binary on first edit.
- **Live mode is never used.** Its Apply fallback can invoke an
  agent CLI with approvals and sandboxing disabled
  (`--dangerously-bypass-approvals-and-sandbox` class flags) when no
  chat agent is polling. `IMPECCABLE_LIVE_COPY_AGENT=off` is set
  wherever the CLI runs.
- The skill half of impeccable is **not** adopted — it duplicates
  unslop with some directly conflicting guidance. Only the detector
  tool is used, pinned, here.

## Provenance

Adopted 2026-11-09 after a detector-only trial on this surface
(35 findings on the then-current landing, scored against a manual
unslop-signs review: 9 overlapping clusters, detector-unique value =
contrast mathematics; 1 strict false positive = the cream-palette
waiver above). Trial and audit reports live in the estate's research
notes (`impeccable-audit-2026-11-09.md`,
`batch8-exec-5-detector-2026-11-09.md`).
