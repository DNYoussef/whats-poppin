"""Offline controls for the hosted-only concurrency characterization."""
import subprocess
import sys
from pathlib import Path
from unittest.mock import Mock, patch

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
future = Mock()
future.done.return_value = False
sql = Mock(side_effect=[subprocess.TimeoutExpired('poll', 5), subprocess.CompletedProcess([], 0, '12:Lock', '')])
with patch.object(concurrency.time, 'monotonic', side_effect=[0, 0, 5]):
    assert concurrency.activity(sql, 'canary', future) == (12, 'Lock')
assert sql.call_count == 2
sql = Mock(side_effect=subprocess.TimeoutExpired('poll', 5))
with patch.object(concurrency.time, 'monotonic', side_effect=[0, 0, 31]):
    rejected(lambda: concurrency.activity(sql, 'canary', future))
assert sql.call_count == 1
subprocess.run([sys.executable, "-B", str(Path(__file__).with_name("test_prepare.py"))], check=True)
print("MIGRATION_CONCURRENCY_CONTROLS_VERIFIED")
