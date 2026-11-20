# Sealed claims-receipt archive (SCF-01)

Every standing public-claims run seals its receipt here: the
`site-claims-receipt-<ts>.md` + `.json` pair from `site-claims-verify.py`,
plus one appended row in `INDEX.jsonl` per run carrying the receipt
files' sha256, the run's exit code, and its verdict counts. Sealed =
the receipt and its index row are committed and never edited after the
run; a later run appends, it does not amend.

Honest failure (SCF-01): "CLAIMS RUN MISSING: last sealed receipt
<date> — site claims UNVERIFIED since." If the newest INDEX row is
older than 7 days, site claims are UNVERIFIED by this archive's own
rule, whatever any chat or goal record says.

Run a check with `scripts/run-claims-check.sh`.
