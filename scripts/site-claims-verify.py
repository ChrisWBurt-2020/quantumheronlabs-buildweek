#!/usr/bin/env python3
"""site-claims-verify — public-claims verifier for quantumheronlabs.com + outbound packs.

Scaffold ★2 of the 2026-10-21 /learn scaffolding pass (S35-1 + S33-2 + S34-P2 + S29-7,
19/20). Consumer pattern: local-forensic-proof-ritual — read-only, per-claim verdicts,
never hand-upgraded.

WHAT IT DOES
  Extracts factual claim triples from (a) the served HTML of the site (default:
  https://quantumheronlabs.com/, fetched read-only) and (b) any local markdown
  files passed with --md (e.g. a LinkedIn/outbound pack), then probes each claim
  against the public record:

    repo claim        "<slug> is a public repo"      -> anonymous GitHub API:
                                                         200 AND private:false = VERIFIED
                                                         404                     = FALSE
    phase claim       "Phase N shipped" (repo R)      -> R missing             = FALSE
                                                         R public + "Phase N" marker in
                                                           README/STATUS         = VERIFIED
                                                         R public, no marker     = UNPROVEN
    test-count claim  "N <lang> tests" (repo R)       -> fresh clone of the PUBLIC
                                                         snapshot, deterministic recount:
                                                         recount == N            = VERIFIED
                                                         recount != N            = FALSE
    pass/total claim  "A/B tests green" (repo R)      -> recount of total B as above;
                                                         the "A green" leg needs a suite
                                                         run (out of scope, read-only) so
                                                         the claim is UNPROVEN with the
                                                         recount stated as evidence —
                                                         unless the total itself
                                                         mismatches, then FALSE.

HONEST-FAILURE RULES (the point of the scaffold)
  - A claim that cannot be probed is UNPROVEN, never silently passed.
  - An unreachable API / failed fetch is UNPROVEN, not VERIFIED and not FALSE.
  - FALSE is reserved for positive contradiction by the probe (404, private,
    recount mismatch).

OUTPUT
  A receipt next to this script (or --out-dir): site-claims-receipt-<ts>.md + .json,
  one line per claim: VERDICT, claim, probe evidence. Overall verdict follows the
  forensic-ritual exit codes: 0 = all VERIFIED, 1 = any FALSE, 2 = no FALSE but
  some UNPROVEN.

USAGE
  site-claims-verify.py [--page URL_OR_PATH] [--md FILE ...] [--owner OWNER]
                        [--out-dir DIR] [--no-clone] [--record-to INDEX]

VERIFIED-STATE RECORDING (opt-in, --record-to)
  With --record-to INDEX, a completed run also appends ONE record for the
  page's surface to the verified-state index the operator names, in the
  writer contract of sovereign-builds 06-forensic-ritual/
  verified_state_index.py (record shape {record_id, surface, state,
  result, probed_at, source, note}; record_id = "vsr-" + sha256 of the
  canonical record body, first 12 hex chars; JSON Lines, append-only).
  This verifier implements that contract itself — it never reaches
  across repos at runtime. The overall verdict maps to the record as:
  VERIFIED -> state "live", result "verified"; FALSE -> state "claims
  contradicted", result "refuted"; UNPROVEN -> state "claims unproven",
  result "unproven" (a non-verified newest record carries no state
  forward in the index's check, by design). Recording is idempotent
  (an identical probe is not appended twice) and fail-closed (a
  malformed existing index line refuses the append, exit 2). Without
  --record-to nothing is recorded. Verdict logic is unchanged.

Stdlib only. Paths resolve from this file's location, never from cwd.
"""

import argparse
import datetime as _dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_PAGE = "https://quantumheronlabs.com/"
DEFAULT_OWNER = "ChrisWBurt-2020"
API = "https://api.github.com/repos/{owner}/{repo}"
UA = {"User-Agent": "site-claims-verify/1.0 (forensic proof ritual; read-only)"}

VERIFIED, FALSE, UNPROVEN = "VERIFIED", "FALSE", "UNPROVEN"


# ---------------------------------------------------------------- extraction

