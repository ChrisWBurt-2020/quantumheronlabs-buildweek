"""Tests for site-claims-verify's verified-state recording (--record-to).

The recording leg implements the writer contract of sovereign-builds
06-forensic-ritual/verified_state_index.py. These tests are offline and
self-contained: the record shape is validated here with an independent
replica of the index reader's acceptance rules (all fields present,
record_id recomputed from the canonical body, probed_at carrying a
timezone), the append is proven idempotent and fail-closed on a
malformed index, and a full CLI run over a local fixture page is proven
to append exactly one well-formed record — and none without the flag.
"""
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
MODULE_PATH = os.path.join(HERE, "site-claims-verify.py")
spec = importlib.util.spec_from_file_location("site_claims_verify",
                                              MODULE_PATH)
scv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scv)

TS = "2026-10-22T12:00:00Z"


def reader_accepts(path):
    """Replica of verified_state_index.load_index's acceptance rules.
    Returns the list of records; raises AssertionError on any line the
    real reader would refuse."""
    records = []
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().splitlines()
    for lineno, raw in enumerate(lines, start=1):
        line = raw.strip()
        if not line:
            continue
        obj = json.loads(line)
        assert isinstance(obj, dict), f"line {lineno}: not an object"
        missing = [f for f in ("record_id",) + scv.RECORD_FIELDS
                   if f not in obj]
        assert not missing, f"line {lineno}: missing {missing}"
        body = {f: obj[f] for f in scv.RECORD_FIELDS}
        canonical = json.dumps(body, sort_keys=True, separators=(",", ":"))
        expected = ("vsr-" + hashlib.sha256(
            canonical.encode("utf-8")).hexdigest()[:12])
        assert obj["record_id"] == expected, (
            f"line {lineno}: record_id {obj['record_id']} != {expected}")
        dt = datetime.fromisoformat(obj["probed_at"].replace("Z", "+00:00"))
        assert dt.tzinfo is not None, f"line {lineno}: probed_at has no tz"
        records.append(obj)
    return records


class RecordCase(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.index = os.path.join(self.tmp.name, "index.jsonl")


class TestAppend(RecordCase):

    def test_append_writes_wellformed_record_reader_accepts(self):
        record, appended = scv.append_verified_state_record(
            self.index, "quantumheronlabs.com", scv.VERIFIED, TS,
            "fixture note")
        self.assertTrue(appended)
        records = reader_accepts(self.index)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0], record)
        self.assertEqual(record["surface"], "quantumheronlabs.com")
        self.assertEqual(record["state"], "live")
        self.assertEqual(record["result"], "verified")
        self.assertEqual(record["source"], "site-claims-verify")
        self.assertEqual(record["probed_at"], TS)
        self.assertTrue(record["record_id"].startswith("vsr-"))

    def test_overall_verdict_mapping(self):
        cases = [(scv.FALSE, "claims contradicted", "refuted"),
                 (scv.UNPROVEN, "claims unproven", "unproven")]
        for i, (overall, state, result) in enumerate(cases):
            record, appended = scv.append_verified_state_record(
                self.index, "quantumheronlabs.com", overall,
                f"2026-10-22T12:0{i}:00Z", f"note {overall}")
            self.assertTrue(appended)
            self.assertEqual(record["state"], state)
            self.assertEqual(record["result"], result)
        self.assertEqual(len(reader_accepts(self.index)), 2)

    def test_identical_probe_is_not_appended_twice(self):
        _, first = scv.append_verified_state_record(
            self.index, "quantumheronlabs.com", scv.VERIFIED, TS, "n")
        record, second = scv.append_verified_state_record(
            self.index, "quantumheronlabs.com", scv.VERIFIED, TS, "n")
        self.assertTrue(first)
        self.assertFalse(second)
        self.assertEqual(len(reader_accepts(self.index)), 1)

    def test_malformed_existing_index_refuses_append(self):
        with open(self.index, "w", encoding="utf-8") as fh:
            fh.write('{"record_id": "vsr-deadbeef0000", "surface": "x"}\n')
        with self.assertRaises(scv.RecordProblem):
            scv.append_verified_state_record(
                self.index, "quantumheronlabs.com", scv.VERIFIED, TS, "n")
        with open(self.index, encoding="utf-8") as fh:
            self.assertEqual(len(fh.read().splitlines()), 1)

    def test_surface_derivation(self):
        self.assertEqual(
            scv.surface_for_page("https://quantumheronlabs.com/"),
            "quantumheronlabs.com")
        self.assertEqual(
            scv.surface_for_page("/some/local/index.html"),
            "quantumheronlabs.com")


FIXTURE_HTML = "<html><body><p>No machine-readable claims here.</p></body></html>"


class TestCliRun(RecordCase):

    def run_cli(self, *extra):
        page = os.path.join(self.tmp.name, "page.html")
        with open(page, "w", encoding="utf-8") as fh:
            fh.write(FIXTURE_HTML)
        out_dir = os.path.join(self.tmp.name, "receipts")
        return subprocess.run(
            [sys.executable, MODULE_PATH, "--page", page, "--no-clone",
             "--out-dir", out_dir, *extra],
            capture_output=True, text=True, timeout=120)

    def test_run_appends_record_with_flag(self):
        proc = self.run_cli("--record-to", self.index)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("Verified-state record:", proc.stdout)
        records = reader_accepts(self.index)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["result"], "verified")
        self.assertEqual(records[0]["surface"], "quantumheronlabs.com")

    def test_run_without_flag_records_nothing(self):
        proc = self.run_cli()
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertNotIn("Verified-state record:", proc.stdout)
        self.assertFalse(os.path.exists(self.index))


if __name__ == "__main__":
    unittest.main()
