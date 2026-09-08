"""Offline controls for the hosted-only concurrency characterization."""
import subprocess
import sys
from pathlib import Path

import concurrency


def rejected(call):
    try:
        call()
    except (AssertionError, RuntimeError):
        return
    raise AssertionError("Negative control accepted")


good = subprocess.CompletedProcess([], 0, "", "")
duplicate = subprocess.CompletedProcess([], 1, "", 'duplicate key value violates unique constraint "migration_concurrency_canary_pkey"')
history, rows = ["1", "2"], ["canary"]
concurrency.verify_outcome([good, duplicate], history, history, rows, "canary")
assert concurrency.verify_outcome([good, good], history, history, rows, "canary") == "both_succeeded"
assert concurrency.verify_outcome([good, duplicate], history, history, rows, "canary") == "duplicate_retry_required"
for results, actual_history, actual_rows in (
    ([duplicate, duplicate], history, rows),
    ([good], history, rows),
    ([good, subprocess.CompletedProcess([], 1, "", "duplicate key unrelated_constraint")], history, rows),
    ([good, subprocess.CompletedProcess([], 1, "", "connection refused")], history, rows),
    ([good, duplicate], ["1"], rows),
    ([good, duplicate], history + ["3"], rows),
    ([good, duplicate], history, []),
    ([good, duplicate], history, ["wrong"]),
    ([good, duplicate], history, rows * 2),
):
    rejected(lambda: concurrency.verify_outcome(results, actual_history, history, actual_rows, "canary"))
for platform, environment in (("win32", {"GITHUB_ACTIONS": "true"}), ("linux", {}), ("linux", {"GITHUB_ACTIONS": "false"})):
    rejected(lambda: concurrency.require_hosted(platform, environment))
concurrency.require_hosted("linux", {"GITHUB_ACTIONS": "true"})
subprocess.run([sys.executable, "-B", str(Path(__file__).with_name("test_prepare.py"))], check=True)
print("MIGRATION_CONCURRENCY_CONTROLS_VERIFIED")