def strip_to_blocks(raw, is_html):
    """Split a page/markdown into claim blocks (roughly one proof bullet each)."""
    if is_html:
        text = re.sub(r"<script.*?</script>", "", raw, flags=re.S | re.I)
        text = re.sub(r"<style.*?</style>", "", text, flags=re.S | re.I)
        # Keep anchors/bold machine-readable: rewrite to tokens before stripping.
        text = re.sub(
            r'<a[^>]+href="(https://github\.com/[^"]+)"[^>]*>(.*?)</a>',
            r" GHLINK(\1|\2) ", text, flags=re.S | re.I)
        text = re.sub(r"<b>(.*?)</b>", r" BOLD(\1) ", text, flags=re.S | re.I)
        text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
        text = re.sub(r"</li>", "\n", text, flags=re.I)
        text = re.sub(r"<[^>]+>", " ", text)
        import html as _h
        text = _h.unescape(text)
        blocks = [b.strip() for b in text.splitlines()]
    else:
        blocks = []
        for line in raw.splitlines():
            line = re.sub(
                r"\[([^\]]*)\]\((https://github\.com/[^)]+)\)",
                r" GHLINK(\2|\1) ", line)
            line = re.sub(r"\*\*([^*]+)\*\*", r" BOLD(\1) ", line)
            line = re.sub(r"`([^`]+)`", r" BOLD(\1) ", line)
            blocks.append(line.strip())
    return [b for b in blocks if b]


SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*[a-z0-9]$")
PHASE_RE = re.compile(r"Phase\s+(\d+)\s+shipped", re.I)
TOTAL_RE = re.compile(r"(\d[\d,]*)\s*/\s*(\d[\d,]*)\s+tests?\b", re.I)
_LANGS = r"(?:Rust|Python|JavaScript|TypeScript|Go|Kotlin|Swift)"
# A chain of "N Lang" segments joined by +/,/and, closed by the word "tests":
# handles both "128 Python tests" and "198 Rust + 128 Python tests".
LANGCHAIN_RE = re.compile(
    r"((?:\d[\d,]*\s+" + _LANGS + r"(?:\s*(?:\+|,|and)\s*)?)+)\s*tests?\b", re.I)
LANGPAIR_RE = re.compile(r"(\d[\d,]*)\s+(" + _LANGS + r")", re.I)

def _canon_lang(name):
    return {"Typescript": "TypeScript", "Javascript": "JavaScript"}.get(
        name.capitalize(), name.capitalize())

GH_URL_RE = re.compile(r"github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?(?:/|$|\"|\))")


def extract_claims(blocks, source, default_owner):
    """Return claim dicts: {kind, subject, claim, source, block}."""
    claims, seen = [], set()

    def add(kind, subject, claim, block):
        key = (kind, subject, claim)
        if key not in seen:
            seen.add(key)
            claims.append({"kind": kind, "subject": subject, "claim": claim,
                           "source": source, "block": block[:240]})

    for block in blocks:
        repos = []  # (owner, repo, display) named in this block
        for url, disp in re.findall(r"GHLINK\((https://github\.com/[^|]+)\|([^)]*)\)", block):
            m = GH_URL_RE.search(url)
            if m and m.group(2) not in ("sponsors", "features", "about"):
                repos.append((m.group(1), m.group(2), disp.strip()))
        for slug in re.findall(r"BOLD\(([^)]*)\)", block):
            slug = slug.strip()
            if SLUG_RE.match(slug) and ("-" in slug or "_" in slug) \
                    and not any(r[1] == slug for r in repos):
                repos.append((default_owner, slug, slug))
        for owner, repo, disp in repos:
            add("repo", f"{owner}/{repo}",
                f"repo {owner}/{repo} exists and is public", block)
        # numeric + phase claims bind to the block's first repo, if any
        subj = f"{repos[0][0]}/{repos[0][1]}" if repos else None
        for a, b in TOTAL_RE.findall(block):
            if subj:
                add("pass_total", subj,
                    f"{a}/{b} tests green ({subj})", block)
        for chain in LANGCHAIN_RE.findall(block):
            if subj:
                for n, lang in LANGPAIR_RE.findall(chain):
                    add("lang_count", subj,
                        f"{n} {_canon_lang(lang)} tests ({subj})", block)
        pm = PHASE_RE.search(block)
        if pm and subj:
            add("phase", subj, f"Phase {pm.group(1)} shipped ({subj})", block)
    return claims


# ------------------------------------------------------------------- probes

