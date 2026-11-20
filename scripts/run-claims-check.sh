#!/bin/bash
# Standing public-claims run (SCF-01): verify the live site's claims and
# seal the receipt into scripts/claims-receipts/ with a sha256 index row.
set -u
cd "$(dirname "$0")/.."
OUT="scripts/claims-receipts"
python3 scripts/site-claims-verify.py --out-dir "$OUT"
code=$?
latest_md=$(ls -t "$OUT"/site-claims-receipt-*.md | head -1)
latest_json=$(ls -t "$OUT"/site-claims-receipt-*.json | head -1)
python3 - "$latest_md" "$latest_json" "$code" << 'PYEOF'
import hashlib, json, sys, datetime
md, js, code = sys.argv[1], sys.argv[2], int(sys.argv[3])
def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()
row = {"ts": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
       "exit_code": code, "receipt_md": md, "receipt_json": js,
       "md_sha256": sha(md), "json_sha256": sha(js)}
with open("scripts/claims-receipts/INDEX.jsonl", "a") as f:
    f.write(json.dumps(row) + "\n")
print(json.dumps(row))
PYEOF
exit $code