def http_get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:  # flaky egress: one curl fallback before giving up
        if shutil.which("curl"):
            try:
                p = subprocess.run(
                    ["curl", "-sS", "-m", str(timeout), "-A", UA["User-Agent"],
                     "-w", "\n%{http_code}", url],
                    capture_output=True, text=True, timeout=timeout + 10)
                body, _, code = p.stdout.rpartition("\n")
                if p.returncode == 0 and code.isdigit():
                    return int(code), body
            except Exception:
                pass
        return None, f"{type(e).__name__}: {e}"


class RepoProbe:
    """Caches per-repo API state + clone recounts."""

    def __init__(self, allow_clone=True):
        self.allow_clone = allow_clone
        self.api = {}     # (owner, repo) -> (status, dict|err)
        self.clone_dir = {}
        self.tmp = tempfile.mkdtemp(prefix="site-claims-")

    def cleanup(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def repo_state(self, owner, repo):
        if (owner, repo) not in self.api:
            status, body = http_get(API.format(owner=owner, repo=repo))
            if status == 200:
                try:
                    self.api[(owner, repo)] = (200, json.loads(body))
                except Exception:
                    self.api[(owner, repo)] = (None, "API body unparseable")
            elif status is None:
                self.api[(owner, repo)] = (None, body)
            else:
                self.api[(owner, repo)] = (status, "")
        return self.api[(owner, repo)]

    def clone(self, owner, repo):
        if (owner, repo) in self.clone_dir:
            return self.clone_dir[(owner, repo)]
        if not self.allow_clone:
            self.clone_dir[(owner, repo)] = (None, "--no-clone")
            return self.clone_dir[(owner, repo)]
        dest = os.path.join(self.tmp, f"{owner}--{repo}")
        p = subprocess.run(
            ["git", "clone", "--depth", "1", "--quiet",
             f"https://github.com/{owner}/{repo}.git", dest],
            capture_output=True, text=True, timeout=600)
        if p.returncode == 0:
            self.clone_dir[(owner, repo)] = (dest, "")
        else:
            tail = (p.stderr or "").strip().splitlines()
            self.clone_dir[(owner, repo)] = (
                None, tail[-1] if tail else "git clone failed")
        return self.clone_dir[(owner, repo)]


RUST_TEST = re.compile(r"^\s*#\[(?:tokio::)?test\]", re.M)
PY_TEST = re.compile(r"^\s*(?:async\s+)?def\s+test_", re.M)
JS_TEST = re.compile(r"\b(?:it|test)\s*\(")


def recount_tests(root):
    """Deterministic test-case recount of a cloned public snapshot."""
    counts = {"Rust": 0, "Python": 0, "JavaScript": 0, "TypeScript": 0}
    for dirpath, _dirs, files in os.walk(root):
        if ".git" in dirpath.split(os.sep):
            continue
        for fn in files:
            path = os.path.join(dirpath, fn)
            try:
                with open(path, encoding="utf-8", errors="ignore") as fh:
                    src = fh.read()
            except Exception:
                continue
            low = fn.lower()
            if fn.endswith(".rs"):
                counts["Rust"] += len(RUST_TEST.findall(src))
            elif (low.startswith("test_") or low.endswith("_test.py")
                    or "tests" in dirpath.split(os.sep)) and fn.endswith(".py"):
                counts["Python"] += len(PY_TEST.findall(src))
            elif (".test." in low or ".spec." in low
                    or "__tests__" in dirpath.split(os.sep)):
                lang = "TypeScript" if (fn.endswith((".ts", ".tsx"))) else "JavaScript"
                counts[lang] += len(JS_TEST.findall(src))
    counts["total"] = sum(counts.values())
    return counts


def probe_claim(claim, probe):
    """Return (verdict, evidence)."""
    owner_repo = claim["subject"]
    owner, repo = owner_repo.split("/", 1)
    kind = claim["kind"]

    if kind == "repo":
        status, data = probe.repo_state(owner, repo)
        if status == 200:
            if data.get("private") is False:
                return VERIFIED, (f"GitHub API 200, private=false, "
                                  f"pushed_at={data.get('pushed_at')}")
            return FALSE, "GitHub API 200 but private=true — not publicly visible"
        if status == 404:
            return FALSE, f"GitHub API 404 for {owner_repo} (anonymous)"
        return UNPROVEN, f"GitHub API unreachable/unexpected (status={status}: {data})"

    # All other kinds need the repo state first.
    status, data = probe.repo_state(owner, repo)
    if status == 404:
        return FALSE, f"subject repo {owner_repo} does not exist (GitHub API 404)"
    if status != 200 or (isinstance(data, dict) and data.get("private")):
        return UNPROVEN, f"subject repo state unproven (status={status})"

    if kind == "phase":
        n = re.search(r"Phase\s+(\d+)", claim["claim"]).group(1)
        for doc in ("README.md", "STATUS.md", "README", "STATUS"):
            st, body = http_get(
                f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{doc}")
            if st == 200 and re.search(rf"Phase\s+{n}\b", body, re.I):
                return VERIFIED, f"repo public; 'Phase {n}' marker found in {doc}"
        return UNPROVEN, (f"repo public; no 'Phase {n}' marker in README/STATUS — "
                          f"CLAIM UNPROVEN: phase state not in the public snapshot")

    if kind in ("lang_count", "pass_total"):
        dest, err = probe.clone(owner, repo)
        if dest is None:
            return UNPROVEN, f"recount impossible: fresh clone failed ({err})"
        counts = recount_tests(dest)
        if kind == "lang_count":
            m = re.match(r"(\d[\d,]*)\s+(\w+)\s+tests", claim["claim"])
            want_n, want_lang = int(m.group(1).replace(",", "")), _canon_lang(m.group(2))
            got = counts.get(want_lang)
            if got is None:
                return UNPROVEN, f"no counter for language {want_lang}"
            ev = f"recount from fresh clone of public snapshot: {got} {want_lang} tests (claimed {want_n}); all counts {counts}"
            return (VERIFIED, ev) if got == want_n else (FALSE, ev)
        m = re.match(r"(\d[\d,]*)/(\d[\d,]*)\s+tests\s+green", claim["claim"])
        want_pass, want_total = (int(m.group(1).replace(",", "")),
                                 int(m.group(2).replace(",", "")))
        got_total = counts["total"]
        ev = (f"recount from fresh clone of public snapshot: {got_total} total tests "
              f"(claimed {want_total}); counters {counts}")
        if got_total != want_total:
            return FALSE, ev + " — total not reproducible from the public snapshot"
        return UNPROVEN, (ev + f" — total reproduces, but '{want_pass} green' requires "
                                f"running the suite; read-only verifier cannot probe it")
    return UNPROVEN, f"no probe implemented for kind {kind}"


# ------------------------------------------------- verified-state recording
# Writer leg of the verified_state_index contract (see module docstring).
# Self-contained: the record shape and id derivation mirror the index
# tool's `record` subcommand exactly; no cross-repo import or path.

RECORD_FIELDS = ("surface", "state", "result", "probed_at", "source", "note")
RECORD_SOURCE = "site-claims-verify"
_OVERALL_TO_RECORD = {
    VERIFIED: ("live", "verified"),
    FALSE: ("claims contradicted", "refuted"),
    UNPROVEN: ("claims unproven", "unproven"),
}


class RecordProblem(Exception):
    """The target index could not be trusted — fail closed, no append."""


def _record_id_for(body):
    canonical = json.dumps(body, sort_keys=True, separators=(",", ":"))
    return "vsr-" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:12]


def _existing_record_ids(path):
    """Validate an existing index exactly as the index reader does:
    every non-blank line a JSON object with all fields present and a
    record_id matching its content. Returns the set of record_ids."""
    ids = set()
    if not os.path.exists(path):
        return ids
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().splitlines()
    for lineno, raw in enumerate(lines, start=1):
        line = raw.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as exc:
            raise RecordProblem(f"index line {lineno}: invalid JSON ({exc})")
        if not isinstance(obj, dict):
            raise RecordProblem(f"index line {lineno}: not a JSON object")
        missing = [f for f in ("record_id",) + RECORD_FIELDS if f not in obj]
        if missing:
            raise RecordProblem(
                f"index line {lineno}: missing fields {missing} — "
                "record cannot be trusted, refusing to append")
        body = {f: obj[f] for f in RECORD_FIELDS}
        if obj["record_id"] != _record_id_for(body):
            raise RecordProblem(
                f"index line {lineno}: record_id {obj['record_id']} does "
                "not match its content — tampered or hand-edited record, "
                "refusing to append")
        ids.add(obj["record_id"])
    return ids


def surface_for_page(page):
    """The surface a run claims about: the page URL's host; a local
    page is the site's own source, so it names the default site host."""
    host = urllib.parse.urlparse(page).netloc
    return host or urllib.parse.urlparse(DEFAULT_PAGE).netloc


def append_verified_state_record(index_path, surface, overall, probed_at,
                                 note):
    """Append this run's record to the index. Returns (record, appended):
    appended is False when the identical probe is already recorded."""
    state, result = _OVERALL_TO_RECORD[overall]
    body = {"surface": surface, "state": state, "result": result,
            "probed_at": probed_at, "source": RECORD_SOURCE, "note": note}
    record = {"record_id": _record_id_for(body)}
    record.update(body)
    if record["record_id"] in _existing_record_ids(index_path):
        return record, False
    parent = os.path.dirname(os.path.abspath(index_path))
    os.makedirs(parent, exist_ok=True)
    with open(index_path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
    return record, True


# ---------------------------------------------------------------------- main

def main(argv=None):
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--page", default=DEFAULT_PAGE,
                    help="site URL or local HTML path (default: live site)")
    ap.add_argument("--md", nargs="*", default=[],
                    help="local markdown files to mine (e.g. LinkedIn pack)")
    ap.add_argument("--owner", default=DEFAULT_OWNER,
                    help="default GitHub owner for unlinked repo slugs")
    ap.add_argument("--out-dir", default=here)
    ap.add_argument("--no-clone", action="store_true",
                    help="skip clone-based recounts (counts become UNPROVEN)")
    ap.add_argument("--record-to", metavar="INDEX", default=None,
                    help="append a verified-state record for this run to "
                         "INDEX (JSON Lines, verified_state_index contract)")
    args = ap.parse_args(argv)

    sources = []  # (name, raw, is_html)
    if args.page.startswith(("http://", "https://")):
        status, body = http_get(args.page)
        if status != 200:
            print(f"FATAL: page fetch {args.page} -> status={status}: {body[:200]}",
                  file=sys.stderr)
            return 2
        sources.append((args.page, body, True))
    else:
        with open(args.page, encoding="utf-8") as fh:
            sources.append((args.page, fh.read(), True))
    for md in args.md:
        with open(md, encoding="utf-8") as fh:
            sources.append((md, fh.read(), False))

    claims = []
    for name, raw, is_html in sources:
        claims.extend(extract_claims(strip_to_blocks(raw, is_html), name, args.owner))

    probe = RepoProbe(allow_clone=not args.no_clone)
    results = []
    try:
        for c in claims:
            verdict, evidence = probe_claim(c, probe)
            results.append({**c, "verdict": verdict, "evidence": evidence})
    finally:
        probe.cleanup()

    tally = {v: sum(1 for r in results if r["verdict"] == v)
             for v in (VERIFIED, FALSE, UNPROVEN)}
    overall = FALSE if tally[FALSE] else (UNPROVEN if tally[UNPROVEN] else VERIFIED)
    ts = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")

    os.makedirs(args.out_dir, exist_ok=True)
    base = os.path.join(args.out_dir, f"site-claims-receipt-{stamp}")
    with open(base + ".json", "w", encoding="utf-8") as fh:
        json.dump({"generated_at": ts, "overall": overall, "tally": tally,
                   "results": results}, fh, indent=2)
    lines = [f"# site-claims-verify receipt — {ts}",
             f"Overall: **{overall}** · VERIFIED {tally[VERIFIED]} · "
             f"FALSE {tally[FALSE]} · UNPROVEN {tally[UNPROVEN]}", ""]
    for r in results:
        lines.append(f"- **{r['verdict']}** · {r['claim']} — {r['evidence']}")
    with open(base + ".md", "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")

    print("\n".join(lines))
    print(f"\nReceipt: {base}.md / .json")

    if args.record_to:
        note = (f"site-claims-verify overall {overall}: "
                f"VERIFIED {tally[VERIFIED]} · FALSE {tally[FALSE]} · "
                f"UNPROVEN {tally[UNPROVEN]} over {len(results)} claims "
                f"from {args.page}")
        try:
            record, appended = append_verified_state_record(
                args.record_to, surface_for_page(args.page), overall,
                ts, note)
        except RecordProblem as exc:
            print(f"FATAL: verified-state recording refused: {exc}",
                  file=sys.stderr)
            return 2
        if appended:
            print(f"Verified-state record: {record['record_id']} "
                  f"appended to {args.record_to}")
        else:
            print(f"Verified-state record: {record['record_id']} "
                  f"already recorded in {args.record_to} — append skipped")
    return 1 if overall == FALSE else (2 if overall == UNPROVEN else 0)


if __name__ == "__main__":
    sys.exit(main())
